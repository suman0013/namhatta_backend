package com.namhatta.dto;

import java.util.List;

public class AddressDetails {
    private String country;
    private String state;
    private String district;
    private List<String> subDistricts;
    private List<String> villages;
    
    public AddressDetails() {
    }
    
    public AddressDetails(String country, String state, String district,
                         List<String> subDistricts, List<String> villages) {
        this.country = country;
        this.state = state;
        this.district = district;
        this.subDistricts = subDistricts;
        this.villages = villages;
    }
    
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    
    public List<String> getSubDistricts() { return subDistricts; }
    public void setSubDistricts(List<String> subDistricts) { this.subDistricts = subDistricts; }
    
    public List<String> getVillages() { return villages; }
    public void setVillages(List<String> villages) { this.villages = villages; }
}
