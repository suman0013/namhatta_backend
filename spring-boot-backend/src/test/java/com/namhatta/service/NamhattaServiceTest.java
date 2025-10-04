package com.namhatta.service;

import com.namhatta.dto.CreateNamhattaRequest;
import com.namhatta.dto.NamhattaDTO;
import com.namhatta.dto.ApproveNamhattaRequest;
import com.namhatta.exception.ConflictException;
import com.namhatta.exception.NotFoundException;
import com.namhatta.model.entity.Namhatta;
import com.namhatta.model.enums.NamhattaStatus;
import com.namhatta.repository.NamhattaRepository;
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
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NamhattaServiceTest {

    @Mock
    private NamhattaRepository namhattaRepository;

    @Mock
    private AddressService addressService;

    @InjectMocks
    private NamhattaService namhattaService;

    private Namhatta testNamhatta;
    private CreateNamhattaRequest createRequest;

    @BeforeEach
    void setUp() {
        testNamhatta = new Namhatta();
        testNamhatta.setId(1L);
        testNamhatta.setCode("NH001");
        testNamhatta.setName("Test Namhatta");
        testNamhatta.setMeetingDay("Sunday");
        testNamhatta.setMeetingTime(LocalTime.of(10, 0));
        testNamhatta.setStatus(NamhattaStatus.PENDING_APPROVAL);
        testNamhatta.setDistrictSupervisorId(1L);

        createRequest = new CreateNamhattaRequest();
        createRequest.setCode("NH002");
        createRequest.setName("New Namhatta");
        createRequest.setMeetingDay("Saturday");
        createRequest.setMeetingTime(LocalTime.of(18, 0));
        createRequest.setDistrictSupervisorId(1L);
    }

    @Test
    void createNamhatta_WithUniqueCode_ShouldReturnNamhattaDTO() {
        when(namhattaRepository.existsByCode("NH002")).thenReturn(false);
        when(namhattaRepository.save(any(Namhatta.class))).thenReturn(testNamhatta);

        NamhattaDTO result = namhattaService.createNamhatta(createRequest);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getCode()).isEqualTo("NH001");
        
        verify(namhattaRepository).existsByCode("NH002");
        verify(namhattaRepository).save(any(Namhatta.class));
    }

    @Test
    void createNamhatta_WithDuplicateCode_ShouldThrowConflictException() {
        when(namhattaRepository.existsByCode("NH002")).thenReturn(true);

        assertThatThrownBy(() -> namhattaService.createNamhatta(createRequest))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already exists");

        verify(namhattaRepository).existsByCode("NH002");
        verify(namhattaRepository, never()).save(any());
    }

    @Test
    void approveNamhatta_WithValidData_ShouldApproveAndSetRegistration() {
        ApproveNamhattaRequest approveRequest = new ApproveNamhattaRequest();
        approveRequest.setRegistrationNo("REG123");
        approveRequest.setRegistrationDate(LocalDate.now());

        when(namhattaRepository.findById(1L)).thenReturn(Optional.of(testNamhatta));
        when(namhattaRepository.existsByRegistrationNo("REG123")).thenReturn(false);
        when(namhattaRepository.save(any(Namhatta.class))).thenReturn(testNamhatta);

        namhattaService.approveNamhatta(1L, approveRequest);

        assertThat(testNamhatta.getStatus()).isEqualTo(NamhattaStatus.APPROVED);
        assertThat(testNamhatta.getRegistrationNo()).isEqualTo("REG123");
        assertThat(testNamhatta.getRegistrationDate()).isEqualTo(approveRequest.getRegistrationDate());

        verify(namhattaRepository).findById(1L);
        verify(namhattaRepository).existsByRegistrationNo("REG123");
        verify(namhattaRepository).save(testNamhatta);
    }

    @Test
    void approveNamhatta_WithDuplicateRegistrationNo_ShouldThrowConflictException() {
        ApproveNamhattaRequest approveRequest = new ApproveNamhattaRequest();
        approveRequest.setRegistrationNo("REG123");
        approveRequest.setRegistrationDate(LocalDate.now());

        when(namhattaRepository.findById(1L)).thenReturn(Optional.of(testNamhatta));
        when(namhattaRepository.existsByRegistrationNo("REG123")).thenReturn(true);

        assertThatThrownBy(() -> namhattaService.approveNamhatta(1L, approveRequest))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Registration number already exists");

        verify(namhattaRepository).findById(1L);
        verify(namhattaRepository).existsByRegistrationNo("REG123");
        verify(namhattaRepository, never()).save(any());
    }

    @Test
    void rejectNamhatta_WithValidId_ShouldSetStatusToRejected() {
        when(namhattaRepository.findById(1L)).thenReturn(Optional.of(testNamhatta));
        when(namhattaRepository.save(any(Namhatta.class))).thenReturn(testNamhatta);

        namhattaService.rejectNamhatta(1L, "Incomplete information");

        assertThat(testNamhatta.getStatus()).isEqualTo(NamhattaStatus.REJECTED);

        verify(namhattaRepository).findById(1L);
        verify(namhattaRepository).save(testNamhatta);
    }

    @Test
    void getNamhattas_WithPagination_ShouldReturnPageOfNamhattas() {
        Page<Namhatta> namhattaPage = new PageImpl<>(List.of(testNamhatta));
        when(namhattaRepository.findAll(any(Pageable.class))).thenReturn(namhattaPage);

        Page<NamhattaDTO> result = namhattaService.getNamhattas(
                null, null, null, null, null, Pageable.unpaged()
        );

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo(1L);

        verify(namhattaRepository).findAll(any(Pageable.class));
    }

    @Test
    void getNamhattaById_WithExistingId_ShouldReturnNamhattaDTO() {
        when(namhattaRepository.findById(1L)).thenReturn(Optional.of(testNamhatta));

        NamhattaDTO result = namhattaService.getNamhattaById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getCode()).isEqualTo("NH001");
        assertThat(result.getName()).isEqualTo("Test Namhatta");

        verify(namhattaRepository).findById(1L);
    }

    @Test
    void getNamhattaById_WithNonexistentId_ShouldThrowNotFoundException() {
        when(namhattaRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> namhattaService.getNamhattaById(999L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Namhatta not found");

        verify(namhattaRepository).findById(999L);
    }

    @Test
    void checkRegistrationNo_WithExistingNo_ShouldReturnTrue() {
        when(namhattaRepository.existsByRegistrationNo("REG123")).thenReturn(true);

        boolean exists = namhattaService.checkRegistrationNo("REG123");

        assertThat(exists).isTrue();
        verify(namhattaRepository).existsByRegistrationNo("REG123");
    }

    @Test
    void checkRegistrationNo_WithNonexistentNo_ShouldReturnFalse() {
        when(namhattaRepository.existsByRegistrationNo("REG999")).thenReturn(false);

        boolean exists = namhattaService.checkRegistrationNo("REG999");

        assertThat(exists).isFalse();
        verify(namhattaRepository).existsByRegistrationNo("REG999");
    }
}
