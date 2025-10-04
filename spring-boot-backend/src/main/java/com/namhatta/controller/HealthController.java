package com.namhatta.controller;

import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("application", "Namhatta Management System - Spring Boot");
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/db-check")
    public ResponseEntity<Map<String, Object>> checkDatabase() {
        Map<String, Object> response = new HashMap<>();
        try (Connection conn = dataSource.getConnection()) {
            response.put("database", "connected");
            response.put("url", conn.getMetaData().getURL());
            response.put("driver", conn.getMetaData().getDriverName());
            response.put("status", "OK");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("database", "error");
            response.put("message", e.getMessage());
            response.put("status", "FAILED");
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/about")
    public Map<String, String> about() {
        Map<String, String> response = new HashMap<>();
        response.put("name", "Namhatta Management System");
        response.put("version", "1.0.0");
        response.put("description", "Spring Boot backend for managing Namhatta organizations");
        return response;
    }
}
