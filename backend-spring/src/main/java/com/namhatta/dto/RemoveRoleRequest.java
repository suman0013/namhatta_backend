package com.namhatta.dto;

import jakarta.validation.constraints.*;

public class RemoveRoleRequest {
    @NotNull(message = "Devotee ID is required")
    private Long devoteeId;

    private Long newSupervisorId;

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotBlank(message = "District code is required")
    private String districtCode;

    // Getters and Setters
    public Long getDevoteeId() {
        return devoteeId;
    }

    public void setDevoteeId(Long devoteeId) {
        this.devoteeId = devoteeId;
    }

    public Long getNewSupervisorId() {
        return newSupervisorId;
    }

    public void setNewSupervisorId(Long newSupervisorId) {
        this.newSupervisorId = newSupervisorId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDistrictCode() {
        return districtCode;
    }

    public void setDistrictCode(String districtCode) {
        this.districtCode = districtCode;
    }
}
