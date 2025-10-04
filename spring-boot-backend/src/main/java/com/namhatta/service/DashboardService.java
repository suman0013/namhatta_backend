package com.namhatta.service;

import com.namhatta.model.entity.NamhattaUpdate;
import com.namhatta.model.enums.UserRole;
import com.namhatta.repository.DevoteeRepository;
import com.namhatta.repository.NamhattaRepository;
import com.namhatta.repository.NamhattaUpdateRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final DevoteeRepository devoteeRepository;
    private final NamhattaRepository namhattaRepository;
    private final NamhattaUpdateRepository namhattaUpdateRepository;

    public DashboardService(DevoteeRepository devoteeRepository,
                           NamhattaRepository namhattaRepository,
                           NamhattaUpdateRepository namhattaUpdateRepository) {
        this.devoteeRepository = devoteeRepository;
        this.namhattaRepository = namhattaRepository;
        this.namhattaUpdateRepository = namhattaUpdateRepository;
    }

    public static class DashboardDTO {
        private long totalDevotees;
        private long totalNamhattas;
        private List<NamhattaUpdate> recentUpdates;

        public DashboardDTO(long totalDevotees, long totalNamhattas, List<NamhattaUpdate> recentUpdates) {
            this.totalDevotees = totalDevotees;
            this.totalNamhattas = totalNamhattas;
            this.recentUpdates = recentUpdates;
        }

        public long getTotalDevotees() { return totalDevotees; }
        public void setTotalDevotees(long totalDevotees) { this.totalDevotees = totalDevotees; }

        public long getTotalNamhattas() { return totalNamhattas; }
        public void setTotalNamhattas(long totalNamhattas) { this.totalNamhattas = totalNamhattas; }

        public List<NamhattaUpdate> getRecentUpdates() { return recentUpdates; }
        public void setRecentUpdates(List<NamhattaUpdate> recentUpdates) { this.recentUpdates = recentUpdates; }
    }

    public static class StatusDistributionDTO {
        private String statusName;
        private long count;

        public StatusDistributionDTO(String statusName, long count) {
            this.statusName = statusName;
            this.count = count;
        }

        public String getStatusName() { return statusName; }
        public void setStatusName(String statusName) { this.statusName = statusName; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public DashboardDTO getDashboardSummary(UserRole userRole, List<String> userDistricts) {
        long totalDevotees;
        long totalNamhattas;

        if (userRole == UserRole.DISTRICT_SUPERVISOR && userDistricts != null && !userDistricts.isEmpty()) {
            totalDevotees = devoteeRepository.count();
            totalNamhattas = namhattaRepository.count();
        } else {
            totalDevotees = devoteeRepository.count();
            totalNamhattas = namhattaRepository.count();
        }

        List<NamhattaUpdate> recentUpdates = namhattaUpdateRepository.findAllByOrderByDateDesc(
            PageRequest.of(0, 10)
        ).getContent();

        return new DashboardDTO(totalDevotees, totalNamhattas, recentUpdates);
    }

    public List<StatusDistributionDTO> getStatusDistribution(UserRole userRole, List<String> userDistricts) {
        Map<String, Long> distribution = new HashMap<>();
        
        List<Object[]> results = devoteeRepository.countByDevotionalStatus();
        
        for (Object[] result : results) {
            String statusName = result[0] != null ? result[0].toString() : "Unknown";
            Long count = result[1] != null ? ((Number) result[1]).longValue() : 0L;
            distribution.put(statusName, count);
        }

        return distribution.entrySet().stream()
            .map(entry -> new StatusDistributionDTO(entry.getKey(), entry.getValue()))
            .toList();
    }
}
