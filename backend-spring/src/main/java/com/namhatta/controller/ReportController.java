package com.namhatta.controller;

import com.namhatta.model.enums.UserRole;
import com.namhatta.security.CustomUserDetails;
import com.namhatta.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/hierarchical")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<ReportService.HierarchicalReportDTO> getHierarchicalReports() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        
        UserRole userRole = userDetails.getUserRole();
        List<String> userDistricts = userDetails.getDistricts();
        
        ReportService.HierarchicalReportDTO reports = reportService.getHierarchicalReports(userRole, userDistricts);
        
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(reports);
    }

    @GetMapping("/states")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<List<ReportService.StateReportDTO>> getAllStates() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        
        UserRole userRole = userDetails.getUserRole();
        List<String> userDistricts = userDetails.getDistricts();
        
        List<ReportService.StateReportDTO> states = reportService.getAllStatesWithCounts(userRole, userDistricts);
        return ResponseEntity.ok(states);
    }

    @GetMapping("/districts/{state}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<List<ReportService.DistrictReportDTO>> getDistrictsByState(@PathVariable String state) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        
        UserRole userRole = userDetails.getUserRole();
        List<String> userDistricts = userDetails.getDistricts();
        
        List<ReportService.DistrictReportDTO> districts = reportService.getDistrictsByState(state, userRole, userDistricts);
        return ResponseEntity.ok(districts);
    }

    @GetMapping("/sub-districts/{state}/{district}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<List<ReportService.SubDistrictReportDTO>> getSubDistrictsByDistrict(
            @PathVariable String state,
            @PathVariable String district) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        
        UserRole userRole = userDetails.getUserRole();
        List<String> userDistricts = userDetails.getDistricts();
        
        List<ReportService.SubDistrictReportDTO> subDistricts = reportService.getSubDistrictsByDistrict(state, district, userRole, userDistricts);
        return ResponseEntity.ok(subDistricts);
    }

    @GetMapping("/villages/{state}/{district}/{subdistrict}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE', 'DISTRICT_SUPERVISOR')")
    public ResponseEntity<List<ReportService.VillageReportDTO>> getVillagesBySubDistrict(
            @PathVariable String state,
            @PathVariable String district,
            @PathVariable String subdistrict) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        
        UserRole userRole = userDetails.getUserRole();
        List<String> userDistricts = userDetails.getDistricts();
        
        List<ReportService.VillageReportDTO> villages = reportService.getVillagesBySubDistrict(state, district, subdistrict, userRole, userDistricts);
        return ResponseEntity.ok(villages);
    }
}
