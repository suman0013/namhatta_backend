package com.namhatta.service;

import com.namhatta.dto.AddressData;
import com.namhatta.dto.AddressDTO;
import com.namhatta.dto.AddressDetails;
import com.namhatta.dto.PincodeSearchResult;
import com.namhatta.model.entity.Address;
import com.namhatta.model.entity.DevoteeAddress;
import com.namhatta.model.entity.NamhattaAddress;
import com.namhatta.model.enums.AddressType;
import com.namhatta.repository.AddressRepository;
import com.namhatta.repository.DevoteeAddressRepository;
import com.namhatta.repository.NamhattaAddressRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AddressService {
    
    private final AddressRepository addressRepository;
    private final DevoteeAddressRepository devoteeAddressRepository;
    private final NamhattaAddressRepository namhattaAddressRepository;
    
    public AddressService(AddressRepository addressRepository,
                         DevoteeAddressRepository devoteeAddressRepository,
                         NamhattaAddressRepository namhattaAddressRepository) {
        this.addressRepository = addressRepository;
        this.devoteeAddressRepository = devoteeAddressRepository;
        this.namhattaAddressRepository = namhattaAddressRepository;
    }
    
    /**
     * Find existing address or create new one based on exact match
     * Task 5.3.3
     */
    @Transactional
    public Long findOrCreateAddress(AddressData addressData) {
        // Build exact match criteria (including null values for all fields)
        Optional<Address> existingAddress = addressRepository.findExactMatch(
            addressData.getCountry(),
            addressData.getStateCode(),
            addressData.getDistrictCode(),
            addressData.getSubdistrictCode(),
            addressData.getVillageCode(),
            addressData.getPincode()
        );
        
        // If found, return address id
        if (existingAddress.isPresent()) {
            return existingAddress.get().getId();
        }
        
        // If not found, create new Address entity
        Address newAddress = new Address();
        newAddress.setCountry(addressData.getCountry());
        newAddress.setStateCode(addressData.getStateCode());
        newAddress.setStateNameEnglish(addressData.getStateNameEnglish());
        newAddress.setDistrictCode(addressData.getDistrictCode());
        newAddress.setDistrictNameEnglish(addressData.getDistrictNameEnglish());
        newAddress.setSubdistrictCode(addressData.getSubdistrictCode());
        newAddress.setSubdistrictNameEnglish(addressData.getSubdistrictNameEnglish());
        newAddress.setVillageCode(addressData.getVillageCode());
        newAddress.setVillageNameEnglish(addressData.getVillageNameEnglish());
        newAddress.setPincode(addressData.getPincode());
        
        // Save and return id
        Address savedAddress = addressRepository.save(newAddress);
        return savedAddress.getId();
    }
    
    /**
     * Link devotee to address
     * Task 5.3.4
     */
    @Transactional
    public void linkDevoteeAddress(Long devoteeId, Long addressId, AddressType type, String landmark) {
        // Check if link already exists
        Optional<DevoteeAddress> existingLink = devoteeAddressRepository.findByDevoteeIdAndAddressType(devoteeId, type);
        
        if (existingLink.isPresent()) {
            // If exists, update landmark
            DevoteeAddress devoteeAddress = existingLink.get();
            devoteeAddress.setAddressId(addressId);
            devoteeAddress.setLandmark(landmark);
            devoteeAddressRepository.save(devoteeAddress);
        } else {
            // If not, create new DevoteeAddress
            DevoteeAddress devoteeAddress = new DevoteeAddress();
            devoteeAddress.setDevoteeId(devoteeId);
            devoteeAddress.setAddressId(addressId);
            devoteeAddress.setAddressType(type);
            devoteeAddress.setLandmark(landmark);
            devoteeAddressRepository.save(devoteeAddress);
        }
    }
    
    /**
     * Link namhatta to address
     * Task 5.3.5
     */
    @Transactional
    public void linkNamhattaAddress(Long namhattaId, Long addressId, String landmark) {
        // Check if link exists
        Optional<NamhattaAddress> existingLink = namhattaAddressRepository.findByNamhattaId(namhattaId);
        
        if (existingLink.isPresent()) {
            // Update
            NamhattaAddress namhattaAddress = existingLink.get();
            namhattaAddress.setAddressId(addressId);
            namhattaAddress.setLandmark(landmark);
            namhattaAddressRepository.save(namhattaAddress);
        } else {
            // Create
            NamhattaAddress namhattaAddress = new NamhattaAddress();
            namhattaAddress.setNamhattaId(namhattaId);
            namhattaAddress.setAddressId(addressId);
            namhattaAddress.setLandmark(landmark);
            namhattaAddressRepository.save(namhattaAddress);
        }
    }
    
    /**
     * Get distinct countries
     * Task 5.3.6
     */
    public List<String> getCountries() {
        return addressRepository.findDistinctCountries();
    }
    
    /**
     * Get distinct states filtered by country
     * Task 5.3.7
     */
    public List<String> getStates(String country) {
        if (country == null || country.trim().isEmpty()) {
            return List.of();
        }
        return addressRepository.findDistinctStatesByCountry(country);
    }
    
    /**
     * Get distinct districts filtered by state
     * Task 5.3.8
     */
    public List<String> getDistricts(String state) {
        if (state == null || state.trim().isEmpty()) {
            return List.of();
        }
        return addressRepository.findDistinctDistrictsByState(state);
    }
    
    /**
     * Get distinct sub-districts
     * Task 5.3.9
     */
    public List<String> getSubDistricts(String district, String pincode) {
        return addressRepository.findDistinctSubDistricts(district, pincode);
    }
    
    /**
     * Get distinct villages
     * Task 5.3.10
     */
    public List<String> getVillages(String subDistrict, String pincode) {
        return addressRepository.findDistinctVillages(subDistrict, pincode);
    }
    
    /**
     * Get distinct pincodes
     * Task 5.3.11
     */
    public List<String> getPincodes(String village, String district, String subDistrict) {
        return addressRepository.findDistinctPincodes(village, district, subDistrict);
    }
    
    /**
     * Search pincodes with pagination
     * Task 5.3.12
     */
    public PincodeSearchResult searchPincodes(String country, String search, int page, int limit) {
        // Validate country required
        if (country == null || country.trim().isEmpty()) {
            throw new IllegalArgumentException("Country is required for pincode search");
        }
        
        // Cap limit at 100
        int cappedLimit = Math.min(limit, 100);
        
        // Build query with LIKE on pincode, village, district, subdistrict
        Pageable pageable = PageRequest.of(page, cappedLimit);
        Page<Address> addressPage = addressRepository.searchPincodes(country, search != null ? search : "", pageable);
        
        // Convert to DTOs
        List<AddressDTO> pincodes = addressPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        // Return pincodes array, total count, hasMore flag
        return new PincodeSearchResult(
            pincodes,
            addressPage.getTotalElements(),
            addressPage.hasNext()
        );
    }
    
    /**
     * Get address details by pincode
     * Task 5.3.13
     */
    public AddressDetails getAddressByPincode(String pincode) {
        if (pincode == null || pincode.trim().isEmpty()) {
            throw new IllegalArgumentException("Pincode is required");
        }
        
        // Query addresses by pincode
        List<Address> addresses = addressRepository.findByPincode(pincode);
        
        if (addresses.isEmpty()) {
            return null;
        }
        
        // Get first address for basic info
        Address firstAddress = addresses.get(0);
        
        // Collect unique sub-districts and villages
        List<String> subDistricts = addresses.stream()
                .map(Address::getSubdistrictNameEnglish)
                .filter(s -> s != null && !s.trim().isEmpty())
                .distinct()
                .collect(Collectors.toList());
        
        List<String> villages = addresses.stream()
                .map(Address::getVillageNameEnglish)
                .filter(v -> v != null && !v.trim().isEmpty())
                .distinct()
                .collect(Collectors.toList());
        
        // Return country, state, district, subDistricts array, villages array
        return new AddressDetails(
            firstAddress.getCountry(),
            firstAddress.getStateNameEnglish(),
            firstAddress.getDistrictNameEnglish(),
            subDistricts,
            villages
        );
    }
    
    /**
     * Convert Address entity to DTO
     */
    private AddressDTO convertToDTO(Address address) {
        return new AddressDTO(
            address.getId(),
            address.getCountry(),
            address.getStateCode(),
            address.getStateNameEnglish(),
            address.getDistrictCode(),
            address.getDistrictNameEnglish(),
            address.getSubdistrictCode(),
            address.getSubdistrictNameEnglish(),
            address.getVillageCode(),
            address.getVillageNameEnglish(),
            address.getPincode()
        );
    }
}
