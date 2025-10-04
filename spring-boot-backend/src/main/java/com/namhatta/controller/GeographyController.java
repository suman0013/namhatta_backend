package com.namhatta.controller;

import com.namhatta.dto.AddressDTO;
import com.namhatta.dto.AddressDetails;
import com.namhatta.dto.PincodeSearchResult;
import com.namhatta.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class GeographyController {

    @Autowired
    private AddressService addressService;

    @GetMapping("/countries")
    public List<String> getCountries() {
        return addressService.getCountries();
    }

    @GetMapping("/states")
    public List<String> getStates(
            @RequestParam(required = false) String country) {
        return addressService.getStates(country);
    }

    @GetMapping("/districts")
    public List<String> getDistricts(
            @RequestParam(required = false) String state) {
        return addressService.getDistricts(state);
    }

    @GetMapping("/sub-districts")
    public List<String> getSubDistricts(
            @RequestParam String district,
            @RequestParam(required = false) String pincode) {
        return addressService.getSubDistricts(district, pincode);
    }

    @GetMapping("/villages")
    public List<String> getVillages(
            @RequestParam String subDistrict,
            @RequestParam(required = false) String pincode) {
        return addressService.getVillages(subDistrict, pincode);
    }

    @GetMapping("/pincodes")
    public List<String> getPincodes(
            @RequestParam(required = false) String village,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String subDistrict) {
        return addressService.getPincodes(village, district, subDistrict);
    }

    @GetMapping("/pincodes/search")
    public Map<String, Object> searchPincodes(
            @RequestParam String country,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int limit) {
        
        // Ensure limit doesn't exceed 100
        limit = Math.min(limit, 100);
        
        PincodeSearchResult result = addressService.searchPincodes(country, search, page, limit);
        
        Map<String, Object> response = new HashMap<>();
        response.put("pincodes", result.getPincodes());
        response.put("total", result.getTotal());
        response.put("hasMore", result.getHasMore());
        
        return response;
    }

    @GetMapping("/address-by-pincode")
    public AddressDetails getAddressByPincode(@RequestParam String pincode) {
        if (pincode == null || !pincode.matches("^[0-9]{6}$")) {
            throw new IllegalArgumentException("Pincode must be 6 digits");
        }
        return addressService.getAddressByPincode(pincode);
    }
}
