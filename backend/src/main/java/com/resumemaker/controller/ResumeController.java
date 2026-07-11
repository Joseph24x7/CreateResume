package com.resumemaker.controller;

import com.resumemaker.model.ResumeDto;
import com.resumemaker.service.PdfExportService;
import com.resumemaker.service.ResumeService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final PdfExportService pdfExportService;

    public ResumeController(ResumeService resumeService, PdfExportService pdfExportService) {
        this.resumeService = resumeService;
        this.pdfExportService = pdfExportService;
    }

    @GetMapping
    public List<ResumeDto.Summary> getAll() {
        return resumeService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResumeDto.Full create(@RequestBody ResumeDto.CreateRequest req) {
        return resumeService.create(req);
    }

    @GetMapping("/{id}")
    public ResumeDto.Full getById(@PathVariable UUID id) {
        return resumeService.findById(id);
    }

    @PutMapping("/{id}")
    public ResumeDto.Full update(@PathVariable UUID id, @RequestBody ResumeDto.UpdateRequest req) {
        return resumeService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        resumeService.delete(id);
    }

    public record ExportPdfRequest(String html) {}

    @PostMapping("/{id}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable UUID id, @RequestBody ExportPdfRequest req) {
        var resume = resumeService.findById(id);
        byte[] pdf = pdfExportService.generatePdf(req.html());
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment",
                resume.title().replaceAll("[^a-zA-Z0-9\\-_]", "_") + ".pdf");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}

