package com.namhatta.util;

import com.namhatta.dto.DevoteeDTO;
import com.namhatta.model.entity.Devotee;
import com.namhatta.repository.DevoteeRepository;
import com.namhatta.repository.DevotionalStatusRepository;
import com.namhatta.repository.NamhattaRepository;
import com.namhatta.repository.ShraddhakutirRepository;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;

@Component
public class DtoMapper {

    private final DevoteeRepository devoteeRepository;
    private final DevotionalStatusRepository devotionalStatusRepository;
    private final NamhattaRepository namhattaRepository;
    private final ShraddhakutirRepository shraddhakutirRepository;

    public DtoMapper(DevoteeRepository devoteeRepository,
                    DevotionalStatusRepository devotionalStatusRepository,
                    NamhattaRepository namhattaRepository,
                    ShraddhakutirRepository shraddhakutirRepository) {
        this.devoteeRepository = devoteeRepository;
        this.devotionalStatusRepository = devotionalStatusRepository;
        this.namhattaRepository = namhattaRepository;
        this.shraddhakutirRepository = shraddhakutirRepository;
    }

    public DevoteeDTO toDevoteeDTO(Devotee devotee) {
        if (devotee == null) {
            return null;
        }

        DevoteeDTO dto = new DevoteeDTO();
        dto.setId(devotee.getId());
        dto.setLegalName(devotee.getLegalName());
        dto.setName(devotee.getName());
        dto.setDob(devotee.getDob() != null ? devotee.getDob().toString() : null);
        dto.setEmail(devotee.getEmail());
        dto.setPhone(devotee.getPhone());
        dto.setFatherName(devotee.getFatherName());
        dto.setMotherName(devotee.getMotherName());
        dto.setHusbandName(devotee.getHusbandName());
        dto.setGender(devotee.getGender() != null ? devotee.getGender().toString() : null);
        dto.setBloodGroup(devotee.getBloodGroup());
        dto.setMaritalStatus(devotee.getMaritalStatus() != null ? devotee.getMaritalStatus().toString() : null);
        
        dto.setDevotionalStatusId(devotee.getDevotionalStatusId());
        if (devotee.getDevotionalStatusId() != null) {
            devotionalStatusRepository.findById(devotee.getDevotionalStatusId())
                .ifPresent(status -> dto.setDevotionalStatusName(status.getName()));
        }
        
        dto.setNamhattaId(devotee.getNamhattaId());
        if (devotee.getNamhattaId() != null) {
            namhattaRepository.findById(devotee.getNamhattaId())
                .ifPresent(namhatta -> dto.setNamhattaName(namhatta.getName()));
        }
        
        dto.setHarinamInitiationGurudevId(devotee.getHarinamInitiationGurudevId());
        if (devotee.getHarinamInitiationGurudevId() != null) {
            devoteeRepository.findById(devotee.getHarinamInitiationGurudevId())
                .ifPresent(gurudev -> dto.setHarinamGurudevName(gurudev.getName()));
        }
        
        dto.setPancharatrikInitiationGurudevId(devotee.getPancharatrikInitiationGurudevId());
        if (devotee.getPancharatrikInitiationGurudevId() != null) {
            devoteeRepository.findById(devotee.getPancharatrikInitiationGurudevId())
                .ifPresent(gurudev -> dto.setPancharatrikGurudevName(gurudev.getName()));
        }
        
        dto.setInitiatedName(devotee.getInitiatedName());
        dto.setHarinamDate(devotee.getHarinamDate() != null ? devotee.getHarinamDate().toString() : null);
        dto.setPancharatrikDate(devotee.getPancharatrikDate() != null ? devotee.getPancharatrikDate().toString() : null);
        dto.setEducation(devotee.getEducation());
        dto.setOccupation(devotee.getOccupation());
        dto.setDevotionalCourses(devotee.getDevotionalCourses() != null ? devotee.getDevotionalCourses() : new ArrayList<>());
        dto.setAdditionalComments(devotee.getAdditionalComments());
        
        dto.setShraddhakutirId(devotee.getShraddhakutirId());
        if (devotee.getShraddhakutirId() != null) {
            shraddhakutirRepository.findById(devotee.getShraddhakutirId())
                .ifPresent(shraddhakutir -> dto.setShraddhakutirName(shraddhakutir.getName()));
        }
        
        dto.setLeadershipRole(devotee.getLeadershipRole() != null ? devotee.getLeadershipRole().toString() : null);
        dto.setReportingToDevoteeId(devotee.getReportingToDevoteeId());
        
        if (devotee.getReportingToDevoteeId() != null) {
            devoteeRepository.findById(devotee.getReportingToDevoteeId())
                .ifPresent(reportingTo -> dto.setReportingToDevoteeName(reportingTo.getName()));
        }
        
        dto.setHasSystemAccess(devotee.getHasSystemAccess());
        dto.setAppointedDate(devotee.getAppointedDate() != null ? devotee.getAppointedDate().toString() : null);
        dto.setAppointedBy(devotee.getAppointedBy() != null ? devotee.getAppointedBy().longValue() : null);
        
        dto.setCreatedAt(devotee.getCreatedAt());
        dto.setUpdatedAt(devotee.getUpdatedAt());
        
        return dto;
    }
}
