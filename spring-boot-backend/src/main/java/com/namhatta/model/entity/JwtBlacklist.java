package com.namhatta.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "jwt_blacklist")
@Getter
@Setter
public class JwtBlacklist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "token_hash", nullable = false)
    private String tokenHash;
    
    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
