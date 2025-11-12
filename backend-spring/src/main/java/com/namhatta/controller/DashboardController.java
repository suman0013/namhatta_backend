package com.namhatta.controller;

import com.namhatta.model.enums.UserRole;
import com.namhatta.security.CustomUserDetails;
import com.namhatta.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DashboardService.DashboardDTO> getDashboard() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        
        UserRole userRole = userDetails.getUserRole();
        List<String> userDistricts = userDetails.getDistricts();
        
        DashboardService.DashboardDTO dashboard = dashboardService.getDashboardSummary(userRole, userDistricts);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/status-distribution")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DashboardService.StatusDistributionDTO>> getStatusDistribution() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        
        UserRole userRole = userDetails.getUserRole();
        List<String> userDistricts = userDetails.getDistricts();
        
        List<DashboardService.StatusDistributionDTO> distribution = dashboardService.getStatusDistribution(userRole, userDistricts);
        return ResponseEntity.ok(distribution);
    }
}
