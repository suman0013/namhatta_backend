package com.namhatta.repository;

import com.namhatta.model.entity.RoleChangeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleChangeHistoryRepository extends JpaRepository<RoleChangeHistory, Long> {
    
    @Query("SELECT rch FROM RoleChangeHistory rch " +
           "WHERE :devoteeId IS NULL OR rch.devoteeId = :devoteeId " +
           "ORDER BY rch.createdAt DESC")
    Page<RoleChangeHistory> findRoleHistoryByDevotee(
        @Param("devoteeId") Long devoteeId,
        Pageable pageable
    );
}
