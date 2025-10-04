package com.namhatta.repository;

import com.namhatta.model.entity.Devotee;
import com.namhatta.model.enums.LeadershipRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DevoteeRepository extends JpaRepository<Devotee, Long> {
    
    List<Devotee> findByNamhattaId(Long namhattaId);
    
    List<Devotee> findByReportingToDevoteeId(Long id);
    
    List<Devotee> findByLeadershipRoleNotNull();
    
    List<Devotee> findByLeadershipRole(LeadershipRole role);
    
    @Query("SELECT d FROM Devotee d " +
           "LEFT JOIN DevoteeAddress da ON d.id = da.devoteeId " +
           "LEFT JOIN Address a ON da.addressId = a.id " +
           "WHERE (:search IS NULL OR :search = '' OR " +
           "       LOWER(d.legalName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(d.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "       LOWER(d.spiritualName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:country IS NULL OR :country = '' OR a.country = :country) " +
           "AND (:state IS NULL OR :state = '' OR a.stateNameEnglish = :state) " +
           "AND (:district IS NULL OR :district = '' OR a.districtNameEnglish = :district) " +
           "AND (:statusId IS NULL OR d.statusId = :statusId)")
    Page<Devotee> findWithFilters(
        @Param("search") String search,
        @Param("country") String country,
        @Param("state") String state,
        @Param("district") String district,
        @Param("statusId") Long statusId,
        Pageable pageable
    );
}
