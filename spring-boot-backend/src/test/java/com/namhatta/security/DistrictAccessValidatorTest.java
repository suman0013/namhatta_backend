package com.namhatta.security;

import com.namhatta.model.entity.Address;
import com.namhatta.model.entity.Devotee;
import com.namhatta.model.entity.DevoteeAddress;
import com.namhatta.repository.DevoteeAddressRepository;
import com.namhatta.repository.DevoteeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DistrictAccessValidatorTest {

    @Mock
    private DevoteeRepository devoteeRepository;

    @Mock
    private DevoteeAddressRepository devoteeAddressRepository;

    @InjectMocks
    private DistrictAccessValidator districtAccessValidator;

    private Devotee testDevotee;
    private DevoteeAddress testDevoteeAddress;
    private Address testAddress;

    @BeforeEach
    void setUp() {
        testDevotee = new Devotee();
        testDevotee.setId(1L);
        testDevotee.setName("Test Devotee");

        testAddress = new Address();
        testAddress.setId(1L);
        testAddress.setDistrictCode("DIST001");
        testAddress.setDistrictNameEnglish("Test District");

        testDevoteeAddress = new DevoteeAddress();
        testDevoteeAddress.setDevoteeId(1L);
        testDevoteeAddress.setAddress(testAddress);
    }

    @Test
    void validateDevoteeAccess_WithMatchingDistrict_ShouldNotThrowException() {
        List<String> userDistricts = Arrays.asList("DIST001", "DIST002");

        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(testDevotee));
        when(devoteeAddressRepository.findByDevoteeId(1L)).thenReturn(List.of(testDevoteeAddress));

        assertThatCode(() -> districtAccessValidator.validateDevoteeAccess(1L, userDistricts))
                .doesNotThrowAnyException();
    }

    @Test
    void validateDevoteeAccess_WithNonMatchingDistrict_ShouldThrowAccessDeniedException() {
        List<String> userDistricts = Arrays.asList("DIST002", "DIST003");

        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(testDevotee));
        when(devoteeAddressRepository.findByDevoteeId(1L)).thenReturn(List.of(testDevoteeAddress));

        assertThatThrownBy(() -> districtAccessValidator.validateDevoteeAccess(1L, userDistricts))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("not authorized");
    }

    @Test
    void validateDevoteeAccess_WithEmptyUserDistricts_ShouldThrowAccessDeniedException() {
        List<String> userDistricts = List.of();

        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(testDevotee));
        when(devoteeAddressRepository.findByDevoteeId(1L)).thenReturn(List.of(testDevoteeAddress));

        assertThatThrownBy(() -> districtAccessValidator.validateDevoteeAccess(1L, userDistricts))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void validateDevoteeAccess_WithNoDevoteeAddress_ShouldThrowAccessDeniedException() {
        List<String> userDistricts = Arrays.asList("DIST001");

        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(testDevotee));
        when(devoteeAddressRepository.findByDevoteeId(1L)).thenReturn(List.of());

        assertThatThrownBy(() -> districtAccessValidator.validateDevoteeAccess(1L, userDistricts))
                .isInstanceOf(AccessDeniedException.class);
    }
}
