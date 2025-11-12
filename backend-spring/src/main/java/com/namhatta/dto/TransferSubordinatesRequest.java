package com.namhatta.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public class TransferSubordinatesRequest {
    @NotNull(message = "From devotee ID is required")
    private Long fromDevoteeId;

    private Long toDevoteeId;

    @NotEmpty(message = "At least one subordinate must be specified")
    private List<Long> subordinateIds;

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotBlank(message = "District code is required")
    private String districtCode;

    // Getters and Setters
    public Long getFromDevoteeId() {
        return fromDevoteeId;
    }

    public void setFromDevoteeId(Long fromDevoteeId) {
        this.fromDevoteeId = fromDevoteeId;
    }

    public Long getToDevoteeId() {
        return toDevoteeId;
    }

    public void setToDevoteeId(Long toDevoteeId) {
        this.toDevoteeId = toDevoteeId;
    }

    public List<Long> getSubordinateIds() {
        return subordinateIds;
    }

    public void setSubordinateIds(List<Long> subordinateIds) {
        this.subordinateIds = subordinateIds;
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
