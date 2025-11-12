package com.namhatta.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class DevoteeDTO {
    private Long id;
    private String legalName;
    private String name;
    private String dob;
    private String email;
    private String phone;
    private String fatherName;
    private String motherName;
    private String husbandName;
    private String gender;
    private String bloodGroup;
    private String maritalStatus;
    private Long devotionalStatusId;
    private String devotionalStatusName;
    private Long namhattaId;
    private String namhattaName;
    private Long harinamInitiationGurudevId;
    private String harinamGurudevName;
    private Long pancharatrikInitiationGurudevId;
    private String pancharatrikGurudevName;
    private String initiatedName;
    private String harinamDate;
    private String pancharatrikDate;
    private String education;
    private String occupation;
    private List<Map<String, String>> devotionalCourses;
    private String additionalComments;
    private Long shraddhakutirId;
    private String shraddhakutirName;
    private String leadershipRole;
    private Long reportingToDevoteeId;
    private String reportingToDevoteeName;
    private Boolean hasSystemAccess;
    private String appointedDate;
    private Long appointedBy;
    private AddressDTO presentAddress;
    private AddressDTO permanentAddress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public DevoteeDTO() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getLegalName() { return legalName; }
    public void setLegalName(String legalName) { this.legalName = legalName; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getFatherName() { return fatherName; }
    public void setFatherName(String fatherName) { this.fatherName = fatherName; }
    
    public String getMotherName() { return motherName; }
    public void setMotherName(String motherName) { this.motherName = motherName; }
    
    public String getHusbandName() { return husbandName; }
    public void setHusbandName(String husbandName) { this.husbandName = husbandName; }
    
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    
    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }
    
    public Long getDevotionalStatusId() { return devotionalStatusId; }
    public void setDevotionalStatusId(Long devotionalStatusId) { this.devotionalStatusId = devotionalStatusId; }
    
    public String getDevotionalStatusName() { return devotionalStatusName; }
    public void setDevotionalStatusName(String devotionalStatusName) { this.devotionalStatusName = devotionalStatusName; }
    
    public Long getNamhattaId() { return namhattaId; }
    public void setNamhattaId(Long namhattaId) { this.namhattaId = namhattaId; }
    
    public String getNamhattaName() { return namhattaName; }
    public void setNamhattaName(String namhattaName) { this.namhattaName = namhattaName; }
    
    public Long getHarinamInitiationGurudevId() { return harinamInitiationGurudevId; }
    public void setHarinamInitiationGurudevId(Long harinamInitiationGurudevId) { this.harinamInitiationGurudevId = harinamInitiationGurudevId; }
    
    public String getHarinamGurudevName() { return harinamGurudevName; }
    public void setHarinamGurudevName(String harinamGurudevName) { this.harinamGurudevName = harinamGurudevName; }
    
    public Long getPancharatrikInitiationGurudevId() { return pancharatrikInitiationGurudevId; }
    public void setPancharatrikInitiationGurudevId(Long pancharatrikInitiationGurudevId) { this.pancharatrikInitiationGurudevId = pancharatrikInitiationGurudevId; }
    
    public String getPancharatrikGurudevName() { return pancharatrikGurudevName; }
    public void setPancharatrikGurudevName(String pancharatrikGurudevName) { this.pancharatrikGurudevName = pancharatrikGurudevName; }
    
    public String getInitiatedName() { return initiatedName; }
    public void setInitiatedName(String initiatedName) { this.initiatedName = initiatedName; }
    
    public String getHarinamDate() { return harinamDate; }
    public void setHarinamDate(String harinamDate) { this.harinamDate = harinamDate; }
    
    public String getPancharatrikDate() { return pancharatrikDate; }
    public void setPancharatrikDate(String pancharatrikDate) { this.pancharatrikDate = pancharatrikDate; }
    
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    
    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }
    
    public List<Map<String, String>> getDevotionalCourses() { return devotionalCourses; }
    public void setDevotionalCourses(List<Map<String, String>> devotionalCourses) { this.devotionalCourses = devotionalCourses; }
    
    public String getAdditionalComments() { return additionalComments; }
    public void setAdditionalComments(String additionalComments) { this.additionalComments = additionalComments; }
    
    public Long getShraddhakutirId() { return shraddhakutirId; }
    public void setShraddhakutirId(Long shraddhakutirId) { this.shraddhakutirId = shraddhakutirId; }
    
    public String getShraddhakutirName() { return shraddhakutirName; }
    public void setShraddhakutirName(String shraddhakutirName) { this.shraddhakutirName = shraddhakutirName; }
    
    public String getLeadershipRole() { return leadershipRole; }
    public void setLeadershipRole(String leadershipRole) { this.leadershipRole = leadershipRole; }
    
    public Long getReportingToDevoteeId() { return reportingToDevoteeId; }
    public void setReportingToDevoteeId(Long reportingToDevoteeId) { this.reportingToDevoteeId = reportingToDevoteeId; }
    
    public String getReportingToDevoteeName() { return reportingToDevoteeName; }
    public void setReportingToDevoteeName(String reportingToDevoteeName) { this.reportingToDevoteeName = reportingToDevoteeName; }
    
    public Boolean getHasSystemAccess() { return hasSystemAccess; }
    public void setHasSystemAccess(Boolean hasSystemAccess) { this.hasSystemAccess = hasSystemAccess; }
    
    public String getAppointedDate() { return appointedDate; }
    public void setAppointedDate(String appointedDate) { this.appointedDate = appointedDate; }
    
    public Long getAppointedBy() { return appointedBy; }
    public void setAppointedBy(Long appointedBy) { this.appointedBy = appointedBy; }
    
    public AddressDTO getPresentAddress() { return presentAddress; }
    public void setPresentAddress(AddressDTO presentAddress) { this.presentAddress = presentAddress; }
    
    public AddressDTO getPermanentAddress() { return permanentAddress; }
    public void setPermanentAddress(AddressDTO permanentAddress) { this.permanentAddress = permanentAddress; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
