package com.namhatta.model.entity;

import com.namhatta.model.enums.Gender;
import com.namhatta.model.enums.LeadershipRole;
import com.namhatta.model.enums.MaritalStatus;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.util.List;
import java.util.Map;

@Entity
@Table(name = "devotees")
@Getter
@Setter
public class Devotee extends BaseEntity {
    
    @Column(name = "legal_name", nullable = false)
    private String legalName;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "dob")
    private String dob;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "father_name")
    private String fatherName;
    
    @Column(name = "mother_name")
    private String motherName;
    
    @Column(name = "husband_name")
    private String husbandName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;
    
    @Column(name = "blood_group")
    private String bloodGroup;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "marital_status")
    private MaritalStatus maritalStatus;
    
    @Column(name = "devotional_status_id")
    private Long devotionalStatusId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "devotional_status_id", insertable = false, updatable = false)
    private DevotionalStatus devotionalStatus;
    
    @Column(name = "namhatta_id")
    private Long namhattaId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "namhatta_id", insertable = false, updatable = false)
    private Namhatta namhatta;
    
    @Column(name = "harinam_initiation_gurudev_id")
    private Long harinamInitiationGurudevId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "harinam_initiation_gurudev_id", insertable = false, updatable = false)
    private Gurudev harinamInitiationGurudev;
    
    @Column(name = "pancharatrik_initiation_gurudev_id")
    private Long pancharatrikInitiationGurudevId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pancharatrik_initiation_gurudev_id", insertable = false, updatable = false)
    private Gurudev pancharatrikInitiationGurudev;
    
    @Column(name = "initiated_name")
    private String initiatedName;
    
    @Column(name = "harinam_date")
    private String harinamDate;
    
    @Column(name = "pancharatrik_date")
    private String pancharatrikDate;
    
    @Column(name = "education")
    private String education;
    
    @Column(name = "occupation")
    private String occupation;
    
    @Type(JsonBinaryType.class)
    @Column(name = "devotional_courses", columnDefinition = "jsonb")
    private List<Map<String, String>> devotionalCourses;
    
    @Column(name = "additional_comments", columnDefinition = "TEXT")
    private String additionalComments;
    
    @Column(name = "shraddhakutir_id")
    private Long shraddhakutirId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shraddhakutir_id", insertable = false, updatable = false)
    private Shraddhakutir shraddhakutir;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "leadership_role")
    private LeadershipRole leadershipRole;
    
    @Column(name = "reporting_to_devotee_id")
    private Long reportingToDevoteeId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporting_to_devotee_id", insertable = false, updatable = false)
    private Devotee reportingToDevotee;
    
    @Column(name = "has_system_access", nullable = false)
    private Boolean hasSystemAccess = false;
    
    @Column(name = "appointed_date")
    private String appointedDate;
    
    @Column(name = "appointed_by")
    private Long appointedBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointed_by", insertable = false, updatable = false)
    private User appointedByUser;
}
