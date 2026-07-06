package com.resumemaker.service;

import com.resumemaker.model.ResumeData;
import com.resumemaker.model.ResumeDto;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class PdfExportService {

    private final TemplateEngine templateEngine;
    private final String commonCss;

    public PdfExportService(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
        try {
            var resource = new org.springframework.core.io.ClassPathResource("static/resume-common.css");
            var bytes = java.nio.file.Files.readAllBytes(resource.getFile().toPath());
            this.commonCss = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load shared resume CSS", e);
        }
    }

    public byte[] generatePdf(ResumeDto.Full resume) {
        Context ctx = new Context();
        ctx.setVariable("resume", resume);

        ResumeData.Data data = resume.data();
        ctx.setVariable("personalInfo", data.personalInfo() != null ? data.personalInfo()
                : new ResumeData.PersonalInfo("", "", "", "", "", "", "", "", "", ""));
        ctx.setVariable("summary", data.summary() != null ? data.summary() : "");
        ctx.setVariable("skillCategories", data.skillCategories() != null ? data.skillCategories() : List.of());
        ctx.setVariable("experiences", data.experiences() != null ? data.experiences() : List.of());
        ctx.setVariable("achievements", filterNonEmpty(data.achievements()));
        ctx.setVariable("educations", data.educations() != null ? data.educations() : List.of());
        ctx.setVariable("languages", data.languages() != null ? data.languages() : List.of());

        String html = templateEngine.process("resume-pdf", ctx);
        // Inject shared CSS (fonts, base styling) into the head of the generated HTML
        html = html.replace("</head>", "<style>" + commonCss + "</style></head>");

        try (var bos = new ByteArrayOutputStream()) {
            var renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(bos);
            return bos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    private List<ResumeData.AchievementEntry> filterNonEmpty(List<ResumeData.AchievementEntry> list) {
        if (list == null) return List.of();
        return list.stream().filter(a -> a.text() != null && !a.text().isBlank()).toList();
    }
}
