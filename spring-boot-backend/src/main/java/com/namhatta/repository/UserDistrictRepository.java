package com.namhatta.repository;

import com.namhatta.model.entity.UserDistrict;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDistrictRepository extends JpaRepository<UserDistrict, Long> {
    
    List<UserDistrict> findByUserId(Long userId);
    
    List<UserDistrict> findByDistrictCode(String districtCode);
    
    Optional<UserDistrict> findByUserIdAndDistrictCode(Long userId, String districtCode);
    
    void deleteByUserId(Long userId);
}
