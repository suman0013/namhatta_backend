package com.namhatta.service;

import com.namhatta.model.entity.Address;
import com.namhatta.model.enums.UserRole;
import com.namhatta.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final DevoteeRepository devoteeRepository;
    private final NamhattaRepository namhattaRepository;
    private final AddressRepository addressRepository;
    private final DevoteeAddressRepository devoteeAddressRepository;
    private final NamhattaAddressRepository namhattaAddressRepository;

    public ReportService(DevoteeRepository devoteeRepository,
                        NamhattaRepository namhattaRepository,
                        AddressRepository addressRepository,
                        DevoteeAddressRepository devoteeAddressRepository,
                        NamhattaAddressRepository namhattaAddressRepository) {
        this.devoteeRepository = devoteeRepository;
        this.namhattaRepository = namhattaRepository;
        this.addressRepository = addressRepository;
        this.devoteeAddressRepository = devoteeAddressRepository;
        this.namhattaAddressRepository = namhattaAddressRepository;
    }

    public static class HierarchicalReportDTO {
        private Map<String, Object> hierarchy;

        public HierarchicalReportDTO(Map<String, Object> hierarchy) {
            this.hierarchy = hierarchy;
        }

        public Map<String, Object> getHierarchy() { return hierarchy; }
        public void setHierarchy(Map<String, Object> hierarchy) { this.hierarchy = hierarchy; }
    }

    public static class StateReportDTO {
        private String state;
        private long devoteeCount;
        private long namhattaCount;

        public StateReportDTO(String state, long devoteeCount, long namhattaCount) {
            this.state = state;
            this.devoteeCount = devoteeCount;
            this.namhattaCount = namhattaCount;
        }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public long getDevoteeCount() { return devoteeCount; }
        public void setDevoteeCount(long devoteeCount) { this.devoteeCount = devoteeCount; }

        public long getNamhattaCount() { return namhattaCount; }
        public void setNamhattaCount(long namhattaCount) { this.namhattaCount = namhattaCount; }
    }

    public static class DistrictReportDTO {
        private String districtCode;
        private String districtName;
        private long devoteeCount;
        private long namhattaCount;

        public DistrictReportDTO(String districtCode, String districtName, long devoteeCount, long namhattaCount) {
            this.districtCode = districtCode;
            this.districtName = districtName;
            this.devoteeCount = devoteeCount;
            this.namhattaCount = namhattaCount;
        }

        public String getDistrictCode() { return districtCode; }
        public void setDistrictCode(String districtCode) { this.districtCode = districtCode; }

        public String getDistrictName() { return districtName; }
        public void setDistrictName(String districtName) { this.districtName = districtName; }

        public long getDevoteeCount() { return devoteeCount; }
        public void setDevoteeCount(long devoteeCount) { this.devoteeCount = devoteeCount; }

        public long getNamhattaCount() { return namhattaCount; }
        public void setNamhattaCount(long namhattaCount) { this.namhattaCount = namhattaCount; }
    }

    public static class SubDistrictReportDTO {
        private String subDistrictCode;
        private String subDistrictName;
        private long devoteeCount;
        private long namhattaCount;

        public SubDistrictReportDTO(String subDistrictCode, String subDistrictName, long devoteeCount, long namhattaCount) {
            this.subDistrictCode = subDistrictCode;
            this.subDistrictName = subDistrictName;
            this.devoteeCount = devoteeCount;
            this.namhattaCount = namhattaCount;
        }

        public String getSubDistrictCode() { return subDistrictCode; }
        public void setSubDistrictCode(String subDistrictCode) { this.subDistrictCode = subDistrictCode; }

        public String getSubDistrictName() { return subDistrictName; }
        public void setSubDistrictName(String subDistrictName) { this.subDistrictName = subDistrictName; }

        public long getDevoteeCount() { return devoteeCount; }
        public void setDevoteeCount(long devoteeCount) { this.devoteeCount = devoteeCount; }

        public long getNamhattaCount() { return namhattaCount; }
        public void setNamhattaCount(long namhattaCount) { this.namhattaCount = namhattaCount; }
    }

    public static class VillageReportDTO {
        private String villageCode;
        private String villageName;
        private long devoteeCount;
        private long namhattaCount;

        public VillageReportDTO(String villageCode, String villageName, long devoteeCount, long namhattaCount) {
            this.villageCode = villageCode;
            this.villageName = villageName;
            this.devoteeCount = devoteeCount;
            this.namhattaCount = namhattaCount;
        }

        public String getVillageCode() { return villageCode; }
        public void setVillageCode(String villageCode) { this.villageCode = villageCode; }

        public String getVillageName() { return villageName; }
        public void setVillageName(String villageName) { this.villageName = villageName; }

        public long getDevoteeCount() { return devoteeCount; }
        public void setDevoteeCount(long devoteeCount) { this.devoteeCount = devoteeCount; }

        public long getNamhattaCount() { return namhattaCount; }
        public void setNamhattaCount(long namhattaCount) { this.namhattaCount = namhattaCount; }
    }

    public HierarchicalReportDTO getHierarchicalReports(UserRole userRole, List<String> userDistricts) {
        Map<String, Object> hierarchy = new HashMap<>();
        
        long totalDevotees = devoteeRepository.count();
        long totalNamhattas = namhattaRepository.count();
        
        hierarchy.put("totalDevotees", totalDevotees);
        hierarchy.put("totalNamhattas", totalNamhattas);
        hierarchy.put("countries", getAllStatesWithCounts(userRole, userDistricts));

        return new HierarchicalReportDTO(hierarchy);
    }

    public List<StateReportDTO> getAllStatesWithCounts(UserRole userRole, List<String> userDistricts) {
        List<Address> allAddresses = addressRepository.findAll();
        
        Map<String, StateReportDTO> stateMap = new HashMap<>();
        
        for (Address address : allAddresses) {
            String state = address.getStateNameEnglish();
            if (state != null && !state.isEmpty()) {
                stateMap.putIfAbsent(state, new StateReportDTO(state, 0, 0));
            }
        }

        return new ArrayList<>(stateMap.values());
    }

    public List<DistrictReportDTO> getDistrictsByState(String state, UserRole userRole, List<String> userDistricts) {
        List<Address> addresses = addressRepository.findByStateNameEnglish(state);
        
        Map<String, DistrictReportDTO> districtMap = new HashMap<>();
        
        for (Address address : addresses) {
            String districtCode = address.getDistrictCode();
            String districtName = address.getDistrictNameEnglish();
            
            if (districtCode != null && districtName != null) {
                districtMap.putIfAbsent(districtCode, 
                    new DistrictReportDTO(districtCode, districtName, 0, 0));
            }
        }

        return new ArrayList<>(districtMap.values());
    }

    public List<SubDistrictReportDTO> getSubDistrictsByDistrict(String state, String district, UserRole userRole, List<String> userDistricts) {
        List<Address> addresses = addressRepository.findByStateNameEnglishAndDistrictNameEnglish(state, district);
        
        Map<String, SubDistrictReportDTO> subDistrictMap = new HashMap<>();
        
        for (Address address : addresses) {
            String subDistrictCode = address.getSubdistrictCode();
            String subDistrictName = address.getSubdistrictNameEnglish();
            
            if (subDistrictCode != null && subDistrictName != null) {
                subDistrictMap.putIfAbsent(subDistrictCode, 
                    new SubDistrictReportDTO(subDistrictCode, subDistrictName, 0, 0));
            }
        }

        return new ArrayList<>(subDistrictMap.values());
    }

    public List<VillageReportDTO> getVillagesBySubDistrict(String state, String district, String subDistrict, UserRole userRole, List<String> userDistricts) {
        List<Address> addresses = addressRepository.findByStateAndDistrictAndSubdistrict(state, district, subDistrict);
        
        Map<String, VillageReportDTO> villageMap = new HashMap<>();
        
        for (Address address : addresses) {
            String villageCode = address.getVillageCode();
            String villageName = address.getVillageNameEnglish();
            
            if (villageCode != null && villageName != null) {
                villageMap.putIfAbsent(villageCode, 
                    new VillageReportDTO(villageCode, villageName, 0, 0));
            }
        }

        return new ArrayList<>(villageMap.values());
    }
}
