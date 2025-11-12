package com.namhatta.controller;

import com.namhatta.model.entity.NamhattaUpdate;
import com.namhatta.service.NamhattaUpdateService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/updates")
public class NamhattaUpdateController {

    @Autowired
    private NamhattaUpdateService namhattaUpdateService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<NamhattaUpdate> createUpdate(@Valid @RequestBody NamhattaUpdateService.NamhattaUpdateRequest request) {
        NamhattaUpdate update = namhattaUpdateService.createUpdate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(update);
    }

    @GetMapping("/all")
    public ResponseEntity<List<NamhattaUpdate>> getAllUpdates() {
        List<NamhattaUpdate> updates = namhattaUpdateService.getAllUpdates();
        return ResponseEntity.ok(updates);
    }
}
