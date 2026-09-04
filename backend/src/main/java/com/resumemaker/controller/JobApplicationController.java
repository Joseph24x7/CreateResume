package com.resumemaker.controller;

import com.resumemaker.model.JobApplication;
import com.resumemaker.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/job-applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class JobApplicationController {

    private final JobApplicationRepository repository;

    @GetMapping
    public List<JobApplication> getAll() {
        return repository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplication create(@RequestBody JobApplication app) {
        return repository.save(app);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> update(@PathVariable UUID id, @RequestBody JobApplication updated) {
        return repository.findById(id)
                .map(app -> {
                    app.setCompany(updated.getCompany());
                    app.setRole(updated.getRole());
                    app.setSalary(updated.getSalary());
                    app.setStatus(updated.getStatus());
                    app.setDateApplied(updated.getDateApplied());
                    app.setNotes(updated.getNotes());
                    app.setUrl(updated.getUrl());
                    return ResponseEntity.ok(repository.save(app));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}
