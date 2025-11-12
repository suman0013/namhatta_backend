package com.namhatta.service;

import com.namhatta.dto.CreateDevoteeRequest;
import com.namhatta.dto.DevoteeDTO;
import com.namhatta.dto.UpdateDevoteeRequest;
import com.namhatta.exception.ConflictException;
import com.namhatta.exception.NotFoundException;
import com.namhatta.model.entity.*;
import com.namhatta.model.enums.Gender;
import com.namhatta.model.enums.LeadershipRole;
import com.namhatta.model.enums.MaritalStatus;
import com.namhatta.model.enums.UserRole;
import com.namhatta.repository.DevoteeRepository;
import com.namhatta.repository.DevotionalStatusRepository;
import com.namhatta.repository.StatusHistoryRepository;
import com.namhatta.security.DistrictAccessValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DevoteeServiceTest {

    @Mock
    private DevoteeRepository devoteeRepository;

    @Mock
    private AddressService addressService;

    @Mock
    private DevotionalStatusRepository statusRepository;

    @Mock
    private StatusHistoryRepository statusHistoryRepository;

    @Mock
    private DistrictAccessValidator accessValidator;

    @InjectMocks
    private DevoteeService devoteeService;

    private Devotee testDevotee;
    private CreateDevoteeRequest createRequest;
    private DevotionalStatus testStatus;

    @BeforeEach
    void setUp() {
        testDevotee = new Devotee();
        testDevotee.setId(1L);
        testDevotee.setLegalName("Test Devotee");
        testDevotee.setName("Spiritual Name");
        testDevotee.setEmail("devotee@test.com");
        testDevotee.setPhone("1234567890");
        testDevotee.setGender(Gender.MALE);
        testDevotee.setMaritalStatus(MaritalStatus.UNMARRIED);
        testDevotee.setDob(LocalDate.of(1990, 1, 1));

        testStatus = new DevotionalStatus();
        testStatus.setId(1L);
        testStatus.setName("Aspiring Devotee");

        createRequest = new CreateDevoteeRequest();
        createRequest.setLegalName("New Devotee");
        createRequest.setName("New Spiritual Name");
        createRequest.setEmail("new@test.com");
        createRequest.setPhone("9876543210");
        createRequest.setGender(Gender.MALE);
        createRequest.setMaritalStatus(MaritalStatus.UNMARRIED);
        createRequest.setDob(LocalDate.of(1995, 5, 15));
        createRequest.setDevotionalStatusId(1L);
    }

    @Test
    void createDevotee_WithValidData_ShouldReturnDevoteeDTO() {
        when(statusRepository.findById(1L)).thenReturn(Optional.of(testStatus));
        when(devoteeRepository.save(any(Devotee.class))).thenReturn(testDevotee);

        DevoteeDTO result = devoteeService.createDevotee(createRequest);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getLegalName()).isEqualTo("Test Devotee");
        
        verify(statusRepository).findById(1L);
        verify(devoteeRepository).save(any(Devotee.class));
    }

    @Test
    void createDevotee_WithInvalidStatusId_ShouldThrowNotFoundException() {
        when(statusRepository.findById(999L)).thenReturn(Optional.empty());
        createRequest.setDevotionalStatusId(999L);

        assertThatThrownBy(() -> devoteeService.createDevotee(createRequest))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Devotional status not found");

        verify(statusRepository).findById(999L);
        verify(devoteeRepository, never()).save(any());
    }

    @Test
    void updateDevotee_WithValidData_ShouldReturnUpdatedDevotee() {
        UpdateDevoteeRequest updateRequest = new UpdateDevoteeRequest();
        updateRequest.setLegalName("Updated Name");
        updateRequest.setEmail("updated@test.com");

        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(testDevotee));
        when(devoteeRepository.save(any(Devotee.class))).thenReturn(testDevotee);
        doNothing().when(accessValidator).validateDevoteeAccess(eq(1L), anyList());

        DevoteeDTO result = devoteeService.updateDevotee(1L, updateRequest, List.of("TEST_DIST"));

        assertThat(result).isNotNull();
        verify(devoteeRepository).findById(1L);
        verify(accessValidator).validateDevoteeAccess(eq(1L), anyList());
        verify(devoteeRepository).save(any(Devotee.class));
    }

    @Test
    void updateDevotee_WithNonexistentId_ShouldThrowNotFoundException() {
        UpdateDevoteeRequest updateRequest = new UpdateDevoteeRequest();
        when(devoteeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> devoteeService.updateDevotee(999L, updateRequest, List.of("TEST_DIST")))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Devotee not found");

        verify(devoteeRepository).findById(999L);
        verify(devoteeRepository, never()).save(any());
    }

    @Test
    void getDevotees_WithPagination_ShouldReturnPageOfDevotees() {
        Page<Devotee> devotePage = new PageImpl<>(List.of(testDevotee));
        when(devoteeRepository.findAll(any(Pageable.class))).thenReturn(devotePage);

        Page<DevoteeDTO> result = devoteeService.getDevotees(
                null, null, null, null, null, Pageable.unpaged(), UserRole.ADMIN, List.of()
        );

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo(1L);

        verify(devoteeRepository).findAll(any(Pageable.class));
    }

    @Test
    void upgradeDevoteeStatus_WithValidData_ShouldUpdateStatusAndCreateHistory() {
        DevotionalStatus newStatus = new DevotionalStatus();
        newStatus.setId(2L);
        newStatus.setName("Initiated Devotee");

        testDevotee.setDevotionalStatusId(1L);

        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(testDevotee));
        when(statusRepository.findById(2L)).thenReturn(Optional.of(newStatus));
        when(devoteeRepository.save(any(Devotee.class))).thenReturn(testDevotee);
        when(statusHistoryRepository.save(any(StatusHistory.class))).thenReturn(new StatusHistory());

        devoteeService.upgradeDevoteeStatus(1L, 2L, "Completed initiation");

        verify(devoteeRepository).findById(1L);
        verify(statusRepository).findById(2L);
        verify(devoteeRepository).save(testDevotee);
        verify(statusHistoryRepository).save(any(StatusHistory.class));
    }

    @Test
    void upgradeDevoteeStatus_WithSameStatus_ShouldThrowConflictException() {
        testDevotee.setDevotionalStatusId(1L);
        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(testDevotee));

        assertThatThrownBy(() -> devoteeService.upgradeDevoteeStatus(1L, 1L, "Comment"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already has this status");

        verify(devoteeRepository).findById(1L);
        verify(statusRepository, never()).findById(anyLong());
        verify(statusHistoryRepository, never()).save(any());
    }

    @Test
    void assignLeadershipRole_WithValidRole_ShouldUpdateDevotee() {
        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(testDevotee));
        when(devoteeRepository.save(any(Devotee.class))).thenReturn(testDevotee);

        devoteeService.assignLeadershipRole(1L, LeadershipRole.CHAKRA_SENAPOTI, 2L);

        assertThat(testDevotee.getLeadershipRole()).isEqualTo(LeadershipRole.CHAKRA_SENAPOTI);
        assertThat(testDevotee.getReportingToDevoteeId()).isEqualTo(2L);

        verify(devoteeRepository).findById(1L);
        verify(devoteeRepository).save(testDevotee);
    }

    @Test
    void getDevoteeById_WithExistingId_ShouldReturnDevoteeDTO() {
        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(testDevotee));

        DevoteeDTO result = devoteeService.getDevoteeById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getLegalName()).isEqualTo("Test Devotee");

        verify(devoteeRepository).findById(1L);
    }

    @Test
    void getDevoteeById_WithNonexistentId_ShouldThrowNotFoundException() {
        when(devoteeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> devoteeService.getDevoteeById(999L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Devotee not found");

        verify(devoteeRepository).findById(999L);
    }
}
