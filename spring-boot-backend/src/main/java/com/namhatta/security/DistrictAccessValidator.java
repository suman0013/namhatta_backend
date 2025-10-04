package com.namhatta.security;

import com.namhatta.model.entity.Devotee;
import com.namhatta.model.entity.DevoteeAddress;
import com.namhatta.repository.DevoteeAddressRepository;
import com.namhatta.repository.DevoteeRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class DistrictAccessValidator {
    
    private final DevoteeRepository devoteeRepository;
    private final DevoteeAddressRepository devoteeAddressRepository;
    
    public DistrictAccessValidator(DevoteeRepository devoteeRepository,
                                   DevoteeAddressRepository devoteeAddressRepository) {
        this.devoteeRepository = devoteeRepository;
        this.devoteeAddressRepository = devoteeAddressRepository;
    }
    
    /**
     * Validate that the user has access to a devotee based on district
     */
    public void validateDevoteeAccess(Long devoteeId, List<String> userDistricts) {
        Optional<Devotee> devoteeOpt = devoteeRepository.findById(devoteeId);
        
        if (devoteeOpt.isEmpty()) {
            throw new AccessDeniedException("Devotee not found");
        }
        
        // Get devotee's address districts
        List<DevoteeAddress> addresses = devoteeAddressRepository.findByDevoteeId(devoteeId);
        List<String> devoteeDistricts = addresses.stream()
                .map(addr -> addr.getAddress().getDistrictCode())
                .filter(code -> code != null)
                .collect(Collectors.toList());
        
        // Check if any of user's districts match devotee's districts
        boolean hasAccess = userDistricts.stream()
                .anyMatch(devoteeDistricts::contains);
        
        if (!hasAccess) {
            throw new AccessDeniedException("User does not have access to this devotee");
        }
    }
    
    /**
     * Get current user's districts from security context
     */
    public List<String> getCurrentUserDistricts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            return userDetails.getDistricts();
        }
        
        return List.of();
    }
    
    /**
     * Get current user ID from security context
     */
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            return userDetails.getUserId();
        }
        
        return null;
    }
    
    /**
     * Check if current user has a specific role
     */
    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            return userDetails.getRole().name().equals(role);
        }
        
        return false;
    }
}
