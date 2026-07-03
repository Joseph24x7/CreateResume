package com.resumemaker.model;

import java.time.Instant;
import java.util.UUID;

public class ResumeDto {

    public record Summary(UUID id, String title, Instant createdAt, Instant updatedAt) {}

    public record Full(UUID id, String title, ResumeData.Data data, Instant createdAt, Instant updatedAt) {}

    public record CreateRequest(String title) {}

    public record UpdateRequest(String title, ResumeData.Data data) {}
}
