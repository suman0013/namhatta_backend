package com.namhatta.dto;

import java.util.List;

public class TransferResult {
    private int count;
    private List<DevoteeDTO> updatedSubordinates;
    private String message;

    public TransferResult() {
    }

    public TransferResult(int count, List<DevoteeDTO> updatedSubordinates, String message) {
        this.count = count;
        this.updatedSubordinates = updatedSubordinates;
        this.message = message;
    }

    // Getters and Setters
    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public List<DevoteeDTO> getUpdatedSubordinates() {
        return updatedSubordinates;
    }

    public void setUpdatedSubordinates(List<DevoteeDTO> updatedSubordinates) {
        this.updatedSubordinates = updatedSubordinates;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
