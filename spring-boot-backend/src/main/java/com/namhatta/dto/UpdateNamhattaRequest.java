package com.namhatta.dto;

import com.namhatta.model.enums.NamhattaStatus;
import jakarta.validation.constraints.*;
import java.time.LocalTime;

public class UpdateNamhattaRequest {
    @Size(max = 50)
    private String code;

    @Size(max = 255)
    private String name;

    @Size(max = 50)
    private String meetingDay;

    private LocalTime meetingTime;

    private Long malaSenapotiId;
    private Long mahaChakraSenapotiId;
    private Long chakraSenapotiId;
    private Long upaChakraSenapotiId;

    private Long secretaryId;
    private Long presidentId;
    private Long accountantId;

    private Long districtSupervisorId;
    private NamhattaStatus status;

    @Size(max = 100)
    private String registrationNo;

    private String registrationDate;

    private AddressData address;

    // Getters and Setters
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMeetingDay() {
        return meetingDay;
    }

    public void setMeetingDay(String meetingDay) {
        this.meetingDay = meetingDay;
    }

    public LocalTime getMeetingTime() {
        return meetingTime;
    }

    public void setMeetingTime(LocalTime meetingTime) {
        this.meetingTime = meetingTime;
    }

    public Long getMalaSenapotiId() {
        return malaSenapotiId;
    }

    public void setMalaSenapotiId(Long malaSenapotiId) {
        this.malaSenapotiId = malaSenapotiId;
    }

    public Long getMahaChakraSenapotiId() {
        return mahaChakraSenapotiId;
    }

    public void setMahaChakraSenapotiId(Long mahaChakraSenapotiId) {
        this.mahaChakraSenapotiId = mahaChakraSenapotiId;
    }

    public Long getChakraSenapotiId() {
        return chakraSenapotiId;
    }

    public void setChakraSenapotiId(Long chakraSenapotiId) {
        this.chakraSenapotiId = chakraSenapotiId;
    }

    public Long getUpaChakraSenapotiId() {
        return upaChakraSenapotiId;
    }

    public void setUpaChakraSenapotiId(Long upaChakraSenapotiId) {
        this.upaChakraSenapotiId = upaChakraSenapotiId;
    }

    public Long getSecretaryId() {
        return secretaryId;
    }

    public void setSecretaryId(Long secretaryId) {
        this.secretaryId = secretaryId;
    }

    public Long getPresidentId() {
        return presidentId;
    }

    public void setPresidentId(Long presidentId) {
        this.presidentId = presidentId;
    }

    public Long getAccountantId() {
        return accountantId;
    }

    public void setAccountantId(Long accountantId) {
        this.accountantId = accountantId;
    }

    public Long getDistrictSupervisorId() {
        return districtSupervisorId;
    }

    public void setDistrictSupervisorId(Long districtSupervisorId) {
        this.districtSupervisorId = districtSupervisorId;
    }

    public NamhattaStatus getStatus() {
        return status;
    }

    public void setStatus(NamhattaStatus status) {
        this.status = status;
    }

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

    public AddressData getAddress() {
        return address;
    }

    public void setAddress(AddressData address) {
        this.address = address;
    }
}
