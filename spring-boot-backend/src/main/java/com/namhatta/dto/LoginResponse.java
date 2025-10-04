package com.namhatta.dto;

import java.util.List;

public class LoginResponse {
    
    private Long id;
    private String username;
    private String role;
    private List<String> districts;
    private String token;
    
    public LoginResponse() {}
    
    public LoginResponse(Long id, String username, String role, List<String> districts, String token) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.districts = districts;
        this.token = token;
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
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
}
