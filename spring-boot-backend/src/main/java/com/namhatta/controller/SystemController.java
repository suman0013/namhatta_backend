package com.namhatta.controller;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class SystemController {

    @GetMapping("/api/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        return response;
    }

    @GetMapping("/api/about")
    public Map<String, String> about() {
        Map<String, String> response = new HashMap<>();
        response.put("name", "Namhatta Management System");
        response.put("version", "1.0.0");
        response.put("description", "Spring Boot backend for managing Namhatta organizations");
        return response;
    }
}
