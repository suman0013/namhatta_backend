package com.namhatta.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_districts", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "district_code"}))
@Getter
@Setter
public class UserDistrict {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @Column(name = "district_code", nullable = false)
    private String districtCode;
    
    @Column(name = "district_name_english", nullable = false)
    private String districtNameEnglish;
    
    @Column(name = "is_default_district_supervisor", nullable = false)
    private Boolean isDefaultDistrictSupervisor = false;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
