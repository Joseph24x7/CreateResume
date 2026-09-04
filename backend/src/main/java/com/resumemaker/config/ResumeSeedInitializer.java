package com.resumemaker.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.List;

@Component
public class ResumeSeedInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ResumeSeedInitializer.class);

    private final DataSource dataSource;

    @Value("${app.seed-data.enabled:true}")
    private boolean seedEnabled;

    @Value("${app.seed-data.files:josephdata.sql,sweetydata.sql}")
    private List<String> seedFiles;

    public ResumeSeedInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Resume seed data loading is disabled via app.seed-data.enabled=false");
            return;
        }

        if (seedFiles == null || seedFiles.isEmpty()) {
            log.info("No resume seed data files configured.");
            return;
        }

        log.info("Processing resume seed data loading for files: {}", seedFiles);

        for (String file : seedFiles) {
            try {
                var resource = new ClassPathResource(file.trim());
                if (!resource.exists()) {
                    log.warn("Seed data file not found on classpath: {}", file);
                    continue;
                }
                var populator = new ResourceDatabasePopulator(resource);
                populator.execute(dataSource);
                log.info("Executed seed script: {}", file);
            } catch (Exception e) {
                log.error("Failed to execute seed data script '{}': {}", file, e.getMessage(), e);
            }
        }
    }
}
