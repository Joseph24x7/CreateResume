package com.resumemaker.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumemaker.exception.ResumeNotFoundException;
import com.resumemaker.model.Resume;
import com.resumemaker.model.ResumeData;
import com.resumemaker.model.ResumeDto;
import com.resumemaker.repository.ResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ResumeService {

    private final ResumeRepository repo;
    private final ObjectMapper mapper;

    public ResumeService(ResumeRepository repo, ObjectMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<ResumeDto.Summary> findAll() {
        return repo.findAll().stream()
                .map(r -> new ResumeDto.Summary(r.getId(), r.getTitle(), r.getCreatedAt(), r.getUpdatedAt()))
                .toList();
    }

    public ResumeDto.Full create(ResumeDto.CreateRequest req) {
        var resume = new Resume();
        resume.setTitle(req.title() != null && !req.title().isBlank() ? req.title() : "Untitled Resume");
        resume.setDataJson(toJson(defaultData()));
        return toFull(repo.save(resume));
    }

    @Transactional(readOnly = true)
    public ResumeDto.Full findById(UUID id) {
        return toFull(repo.findById(id).orElseThrow(() -> new ResumeNotFoundException(id)));
    }

    public ResumeDto.Full update(UUID id, ResumeDto.UpdateRequest req) {
        var resume = repo.findById(id).orElseThrow(() -> new ResumeNotFoundException(id));
        if (req.title() != null && !req.title().isBlank()) {
            resume.setTitle(req.title());
        }
        if (req.data() != null) {
            resume.setDataJson(toJson(req.data()));
        }
        return toFull(repo.save(resume));
    }

    public void delete(UUID id) {
        if (!repo.existsById(id)) throw new ResumeNotFoundException(id);
        repo.deleteById(id);
    }

    private ResumeData.Data defaultData() {
        return new ResumeData.Data(
                new ResumeData.PersonalInfo(
                        "Joseph Praveen",
                        "Kumar S",
                        "AVP - Application Development",
                        "joseph.praveen@example.com",
                        "+91 98765 43210",
                        "Chennai, India",
                        "linkedin.com/in/josephpraveen",
                        "github.com/josephpraveen",
                        "josephpraveen.dev",
                        "leetcode.com/josephpraveen"
                ),
                "Senior Software Developer and AVP with 11+ years of experience in Java Enterprise development, microservices, cloud applications, and frontend frameworks. Skilled in leading teams and designing high-throughput, low-latency financial systems.",
                List.of(
                        new ResumeData.SkillCategory(UUID.randomUUID().toString(), "Languages", "Java 21 | SQL | JavaScript | HTML/CSS"),
                        new ResumeData.SkillCategory(UUID.randomUUID().toString(), "Frameworks", "Spring Boot 4 | Spring Cloud | Hibernate | React"),
                        new ResumeData.SkillCategory(UUID.randomUUID().toString(), "Tools & Infra", "Docker | Kubernetes | AWS | Git | Maven")
                ),
                List.of(
                        new ResumeData.ExperienceEntry(
                                UUID.randomUUID().toString(),
                                "AVP - Application Development",
                                "Major Financial Institution",
                                "06/2021",
                                "Present",
                                "Chennai, India",
                                "Custody Tax Reclaims Platform",
                                List.of(
                                        "Led a team of 8 developers in migrating a legacy monolithic custody platform to Spring Boot microservices.",
                                        "Designed and implemented a real-time event-driven transaction processing system handling 1M+ daily transactions.",
                                        "Reduced processing latencies by 45% using Project Loom virtual threads and optimized JPA database queries."
                                )
                        ),
                        new ResumeData.ExperienceEntry(
                                UUID.randomUUID().toString(),
                                "Senior Software Engineer",
                                "Tech Solutions Inc.",
                                "08/2016",
                                "05/2021",
                                "Chennai, India",
                                "Core Banking Integration",
                                List.of(
                                        "Developed reusable REST APIs and SOAP integrations connecting third-party payment gateways.",
                                        "Mentored 4 junior engineers and implemented standard CI/CD pipelines reducing deployment times by 50%."
                                )
                        )
                ),
                List.of(
                        new ResumeData.AchievementEntry(UUID.randomUUID().toString(), "Spot Award for Outstanding Delivery of Custody Tax Reclaims in Q3 2023."),
                        new ResumeData.AchievementEntry(UUID.randomUUID().toString(), "Successfully migrated 12 legacy applications to cloud-native platforms ahead of schedule.")
                ),
                List.of(
                        new ResumeData.EducationEntry(
                                UUID.randomUUID().toString(),
                                "Bachelor of Engineering in Computer Science",
                                "Sathyabama University",
                                "08/2011",
                                "04/2015",
                                "Chennai, India"
                        )
                ),
                List.of(
                        new ResumeData.LanguageEntry(UUID.randomUUID().toString(), "English", "Full Professional Proficiency"),
                        new ResumeData.LanguageEntry(UUID.randomUUID().toString(), "Tamil", "Native or Bilingual Proficiency")
                ),
                List.of(),
                "Inter"
        );
    }

    private ResumeDto.Full toFull(Resume resume) {
        return new ResumeDto.Full(
                resume.getId(),
                resume.getTitle(),
                fromJson(resume.getDataJson()),
                resume.getCreatedAt(),
                resume.getUpdatedAt()
        );
    }

    private String toJson(Object obj) {
        try {
            return mapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON serialization failed", e);
        }
    }

    private ResumeData.Data fromJson(String json) {
        try {
            return mapper.readValue(json, ResumeData.Data.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON deserialization failed", e);
        }
    }
}
