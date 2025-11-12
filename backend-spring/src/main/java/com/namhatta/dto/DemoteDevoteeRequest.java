package com.namhatta.dto;

import com.namhatta.model.enums.LeadershipRole;
import jakarta.validation.constraints.*;

public class DemoteDevoteeRequest {
    @NotNull(message = "Devotee ID is required")
    private Long devoteeId;

    @NotNull(message = "Target role is required")
    private LeadershipRole targetRole;

    private Long newReportingToId;
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

    public LeadershipRole getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(LeadershipRole targetRole) {
        this.targetRole = targetRole;
    }

    public Long getNewReportingToId() {
        return newReportingToId;
    }

    public void setNewReportingToId(Long newReportingToId) {
        this.newReportingToId = newReportingToId;
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
