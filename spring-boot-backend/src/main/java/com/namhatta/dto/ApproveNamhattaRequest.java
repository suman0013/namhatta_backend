package com.namhatta.dto;

import jakarta.validation.constraints.*;

public class ApproveNamhattaRequest {
    @NotBlank(message = "Registration number is required")
    @Size(max = 100)
    private String registrationNo;

    @NotBlank(message = "Registration date is required")
    private String registrationDate;

    // Getters and Setters
    public String getRegistrationNo() {
        return registrationNo;
    }

    public void setRegistrationNo(String registrationNo) {
        this.registrationNo = registrationNo;
    }

    public String getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(String registrationDate) {
        this.registrationDate = registrationDate;
    }
}
