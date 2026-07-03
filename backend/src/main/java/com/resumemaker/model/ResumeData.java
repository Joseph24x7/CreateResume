package com.resumemaker.model;

import java.util.List;

public class ResumeData {

    public record PersonalInfo(
            String firstName,
            String lastName,
            String title,
            String email,
            String phone,
            String location,
            String linkedin,
            String github,
            String website,
            String leetcode
    ) {}

    public record SkillCategory(String id, String category, String skills) {}

    public record ExperienceEntry(
            String id,
            String role,
            String company,
            String startDate,
            String endDate,
            String location,
            String project,
            List<String> achievements
    ) {}

    public record AchievementEntry(String id, String text) {}

    public record EducationEntry(
            String id,
            String degree,
            String institution,
            String startDate,
            String endDate,
            String location
    ) {}

    public record LanguageEntry(String id, String language, String proficiency) {}

    public record Data(
            PersonalInfo personalInfo,
            String summary,
            List<SkillCategory> skillCategories,
            List<ExperienceEntry> experiences,
            List<AchievementEntry> achievements,
            List<EducationEntry> educations,
            List<LanguageEntry> languages,
            List<String> hiddenSections,
            String font
    ) {}
}
