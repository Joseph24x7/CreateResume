package com.resumemaker.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumemaker.exception.ResumeNotFoundException;
import com.resumemaker.model.Resume;
import com.resumemaker.model.ResumeData;
import com.resumemaker.model.ResumeDto;
import com.resumemaker.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository repo;
    private final ObjectMapper mapper;

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
                new ResumeData.PersonalInfo("", "", "", "", "", "", "", "", "", ""),
                "",
                List.of(new ResumeData.SkillCategory(UUID.randomUUID().toString(), "", "")),
                List.of(new ResumeData.ExperienceEntry(UUID.randomUUID().toString(), "", "", "", "", "", "", List.of(""))),
                List.of(new ResumeData.AchievementEntry(UUID.randomUUID().toString(), "")),
                List.of(new ResumeData.EducationEntry(UUID.randomUUID().toString(), "", "", "", "", "")),
                List.of(new ResumeData.LanguageEntry(UUID.randomUUID().toString(), "", "")),
                List.of(),
                "Inter",
                "executive-navy",
                "medium"
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
