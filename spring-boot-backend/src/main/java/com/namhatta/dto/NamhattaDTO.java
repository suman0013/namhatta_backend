package com.namhatta.dto;

import java.time.LocalDateTime;

public class NamhattaDTO {
    private Long id;
    private String code;
    private String name;
    private String meetingDay;
    private String meetingTime;
    private Long malaSenapotiId;
    private String malaSenapotiName;
    private Long mahaChakraSenapotiId;
    private String mahaChakraSenapotiName;
    private Long chakraSenapotiId;
    private String chakraSenapotiName;
    private Long upaChakraSenapotiId;
    private String upaChakraSenapotiName;
    private Long secretaryId;
    private String secretaryName;
    private Long presidentId;
    private String presidentName;
    private Long accountantId;
    private String accountantName;
    private Long districtSupervisorId;
    private String districtSupervisorName;
    private String status;
    private String registrationNo;
    private String registrationDate;
    private AddressDTO address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public NamhattaDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getMeetingDay() { return meetingDay; }
    public void setMeetingDay(String meetingDay) { this.meetingDay = meetingDay; }
    
    public String getMeetingTime() { return meetingTime; }
    public void setMeetingTime(String meetingTime) { this.meetingTime = meetingTime; }
    
    public Long getMalaSenapotiId() { return malaSenapotiId; }
    public void setMalaSenapotiId(Long malaSenapotiId) { this.malaSenapotiId = malaSenapotiId; }
    
    public String getMalaSenapotiName() { return malaSenapotiName; }
    public void setMalaSenapotiName(String malaSenapotiName) { this.malaSenapotiName = malaSenapotiName; }
    
    public Long getMahaChakraSenapotiId() { return mahaChakraSenapotiId; }
    public void setMahaChakraSenapotiId(Long mahaChakraSenapotiId) { this.mahaChakraSenapotiId = mahaChakraSenapotiId; }
    
    public String getMahaChakraSenapotiName() { return mahaChakraSenapotiName; }
    public void setMahaChakraSenapotiName(String mahaChakraSenapotiName) { this.mahaChakraSenapotiName = mahaChakraSenapotiName; }
    
    public Long getChakraSenapotiId() { return chakraSenapotiId; }
    public void setChakraSenapotiId(Long chakraSenapotiId) { this.chakraSenapotiId = chakraSenapotiId; }
    
    public String getChakraSenapotiName() { return chakraSenapotiName; }
    public void setChakraSenapotiName(String chakraSenapotiName) { this.chakraSenapotiName = chakraSenapotiName; }
    
    public Long getUpaChakraSenapotiId() { return upaChakraSenapotiId; }
    public void setUpaChakraSenapotiId(Long upaChakraSenapotiId) { this.upaChakraSenapotiId = upaChakraSenapotiId; }
    
    public String getUpaChakraSenapotiName() { return upaChakraSenapotiName; }
    public void setUpaChakraSenapotiName(String upaChakraSenapotiName) { this.upaChakraSenapotiName = upaChakraSenapotiName; }
    
    public Long getSecretaryId() { return secretaryId; }
    public void setSecretaryId(Long secretaryId) { this.secretaryId = secretaryId; }
    
    public String getSecretaryName() { return secretaryName; }
    public void setSecretaryName(String secretaryName) { this.secretaryName = secretaryName; }
    
    public Long getPresidentId() { return presidentId; }
    public void setPresidentId(Long presidentId) { this.presidentId = presidentId; }
    
    public String getPresidentName() { return presidentName; }
    public void setPresidentName(String presidentName) { this.presidentName = presidentName; }
    
    public Long getAccountantId() { return accountantId; }
    public void setAccountantId(Long accountantId) { this.accountantId = accountantId; }
    
    public String getAccountantName() { return accountantName; }
    public void setAccountantName(String accountantName) { this.accountantName = accountantName; }
    
    public Long getDistrictSupervisorId() { return districtSupervisorId; }
    public void setDistrictSupervisorId(Long districtSupervisorId) { this.districtSupervisorId = districtSupervisorId; }
    
    public String getDistrictSupervisorName() { return districtSupervisorName; }
    public void setDistrictSupervisorName(String districtSupervisorName) { this.districtSupervisorName = districtSupervisorName; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getRegistrationNo() { return registrationNo; }
    public void setRegistrationNo(String registrationNo) { this.registrationNo = registrationNo; }
    
    public String getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(String registrationDate) { this.registrationDate = registrationDate; }
    
    public AddressDTO getAddress() { return address; }
    public void setAddress(AddressDTO address) { this.address = address; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
