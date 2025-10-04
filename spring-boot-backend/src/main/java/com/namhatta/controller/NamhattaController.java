package com.namhatta.controller;

import com.namhatta.dto.*;
import com.namhatta.service.NamhattaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/namhattas")
public class NamhattaController {

    @Autowired
    private NamhattaService namhattaService;

    @GetMapping
    public Page<NamhattaDTO> getNamhattas(
            Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String status) {
        
        return namhattaService.getNamhattas(pageable, search, country, state, district, status);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NamhattaDTO> getNamhatta(@PathVariable Long id) {
        NamhattaDTO namhatta = namhattaService.getNamhatta(id);
        return ResponseEntity.ok(namhatta);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public ResponseEntity<NamhattaDTO> createNamhatta(@Valid @RequestBody CreateNamhattaRequest request) {
        try {
            NamhattaDTO namhatta = namhattaService.createNamhatta(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(namhatta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public ResponseEntity<NamhattaDTO> updateNamhatta(
            @PathVariable Long id,
            @Valid @RequestBody UpdateNamhattaRequest request) {
        
        NamhattaDTO namhatta = namhattaService.updateNamhatta(id, request);
        return ResponseEntity.ok(namhatta);
    }

    @GetMapping("/check-registration/{registrationNo}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public Map<String, Boolean> checkRegistrationNo(@PathVariable String registrationNo) {
        boolean exists = namhattaService.checkRegistrationNo(registrationNo);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return response;
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public ResponseEntity<Map<String, String>> approveNamhatta(
            @PathVariable Long id,
            @Valid @RequestBody ApproveNamhattaRequest request) {
        
        try {
            namhattaService.approveNamhatta(id, request);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Namhatta approved successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public ResponseEntity<Map<String, String>> rejectNamhatta(
            @PathVariable Long id,
            @RequestBody RejectNamhattaRequest request) {
        
        String reason = request.getReason();
        namhattaService.rejectNamhatta(id, reason);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Namhatta rejected");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/devotees")
    public Page<DevoteeDTO> getDevoteesByNamhatta(
            @PathVariable Long id,
            Pageable pageable,
            @RequestParam(required = false) Long statusId) {
        
        return namhattaService.getDevoteesByNamhatta(id, pageable, statusId);
    }

    @GetMapping("/{id}/updates")
    public List<Map<String, Object>> getNamhattaUpdates(@PathVariable Long id) {
        return namhattaService.getNamhattaUpdates(id);
    }

    @GetMapping("/{id}/devotee-status-count")
    public Map<String, Integer> getDevoteeStatusCount(@PathVariable Long id) {
        return namhattaService.getDevoteeStatusCount(id);
    }

    @GetMapping("/{id}/status-history")
    public Page<Map<String, Object>> getStatusHistory(
            @PathVariable Long id,
            Pageable pageable) {
        
        return namhattaService.getStatusHistory(id, pageable);
    }
}
