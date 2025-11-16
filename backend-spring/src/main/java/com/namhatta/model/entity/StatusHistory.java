package com.namhatta.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "status_history")
@Getter
@Setter
public class StatusHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "devotee_id", nullable = false)
    private Integer devoteeId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "devotee_id", insertable = false, updatable = false)
    private Devotee devotee;
    
    @Column(name = "previous_status")
    private String previousStatus;
    
    @Column(name = "new_status", nullable = false)
    private String newStatus;
    
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
