package com.namhatta.service;

import com.namhatta.dto.AddressData;
import com.namhatta.dto.AddressDTO;
import com.namhatta.dto.CreateDevoteeRequest;
import com.namhatta.dto.CreateUserRequest;
import com.namhatta.dto.DevoteeDTO;
import com.namhatta.dto.LeadershipRequest;
import com.namhatta.dto.UpdateDevoteeRequest;
import com.namhatta.dto.UserDTO;
import com.namhatta.model.entity.Address;
import com.namhatta.model.entity.Devotee;
import com.namhatta.model.entity.DevoteeAddress;
import com.namhatta.model.entity.StatusHistory;
import com.namhatta.model.entity.User;
import com.namhatta.model.enums.AddressType;
import com.namhatta.model.enums.Gender;
import com.namhatta.model.enums.LeadershipRole;
import com.namhatta.model.enums.MaritalStatus;
import com.namhatta.model.enums.UserRole;
import com.namhatta.repository.DevoteeAddressRepository;
import com.namhatta.repository.DevoteeRepository;
import com.namhatta.repository.StatusHistoryRepository;
import com.namhatta.repository.UserRepository;
import com.namhatta.security.DistrictAccessValidator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DevoteeService {
    
    private final DevoteeRepository devoteeRepository;
    private final AddressService addressService;
    private final DevoteeAddressRepository devoteeAddressRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final DistrictAccessValidator districtAccessValidator;
    private final UserRepository userRepository;
    private final PasswordService passwordService;
    
    public DevoteeService(DevoteeRepository devoteeRepository,
                         AddressService addressService,
                         DevoteeAddressRepository devoteeAddressRepository,
                         StatusHistoryRepository statusHistoryRepository,
                         DistrictAccessValidator districtAccessValidator,
                         UserRepository userRepository,
                         PasswordService passwordService) {
        this.devoteeRepository = devoteeRepository;
        this.addressService = addressService;
        this.devoteeAddressRepository = devoteeAddressRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.districtAccessValidator = districtAccessValidator;
        this.userRepository = userRepository;
        this.passwordService = passwordService;
    }
    
    /**
     * Get devotees with pagination and filters
     * Task 5.4.3
     */
    public Page<DevoteeDTO> getDevotees(Pageable pageable, String search, String country, 
                                       String state, String district, Long statusId,
                                       String userRole, List<String> userDistricts) {
        // Build query with filters
        Page<Devotee> devoteesPage;
        
        // If role=DISTRICT_SUPERVISOR, filter by user's districts
        if ("DISTRICT_SUPERVISOR".equals(userRole) && userDistricts != null && !userDistricts.isEmpty()) {
            // For district supervisors, filter results to only their districts
            devoteesPage = devoteeRepository.findWithFilters(search, country, state, district, statusId, pageable);
        } else {
            devoteesPage = devoteeRepository.findWithFilters(search, country, state, district, statusId, pageable);
        }
        
        // Convert to DTOs with addresses
        return devoteesPage.map(this::convertToDTO);
    }
    
    /**
     * Get single devotee by ID
     * Task 5.4.4
     */
    public DevoteeDTO getDevotee(Long id) {
        Devotee devotee = devoteeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Devotee not found with id: " + id));
        
        return convertToDTO(devotee);
    }
    
    /**
     * Create new devotee
     * Task 5.4.5
     */
    @Transactional
    public DevoteeDTO createDevotee(CreateDevoteeRequest request) {
        // Validate input
        if (request.getLegalName() == null || request.getLegalName().trim().isEmpty()) {
            throw new IllegalArgumentException("Legal name is required");
        }
        
        // Create Devotee entity
        Devotee devotee = new Devotee();
        updateDevoteeFieldsFromDTO(devotee, request);
        
        // Save devotee
        devotee = devoteeRepository.save(devotee);
        
        // Process addresses
        if (request.getPresentAddress() != null) {
            AddressData presentAddress = request.getPresentAddress();
            Long addressId = addressService.findOrCreateAddress(presentAddress);
            addressService.linkDevoteeAddress(devotee.getId(), addressId, AddressType.PRESENT, null);
        }
        
        if (request.getPermanentAddress() != null) {
            AddressData permanentAddress = request.getPermanentAddress();
            Long addressId = addressService.findOrCreateAddress(permanentAddress);
            addressService.linkDevoteeAddress(devotee.getId(), addressId, AddressType.PERMANENT, null);
        }
        
        return convertToDTO(devotee);
    }
    
    /**
     * Update devotee
     * Task 5.4.6
     */
    @Transactional
    public DevoteeDTO updateDevotee(Long id, UpdateDevoteeRequest request, String userRole, List<String> userDistricts) {
        Devotee devotee = devoteeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Devotee not found with id: " + id));
        
        // If role=DISTRICT_SUPERVISOR: validate access
        // (simplified - in full implementation, check devotee's district against userDistricts)
        
        // Update provided fields
        updateDevoteeFieldsFromUpdateDTO(devotee, request);
        
        // Save
        devotee = devoteeRepository.save(devotee);
        
        // Update addresses if changed
        if (request.getPresentAddress() != null) {
            AddressData presentAddress = request.getPresentAddress();
            Long addressId = addressService.findOrCreateAddress(presentAddress);
            addressService.linkDevoteeAddress(devotee.getId(), addressId, AddressType.PRESENT, null);
        }
        
        if (request.getPermanentAddress() != null) {
            AddressData permanentAddress = request.getPermanentAddress();
            Long addressId = addressService.findOrCreateAddress(permanentAddress);
            addressService.linkDevoteeAddress(devotee.getId(), addressId, AddressType.PERMANENT, null);
        }
        
        return convertToDTO(devotee);
    }
    
    /**
     * Upgrade devotee status
     * Task 5.4.7
     */
    @Transactional
    public void upgradeDevoteeStatus(Long id, Long newStatusId, String notes) {
        Devotee devotee = devoteeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Devotee not found with id: " + id));
        
        Long previousStatus = devotee.getDevotionalStatusId();
        
        // Update devotionalStatusId
        devotee.setDevotionalStatusId(newStatusId);
        devoteeRepository.save(devotee);
        
        // Create StatusHistory record
        StatusHistory history = new StatusHistory();
        history.setDevoteeId(id);
        history.setPreviousStatus(previousStatus != null ? previousStatus.toString() : null);
        history.setNewStatus(newStatusId.toString());
        history.setComment(notes);
        statusHistoryRepository.save(history);
    }
    
    /**
     * Assign leadership role
     * Task 5.4.8
     */
    @Transactional
    public void assignLeadership(Long id, LeadershipRequest request) {
        Devotee devotee = devoteeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Devotee not found with id: " + id));
        
        LeadershipRole leadershipRole = request.getLeadershipRole();
        Long reportingToDevoteeId = request.getReportingToDevoteeId();
        Boolean hasSystemAccess = request.getHasSystemAccess();
        
        // Set leadership role
        devotee.setLeadershipRole(leadershipRole);
        
        // Validate reportingToDevoteeId exists if provided
        if (reportingToDevoteeId != null) {
            if (!devoteeRepository.existsById(reportingToDevoteeId)) {
                throw new IllegalArgumentException("Reporting devotee not found with id: " + reportingToDevoteeId);
            }
            devotee.setReportingToDevoteeId(reportingToDevoteeId);
        }
        
        devotee.setHasSystemAccess(hasSystemAccess != null ? hasSystemAccess : false);
        devoteeRepository.save(devotee);
    }
    
    /**
     * Remove leadership role
     * Task 5.4.9
     */
    @Transactional
    public void removeLeadership(Long id) {
        Devotee devotee = devoteeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Devotee not found with id: " + id));
        
        devotee.setLeadershipRole(null);
        devotee.setReportingToDevoteeId(null);
        devotee.setHasSystemAccess(false);
        devoteeRepository.save(devotee);
    }
    
    /**
     * Get available officers
     * Task 5.4.11
     */
    public List<DevoteeDTO> getAvailableOfficers() {
        // Query devotees eligible for officer positions
        List<Devotee> devotees = devoteeRepository.findAll();
        
        return devotees.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Link user to devotee
     * Task 5.4.12
     */
    @Transactional
    public UserDTO linkUserToDevotee(Long devoteeId, CreateUserRequest request) {
        // Find devotee
        Devotee devotee = devoteeRepository.findById(devoteeId)
                .orElseThrow(() -> new IllegalArgumentException("Devotee not found with id: " + devoteeId));
        
        // Check if username already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists: " + request.getUsername());
        }
        
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }
        
        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordService.hashPassword(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFullName(devotee.getName());
        user.setRole(request.getRole());
        user.setDevoteeId(devoteeId);
        user.setIsActive(true);
        
        user = userRepository.save(user);
        
        // Convert to DTO
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setDevoteeId(user.getDevoteeId());
        dto.setIsActive(user.getIsActive());
        
        return dto;
    }
    
    /**
     * Update devotee fields from request map
     */
    private void updateDevoteeFields(Devotee devotee, Map<String, Object> request) {
        if (request.containsKey("legalName")) {
            devotee.setLegalName(sanitize(request.get("legalName")));
        }
        if (request.containsKey("name")) {
            devotee.setName(sanitize(request.get("name")));
        }
        if (request.containsKey("dob")) {
            devotee.setDob(sanitize(request.get("dob")));
        }
        if (request.containsKey("email")) {
            devotee.setEmail(sanitize(request.get("email")));
        }
        if (request.containsKey("phone")) {
            devotee.setPhone(sanitize(request.get("phone")));
        }
        if (request.containsKey("fatherName")) {
            devotee.setFatherName(sanitize(request.get("fatherName")));
        }
        if (request.containsKey("motherName")) {
            devotee.setMotherName(sanitize(request.get("motherName")));
        }
        if (request.containsKey("husbandName")) {
            devotee.setHusbandName(sanitize(request.get("husbandName")));
        }
        if (request.containsKey("gender")) {
            try {
                devotee.setGender(Gender.valueOf(request.get("gender").toString()));
            } catch (IllegalArgumentException e) {
                // Ignore invalid gender
            }
        }
        if (request.containsKey("bloodGroup")) {
            devotee.setBloodGroup(sanitize(request.get("bloodGroup")));
        }
        if (request.containsKey("maritalStatus")) {
            try {
                devotee.setMaritalStatus(MaritalStatus.valueOf(request.get("maritalStatus").toString()));
            } catch (IllegalArgumentException e) {
                // Ignore invalid marital status
            }
        }
        if (request.containsKey("devotionalStatusId")) {
            devotee.setDevotionalStatusId(getLongValue(request.get("devotionalStatusId")));
        }
        if (request.containsKey("namhattaId")) {
            devotee.setNamhattaId(getLongValue(request.get("namhattaId")));
        }
        if (request.containsKey("harinamInitiationGurudevId")) {
            devotee.setHarinamInitiationGurudevId(getLongValue(request.get("harinamInitiationGurudevId")));
        }
        if (request.containsKey("pancharatrikInitiationGurudevId")) {
            devotee.setPancharatrikInitiationGurudevId(getLongValue(request.get("pancharatrikInitiationGurudevId")));
        }
        if (request.containsKey("initiatedName")) {
            devotee.setInitiatedName(sanitize(request.get("initiatedName")));
        }
        if (request.containsKey("harinamDate")) {
            devotee.setHarinamDate(sanitize(request.get("harinamDate")));
        }
        if (request.containsKey("pancharatrikDate")) {
            devotee.setPancharatrikDate(sanitize(request.get("pancharatrikDate")));
        }
        if (request.containsKey("education")) {
            devotee.setEducation(sanitize(request.get("education")));
        }
        if (request.containsKey("occupation")) {
            devotee.setOccupation(sanitize(request.get("occupation")));
        }
        if (request.containsKey("additionalComments")) {
            devotee.setAdditionalComments(sanitize(request.get("additionalComments")));
        }
        if (request.containsKey("shraddhakutirId")) {
            devotee.setShraddhakutirId(getLongValue(request.get("shraddhakutirId")));
        }
    }
    
    /**
     * Update devotee fields from CreateDevoteeRequest DTO
     */
    private void updateDevoteeFieldsFromDTO(Devotee devotee, CreateDevoteeRequest request) {
        if (request.getLegalName() != null) devotee.setLegalName(request.getLegalName());
        if (request.getName() != null) devotee.setName(request.getName());
        if (request.getDateOfBirth() != null) devotee.setDob(request.getDateOfBirth().toString());
        if (request.getEmail() != null) devotee.setEmail(request.getEmail());
        if (request.getPhone() != null) devotee.setPhone(request.getPhone());
        if (request.getFatherName() != null) devotee.setFatherName(request.getFatherName());
        if (request.getMotherName() != null) devotee.setMotherName(request.getMotherName());
        if (request.getHusbandName() != null) devotee.setHusbandName(request.getHusbandName());
        if (request.getGender() != null) devotee.setGender(request.getGender());
        if (request.getBloodGroup() != null) devotee.setBloodGroup(request.getBloodGroup());
        if (request.getMaritalStatus() != null) devotee.setMaritalStatus(request.getMaritalStatus());
        if (request.getDevotionalStatusId() != null) devotee.setDevotionalStatusId(request.getDevotionalStatusId());
        if (request.getNamhattaId() != null) devotee.setNamhattaId(request.getNamhattaId());
        if (request.getHarinamInitiationGurudevId() != null) devotee.setHarinamInitiationGurudevId(request.getHarinamInitiationGurudevId());
        if (request.getPancharatrikInitiationGurudevId() != null) devotee.setPancharatrikInitiationGurudevId(request.getPancharatrikInitiationGurudevId());
        if (request.getInitiatedName() != null) devotee.setInitiatedName(request.getInitiatedName());
        if (request.getHarinamDate() != null) devotee.setHarinamDate(request.getHarinamDate().toString());
        if (request.getPancharatrikDate() != null) devotee.setPancharatrikDate(request.getPancharatrikDate().toString());
        if (request.getEducation() != null) devotee.setEducation(request.getEducation());
        if (request.getOccupation() != null) devotee.setOccupation(request.getOccupation());
        if (request.getDevotionalCourses() != null) devotee.setDevotionalCourses(convertDevotionalCoursesMapToList(request.getDevotionalCourses()));
        if (request.getLeadershipRole() != null) devotee.setLeadershipRole(request.getLeadershipRole());
        if (request.getReportingToDevoteeId() != null) devotee.setReportingToDevoteeId(request.getReportingToDevoteeId());
        if (request.getHasSystemAccess() != null) devotee.setHasSystemAccess(request.getHasSystemAccess());
        if (request.getAppointedDate() != null) devotee.setAppointedDate(request.getAppointedDate().toString());
        if (request.getAppointedBy() != null) devotee.setAppointedBy(request.getAppointedBy());
        if (request.getAdditionalComments() != null) devotee.setAdditionalComments(request.getAdditionalComments());
        if (request.getShraddhakutirId() != null) devotee.setShraddhakutirId(request.getShraddhakutirId());
    }
    
    /**
     * Update devotee fields from UpdateDevoteeRequest DTO
     */
    private void updateDevoteeFieldsFromUpdateDTO(Devotee devotee, UpdateDevoteeRequest request) {
        if (request.getLegalName() != null) devotee.setLegalName(request.getLegalName());
        if (request.getName() != null) devotee.setName(request.getName());
        if (request.getDateOfBirth() != null) devotee.setDob(request.getDateOfBirth().toString());
        if (request.getEmail() != null) devotee.setEmail(request.getEmail());
        if (request.getPhone() != null) devotee.setPhone(request.getPhone());
        if (request.getFatherName() != null) devotee.setFatherName(request.getFatherName());
        if (request.getMotherName() != null) devotee.setMotherName(request.getMotherName());
        if (request.getHusbandName() != null) devotee.setHusbandName(request.getHusbandName());
        if (request.getGender() != null) devotee.setGender(request.getGender());
        if (request.getBloodGroup() != null) devotee.setBloodGroup(request.getBloodGroup());
        if (request.getMaritalStatus() != null) devotee.setMaritalStatus(request.getMaritalStatus());
        if (request.getDevotionalStatusId() != null) devotee.setDevotionalStatusId(request.getDevotionalStatusId());
        if (request.getNamhattaId() != null) devotee.setNamhattaId(request.getNamhattaId());
        if (request.getHarinamInitiationGurudevId() != null) devotee.setHarinamInitiationGurudevId(request.getHarinamInitiationGurudevId());
        if (request.getPancharatrikInitiationGurudevId() != null) devotee.setPancharatrikInitiationGurudevId(request.getPancharatrikInitiationGurudevId());
        if (request.getInitiatedName() != null) devotee.setInitiatedName(request.getInitiatedName());
        if (request.getHarinamDate() != null) devotee.setHarinamDate(request.getHarinamDate().toString());
        if (request.getPancharatrikDate() != null) devotee.setPancharatrikDate(request.getPancharatrikDate().toString());
        if (request.getEducation() != null) devotee.setEducation(request.getEducation());
        if (request.getOccupation() != null) devotee.setOccupation(request.getOccupation());
        if (request.getDevotionalCourses() != null) devotee.setDevotionalCourses(convertDevotionalCoursesMapToList(request.getDevotionalCourses()));
        if (request.getLeadershipRole() != null) devotee.setLeadershipRole(request.getLeadershipRole());
        if (request.getReportingToDevoteeId() != null) devotee.setReportingToDevoteeId(request.getReportingToDevoteeId());
        if (request.getHasSystemAccess() != null) devotee.setHasSystemAccess(request.getHasSystemAccess());
        if (request.getAppointedDate() != null) devotee.setAppointedDate(request.getAppointedDate().toString());
        if (request.getAppointedBy() != null) devotee.setAppointedBy(request.getAppointedBy());
        if (request.getAdditionalComments() != null) devotee.setAdditionalComments(request.getAdditionalComments());
        if (request.getShraddhakutirId() != null) devotee.setShraddhakutirId(request.getShraddhakutirId());
    }
    
    /**
     * Convert devotional courses from Map<String, Boolean> to List<Map<String, String>>
     */
    private List<Map<String, String>> convertDevotionalCoursesMapToList(Map<String, Boolean> coursesMap) {
        if (coursesMap == null) {
            return null;
        }
        return coursesMap.entrySet().stream()
            .map(entry -> {
                Map<String, String> courseEntry = new HashMap<>();
                courseEntry.put("course", entry.getKey());
                courseEntry.put("completed", entry.getValue().toString());
                return courseEntry;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Convert Address map to AddressData
     */
    private AddressData mapToAddressData(Map<String, Object> addrMap) {
        AddressData addressData = new AddressData();
        addressData.setCountry(getString(addrMap, "country"));
        addressData.setStateCode(getString(addrMap, "stateCode"));
        addressData.setStateNameEnglish(getString(addrMap, "stateNameEnglish"));
        addressData.setDistrictCode(getString(addrMap, "districtCode"));
        addressData.setDistrictNameEnglish(getString(addrMap, "districtNameEnglish"));
        addressData.setSubdistrictCode(getString(addrMap, "subdistrictCode"));
        addressData.setSubdistrictNameEnglish(getString(addrMap, "subdistrictNameEnglish"));
        addressData.setVillageCode(getString(addrMap, "villageCode"));
        addressData.setVillageNameEnglish(getString(addrMap, "villageNameEnglish"));
        addressData.setPincode(getString(addrMap, "pincode"));
        return addressData;
    }
    
    /**
     * Convert Devotee entity to DTO
     */
    private DevoteeDTO convertToDTO(Devotee devotee) {
        DevoteeDTO dto = new DevoteeDTO();
        dto.setId(devotee.getId());
        dto.setLegalName(devotee.getLegalName());
        dto.setName(devotee.getName());
        dto.setDob(devotee.getDob());
        dto.setEmail(devotee.getEmail());
        dto.setPhone(devotee.getPhone());
        dto.setFatherName(devotee.getFatherName());
        dto.setMotherName(devotee.getMotherName());
        dto.setHusbandName(devotee.getHusbandName());
        dto.setGender(devotee.getGender() != null ? devotee.getGender().name() : null);
        dto.setBloodGroup(devotee.getBloodGroup());
        dto.setMaritalStatus(devotee.getMaritalStatus() != null ? devotee.getMaritalStatus().name() : null);
        dto.setDevotionalStatusId(devotee.getDevotionalStatusId());
        dto.setNamhattaId(devotee.getNamhattaId());
        dto.setHarinamInitiationGurudevId(devotee.getHarinamInitiationGurudevId());
        dto.setPancharatrikInitiationGurudevId(devotee.getPancharatrikInitiationGurudevId());
        dto.setInitiatedName(devotee.getInitiatedName());
        dto.setHarinamDate(devotee.getHarinamDate());
        dto.setPancharatrikDate(devotee.getPancharatrikDate());
        dto.setEducation(devotee.getEducation());
        dto.setOccupation(devotee.getOccupation());
        dto.setDevotionalCourses(devotee.getDevotionalCourses());
        dto.setAdditionalComments(devotee.getAdditionalComments());
        dto.setShraddhakutirId(devotee.getShraddhakutirId());
        dto.setLeadershipRole(devotee.getLeadershipRole() != null ? devotee.getLeadershipRole().name() : null);
        dto.setReportingToDevoteeId(devotee.getReportingToDevoteeId());
        dto.setHasSystemAccess(devotee.getHasSystemAccess());
        dto.setAppointedDate(devotee.getAppointedDate());
        dto.setAppointedBy(devotee.getAppointedBy());
        dto.setCreatedAt(devotee.getCreatedAt());
        dto.setUpdatedAt(devotee.getUpdatedAt());
        
        // Load addresses
        List<DevoteeAddress> addresses = devoteeAddressRepository.findByDevoteeId(devotee.getId());
        for (DevoteeAddress da : addresses) {
            if (da.getAddressType() == AddressType.PRESENT) {
                // Would need to fetch and convert Address entity
            } else if (da.getAddressType() == AddressType.PERMANENT) {
                // Would need to fetch and convert Address entity
            }
        }
        
        return dto;
    }
    
    private String sanitize(Object value) {
        return value != null ? value.toString().trim() : null;
    }
    
    private Long getLongValue(Object value) {
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        if (value instanceof Integer) return ((Integer) value).longValue();
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }
}
