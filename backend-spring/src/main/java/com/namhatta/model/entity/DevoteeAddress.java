package com.namhatta.model.entity;

import com.namhatta.model.enums.AddressType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "devotee_addresses")
@Getter
@Setter
public class DevoteeAddress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "devotee_id", nullable = false)
    private Long devoteeId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "devotee_id", insertable = false, updatable = false)
    private Devotee devotee;
    
    @Column(name = "address_id", nullable = false)
    private Long addressId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", insertable = false, updatable = false)
    private Address address;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "address_type", nullable = false)
    private AddressType addressType;
    
    @Column(name = "landmark")
    private String landmark;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
