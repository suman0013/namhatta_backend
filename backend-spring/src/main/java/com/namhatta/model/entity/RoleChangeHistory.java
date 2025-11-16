package com.namhatta.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "role_change_history")
@Getter
@Setter
public class RoleChangeHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "devotee_id", nullable = false)
    private Integer devoteeId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "devotee_id", insertable = false, updatable = false)
    private Devotee devotee;
    
    @Column(name = "previous_role")
    private String previousRole;
    
    @Column(name = "new_role")
    private String newRole;
    
    @Column(name = "previous_reporting_to")
    private Integer previousReportingTo;
    
    @Column(name = "new_reporting_to")
    private Integer newReportingTo;
    
    @Column(name = "changed_by", nullable = false)
    private Integer changedBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", insertable = false, updatable = false)
    private User changedByUser;
    
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
    
    @Column(name = "district_code")
    private String districtCode;
    
    @Column(name = "subordinates_transferred")
    private Integer subordinatesTransferred;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
