package com.namhatta.dto;

import java.util.List;

public class UserDTO {
    
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private Long devoteeId;
    private Boolean isActive;
    private List<DistrictDTO> districts;
    
    public UserDTO() {}
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public Long getDevoteeId() {
        return devoteeId;
    }
    
    public void setDevoteeId(Long devoteeId) {
        this.devoteeId = devoteeId;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public List<DistrictDTO> getDistricts() {
        return districts;
    }
    
    public void setDistricts(List<DistrictDTO> districts) {
        this.districts = districts;
    }
}
