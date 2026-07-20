package com.resumemaker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Entity
@Table(name = "job_offers")
@Getter
@Setter
public class JobOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String role;

    private Double baseSalary;

    private Double bonus;

    private Double equity;

    private String location;

    private Integer ptoDays;

    private Integer wlbRating; // 1-5 scale
}
