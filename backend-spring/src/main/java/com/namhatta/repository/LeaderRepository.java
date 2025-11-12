package com.namhatta.repository;

import com.namhatta.model.entity.Leader;
import com.namhatta.model.enums.LeaderRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaderRepository extends JpaRepository<Leader, Long> {
    
    List<Leader> findByRole(LeaderRole role);
    
    List<Leader> findByReportingToIsNull();
}
