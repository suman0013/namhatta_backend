package com.namhatta.repository;

import com.namhatta.model.entity.StatusHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {
    
    List<StatusHistory> findByDevoteeIdOrderByUpdatedAtDesc(Long devoteeId);
    
    @Query("SELECT sh FROM StatusHistory sh " +
           "LEFT JOIN sh.devotee d " +
           "WHERE :devoteeId IS NULL OR sh.devoteeId = :devoteeId " +
           "ORDER BY sh.updatedAt DESC")
    Page<StatusHistory> findStatusHistoryWithDevotee(
        @Param("devoteeId") Long devoteeId,
        Pageable pageable
    );
}
