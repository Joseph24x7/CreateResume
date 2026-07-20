package com.resumemaker.controller;

import com.resumemaker.model.JobOffer;
import com.resumemaker.repository.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/job-offers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class JobOfferController {

    private final JobOfferRepository repository;

    @GetMapping
    public List<JobOffer> getAll() {
        return repository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobOffer create(@RequestBody JobOffer offer) {
        return repository.save(offer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobOffer> update(@PathVariable UUID id, @RequestBody JobOffer updated) {
        return repository.findById(id)
                .map(offer -> {
                    offer.setCompany(updated.getCompany());
                    offer.setRole(updated.getRole());
                    offer.setBaseSalary(updated.getBaseSalary());
                    offer.setBonus(updated.getBonus());
                    offer.setEquity(updated.getEquity());
                    offer.setLocation(updated.getLocation());
                    offer.setPtoDays(updated.getPtoDays());
                    offer.setWlbRating(updated.getWlbRating());
                    return ResponseEntity.ok(repository.save(offer));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}
