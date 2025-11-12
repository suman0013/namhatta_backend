package com.namhatta.dto;

import com.namhatta.model.enums.UserRole;
import jakarta.validation.constraints.Email;
import java.util.List;

public class UpdateUserRequest {
    private String fullName;

    @Email(message = "Invalid email format")
    private String email;

    private UserRole role;
    private List<DistrictDTO> districts;

    // Getters and Setters
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

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public List<DistrictDTO> getDistricts() {
        return districts;
    }

    public void setDistricts(List<DistrictDTO> districts) {
        this.districts = districts;
    }
}
