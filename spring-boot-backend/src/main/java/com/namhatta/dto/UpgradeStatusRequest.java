package com.namhatta.dto;

import jakarta.validation.constraints.NotNull;

public class UpgradeStatusRequest {
    @NotNull(message = "New status ID is required")
    private Long newStatusId;

    private String notes;

    // Getters and Setters
    public Long getNewStatusId() {
        return newStatusId;
    }

    public void setNewStatusId(Long newStatusId) {
        this.newStatusId = newStatusId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
