package com.namhatta.service;

import com.namhatta.repository.AddressRepository;
import com.namhatta.repository.NamhattaAddressRepository;
import com.namhatta.repository.NamhattaRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MapDataService {

    private final NamhattaRepository namhattaRepository;
    private final NamhattaAddressRepository namhattaAddressRepository;
    private final AddressRepository addressRepository;

    public MapDataService(NamhattaRepository namhattaRepository,
                         NamhattaAddressRepository namhattaAddressRepository,
                         AddressRepository addressRepository) {
        this.namhattaRepository = namhattaRepository;
        this.namhattaAddressRepository = namhattaAddressRepository;
        this.addressRepository = addressRepository;
    }

    public static class CountryCountDTO {
        private String country;
        private long count;

        public CountryCountDTO(String country, long count) {
            this.country = country;
            this.count = count;
        }

        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class StateCountDTO {
        private String state;
        private long count;

        public StateCountDTO(String state, long count) {
            this.state = state;
            this.count = count;
        }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class DistrictCountDTO {
        private String districtCode;
        private String districtName;
        private long count;

        public DistrictCountDTO(String districtCode, String districtName, long count) {
            this.districtCode = districtCode;
            this.districtName = districtName;
            this.count = count;
        }

        public String getDistrictCode() { return districtCode; }
        public void setDistrictCode(String districtCode) { this.districtCode = districtCode; }

        public String getDistrictName() { return districtName; }
        public void setDistrictName(String districtName) { this.districtName = districtName; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class SubDistrictCountDTO {
        private String subDistrictCode;
        private String subDistrictName;
        private long count;

        public SubDistrictCountDTO(String subDistrictCode, String subDistrictName, long count) {
            this.subDistrictCode = subDistrictCode;
            this.subDistrictName = subDistrictName;
            this.count = count;
        }

        public String getSubDistrictCode() { return subDistrictCode; }
        public void setSubDistrictCode(String subDistrictCode) { this.subDistrictCode = subDistrictCode; }

        public String getSubDistrictName() { return subDistrictName; }
        public void setSubDistrictName(String subDistrictName) { this.subDistrictName = subDistrictName; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class VillageCountDTO {
        private String villageCode;
        private String villageName;
        private long count;

        public VillageCountDTO(String villageCode, String villageName, long count) {
            this.villageCode = villageCode;
            this.villageName = villageName;
            this.count = count;
        }

        public String getVillageCode() { return villageCode; }
        public void setVillageCode(String villageCode) { this.villageCode = villageCode; }

        public String getVillageName() { return villageName; }
        public void setVillageName(String villageName) { this.villageName = villageName; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public List<CountryCountDTO> getNamhattaCountsByCountry() {
        List<Object[]> results = namhattaAddressRepository.countNamhattasByCountry();
        List<CountryCountDTO> countryDTOs = new ArrayList<>();
        
        for (Object[] result : results) {
            String country = result[0] != null ? result[0].toString() : "Unknown";
            Long count = result[1] != null ? ((Number) result[1]).longValue() : 0L;
            countryDTOs.add(new CountryCountDTO(country, count));
        }
        
        return countryDTOs;
    }

    public List<StateCountDTO> getNamhattaCountsByState() {
        List<Object[]> results = namhattaAddressRepository.countNamhattasByState();
        List<StateCountDTO> stateDTOs = new ArrayList<>();
        
        for (Object[] result : results) {
            String state = result[0] != null ? result[0].toString() : "Unknown";
            Long count = result[1] != null ? ((Number) result[1]).longValue() : 0L;
            stateDTOs.add(new StateCountDTO(state, count));
        }
        
        return stateDTOs;
    }

    public List<DistrictCountDTO> getNamhattaCountsByDistrict() {
        List<Object[]> results = namhattaAddressRepository.countNamhattasByDistrict();
        List<DistrictCountDTO> districtDTOs = new ArrayList<>();
        
        for (Object[] result : results) {
            String districtCode = result[0] != null ? result[0].toString() : "";
            String districtName = result[1] != null ? result[1].toString() : "Unknown";
            Long count = result[2] != null ? ((Number) result[2]).longValue() : 0L;
            districtDTOs.add(new DistrictCountDTO(districtCode, districtName, count));
        }
        
        return districtDTOs;
    }

    public List<SubDistrictCountDTO> getNamhattaCountsBySubDistrict() {
        List<Object[]> results = namhattaAddressRepository.countNamhattasBySubDistrict();
        List<SubDistrictCountDTO> subDistrictDTOs = new ArrayList<>();
        
        for (Object[] result : results) {
            String subDistrictCode = result[0] != null ? result[0].toString() : "";
            String subDistrictName = result[1] != null ? result[1].toString() : "Unknown";
            Long count = result[2] != null ? ((Number) result[2]).longValue() : 0L;
            subDistrictDTOs.add(new SubDistrictCountDTO(subDistrictCode, subDistrictName, count));
        }
        
        return subDistrictDTOs;
    }

    public List<VillageCountDTO> getNamhattaCountsByVillage() {
        List<Object[]> results = namhattaAddressRepository.countNamhattasByVillage();
        List<VillageCountDTO> villageDTOs = new ArrayList<>();
        
        for (Object[] result : results) {
            String villageCode = result[0] != null ? result[0].toString() : "";
            String villageName = result[1] != null ? result[1].toString() : "Unknown";
            Long count = result[2] != null ? ((Number) result[2]).longValue() : 0L;
            villageDTOs.add(new VillageCountDTO(villageCode, villageName, count));
        }
        
        return villageDTOs;
    }
}
