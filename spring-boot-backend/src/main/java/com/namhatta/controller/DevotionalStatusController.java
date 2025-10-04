package com.namhatta.controller;

import com.namhatta.model.entity.DevotionalStatus;
import com.namhatta.service.DevotionalStatusService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statuses")
public class DevotionalStatusController {

    @Autowired
    private DevotionalStatusService devotionalStatusService;

    @GetMapping
    public ResponseEntity<List<DevotionalStatus>> getAllStatuses() {
        List<DevotionalStatus> statuses = devotionalStatusService.getAllStatuses();
        return ResponseEntity.ok(statuses);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public ResponseEntity<DevotionalStatus> createStatus(@Valid @RequestBody Map<String, String> request) {
        String name = request.get("name");
        DevotionalStatus status = devotionalStatusService.createStatus(name);
        return ResponseEntity.status(HttpStatus.CREATED).body(status);
    }

    @PostMapping("/{id}/rename")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public ResponseEntity<DevotionalStatus> renameStatus(
            @PathVariable Long id,
            @Valid @RequestBody Map<String, String> request) {
        
        String newName = request.get("newName");
        DevotionalStatus status = devotionalStatusService.renameStatus(id, newName);
        return ResponseEntity.ok(status);
    }
}
