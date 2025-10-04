package com.namhatta.repository;

import com.namhatta.model.entity.NamhattaUpdate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NamhattaUpdateRepository extends JpaRepository<NamhattaUpdate, Long> {
    
    List<NamhattaUpdate> findByNamhattaIdOrderByDateDesc(Long namhattaId);
    
    List<NamhattaUpdate> findAllByOrderByDateDesc();
    
    Page<NamhattaUpdate> findAllByOrderByDateDesc(Pageable pageable);
}
