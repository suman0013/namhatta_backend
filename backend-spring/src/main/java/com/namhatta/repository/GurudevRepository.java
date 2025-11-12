package com.namhatta.repository;

import com.namhatta.model.entity.Gurudev;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GurudevRepository extends JpaRepository<Gurudev, Long> {
    
    Optional<Gurudev> findByName(String name);
}
