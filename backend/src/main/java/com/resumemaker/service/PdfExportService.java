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

    public PdfExportService(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    public byte[] generatePdf(ResumeDto.Full resume) {
        Context ctx = new Context();
        ctx.setVariable("resume", resume);

        ResumeData.Data data = resume.data();
        ctx.setVariable("personalInfo", data.personalInfo());
        ctx.setVariable("summary", data.summary());
        ctx.setVariable("skillCategories", data.skillCategories());
        ctx.setVariable("experiences", data.experiences());
        ctx.setVariable("achievements", filterNonEmpty(data.achievements()));
        ctx.setVariable("educations", data.educations());
        ctx.setVariable("languages", data.languages());

        String html = templateEngine.process("resume-pdf", ctx);

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
