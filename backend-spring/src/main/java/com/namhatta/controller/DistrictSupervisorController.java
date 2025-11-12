package com.namhatta.controller;

import com.namhatta.model.entity.User;
import com.namhatta.model.entity.UserDistrict;
import com.namhatta.model.enums.UserRole;
import com.namhatta.repository.AddressRepository;
import com.namhatta.repository.UserDistrictRepository;
import com.namhatta.repository.UserRepository;
import com.namhatta.security.CustomUserDetails;
import com.namhatta.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/district-supervisors")
public class DistrictSupervisorController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDistrictRepository userDistrictRepository;

    @Autowired
    private AddressRepository addressRepository;

    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getAllDistrictSupervisors() {
        List<User> supervisors = userRepository.findByRole(UserRole.DISTRICT_SUPERVISOR);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (User supervisor : supervisors) {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", supervisor.getId());
            dto.put("username", supervisor.getUsername());
            dto.put("fullName", supervisor.getFullName());
            dto.put("email", supervisor.getEmail());
            dto.put("isActive", supervisor.getIsActive());
            
            // Get districts for this supervisor
            List<UserDistrict> districts = userDistrictRepository.findByUserId(supervisor.getId());
            List<Map<String, String>> districtList = new ArrayList<>();
            for (UserDistrict ud : districts) {
                Map<String, String> district = new HashMap<>();
                district.put("code", ud.getDistrictCode());
                district.put("name", ud.getDistrictNameEnglish());
                districtList.add(district);
            }
            dto.put("districts", districtList);
            
            // Include linked devotee info if available
            if (supervisor.getDevotee() != null) {
                Map<String, Object> devotee = new HashMap<>();
                devotee.put("id", supervisor.getDevotee().getId());
                devotee.put("name", supervisor.getDevotee().getName());
                dto.put("devotee", devotee);
            }
            
            result.add(dto);
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getDistrictSupervisorsByDistrict(
            @RequestParam(required = true) String district) {
        
        List<UserDistrict> userDistricts = userDistrictRepository.findByDistrictCode(district);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (UserDistrict ud : userDistricts) {
            User supervisor = ud.getUser();
            if (supervisor.getRole() == UserRole.DISTRICT_SUPERVISOR) {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", supervisor.getId());
                dto.put("username", supervisor.getUsername());
                dto.put("fullName", supervisor.getFullName());
                dto.put("email", supervisor.getEmail());
                dto.put("isActive", supervisor.getIsActive());
                dto.put("districtCode", ud.getDistrictCode());
                dto.put("districtName", ud.getDistrictNameEnglish());
                
                if (supervisor.getDevotee() != null) {
                    Map<String, Object> devotee = new HashMap<>();
                    devotee.put("id", supervisor.getDevotee().getId());
                    devotee.put("name", supervisor.getDevotee().getName());
                    dto.put("devotee", devotee);
                }
                
                result.add(dto);
            }
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/user/address-defaults")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> getAddressDefaults() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        
        Map<String, String> defaults = new HashMap<>();
        
        if (userDetails.getUserRole() == UserRole.DISTRICT_SUPERVISOR) {
            List<String> districts = userDetails.getDistricts();
            if (!districts.isEmpty()) {
                String firstDistrict = districts.get(0);
                
                // Query address info for that district
                List<Object[]> addressInfo = addressRepository.findDistrictInfo(firstDistrict);
                if (!addressInfo.isEmpty()) {
                    Object[] info = addressInfo.get(0);
                    defaults.put("country", (String) info[0]);
                    defaults.put("state", (String) info[1]);
                    defaults.put("district", (String) info[2]);
                }
            }
        } else {
            defaults.put("country", null);
            defaults.put("state", null);
            defaults.put("district", null);
        }
        
        return ResponseEntity.ok(defaults);
    }
}
