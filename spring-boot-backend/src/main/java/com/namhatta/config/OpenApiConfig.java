package com.namhatta.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:5000}")
    private String serverPort;

    @Bean
    public OpenAPI namhattaOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Namhatta Management System API")
                        .description("RESTful API for managing Namhattas, devotees, and hierarchical leadership structures")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Namhatta Management Team")
                                .email("support@namhatta.org"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://namhatta.org/license")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Development server"),
                        new Server()
                                .url("https://api.namhatta.org")
                                .description("Production server")))
                .addSecurityItem(new SecurityRequirement().addList("cookieAuth"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("cookieAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.COOKIE)
                                        .name("auth_token")
                                        .description("JWT token stored in HTTP-only cookie")));
    }
}
