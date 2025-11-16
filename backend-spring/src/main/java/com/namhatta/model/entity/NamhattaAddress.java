package com.namhatta.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "namhatta_addresses")
@Getter
@Setter
public class NamhattaAddress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "namhatta_id", nullable = false)
    private Integer namhattaId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "namhatta_id", insertable = false, updatable = false)
    private Namhatta namhatta;
    
    @Column(name = "address_id", nullable = false)
    private Integer addressId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", insertable = false, updatable = false)
    private Address address;
    
    @Column(name = "landmark")
    private String landmark;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
