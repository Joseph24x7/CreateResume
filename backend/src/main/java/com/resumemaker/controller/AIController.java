package com.resumemaker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AIController {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public record QuestionsRequest(String resumeText, String jobTitle) {}
    public record EvaluateRequest(String question, String answer) {}
    public record CoverLetterRequest(String resumeText, String jobTitle, String company, String jobDescription) {}

    @PostMapping("/generate-questions")
    public List<String> generateQuestions(
            @RequestHeader(value = "X-Gemini-Key", required = false) String geminiKey,
            @RequestBody QuestionsRequest req) {

        if (geminiKey == null || geminiKey.trim().isEmpty()) {
            return getMockQuestions(req.jobTitle(), req.resumeText());
        }

        String prompt = "You are an expert interviewer. Based on the candidate's resume: " + req.resumeText() + 
                "\nand target job title: " + req.jobTitle() + 
                "\ngenerate exactly 5 realistic, highly targeted technical and behavioral interview questions. " +
                "Output your response strictly as a JSON array of strings. Do not include markdown code block syntax (like ```json or ```) or backticks. Example format: [\"Question 1\", \"Question 2\"]";

        try {
            String aiResult = callGemini(geminiKey, prompt);
            // Strip any accidental markdown formatting
            aiResult = aiResult.replaceAll("```json", "").replaceAll("```", "").trim();
            return objectMapper.readValue(aiResult, List.class);
        } catch (Exception e) {
            System.err.println("Gemini call failed, falling back to mock questions: " + e.getMessage());
            return getMockQuestions(req.jobTitle(), req.resumeText());
        }
    }

    @PostMapping("/evaluate-answer")
    public Map<String, Object> evaluateAnswer(
            @RequestHeader(value = "X-Gemini-Key", required = false) String geminiKey,
            @RequestBody EvaluateRequest req) {

        if (geminiKey == null || geminiKey.trim().isEmpty()) {
            return getMockEvaluation(req.question(), req.answer());
        }

        String prompt = "Evaluate the candidate's response: \"" + req.answer() + "\"\n" +
                "to the interview question: \"" + req.question() + "\"\n" +
                "Output your response strictly as a JSON object with exactly three fields: " +
                "\"grade\" (should be one of 'Strong', 'Good', or 'Needs Work'), " +
                "\"feedback\" (constructive feedback in 1-2 sentences), " +
                "\"modelAnswer\" (a suggested benchmark response). " +
                "Do not include markdown code block syntax or backticks.";

        try {
            String aiResult = callGemini(geminiKey, prompt);
            aiResult = aiResult.replaceAll("```json", "").replaceAll("```", "").trim();
            return objectMapper.readValue(aiResult, Map.class);
        } catch (Exception e) {
            System.err.println("Gemini call failed, falling back to mock evaluation: " + e.getMessage());
            return getMockEvaluation(req.question(), req.answer());
        }
    }

    @PostMapping("/generate-cover-letter")
    public Map<String, String> generateCoverLetter(
            @RequestHeader(value = "X-Gemini-Key", required = false) String geminiKey,
            @RequestBody CoverLetterRequest req) {

        Map<String, String> response = new HashMap<>();

        if (geminiKey == null || geminiKey.trim().isEmpty()) {
            response.put("coverLetter", getMockCoverLetter(req));
            return response;
        }

        String prompt = "Write a tailored, highly professional cover letter for a candidate applying for the role of " +
                req.jobTitle() + " at " + req.company() + ".\n" +
                "Candidate Resume Highlights:\n" + req.resumeText() + "\n" +
                "Target Job Description:\n" + req.jobDescription() + "\n" +
                "Structure it with clean paragraphs, formal headings, and professional sign-offs. Return only the cover letter body text.";

        try {
            String letter = callGemini(geminiKey, prompt);
            response.put("coverLetter", letter);
            return response;
        } catch (Exception e) {
            System.err.println("Gemini call failed, falling back to mock cover letter: " + e.getMessage());
            response.put("coverLetter", getMockCoverLetter(req));
            return response;
        }
    }

    private String callGemini(String apiKey, String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Prepare Gemini request body payload
        Map<String, Object> reqBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> contentMap = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> partMap = new HashMap<>();
        
        partMap.put("text", prompt);
        parts.add(partMap);
        contentMap.put("parts", parts);
        contents.add(contentMap);
        reqBody.put("contents", contents);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map body = response.getBody();
            List candidates = (List) body.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map candidate = (Map) candidates.get(0);
                Map content = (Map) candidate.get("content");
                if (content != null) {
                    List responseParts = (List) content.get("parts");
                    if (responseParts != null && !responseParts.isEmpty()) {
                        Map responsePart = (Map) responseParts.get(0);
                        return (String) responsePart.get("text");
                    }
                }
            }
        }
        throw new RuntimeException("Empty or malformed response from Gemini API");
    }

    private List<String> getMockQuestions(String jobTitle, String resumeText) {
        List<String> list = new ArrayList<>();
        String title = (jobTitle == null || jobTitle.isEmpty()) ? "Software Engineer" : jobTitle;
        list.add("How do you design and structure scalable systems for a " + title + " position?");
        list.add("Tell me about a time when you had to optimize performance or fix a critical bug. What steps did you take?");
        list.add("In your resume, you listed technical skills. How do you decide which technology is the best fit for a project?");
        list.add("Describe a scenario where you had to collaborate with stakeholders or navigate conflicting requirements.");
        list.add("What is your approach to writing clean, maintainable code, and how do you conduct effective code reviews?");
        return list;
    }

    private Map<String, Object> getMockEvaluation(String question, String answer) {
        Map<String, Object> map = new HashMap<>();
        if (answer == null || answer.trim().length() < 10) {
            map.put("grade", "Needs Work");
            map.put("feedback", "Your answer is too short. Try structure it using the STAR method (Situation, Task, Action, Result) with specific metrics.");
            map.put("modelAnswer", "I approach this by first analyzing the requirements (Situation), defining the success metrics (Task), implementing a clean solution with unit testing (Action), and measuring performance gains (Result). For example, I once optimized database queries reducing API latencies by 40%.");
        } else {
            map.put("grade", "Good");
            map.put("feedback", "Excellent start. To make this answer Strong, try adding more quantifiable metrics and how you measured the business impact.");
            map.put("modelAnswer", "A strong answer follows the STAR pattern: 'In my previous role, we faced scalability bottlenecks (Situation). I spearheaded the migration to a microservices architecture (Action), which resulted in a 30% reduction in server costs and a 99.99% uptime (Result).'");
        }
        return map;
    }

    private String getMockCoverLetter(CoverLetterRequest req) {
        String company = (req.company() == null || req.company().isEmpty()) ? "[Company Name]" : req.company();
        String title = (req.jobTitle() == null || req.jobTitle().isEmpty()) ? "Software Engineer" : req.jobTitle();
        return "Dear Hiring Manager,\n\n" +
                "I am writing to express my strong interest in the " + title + " position at " + company + ". " +
                "With my backgrounds and hands-on experiences outlined in my resume, I am confident in my ability to immediately add value to your engineering team.\n\n" +
                "In my previous roles, I have consistently demonstrated a commitment to engineering excellence, writing clean code, and solving complex problems. " +
                "I look forward to the opportunity to discuss how my skillset aligns with " + company + "'s current product goals.\n\n" +
                "Thank you for your time and consideration.\n\n" +
                "Sincerely,\n" +
                "Applicant";
    }
}
