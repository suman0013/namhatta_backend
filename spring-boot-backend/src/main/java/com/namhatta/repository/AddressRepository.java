package com.namhatta.repository;

import com.namhatta.model.entity.Address;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    
    @Query("SELECT DISTINCT a.country FROM Address a WHERE a.country IS NOT NULL ORDER BY a.country")
    List<String> findDistinctCountries();
    
    @Query("SELECT DISTINCT a.stateNameEnglish FROM Address a WHERE a.country = :country AND a.stateNameEnglish IS NOT NULL ORDER BY a.stateNameEnglish")
    List<String> findDistinctStatesByCountry(@Param("country") String country);
    
    @Query("SELECT DISTINCT a.districtNameEnglish FROM Address a WHERE a.stateNameEnglish = :state AND a.districtNameEnglish IS NOT NULL ORDER BY a.districtNameEnglish")
    List<String> findDistinctDistrictsByState(@Param("state") String state);
    
    @Query("SELECT a FROM Address a WHERE " +
           "(:country IS NULL OR a.country = :country) AND " +
           "(:stateCode IS NULL OR a.stateCode = :stateCode) AND " +
           "(:districtCode IS NULL OR a.districtCode = :districtCode) AND " +
           "(:subdistrictCode IS NULL OR a.subdistrictCode = :subdistrictCode) AND " +
           "(:villageCode IS NULL OR a.villageCode = :villageCode) AND " +
           "(:pincode IS NULL OR a.pincode = :pincode)")
    Optional<Address> findExactMatch(
        @Param("country") String country,
        @Param("stateCode") String stateCode,
        @Param("districtCode") String districtCode,
        @Param("subdistrictCode") String subdistrictCode,
        @Param("villageCode") String villageCode,
        @Param("pincode") String pincode
    );
    
    @Query("SELECT a FROM Address a WHERE " +
           ":pincode IS NOT NULL AND a.pincode = :pincode")
    Page<Address> findByPincode(@Param("pincode") String pincode, Pageable pageable);
    
    @Query("SELECT DISTINCT a.districtCode, a.districtNameEnglish FROM Address a WHERE a.districtCode IS NOT NULL ORDER BY a.districtNameEnglish")
    List<Object[]> findDistinctDistricts();
    
    @Query("SELECT DISTINCT a.subdistrictNameEnglish FROM Address a WHERE " +
           "(:district IS NULL OR a.districtNameEnglish = :district) AND " +
           "(:pincode IS NULL OR a.pincode = :pincode) AND " +
           "a.subdistrictNameEnglish IS NOT NULL " +
           "ORDER BY a.subdistrictNameEnglish")
    List<String> findDistinctSubDistricts(@Param("district") String district, @Param("pincode") String pincode);
    
    @Query("SELECT DISTINCT a.villageNameEnglish FROM Address a WHERE " +
           "(:subDistrict IS NULL OR a.subdistrictNameEnglish = :subDistrict) AND " +
           "(:pincode IS NULL OR a.pincode = :pincode) AND " +
           "a.villageNameEnglish IS NOT NULL " +
           "ORDER BY a.villageNameEnglish")
    List<String> findDistinctVillages(@Param("subDistrict") String subDistrict, @Param("pincode") String pincode);
    
    @Query("SELECT DISTINCT a.pincode FROM Address a WHERE " +
           "(:village IS NULL OR a.villageNameEnglish = :village) AND " +
           "(:district IS NULL OR a.districtNameEnglish = :district) AND " +
           "(:subDistrict IS NULL OR a.subdistrictNameEnglish = :subDistrict) AND " +
           "a.pincode IS NOT NULL " +
           "ORDER BY a.pincode")
    List<String> findDistinctPincodes(@Param("village") String village, @Param("district") String district, @Param("subDistrict") String subDistrict);
    
    @Query("SELECT a FROM Address a WHERE " +
           "a.country = :country AND " +
           "(a.pincode LIKE %:search% OR " +
           "a.villageNameEnglish LIKE %:search% OR " +
           "a.districtNameEnglish LIKE %:search% OR " +
           "a.subdistrictNameEnglish LIKE %:search%)")
    Page<Address> searchPincodes(@Param("country") String country, @Param("search") String search, Pageable pageable);
    
    List<Address> findByPincode(String pincode);
}
