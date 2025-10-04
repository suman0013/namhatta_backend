package com.namhatta.repository;

import com.namhatta.model.entity.NamhattaAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NamhattaAddressRepository extends JpaRepository<NamhattaAddress, Long> {
    
    Optional<NamhattaAddress> findByNamhattaId(Long namhattaId);
}
