package com.resumemaker.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumemaker.exception.ResumeNotFoundException;
import com.resumemaker.model.Resume;
import com.resumemaker.model.ResumeData;
import com.resumemaker.model.ResumeDto;
import com.resumemaker.repository.ResumeRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ResumeService {

    private final ResumeRepository repo;
    private final ObjectMapper mapper;

    public ResumeService(ResumeRepository repo, ObjectMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    @PostConstruct
    public void initData() {
        if (repo.count() == 0) {
            var resume = new Resume();
            resume.setTitle("Joseph's Resume");
            resume.setDataJson(toJson(sampleData()));
            repo.save(resume);
        }
    }

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
                "Inter"
        );
    }

    private ResumeData.Data sampleData() {
        return new ResumeData.Data(
                new ResumeData.PersonalInfo(
                        "Joseph Praveen",
                        "Kumar S",
                        "AVP - Application Development Senior Programmer",
                        "joseph24x7@outlook.com",
                        "+91 8072405300",
                        "Chennai, India",
                        "linkedin.com/in/joseph24x7",
                        "github.com/Joseph24x7",
                        "",
                        "leetcode.com/u/joseph24x7/"
                ),
                "Senior Software Developer with 11+ years of experience building high-performance, scalable web applications across Banking, Payments, and Logistics domains. Proven technical leader with end-to-end ownership from system design to production, specializing in Java-based distributed systems, microservices, event-driven architectures, and performance engineering. Strong advocate of clean code, test automation, and collaborative delivery in fast-paced environments.",
                List.of(
                        new ResumeData.SkillCategory(UUID.randomUUID().toString(), "Languages", "Java 21 | SQL | NoSQL | PL/SQL"),
                        new ResumeData.SkillCategory(UUID.randomUUID().toString(), "Persistence", "PostgreSQL | Oracle | Couchbase | Redis"),
                        new ResumeData.SkillCategory(UUID.randomUUID().toString(), "Frameworks & Libraries", "Spring Boot | JUnit5 | Hibernate | RESTful APIs | SOAP | GraphQL"),
                        new ResumeData.SkillCategory(UUID.randomUUID().toString(), "Event Processing", "Apache Kafka | RabbitMQ | WebSocket | Apache Flink | Spring Schedulers"),
                        new ResumeData.SkillCategory(UUID.randomUUID().toString(), "Architecture & System Design", "Microservices | Monolithic | Distributed Systems | Design Patterns | HLD | LLD | Event-Driven | Fault Tolerance"),
                        new ResumeData.SkillCategory(UUID.randomUUID().toString(), "Cloud & DevOps", "Azure OpenShift (OCP4) | OpenShift Cloud | Lightspeed | CI/CD | Docker | Jenkins | ArgoCD | GCP PubSub"),
                        new ResumeData.SkillCategory(UUID.randomUUID().toString(), "Testing & Performance", "Logging and Observability (Grafana) | Performance Testing (JMeter) | Profiling (JProfiler)"),
                        new ResumeData.SkillCategory(UUID.randomUUID().toString(), "Developer Tools", "Git | Maven | Gradle | SonarQube | Postman | Swagger UI | IntelliJ/VsCode | WinSCP | GitHub")
                ),
                List.of(
                        new ResumeData.ExperienceEntry(
                                UUID.randomUUID().toString(),
                                "AVP - Application Development Senior Programmer",
                                "Citi",
                                "02/2026",
                                "Present",
                                "Chennai, India",
                                "Custody Tax Reclaims",
                                List.of(
                                        "Currently working on Custody Tax Reclaim Report generation by developing a solution from scratch, building a Flink-based streaming pipeline to ingest data from database and publish events asynchronously to Kafka via a session cluster",
                                        "Contributed to architectural design discussions, where the Transactional Outbox pattern was selected for implementation."
                                )
                        ),
                        new ResumeData.ExperienceEntry(
                                UUID.randomUUID().toString(),
                                "Senior Application Developer",
                                "UPS",
                                "01/2024",
                                "02/2026",
                                "Chennai, India",
                                "Shipping Services",
                                List.of(
                                        "Led end-to-end development of multiple SaaS-based microservices using Java, collaborating closely with product managers to deliver scalable and customer-focused solutions. Contributed to key programs such as World Ease Movement and Trade Direct APIs, supporting large-scale revenue-impacting initiatives.",
                                        "Participated in High-Level and Low-Level Design discussions, driving performance optimization, scalability improvements, and cost-efficient architectural decisions documented in Confluence/Wiki.",
                                        "Enhanced legacy shipment modules built on Java Servlets by implementing circuit breakers and database fallback mechanisms (SQL to NoSQL), ensuring high availability and fault tolerance.",
                                        "Strengthened system observability and production support while conducting performance testing to identify bottlenecks and improve application responsiveness.",
                                        "Created and maintained API documentation using OpenAPI/Swagger to ensure clear and consistent service contracts.",
                                        "Collaborated with cross-functional teams and leveraged AI-assisted tools like GitHub Copilot to accelerate development.",
                                        "Actively collaborated with cross-functional teams in Agile/Scrum environments using JIRA and Azure Boards for sprint planning, backlog grooming, and delivery tracking.",
                                        "Acted as a core member of the Java Community of Practice (CoP), conducting knowledge-sharing sessions on Java best practices and mentoring junior engineers through code and design reviews."
                                )
                        ),
                        new ResumeData.ExperienceEntry(
                                UUID.randomUUID().toString(),
                                "Technology Lead",
                                "Infosys Ltd.",
                                "10/2021",
                                "01/2024",
                                "Chennai, India",
                                "Leading Bank in the United States",
                                List.of(
                                        "Fixed bid #1: Led and mentored a team to modernize a hospitality payments platform, migrating legacy systems from MuleSoft and Ruby to Java/Spring Boot-based microservices using PostgreSQL and Redis. Exceptional performance of our team in Fixed bid #1 has earned client trust, resulting in an additional fixed-bid #2 project for the organization.",
                                        "Contributed to the development of a new Zelle Tag feature, enabling enhanced Zelle payment capabilities within the bank's Zelle payments platform for making real-time payments."
                                )
                        ),
                        new ResumeData.ExperienceEntry(
                                UUID.randomUUID().toString(),
                                "I.T.Analyst",
                                "Tata Consultancy Services",
                                "10/2019",
                                "10/2021",
                                "Chennai, India",
                                "Leading International Bank",
                                List.of(
                                        "Enhanced a banking risk management application by integrating asynchronous messaging with Apache Kafka, enabling reliable event-driven processing and improved data flow across systems."
                                )
                        ),
                        new ResumeData.ExperienceEntry(
                                UUID.randomUUID().toString(),
                                "Technology Analyst",
                                "Infosys Ltd.",
                                "05/2015",
                                "10/2019",
                                "Chennai, India",
                                "Leading Bank in the United States",
                                List.of(
                                        "Developed and delivered RESTful APIs for an Admin Tool using Spring MVC to manage customer bank accounts and tokens, presenting solutions directly to the client and ensuring alignment with business requirements.",
                                        "Contributed as an API developer for the Cardless ATM project, that gained recognition in US headlines. Strong understanding of Web and application servers, with hands-on experience on JBoss and Apache Tomcat."
                                )
                        )
                ),
                List.of(
                        new ResumeData.AchievementEntry(UUID.randomUUID().toString(), "UPS -> Proud Team Leader of Team Tech Hustlers, securing 3rd place in the Microsoft Vendor Round at the UPS Hackathon by building a multi-agent AI prototype using Python, LangChain, and OpenAI models, demonstrating agent-to-agent communication, workflow automation, and LLM-powered decision-making."),
                        new ResumeData.AchievementEntry(UUID.randomUUID().toString(), "UPS -> Promoted from Intermediate to Senior Application Developer within six months at UPS, in recognition of exceptional performance as both a technical lead and hands-on developer"),
                        new ResumeData.AchievementEntry(UUID.randomUUID().toString(), "UPS -> Received a Certificate of Recognition for outstanding contributions, especially on the Final Mile project."),
                        new ResumeData.AchievementEntry(UUID.randomUUID().toString(), "Infosys -> Received Glory, Insta, and Rise awards for contributing to multiple projects that increased revenue for my unit. Our team was recognized in Q3 2022-2023 town hall for exceptional results."),
                        new ResumeData.AchievementEntry(UUID.randomUUID().toString(), "UPS -> World Ease Movement projected to drive $147M revenue growth (2024-2028)."),
                        new ResumeData.AchievementEntry(UUID.randomUUID().toString(), "UPS -> Trade Direct APIs forecasted to generate $454M revenue over five years.")
                ),
                List.of(
                        new ResumeData.EducationEntry(
                                UUID.randomUUID().toString(),
                                "Bachelor of Engineering - Computer Science",
                                "Sathyabama University",
                                "08/2011",
                                "04/2015",
                                "Chennai, India"
                        )
                ),
                List.of(
                        new ResumeData.LanguageEntry(UUID.randomUUID().toString(), "English", "Full Professional Proficiency"),
                        new ResumeData.LanguageEntry(UUID.randomUUID().toString(), "Tamil", "Native or Bilingual Proficiency")
                ),
                List.of(),
                "Inter"
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
