package com.namhatta.model.entity;

import com.namhatta.model.enums.LeaderRole;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "leaders")
@Getter
@Setter
public class Leader {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private LeaderRole role;
    
    @Column(name = "reporting_to")
    private Long reportingTo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporting_to", insertable = false, updatable = false)
    private Leader reportingToLeader;
    
    @Type(JsonBinaryType.class)
    @Column(name = "location", columnDefinition = "jsonb")
    private Map<String, String> location;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
