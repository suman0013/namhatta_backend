package com.namhatta.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "addresses")
@Getter
@Setter
public class Address {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "country", nullable = false, columnDefinition = "TEXT DEFAULT 'India'")
    private String country = "India";
    
    @Column(name = "state_code")
    private String stateCode;
    
    @Column(name = "state_name_english")
    private String stateNameEnglish;
    
    @Column(name = "district_code")
    private String districtCode;
    
    @Column(name = "district_name_english")
    private String districtNameEnglish;
    
    @Column(name = "subdistrict_code")
    private String subdistrictCode;
    
    @Column(name = "subdistrict_name_english")
    private String subdistrictNameEnglish;
    
    @Column(name = "village_code")
    private String villageCode;
    
    @Column(name = "village_name_english")
    private String villageNameEnglish;
    
    @Column(name = "pincode")
    private String pincode;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
