package com.namhatta.controller;

import com.namhatta.dto.*;
import com.namhatta.security.CustomUserDetails;
import com.namhatta.service.RoleManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/senapoti")
public class SenapotiController {

    @Autowired
    private RoleManagementService roleManagementService;

    @PostMapping("/transfer-subordinates")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<TransferResult> transferSubordinates(
            @Valid @RequestBody TransferSubordinatesRequest request) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        Long userId = userDetails.getUserId();
        
        TransferResult result = roleManagementService.transferSubordinates(request, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/promote")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<RoleChangeResult> promoteDevotee(
            @Valid @RequestBody PromoteDevoteeRequest request) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        Long userId = userDetails.getUserId();
        
        RoleChangeResult result = roleManagementService.promoteDevotee(request, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/demote")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<RoleChangeResult> demoteDevotee(
            @Valid @RequestBody DemoteDevoteeRequest request) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        Long userId = userDetails.getUserId();
        
        RoleChangeResult result = roleManagementService.demoteDevotee(request, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/remove-role")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<RoleChangeResult> removeRole(
            @Valid @RequestBody RemoveRoleRequest request) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        Long userId = userDetails.getUserId();
        
        RoleChangeResult result = roleManagementService.removeRole(
                request.getDevoteeId(), 
                request.getReason(), 
                userId
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/available-supervisors/{districtCode}/{targetRole}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<List<DevoteeDTO>> getAvailableSupervisors(
            @PathVariable String districtCode,
            @PathVariable String targetRole,
            @RequestParam(required = false) List<Long> excludeIds) {
        
        List<DevoteeDTO> supervisors = roleManagementService.getAvailableSupervisors(
                districtCode, 
                targetRole, 
                excludeIds
        );
        return ResponseEntity.ok(supervisors);
    }

    @GetMapping("/subordinates/{devoteeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<Map<String, Object>> getDirectSubordinates(@PathVariable Long devoteeId) {
        List<DevoteeDTO> subordinates = roleManagementService.getDirectSubordinates(devoteeId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("devoteeId", devoteeId);
        response.put("subordinates", subordinates);
        response.put("count", subordinates.size());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/subordinates/{devoteeId}/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<Map<String, Object>> getAllSubordinates(@PathVariable Long devoteeId) {
        List<DevoteeDTO> allSubordinates = roleManagementService.getAllSubordinates(devoteeId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("devoteeId", devoteeId);
        response.put("allSubordinates", allSubordinates);
        response.put("count", allSubordinates.size());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/role-history/{devoteeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<Page<Map<String, Object>>> getRoleHistory(
            @PathVariable Long devoteeId,
            Pageable pageable) {
        
        Page<Map<String, Object>> history = roleManagementService.getRoleHistory(devoteeId, pageable);
        return ResponseEntity.ok(history);
    }
}
