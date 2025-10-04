package com.namhatta.dto;

import com.namhatta.model.enums.LeadershipRole;
import jakarta.validation.constraints.NotNull;

public class LeadershipRequest {
    @NotNull(message = "Leadership role is required")
    private LeadershipRole leadershipRole;

    private Long reportingToDevoteeId;
    private Boolean hasSystemAccess;

    // Getters and Setters
    public LeadershipRole getLeadershipRole() {
        return leadershipRole;
    }

    public void setLeadershipRole(LeadershipRole leadershipRole) {
        this.leadershipRole = leadershipRole;
    }

    public Long getReportingToDevoteeId() {
        return reportingToDevoteeId;
    }

    public void setReportingToDevoteeId(Long reportingToDevoteeId) {
        this.reportingToDevoteeId = reportingToDevoteeId;
    }

    public Boolean getHasSystemAccess() {
        return hasSystemAccess;
    }

    public void setHasSystemAccess(Boolean hasSystemAccess) {
        this.hasSystemAccess = hasSystemAccess;
    }
}
