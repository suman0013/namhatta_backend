package com.namhatta.service;

import com.namhatta.dto.DevoteeDTO;
import com.namhatta.dto.PromoteDevoteeRequest;
import com.namhatta.dto.DemoteDevoteeRequest;
import com.namhatta.dto.TransferSubordinatesRequest;
import com.namhatta.dto.RoleChangeResult;
import com.namhatta.exception.CircularReferenceException;
import com.namhatta.exception.ValidationException;
import com.namhatta.model.entity.Devotee;
import com.namhatta.model.entity.RoleChangeHistory;
import com.namhatta.model.enums.LeadershipRole;
import com.namhatta.repository.DevoteeRepository;
import com.namhatta.repository.RoleChangeHistoryRepository;
import com.namhatta.util.RoleHierarchyRules;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoleManagementServiceTest {

    @Mock
    private DevoteeRepository devoteeRepository;

    @Mock
    private RoleChangeHistoryRepository roleChangeHistoryRepository;

    @Mock
    private RoleHierarchyRules roleHierarchyRules;

    @InjectMocks
    private RoleManagementService roleManagementService;

    private Devotee devotee;
    private Devotee supervisor;

    @BeforeEach
    void setUp() {
        devotee = new Devotee();
        devotee.setId(1L);
        devotee.setName("Test Devotee");
        devotee.setLeadershipRole(LeadershipRole.UPA_CHAKRA_SENAPOTI);
        devotee.setReportingToDevoteeId(2L);

        supervisor = new Devotee();
        supervisor.setId(2L);
        supervisor.setName("Test Supervisor");
        supervisor.setLeadershipRole(LeadershipRole.CHAKRA_SENAPOTI);
        supervisor.setReportingToDevoteeId(null);
    }

    @Test
    void promoteDevotee_WithValidPromotion_ShouldSucceed() {
        PromoteDevoteeRequest request = new PromoteDevoteeRequest();
        request.setDevoteeId(1L);
        request.setTargetRole(LeadershipRole.CHAKRA_SENAPOTI);
        request.setNewSupervisorId(3L);
        request.setReason("Good performance");
        request.setDistrictCode("TEST_DIST");

        Devotee newSupervisor = new Devotee();
        newSupervisor.setId(3L);
        newSupervisor.setLeadershipRole(LeadershipRole.MAHA_CHAKRA_SENAPOTI);

        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(devotee));
        when(devoteeRepository.findById(3L)).thenReturn(Optional.of(newSupervisor));
        when(roleHierarchyRules.canPromote(LeadershipRole.UPA_CHAKRA_SENAPOTI, LeadershipRole.CHAKRA_SENAPOTI))
                .thenReturn(true);
        when(devoteeRepository.save(any(Devotee.class))).thenReturn(devotee);
        when(roleChangeHistoryRepository.save(any(RoleChangeHistory.class))).thenReturn(new RoleChangeHistory());

        RoleChangeResult result = roleManagementService.promoteDevotee(request, 100L);

        assertThat(result).isNotNull();
        assertThat(result.getDevotee()).isNotNull();
        verify(devoteeRepository).save(devotee);
        verify(roleChangeHistoryRepository).save(any(RoleChangeHistory.class));
    }

    @Test
    void promoteDevotee_WithCircularReference_ShouldThrowException() {
        PromoteDevoteeRequest request = new PromoteDevoteeRequest();
        request.setDevoteeId(1L);
        request.setTargetRole(LeadershipRole.MAHA_CHAKRA_SENAPOTI);
        request.setNewSupervisorId(1L);
        request.setReason("Test");
        request.setDistrictCode("TEST_DIST");

        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(devotee));

        assertThatThrownBy(() -> roleManagementService.promoteDevotee(request, 100L))
                .isInstanceOf(CircularReferenceException.class)
                .hasMessageContaining("circular");

        verify(devoteeRepository, never()).save(any());
    }

    @Test
    void promoteDevotee_WithInvalidRoleHierarchy_ShouldThrowException() {
        PromoteDevoteeRequest request = new PromoteDevoteeRequest();
        request.setDevoteeId(1L);
        request.setTargetRole(LeadershipRole.CHAKRA_SENAPOTI);
        request.setNewSupervisorId(3L);
        request.setReason("Test");
        request.setDistrictCode("TEST_DIST");

        Devotee newSupervisor = new Devotee();
        newSupervisor.setId(3L);
        newSupervisor.setLeadershipRole(LeadershipRole.UPA_CHAKRA_SENAPOTI);

        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(devotee));
        when(devoteeRepository.findById(3L)).thenReturn(Optional.of(newSupervisor));
        when(roleHierarchyRules.canPromote(LeadershipRole.UPA_CHAKRA_SENAPOTI, LeadershipRole.CHAKRA_SENAPOTI))
                .thenReturn(false);

        assertThatThrownBy(() -> roleManagementService.promoteDevotee(request, 100L))
                .isInstanceOf(ValidationException.class);

        verify(devoteeRepository, never()).save(any());
    }

    @Test
    void demoteDevotee_WithValidDemotion_ShouldSucceed() {
        DemoteDevoteeRequest request = new DemoteDevoteeRequest();
        request.setDevoteeId(1L);
        request.setTargetRole(null);
        request.setReason("Performance issues");
        request.setDistrictCode("TEST_DIST");

        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(devotee));
        when(devoteeRepository.findByReportingToDevoteeId(1L)).thenReturn(List.of());
        when(devoteeRepository.save(any(Devotee.class))).thenReturn(devotee);
        when(roleChangeHistoryRepository.save(any(RoleChangeHistory.class))).thenReturn(new RoleChangeHistory());

        RoleChangeResult result = roleManagementService.demoteDevotee(request, 100L);

        assertThat(result).isNotNull();
        assertThat(result.getDevotee()).isNotNull();

        verify(devoteeRepository).save(devotee);
        verify(roleChangeHistoryRepository).save(any(RoleChangeHistory.class));
    }

    @Test
    void demoteDevotee_WithSubordinates_ShouldRequireTransfer() {
        DemoteDevoteeRequest request = new DemoteDevoteeRequest();
        request.setDevoteeId(1L);
        request.setTargetRole(null);
        request.setReason("Test");
        request.setDistrictCode("TEST_DIST");

        Devotee subordinate = new Devotee();
        subordinate.setId(5L);
        subordinate.setReportingToDevoteeId(1L);

        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(devotee));
        when(devoteeRepository.findByReportingToDevoteeId(1L)).thenReturn(List.of(subordinate));

        assertThatThrownBy(() -> roleManagementService.demoteDevotee(request, 100L))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("subordinates");

        verify(devoteeRepository, never()).save(any());
    }

    @Test
    void transferSubordinates_WithValidTransfer_ShouldSucceed() {
        TransferSubordinatesRequest request = new TransferSubordinatesRequest();
        request.setFromDevoteeId(1L);
        request.setToDevoteeId(2L);
        request.setSubordinateIds(Arrays.asList(3L, 4L));
        request.setReason("Reorganization");

        Devotee subordinate1 = new Devotee();
        subordinate1.setId(3L);
        subordinate1.setReportingToDevoteeId(1L);

        Devotee subordinate2 = new Devotee();
        subordinate2.setId(4L);
        subordinate2.setReportingToDevoteeId(1L);

        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(devotee));
        when(devoteeRepository.findById(2L)).thenReturn(Optional.of(supervisor));
        when(devoteeRepository.findById(3L)).thenReturn(Optional.of(subordinate1));
        when(devoteeRepository.findById(4L)).thenReturn(Optional.of(subordinate2));
        when(devoteeRepository.save(any(Devotee.class))).thenAnswer(i -> i.getArguments()[0]);

        roleManagementService.transferSubordinates(request, 100L);

        assertThat(subordinate1.getReportingToDevoteeId()).isEqualTo(2L);
        assertThat(subordinate2.getReportingToDevoteeId()).isEqualTo(2L);

        verify(devoteeRepository, times(2)).save(any(Devotee.class));
    }

    @Test
    void removeRole_WithNoSubordinates_ShouldSucceed() {
        when(devoteeRepository.findById(1L)).thenReturn(Optional.of(devotee));
        when(devoteeRepository.findByReportingToDevoteeId(1L)).thenReturn(List.of());
        when(devoteeRepository.save(any(Devotee.class))).thenReturn(devotee);
        when(roleChangeHistoryRepository.save(any(RoleChangeHistory.class))).thenReturn(new RoleChangeHistory());

        RoleChangeResult result = roleManagementService.removeRole(1L, "No longer needed", 100L, null);

        assertThat(result).isNotNull();
        assertThat(result.getDevotee()).isNotNull();

        verify(devoteeRepository).save(devotee);
    }

    @Test
    void getDirectSubordinates_ShouldReturnSubordinateList() {
        Devotee subordinate1 = new Devotee();
        subordinate1.setId(3L);
        subordinate1.setName("Subordinate 1");

        Devotee subordinate2 = new Devotee();
        subordinate2.setId(4L);
        subordinate2.setName("Subordinate 2");

        when(devoteeRepository.findByReportingToDevoteeId(1L))
                .thenReturn(Arrays.asList(subordinate1, subordinate2));

        List<DevoteeDTO> subordinates = roleManagementService.getDirectSubordinates(1L);

        assertThat(subordinates).hasSize(2);
        assertThat(subordinates).extracting("id").containsExactlyInAnyOrder(3L, 4L);

        verify(devoteeRepository).findByReportingToDevoteeId(1L);
    }
}
