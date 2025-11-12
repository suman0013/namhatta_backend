package com.namhatta.dto;

import com.namhatta.model.enums.Gender;
import com.namhatta.model.enums.LeadershipRole;
import com.namhatta.model.enums.MaritalStatus;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.Map;

public class UpdateDevoteeRequest {
    @Size(max = 255)
    private String legalName;

    @Size(max = 255)
    private String name;

    private LocalDate dateOfBirth;

    @Email(message = "Invalid email format")
    @Size(max = 255)
    private String email;

    @Pattern(regexp = "^[0-9]{10}$|^$", message = "Phone must be 10 digits")
    private String phone;

    private Gender gender;

    @Size(max = 10)
    private String bloodGroup;

    private MaritalStatus maritalStatus;

    @Size(max = 255)
    private String fatherName;

    @Size(max = 255)
    private String motherName;

    @Size(max = 255)
    private String husbandName;

    private Long devotionalStatusId;
    private Long harinamInitiationGurudevId;
    private Long pancharatrikInitiationGurudevId;

    @Size(max = 255)
    private String initiatedName;

    private LocalDate harinamDate;
    private LocalDate pancharatrikDate;

    @Size(max = 255)
    private String education;

    @Size(max = 255)
    private String occupation;

    private Map<String, Boolean> devotionalCourses;

    private LeadershipRole leadershipRole;
    private Long reportingToDevoteeId;
    private Boolean hasSystemAccess;
    private LocalDate appointedDate;
    private Long appointedBy;

    private String additionalComments;
    private Long shraddhakutirId;
    private Long namhattaId;

    private AddressData presentAddress;
    private AddressData permanentAddress;

    // Getters and Setters
    public String getLegalName() {
        return legalName;
    }

    public void setLegalName(String legalName) {
        this.legalName = legalName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public MaritalStatus getMaritalStatus() {
        return maritalStatus;
    }

    public void setMaritalStatus(MaritalStatus maritalStatus) {
        this.maritalStatus = maritalStatus;
    }

    public String getFatherName() {
        return fatherName;
    }

    public void setFatherName(String fatherName) {
        this.fatherName = fatherName;
    }

    public String getMotherName() {
        return motherName;
    }

    public void setMotherName(String motherName) {
        this.motherName = motherName;
    }

    public String getHusbandName() {
        return husbandName;
    }

    public void setHusbandName(String husbandName) {
        this.husbandName = husbandName;
    }

    public Long getDevotionalStatusId() {
        return devotionalStatusId;
    }

    public void setDevotionalStatusId(Long devotionalStatusId) {
        this.devotionalStatusId = devotionalStatusId;
    }

    public Long getHarinamInitiationGurudevId() {
        return harinamInitiationGurudevId;
    }

    public void setHarinamInitiationGurudevId(Long harinamInitiationGurudevId) {
        this.harinamInitiationGurudevId = harinamInitiationGurudevId;
    }

    public Long getPancharatrikInitiationGurudevId() {
        return pancharatrikInitiationGurudevId;
    }

    public void setPancharatrikInitiationGurudevId(Long pancharatrikInitiationGurudevId) {
        this.pancharatrikInitiationGurudevId = pancharatrikInitiationGurudevId;
    }

    public String getInitiatedName() {
        return initiatedName;
    }

    public void setInitiatedName(String initiatedName) {
        this.initiatedName = initiatedName;
    }

    public LocalDate getHarinamDate() {
        return harinamDate;
    }

    public void setHarinamDate(LocalDate harinamDate) {
        this.harinamDate = harinamDate;
    }

    public LocalDate getPancharatrikDate() {
        return pancharatrikDate;
    }

    public void setPancharatrikDate(LocalDate pancharatrikDate) {
        this.pancharatrikDate = pancharatrikDate;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public Map<String, Boolean> getDevotionalCourses() {
        return devotionalCourses;
    }

    public void setDevotionalCourses(Map<String, Boolean> devotionalCourses) {
        this.devotionalCourses = devotionalCourses;
    }

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

    public LocalDate getAppointedDate() {
        return appointedDate;
    }

    public void setAppointedDate(LocalDate appointedDate) {
        this.appointedDate = appointedDate;
    }

    public Long getAppointedBy() {
        return appointedBy;
    }

    public void setAppointedBy(Long appointedBy) {
        this.appointedBy = appointedBy;
    }

    public String getAdditionalComments() {
        return additionalComments;
    }

    public void setAdditionalComments(String additionalComments) {
        this.additionalComments = additionalComments;
    }

    public Long getShraddhakutirId() {
        return shraddhakutirId;
    }

    public void setShraddhakutirId(Long shraddhakutirId) {
        this.shraddhakutirId = shraddhakutirId;
    }

    public Long getNamhattaId() {
        return namhattaId;
    }

    public void setNamhattaId(Long namhattaId) {
        this.namhattaId = namhattaId;
    }

    public AddressData getPresentAddress() {
        return presentAddress;
    }

    public void setPresentAddress(AddressData presentAddress) {
        this.presentAddress = presentAddress;
    }

    public AddressData getPermanentAddress() {
        return permanentAddress;
    }

    public void setPermanentAddress(AddressData permanentAddress) {
        this.permanentAddress = permanentAddress;
    }
}
