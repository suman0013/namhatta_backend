package com.namhatta.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.ArrayList;
import java.util.List;

@Configuration
@Profile("prod")
public class EnvironmentValidator {

    private static final Logger logger = LoggerFactory.getLogger(EnvironmentValidator.class);

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${jwt.secret:#{null}}")
    private String jwtSecret;

    @Value("${session.secret:#{null}}")
    private String sessionSecret;

    @PostConstruct
    public void validateEnvironment() {
        List<String> missingVariables = new ArrayList<>();

        if (databaseUrl == null || databaseUrl.isEmpty()) {
            missingVariables.add("DATABASE_URL");
        }

        if (jwtSecret == null || jwtSecret.isEmpty()) {
            missingVariables.add("JWT_SECRET");
        }

        if (sessionSecret == null || sessionSecret.isEmpty()) {
            missingVariables.add("SESSION_SECRET");
        }

        if (!missingVariables.isEmpty()) {
            String errorMessage = String.format(
                "FATAL: Required environment variables are missing: %s. " +
                "Application cannot start without these variables in production mode.",
                String.join(", ", missingVariables)
            );
            logger.error(errorMessage);
            throw new IllegalStateException(errorMessage);
        }

        logger.info("Environment validation passed - all required variables are set");
        
        validateJwtSecretStrength();
    }

    private void validateJwtSecretStrength() {
        if (jwtSecret != null && jwtSecret.length() < 32) {
            logger.warn("JWT_SECRET is less than 32 characters - this is not recommended for production");
        }
    }
}
