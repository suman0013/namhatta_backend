package com.namhatta.repository;

import com.namhatta.model.entity.Shraddhakutir;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShraddhakutirRepository extends JpaRepository<Shraddhakutir, Long> {
    
    List<Shraddhakutir> findByDistrictCode(String districtCode);
}
