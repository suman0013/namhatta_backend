package com.namhatta.service;

import com.namhatta.model.entity.Leader;
import com.namhatta.model.enums.LeaderRole;
import com.namhatta.repository.LeaderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HierarchyService {

    private final LeaderRepository leaderRepository;

    public HierarchyService(LeaderRepository leaderRepository) {
        this.leaderRepository = leaderRepository;
    }

    public List<Leader> getTopLevelLeaders() {
        return leaderRepository.findByReportingToIsNull();
    }

    public List<Leader> getLeadersByLevel(LeaderRole role) {
        return leaderRepository.findByRole(role);
    }
}
