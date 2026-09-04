package com.resumemaker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "job_applications")
@Getter
@Setter
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String role;

    private String salary;

    @Column(nullable = false)
    private String status; // Wishlist, Applied, Interviewing, Offer, Rejected

    private LocalDate dateApplied;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String url;
}
