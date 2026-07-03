package com.resumemaker.repository;

import com.resumemaker.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ResumeRepository extends JpaRepository<Resume, UUID> {}
