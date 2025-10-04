package com.namhatta.controller;

import com.namhatta.dto.*;
import com.namhatta.model.enums.UserRole;
import com.namhatta.security.CustomUserDetails;
import com.namhatta.service.DevoteeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devotees")
public class DevoteeController {

    @Autowired
    private DevoteeService devoteeService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Page<DevoteeDTO> getDevotees(
            Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Long statusId) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        
        UserRole userRole = userDetails.getUserRole();
        List<String> userDistricts = userDetails.getDistricts();
        
        return devoteeService.getDevotees(pageable, search, country, state, district, statusId, userRole, userDistricts);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DevoteeDTO> getDevotee(@PathVariable Long id) {
        DevoteeDTO devotee = devoteeService.getDevotee(id);
        return ResponseEntity.ok(devotee);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public ResponseEntity<DevoteeDTO> createDevotee(@Valid @RequestBody CreateDevoteeRequest request) {
        DevoteeDTO devotee = devoteeService.createDevotee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(devotee);
    }

    @PostMapping("/{namhattaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public ResponseEntity<DevoteeDTO> createDevoteeForNamhatta(
            @PathVariable Long namhattaId,
            @Valid @RequestBody CreateDevoteeRequest request) {
        
        request.setNamhattaId(namhattaId);
        DevoteeDTO devotee = devoteeService.createDevotee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(devotee);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<DevoteeDTO> updateDevotee(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDevoteeRequest request) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        
        UserRole userRole = userDetails.getUserRole();
        List<String> userDistricts = userDetails.getDistricts();
        
        DevoteeDTO devotee = devoteeService.updateDevotee(id, request, userRole, userDistricts);
        return ResponseEntity.ok(devotee);
    }

    @PostMapping("/{id}/upgrade-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public ResponseEntity<Map<String, String>> upgradeStatus(
            @PathVariable Long id,
            @RequestBody UpgradeStatusRequest request) {
        
        devoteeService.upgradeDevoteeStatus(id, request.getNewStatusId(), request.getNotes());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Status upgraded successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/assign-leadership")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public ResponseEntity<Map<String, String>> assignLeadership(
            @PathVariable Long id,
            @Valid @RequestBody LeadershipRequest request) {
        
        devoteeService.assignLeadership(id, request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Leadership assigned successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/leadership")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public ResponseEntity<Map<String, String>> removeLeadership(@PathVariable Long id) {
        devoteeService.removeLeadership(id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Leadership removed successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/link-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> linkUserToDevotee(
            @PathVariable Long id,
            @Valid @RequestBody CreateUserRequest request) {
        
        UserDTO user = devoteeService.linkUserToDevotee(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @GetMapping("/available-officers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DevoteeDTO>> getAvailableOfficers() {
        List<DevoteeDTO> officers = devoteeService.getAvailableOfficers();
        return ResponseEntity.ok(officers);
    }
}
