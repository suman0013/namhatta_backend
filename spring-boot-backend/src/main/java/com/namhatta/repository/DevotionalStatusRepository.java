package com.namhatta.repository;

import com.namhatta.model.entity.DevotionalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DevotionalStatusRepository extends JpaRepository<DevotionalStatus, Long> {
    
    Optional<DevotionalStatus> findByName(String name);
}
