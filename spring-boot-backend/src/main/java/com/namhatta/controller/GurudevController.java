package com.namhatta.controller;

import com.namhatta.model.entity.Gurudev;
import com.namhatta.service.GurudevService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gurudevs")
public class GurudevController {

    @Autowired
    private GurudevService gurudevService;

    @GetMapping
    public ResponseEntity<List<Gurudev>> getAllGurudevs() {
        List<Gurudev> gurudevs = gurudevService.getAllGurudevs();
        return ResponseEntity.ok(gurudevs);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public ResponseEntity<Gurudev> createGurudev(@Valid @RequestBody Map<String, String> request) {
        String name = request.get("name");
        String title = request.get("title");
        Gurudev gurudev = gurudevService.createGurudev(name, title);
        return ResponseEntity.status(HttpStatus.CREATED).body(gurudev);
    }
}
