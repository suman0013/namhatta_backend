package com.namhatta.service;

import com.namhatta.dto.DistrictDTO;
import com.namhatta.dto.RegisterRequest;
import com.namhatta.dto.UpdateUserRequest;
import com.namhatta.dto.UserDTO;
import com.namhatta.model.entity.User;
import com.namhatta.model.entity.UserDistrict;
import com.namhatta.model.enums.UserRole;
import com.namhatta.repository.UserDistrictRepository;
import com.namhatta.repository.UserRepository;
import com.namhatta.repository.AddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final UserDistrictRepository userDistrictRepository;
    private final PasswordService passwordService;
    private final AddressRepository addressRepository;
    
    public UserService(UserRepository userRepository,
                      UserDistrictRepository userDistrictRepository,
                      PasswordService passwordService,
                      AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.userDistrictRepository = userDistrictRepository;
        this.passwordService = passwordService;
        this.addressRepository = addressRepository;
    }
    
    /**
     * Get all users
     */
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Create a new district supervisor
     */
    @Transactional
    public UserDTO createDistrictSupervisor(RegisterRequest request) {
        // Validate username uniqueness
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        
        // Validate email uniqueness
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        // Validate password strength
        passwordService.validatePasswordStrength(request.getPassword());
        
        // Hash password
        String hashedPassword = passwordService.hashPassword(request.getPassword());
        
        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(hashedPassword);
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setRole(UserRole.DISTRICT_SUPERVISOR);
        user.setIsActive(true);
        
        user = userRepository.save(user);
        
        // Create user district entries
        for (DistrictDTO district : request.getDistricts()) {
            UserDistrict userDistrict = new UserDistrict();
            userDistrict.setUserId(user.getId());
            userDistrict.setDistrictCode(district.getCode());
            userDistrict.setDistrictNameEnglish(district.getName());
            userDistrict.setIsDefaultDistrictSupervisor(false);
            
            userDistrictRepository.save(userDistrict);
        }
        
        return convertToDTO(user);
    }
    
    /**
     * Update user
     */
    @Transactional
    public UserDTO updateUser(Long id, UpdateUserRequest updateRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Update allowed fields
        if (updateRequest.getFullName() != null) {
            user.setFullName(updateRequest.getFullName());
        }
        
        if (updateRequest.getEmail() != null) {
            // Check email uniqueness
            Optional<User> existingUser = userRepository.findByEmail(updateRequest.getEmail());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(id)) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(updateRequest.getEmail());
        }
        
        if (updateRequest.getRole() != null) {
            user.setRole(UserRole.valueOf(updateRequest.getRole()));
        }
        
        user = userRepository.save(user);
        
        // Update districts if provided
        if (updateRequest.getDistricts() != null) {
            // Delete existing districts
            userDistrictRepository.deleteByUserId(id);
            
            // Create new districts
            for (DistrictDTO district : updateRequest.getDistricts()) {
                UserDistrict userDistrict = new UserDistrict();
                userDistrict.setUserId(user.getId());
                userDistrict.setDistrictCode(district.getCode());
                userDistrict.setDistrictNameEnglish(district.getName());
                userDistrict.setIsDefaultDistrictSupervisor(false);
                
                userDistrictRepository.save(userDistrict);
            }
        }
        
        return convertToDTO(user);
    }
    
    /**
     * Deactivate user (soft delete)
     */
    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setIsActive(false);
        userRepository.save(user);
    }
    
    /**
     * Get user districts
     */
    public List<DistrictDTO> getUserDistricts(Long userId) {
        List<UserDistrict> userDistricts = userDistrictRepository.findByUserId(userId);
        return userDistricts.stream()
                .map(ud -> new DistrictDTO(ud.getDistrictCode(), ud.getDistrictNameEnglish()))
                .collect(Collectors.toList());
    }
    
    /**
     * Get all available districts from addresses
     */
    public List<DistrictDTO> getAvailableDistricts() {
        // Query distinct districts from addresses
        List<Object[]> results = addressRepository.findDistinctDistricts();
        
        return results.stream()
                .map(row -> new DistrictDTO(
                        (String) row[0],  // districtCode
                        (String) row[1]   // districtNameEnglish
                ))
                .collect(Collectors.toList());
    }
    
    /**
     * Convert User entity to DTO
     */
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setDevoteeId(user.getDevoteeId());
        dto.setIsActive(user.getIsActive());
        
        // Load districts
        List<DistrictDTO> districts = getUserDistricts(user.getId());
        dto.setDistricts(districts);
        
        return dto;
    }
}
