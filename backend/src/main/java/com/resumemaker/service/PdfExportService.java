package com.resumemaker.service;

import org.springframework.stereotype.Service;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.UUID;

@Service
public class PdfExportService {

    public byte[] generatePdf(String html) {
        String tempDir = System.getProperty("java.io.tmpdir");
        String uniqueId = UUID.randomUUID().toString();
        File htmlFile = new File(tempDir, "resume_" + uniqueId + ".html");
        File pdfFile = new File(tempDir, "resume_" + uniqueId + ".pdf");

        try {
            // Write HTML content to temporary file
            Files.writeString(htmlFile.toPath(), html);

            // Locate Chrome executable on Windows
            String chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
            if (!new File(chromePath).exists()) {
                chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
            }
            if (!new File(chromePath).exists()) {
                throw new RuntimeException("Google Chrome executable not found at typical paths.");
            }

            // Print HTML to PDF using Headless Chrome
            ProcessBuilder pb = new ProcessBuilder(
                chromePath,
                "--headless",
                "--disable-gpu",
                "--no-sandbox",
                "--print-to-pdf=" + pdfFile.getAbsolutePath(),
                "--no-margins",
                htmlFile.getAbsolutePath()
            );

            Process process = pb.start();
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("Headless Chrome process exited with code: " + exitCode);
            }

            if (!pdfFile.exists()) {
                throw new RuntimeException("Headless Chrome did not output the PDF file.");
            }

            return Files.readAllBytes(pdfFile.toPath());

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Headless Chrome PDF rendering failed", e);
        } finally {
            // Cleanup temp files
            if (htmlFile.exists()) htmlFile.delete();
            if (pdfFile.exists()) pdfFile.delete();
        }
    }
}

