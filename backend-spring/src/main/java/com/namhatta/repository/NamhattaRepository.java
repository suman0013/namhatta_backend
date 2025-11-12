package com.namhatta.repository;

import com.namhatta.model.entity.Namhatta;
import com.namhatta.model.enums.NamhattaStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NamhattaRepository extends JpaRepository<Namhatta, Long> {
    
    Optional<Namhatta> findByCode(String code);
    
    Optional<Namhatta> findByRegistrationNo(String registrationNo);
    
    boolean existsByCode(String code);
    
    boolean existsByRegistrationNo(String registrationNo);
    
    @Query("SELECT n FROM Namhatta n " +
           "LEFT JOIN NamhattaAddress na ON n.id = na.namhattaId " +
           "LEFT JOIN Address a ON na.addressId = a.id " +
           "WHERE (:search IS NULL OR :search = '' OR " +
           "       LOWER(n.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(n.code) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:country IS NULL OR :country = '' OR a.country = :country) " +
           "AND (:state IS NULL OR :state = '' OR a.stateNameEnglish = :state) " +
           "AND (:district IS NULL OR :district = '' OR a.districtNameEnglish = :district) " +
           "AND (:status IS NULL OR n.status = :status)")
    Page<Namhatta> findWithFilters(
        @Param("search") String search,
        @Param("country") String country,
        @Param("state") String state,
        @Param("district") String district,
        @Param("status") NamhattaStatus status,
        Pageable pageable
    );
}
