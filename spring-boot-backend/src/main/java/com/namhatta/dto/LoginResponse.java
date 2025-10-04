package com.namhatta.dto;

public class LoginResponse {
    
    private UserDTO user;
    private String token;
    
    public LoginResponse() {}
    
    public LoginResponse(UserDTO user, String token) {
        this.user = user;
        this.token = token;
    }
    
    public UserDTO getUser() {
        return user;
    }
    
    public void setUser(UserDTO user) {
        this.user = user;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
}
