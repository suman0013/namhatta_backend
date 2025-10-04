package com.namhatta.dto;

import java.util.List;

public class UserInfo {
    
    private Long id;
    private String username;
    private String role;
    private List<String> districts;
    
    public UserInfo() {}
    
    public UserInfo(Long id, String username, String role, List<String> districts) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.districts = districts;
    }
    
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
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public List<String> getDistricts() {
        return districts;
    }
    
    public void setDistricts(List<String> districts) {
        this.districts = districts;
    }
}
