package com.namhatta.model.entity;

import com.namhatta.model.enums.NamhattaStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "namhattas")
@Getter
@Setter
public class Namhatta extends BaseEntity {
    
    @Column(name = "code", nullable = false, unique = true)
    private String code;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "meeting_day")
    private String meetingDay;
    
    @Column(name = "meeting_time")
    private String meetingTime;
    
    @Column(name = "mala_senapoti_id")
    private Integer malaSenapotiId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mala_senapoti_id", insertable = false, updatable = false)
    private Devotee malaSenapoti;
    
    @Column(name = "maha_chakra_senapoti_id")
    private Integer mahaChakraSenapotiId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maha_chakra_senapoti_id", insertable = false, updatable = false)
    private Devotee mahaChakraSenapoti;
    
    @Column(name = "chakra_senapoti_id")
    private Integer chakraSenapotiId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chakra_senapoti_id", insertable = false, updatable = false)
    private Devotee chakraSenapoti;
    
    @Column(name = "upa_chakra_senapoti_id")
    private Integer upaChakraSenapotiId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upa_chakra_senapoti_id", insertable = false, updatable = false)
    private Devotee upaChakraSenapoti;
    
    @Column(name = "secretary_id")
    private Integer secretaryId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "secretary_id", insertable = false, updatable = false)
    private Devotee secretary;
    
    @Column(name = "president_id")
    private Integer presidentId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "president_id", insertable = false, updatable = false)
    private Devotee president;
    
    @Column(name = "accountant_id")
    private Integer accountantId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accountant_id", insertable = false, updatable = false)
    private Devotee accountant;
    
    @Column(name = "district_supervisor_id", nullable = false)
    private Integer districtSupervisorId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_supervisor_id", insertable = false, updatable = false)
    private User districtSupervisor;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "TEXT DEFAULT 'PENDING_APPROVAL'")
    private NamhattaStatus status = NamhattaStatus.PENDING_APPROVAL;
    
    @Column(name = "registration_no", unique = true)
    private String registrationNo;
    
    @Column(name = "registration_date")
    private String registrationDate;
}
