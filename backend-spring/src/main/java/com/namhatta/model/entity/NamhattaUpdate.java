package com.namhatta.model.entity;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "namhatta_updates")
@Getter
@Setter
public class NamhattaUpdate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "namhatta_id", nullable = false)
    private Long namhattaId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "namhatta_id", insertable = false, updatable = false)
    private Namhatta namhatta;
    
    @Column(name = "program_type", nullable = false)
    private String programType;
    
    @Column(name = "date", nullable = false)
    private String date;
    
    @Column(name = "attendance", nullable = false)
    private Integer attendance;
    
    @Column(name = "prasad_distribution")
    private Integer prasadDistribution;
    
    @Column(name = "nagar_kirtan")
    private Integer nagarKirtan = 0;
    
    @Column(name = "book_distribution")
    private Integer bookDistribution = 0;
    
    @Column(name = "chanting")
    private Integer chanting = 0;
    
    @Column(name = "arati")
    private Integer arati = 0;
    
    @Column(name = "bhagwat_path")
    private Integer bhagwatPath = 0;
    
    @Type(JsonBinaryType.class)
    @Column(name = "image_urls", columnDefinition = "jsonb")
    private List<String> imageUrls;
    
    @Column(name = "facebook_link")
    private String facebookLink;
    
    @Column(name = "youtube_link")
    private String youtubeLink;
    
    @Column(name = "special_attraction", columnDefinition = "TEXT")
    private String specialAttraction;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
