package com.namhatta.repository;

import com.namhatta.model.entity.NamhattaAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NamhattaAddressRepository extends JpaRepository<NamhattaAddress, Long> {
    
    Optional<NamhattaAddress> findByNamhattaId(Long namhattaId);
    
    @Query("SELECT a.country, COUNT(na.namhattaId) FROM NamhattaAddress na " +
           "JOIN Address a ON na.addressId = a.id " +
           "GROUP BY a.country")
    List<Object[]> countNamhattasByCountry();
    
    @Query("SELECT a.stateNameEnglish, COUNT(na.namhattaId) FROM NamhattaAddress na " +
           "JOIN Address a ON na.addressId = a.id " +
           "GROUP BY a.stateNameEnglish")
    List<Object[]> countNamhattasByState();
    
    @Query("SELECT a.districtCode, a.districtNameEnglish, COUNT(na.namhattaId) FROM NamhattaAddress na " +
           "JOIN Address a ON na.addressId = a.id " +
           "GROUP BY a.districtCode, a.districtNameEnglish")
    List<Object[]> countNamhattasByDistrict();
    
    @Query("SELECT a.subdistrictCode, a.subdistrictNameEnglish, COUNT(na.namhattaId) FROM NamhattaAddress na " +
           "JOIN Address a ON na.addressId = a.id " +
           "GROUP BY a.subdistrictCode, a.subdistrictNameEnglish")
    List<Object[]> countNamhattasBySubDistrict();
    
    @Query("SELECT a.villageCode, a.villageNameEnglish, COUNT(na.namhattaId) FROM NamhattaAddress na " +
           "JOIN Address a ON na.addressId = a.id " +
           "GROUP BY a.villageCode, a.villageNameEnglish")
    List<Object[]> countNamhattasByVillage();
}
