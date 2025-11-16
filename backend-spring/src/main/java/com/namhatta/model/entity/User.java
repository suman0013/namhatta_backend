package com.namhatta.model.entity;

import com.namhatta.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends BaseEntity {
    
    @Column(name = "username", nullable = false, unique = true)
    private String username;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(name = "full_name", nullable = false)
    private String fullName;
    
    @Column(name = "email", nullable = false, unique = true)
    private String email;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;
    
    @Column(name = "devotee_id")
    private Long devoteeId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "devotee_id", insertable = false, updatable = false)
    private Devotee devotee;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
