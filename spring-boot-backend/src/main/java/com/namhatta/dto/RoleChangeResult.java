package com.namhatta.dto;

public class RoleChangeResult {
    private DevoteeDTO devotee;
    private int subordinatesTransferred;
    private Long roleChangeRecordId;
    private String message;

    public RoleChangeResult() {
    }

    public RoleChangeResult(DevoteeDTO devotee, int subordinatesTransferred, Long roleChangeRecordId, String message) {
        this.devotee = devotee;
        this.subordinatesTransferred = subordinatesTransferred;
        this.roleChangeRecordId = roleChangeRecordId;
        this.message = message;
    }

    // Getters and Setters
    public DevoteeDTO getDevotee() {
        return devotee;
    }

    public void setDevotee(DevoteeDTO devotee) {
        this.devotee = devotee;
    }

    public int getSubordinatesTransferred() {
        return subordinatesTransferred;
    }

    public void setSubordinatesTransferred(int subordinatesTransferred) {
        this.subordinatesTransferred = subordinatesTransferred;
    }

    public Long getRoleChangeRecordId() {
        return roleChangeRecordId;
    }

    public void setRoleChangeRecordId(Long roleChangeRecordId) {
        this.roleChangeRecordId = roleChangeRecordId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
