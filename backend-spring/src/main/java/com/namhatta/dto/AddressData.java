package com.namhatta.dto;

public class AddressData {
    private String country;
    private String stateCode;
    private String stateNameEnglish;
    private String districtCode;
    private String districtNameEnglish;
    private String subdistrictCode;
    private String subdistrictNameEnglish;
    private String villageCode;
    private String villageNameEnglish;
    private String pincode;
    
    public AddressData() {
    }
    
    public AddressData(String country, String stateCode, String stateNameEnglish,
                      String districtCode, String districtNameEnglish,
                      String subdistrictCode, String subdistrictNameEnglish,
                      String villageCode, String villageNameEnglish, String pincode) {
        this.country = country;
        this.stateCode = stateCode;
        this.stateNameEnglish = stateNameEnglish;
        this.districtCode = districtCode;
        this.districtNameEnglish = districtNameEnglish;
        this.subdistrictCode = subdistrictCode;
        this.subdistrictNameEnglish = subdistrictNameEnglish;
        this.villageCode = villageCode;
        this.villageNameEnglish = villageNameEnglish;
        this.pincode = pincode;
    }
    
    // Getters and setters
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    
    public String getStateCode() { return stateCode; }
    public void setStateCode(String stateCode) { this.stateCode = stateCode; }
    
    public String getStateNameEnglish() { return stateNameEnglish; }
    public void setStateNameEnglish(String stateNameEnglish) { this.stateNameEnglish = stateNameEnglish; }
    
    public String getDistrictCode() { return districtCode; }
    public void setDistrictCode(String districtCode) { this.districtCode = districtCode; }
    
    public String getDistrictNameEnglish() { return districtNameEnglish; }
    public void setDistrictNameEnglish(String districtNameEnglish) { this.districtNameEnglish = districtNameEnglish; }
    
    public String getSubdistrictCode() { return subdistrictCode; }
    public void setSubdistrictCode(String subdistrictCode) { this.subdistrictCode = subdistrictCode; }
    
    public String getSubdistrictNameEnglish() { return subdistrictNameEnglish; }
    public void setSubdistrictNameEnglish(String subdistrictNameEnglish) { this.subdistrictNameEnglish = subdistrictNameEnglish; }
    
    public String getVillageCode() { return villageCode; }
    public void setVillageCode(String villageCode) { this.villageCode = villageCode; }
    
    public String getVillageNameEnglish() { return villageNameEnglish; }
    public void setVillageNameEnglish(String villageNameEnglish) { this.villageNameEnglish = villageNameEnglish; }
    
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
}
