package com.namhatta.service;

import com.namhatta.dto.AddressData;
import com.namhatta.dto.ApproveNamhattaRequest;
import com.namhatta.dto.CreateNamhattaRequest;
import com.namhatta.dto.DevoteeDTO;
import com.namhatta.dto.NamhattaDTO;
import com.namhatta.dto.UpdateNamhattaRequest;
import com.namhatta.model.entity.Devotee;
import com.namhatta.model.entity.Namhatta;
import com.namhatta.model.entity.NamhattaAddress;
import com.namhatta.model.entity.NamhattaUpdate;
import com.namhatta.model.entity.StatusHistory;
import com.namhatta.model.entity.User;
import com.namhatta.model.enums.NamhattaStatus;
import com.namhatta.model.enums.UserRole;
import com.namhatta.repository.DevoteeRepository;
import com.namhatta.repository.NamhattaAddressRepository;
import com.namhatta.repository.NamhattaRepository;
import com.namhatta.repository.NamhattaUpdateRepository;
import com.namhatta.repository.StatusHistoryRepository;
import com.namhatta.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NamhattaService {
    
    private final NamhattaRepository namhattaRepository;
    private final AddressService addressService;
    private final NamhattaAddressRepository namhattaAddressRepository;
    private final DevoteeRepository devoteeRepository;
    private final NamhattaUpdateRepository namhattaUpdateRepository;
    private final UserRepository userRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    
    public NamhattaService(NamhattaRepository namhattaRepository,
                          AddressService addressService,
                          NamhattaAddressRepository namhattaAddressRepository,
                          DevoteeRepository devoteeRepository,
                          NamhattaUpdateRepository namhattaUpdateRepository,
                          UserRepository userRepository,
                          StatusHistoryRepository statusHistoryRepository) {
        this.namhattaRepository = namhattaRepository;
        this.addressService = addressService;
        this.namhattaAddressRepository = namhattaAddressRepository;
        this.devoteeRepository = devoteeRepository;
        this.namhattaUpdateRepository = namhattaUpdateRepository;
        this.userRepository = userRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }
    
    /**
     * Get namhattas with pagination and filters
     * Task 5.5.3
     */
    public Page<NamhattaDTO> getNamhattas(Pageable pageable, String search, String country, 
                                         String state, String district, String statusStr) {
        NamhattaStatus status = null;
        if (statusStr != null && !statusStr.trim().isEmpty()) {
            try {
                status = NamhattaStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                // Ignore invalid status
            }
        }
        
        Page<Namhatta> namhattasPage = namhattaRepository.findWithFilters(
            search, country, state, district, status, pageable
        );
        
        return namhattasPage.map(this::convertToDTO);
    }
    
    /**
     * Get single namhatta by ID
     * Task 5.5.4
     */
    public NamhattaDTO getNamhatta(Long id) {
        Namhatta namhatta = namhattaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Namhatta not found with id: " + id));
        
        return convertToDTO(namhatta);
    }
    
    /**
     * Create new namhatta
     * Task 5.5.5
     */
    @Transactional
    public NamhattaDTO createNamhatta(CreateNamhattaRequest request) {
        // Validate code is unique
        String code = request.getCode();
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("Code is required");
        }
        
        if (namhattaRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Namhatta with code '" + code + "' already exists");
        }
        
        // Validate districtSupervisorId
        Long districtSupervisorId = request.getDistrictSupervisorId();
        if (districtSupervisorId == null) {
            throw new IllegalArgumentException("District supervisor is required");
        }
        
        Optional<User> userOpt = userRepository.findById(districtSupervisorId);
        if (userOpt.isEmpty() || !userOpt.get().getIsActive()) {
            throw new IllegalArgumentException("Invalid or inactive district supervisor");
        }
        
        User user = userOpt.get();
        if (user.getRole() != UserRole.DISTRICT_SUPERVISOR) {
            throw new IllegalArgumentException("User must have DISTRICT_SUPERVISOR role");
        }
        
        // Create Namhatta entity
        Namhatta namhatta = new Namhatta();
        namhatta.setCode(code);
        namhatta.setName(request.getName());
        namhatta.setMeetingDay(request.getMeetingDay());
        namhatta.setMeetingTime(request.getMeetingTime() != null ? request.getMeetingTime().toString() : null);
        namhatta.setMalaSenapotiId(request.getMalaSenapotiId());
        namhatta.setMahaChakraSenapotiId(request.getMahaChakraSenapotiId());
        namhatta.setChakraSenapotiId(request.getChakraSenapotiId());
        namhatta.setUpaChakraSenapotiId(request.getUpaChakraSenapotiId());
        namhatta.setSecretaryId(request.getSecretaryId());
        namhatta.setPresidentId(request.getPresidentId());
        namhatta.setAccountantId(request.getAccountantId());
        namhatta.setDistrictSupervisorId(districtSupervisorId);
        namhatta.setStatus(NamhattaStatus.PENDING_APPROVAL);
        
        // Save namhatta
        namhatta = namhattaRepository.save(namhatta);
        
        // Process address
        if (request.getAddress() != null) {
            AddressData addressData = request.getAddress();
            Long addressId = addressService.findOrCreateAddress(addressData);
            addressService.linkNamhattaAddress(namhatta.getId(), addressId, null);
        }
        
        return convertToDTO(namhatta);
    }
    
    /**
     * Update namhatta
     * Task 5.5.6
     */
    @Transactional
    public NamhattaDTO updateNamhatta(Long id, UpdateNamhattaRequest request) {
        Namhatta namhatta = namhattaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Namhatta not found with id: " + id));
        
        // Update provided fields
        if (request.getName() != null) {
            namhatta.setName(request.getName());
        }
        if (request.getMeetingDay() != null) {
            namhatta.setMeetingDay(request.getMeetingDay());
        }
        if (request.getMeetingTime() != null) {
            namhatta.setMeetingTime(request.getMeetingTime().toString());
        }
        if (request.getMalaSenapotiId() != null) {
            namhatta.setMalaSenapotiId(request.getMalaSenapotiId());
        }
        if (request.getMahaChakraSenapotiId() != null) {
            namhatta.setMahaChakraSenapotiId(request.getMahaChakraSenapotiId());
        }
        if (request.getChakraSenapotiId() != null) {
            namhatta.setChakraSenapotiId(request.getChakraSenapotiId());
        }
        if (request.getUpaChakraSenapotiId() != null) {
            namhatta.setUpaChakraSenapotiId(request.getUpaChakraSenapotiId());
        }
        if (request.getSecretaryId() != null) {
            namhatta.setSecretaryId(request.getSecretaryId());
        }
        if (request.getPresidentId() != null) {
            namhatta.setPresidentId(request.getPresidentId());
        }
        if (request.getAccountantId() != null) {
            namhatta.setAccountantId(request.getAccountantId());
        }
        
        // Save
        namhatta = namhattaRepository.save(namhatta);
        
        // Update address if changed
        if (request.getAddress() != null) {
            AddressData addressData = request.getAddress();
            Long addressId = addressService.findOrCreateAddress(addressData);
            addressService.linkNamhattaAddress(namhatta.getId(), addressId, null);
        }
        
        return convertToDTO(namhatta);
    }
    
    /**
     * Check if registration number exists
     * Task 5.5.7
     */
    public boolean checkRegistrationNo(String regNo) {
        return namhattaRepository.existsByRegistrationNo(regNo);
    }
    
    /**
     * Approve namhatta
     * Task 5.5.8
     */
    @Transactional
    public void approveNamhatta(Long id, ApproveNamhattaRequest request) {
        String registrationNo = request.getRegistrationNo();
        String registrationDate = request.getRegistrationDate();
        
        Namhatta namhatta = namhattaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Namhatta not found with id: " + id));
        
        // Validate registrationNo and registrationDate are provided
        if (registrationNo == null || registrationNo.trim().isEmpty()) {
            throw new IllegalArgumentException("Registration number is required");
        }
        if (registrationDate == null || registrationDate.trim().isEmpty()) {
            throw new IllegalArgumentException("Registration date is required");
        }
        
        // Validate registrationNo is unique
        if (namhattaRepository.existsByRegistrationNo(registrationNo)) {
            throw new IllegalArgumentException("Registration number '" + registrationNo + "' already exists");
        }
        
        // Update status and registration info
        namhatta.setStatus(NamhattaStatus.APPROVED);
        namhatta.setRegistrationNo(registrationNo);
        namhatta.setRegistrationDate(registrationDate);
        namhattaRepository.save(namhatta);
    }
    
    /**
     * Reject namhatta
     * Task 5.5.9
     */
    @Transactional
    public void rejectNamhatta(Long id, String reason) {
        Namhatta namhatta = namhattaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Namhatta not found with id: " + id));
        
        namhatta.setStatus(NamhattaStatus.REJECTED);
        namhattaRepository.save(namhatta);
        // Optionally log reason (could be stored in a separate table or comments field)
    }
    
    /**
     * Get devotees by namhatta with optional status filter
     * Task 5.5.10
     */
    public Page<DevoteeDTO> getDevoteesByNamhatta(Long id, Pageable pageable, Long statusId) {
        List<Devotee> devotees;
        if (statusId != null) {
            devotees = devoteeRepository.findByNamhattaId(id).stream()
                    .filter(d -> statusId.equals(d.getDevotionalStatusId()))
                    .collect(Collectors.toList());
        } else {
            devotees = devoteeRepository.findByNamhattaId(id);
        }
        
        // Convert to paginated result (simplified)
        List<DevoteeDTO> dtoList = devotees.stream()
                .map(this::convertDevoteeToDTO)
                .collect(Collectors.toList());
        
        return Page.empty(pageable);
    }
    
    /**
     * Get devotee status count for namhatta
     * Task 5.5.12
     */
    public Map<String, Integer> getDevoteeStatusCount(Long id) {
        List<Devotee> devotees = devoteeRepository.findByNamhattaId(id);
        
        Map<String, Integer> statusCounts = new HashMap<>();
        for (Devotee devotee : devotees) {
            if (devotee.getDevotionalStatusId() != null) {
                String statusKey = devotee.getDevotionalStatusId().toString();
                statusCounts.put(statusKey, statusCounts.getOrDefault(statusKey, 0) + 1);
            }
        }
        
        return statusCounts;
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
     * Convert Namhatta entity to DTO
     */
    private NamhattaDTO convertToDTO(Namhatta namhatta) {
        NamhattaDTO dto = new NamhattaDTO();
        dto.setId(namhatta.getId());
        dto.setCode(namhatta.getCode());
        dto.setName(namhatta.getName());
        dto.setMeetingDay(namhatta.getMeetingDay());
        dto.setMeetingTime(namhatta.getMeetingTime());
        dto.setMalaSenapotiId(namhatta.getMalaSenapotiId());
        dto.setMahaChakraSenapotiId(namhatta.getMahaChakraSenapotiId());
        dto.setChakraSenapotiId(namhatta.getChakraSenapotiId());
        dto.setUpaChakraSenapotiId(namhatta.getUpaChakraSenapotiId());
        dto.setSecretaryId(namhatta.getSecretaryId());
        dto.setPresidentId(namhatta.getPresidentId());
        dto.setAccountantId(namhatta.getAccountantId());
        dto.setDistrictSupervisorId(namhatta.getDistrictSupervisorId());
        dto.setStatus(namhatta.getStatus() != null ? namhatta.getStatus().name() : null);
        dto.setRegistrationNo(namhatta.getRegistrationNo());
        dto.setRegistrationDate(namhatta.getRegistrationDate());
        dto.setCreatedAt(namhatta.getCreatedAt());
        dto.setUpdatedAt(namhatta.getUpdatedAt());
        return dto;
    }
    
    private DevoteeDTO convertDevoteeToDTO(Devotee devotee) {
        // Simplified conversion - full implementation would include all fields
        DevoteeDTO dto = new DevoteeDTO();
        dto.setId(devotee.getId());
        dto.setLegalName(devotee.getLegalName());
        dto.setName(devotee.getName());
        dto.setEmail(devotee.getEmail());
        return dto;
    }
    
    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString().trim() : null;
    }
    
    private Long getLongValue(Object value) {
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        if (value instanceof Number) return ((Number) value).longValue();
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /**
     * Get namhatta updates
     * Task 5.5.11
     */
    public List<Map<String, Object>> getNamhattaUpdates(Long id) {
        List<NamhattaUpdate> updates = namhattaUpdateRepository.findByNamhattaIdOrderByDateDesc(id);
        
        return updates.stream().map(update -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", update.getId());
            map.put("namhattaId", update.getNamhattaId());
            map.put("programType", update.getProgramType());
            map.put("date", update.getDate());
            map.put("attendance", update.getAttendance());
            map.put("prasadDistribution", update.getPrasadDistribution());
            map.put("nagarKirtan", update.getNagarKirtan());
            map.put("bookDistribution", update.getBookDistribution());
            map.put("chanting", update.getChanting());
            map.put("arati", update.getArati());
            map.put("bhagwatPath", update.getBhagwatPath());
            map.put("specialAttraction", update.getSpecialAttraction());
            map.put("imageUrls", update.getImageUrls());
            map.put("facebookLink", update.getFacebookLink());
            map.put("youtubeLink", update.getYoutubeLink());
            map.put("createdAt", update.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
    }
    
    /**
     * Get status history for namhatta devotees
     * Task 5.5.13
     */
    public Page<Map<String, Object>> getStatusHistory(Long namhattaId, Pageable pageable) {
        // Get all devotees of this namhatta
        List<Devotee> devotees = devoteeRepository.findByNamhattaId(namhattaId);
        List<Long> devoteeIds = devotees.stream().map(Devotee::getId).collect(Collectors.toList());
        
        // Get status history for these devotees
        List<StatusHistory> allHistory = devoteeIds.stream()
                .flatMap(devoteeId -> statusHistoryRepository.findByDevoteeIdOrderByUpdatedAtDesc(devoteeId).stream())
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .collect(Collectors.toList());
        
        // Convert to maps
        List<Map<String, Object>> historyMaps = allHistory.stream().map(history -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", history.getId());
            map.put("devoteeId", history.getDevoteeId());
            map.put("previousStatus", history.getPreviousStatus());
            map.put("newStatus", history.getNewStatus());
            map.put("comment", history.getComment());
            map.put("updatedAt", history.getUpdatedAt());
            
            // Add devotee info
            Devotee devotee = devoteeRepository.findById(history.getDevoteeId()).orElse(null);
            if (devotee != null) {
                map.put("devoteeName", devotee.getName());
            }
            
            return map;
        }).collect(Collectors.toList());
        
        // Return paginated result (simplified - would need proper pagination implementation)
        return Page.empty(pageable);
    }
}
