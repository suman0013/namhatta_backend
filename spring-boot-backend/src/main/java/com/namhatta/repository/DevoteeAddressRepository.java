package com.namhatta.repository;

import com.namhatta.model.entity.DevoteeAddress;
import com.namhatta.model.enums.AddressType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DevoteeAddressRepository extends JpaRepository<DevoteeAddress, Long> {
    
    List<DevoteeAddress> findByDevoteeId(Long devoteeId);
    
    Optional<DevoteeAddress> findByDevoteeIdAndAddressType(Long devoteeId, AddressType type);
}
