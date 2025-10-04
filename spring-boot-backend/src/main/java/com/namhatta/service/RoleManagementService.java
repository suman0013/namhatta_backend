package com.namhatta.service;

import com.namhatta.dto.DevoteeDTO;
import com.namhatta.dto.RoleChangeResult;
import com.namhatta.dto.TransferResult;
import com.namhatta.model.entity.Devotee;
import com.namhatta.model.entity.RoleChangeHistory;
import com.namhatta.model.enums.LeadershipRole;
import com.namhatta.repository.DevoteeRepository;
import com.namhatta.repository.RoleChangeHistoryRepository;
import com.namhatta.util.DtoMapper;
import com.namhatta.util.RoleHierarchyRules;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoleManagementService {

    private final DevoteeRepository devoteeRepository;
    private final RoleChangeHistoryRepository roleChangeHistoryRepository;
    private final RoleHierarchyRules roleHierarchyRules;
    private final DtoMapper dtoMapper;

    public RoleManagementService(DevoteeRepository devoteeRepository,
                                RoleChangeHistoryRepository roleChangeHistoryRepository,
                                RoleHierarchyRules roleHierarchyRules,
                                DtoMapper dtoMapper) {
        this.devoteeRepository = devoteeRepository;
        this.roleChangeHistoryRepository = roleChangeHistoryRepository;
        this.roleHierarchyRules = roleHierarchyRules;
        this.dtoMapper = dtoMapper;
    }

    public static class ValidationResult {
        private final boolean isValid;
        private final List<String> errors;
        private final List<String> warnings;

        public ValidationResult(boolean isValid, List<String> errors, List<String> warnings) {
            this.isValid = isValid;
            this.errors = errors != null ? errors : new ArrayList<>();
            this.warnings = warnings != null ? warnings : new ArrayList<>();
        }

        public boolean isValid() { return isValid; }
        public List<String> getErrors() { return errors; }
        public List<String> getWarnings() { return warnings; }

        public static ValidationResult success() {
            return new ValidationResult(true, new ArrayList<>(), new ArrayList<>());
        }

        public static ValidationResult failure(String error) {
            List<String> errors = new ArrayList<>();
            errors.add(error);
            return new ValidationResult(false, errors, new ArrayList<>());
        }

        public static ValidationResult failure(List<String> errors) {
            return new ValidationResult(false, errors, new ArrayList<>());
        }
    }

    private static class InternalTransferResult {
        private final int count;
        private final List<Devotee> updatedSubordinates;

        public InternalTransferResult(int count, List<Devotee> updatedSubordinates) {
            this.count = count;
            this.updatedSubordinates = updatedSubordinates;
        }

        public int getCount() { return count; }
        public List<Devotee> getUpdatedSubordinates() { return updatedSubordinates; }
    }

    private static class InternalRoleChangeResult {
        private final Devotee devotee;
        private final int subordinatesTransferred;
        private final RoleChangeHistory roleChangeRecord;

        public InternalRoleChangeResult(Devotee devotee, int subordinatesTransferred, RoleChangeHistory roleChangeRecord) {
            this.devotee = devotee;
            this.subordinatesTransferred = subordinatesTransferred;
            this.roleChangeRecord = roleChangeRecord;
        }

        public Devotee getDevotee() { return devotee; }
        public int getSubordinatesTransferred() { return subordinatesTransferred; }
        public RoleChangeHistory getRoleChangeRecord() { return roleChangeRecord; }
    }

    public enum ChangeType {
        PROMOTE, DEMOTE, REMOVE, REPLACE
    }

    public ValidationResult validateHierarchyChange(LeadershipRole currentRole, LeadershipRole targetRole, ChangeType changeType) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        switch (changeType) {
            case REMOVE:
                if (currentRole == null) {
                    errors.add("Cannot remove role: Devotee has no current role");
                }
                break;

            case PROMOTE:
                if (currentRole == null) {
                    errors.add("Cannot promote: Devotee has no current role");
                } else if (targetRole == null) {
                    errors.add("Cannot promote: Target role is required");
                } else if (!roleHierarchyRules.canPromote(currentRole, targetRole)) {
                    errors.add("Cannot promote from " + currentRole + " to " + targetRole + " - not allowed by hierarchy rules");
                }
                break;

            case DEMOTE:
                if (currentRole == null) {
                    errors.add("Cannot demote: Devotee has no current role");
                } else if (targetRole == null) {
                    errors.add("Cannot demote: Target role is required");
                } else if (!roleHierarchyRules.canDemote(currentRole, targetRole)) {
                    errors.add("Cannot demote from " + currentRole + " to " + targetRole + " - not allowed by hierarchy rules");
                }
                break;

            case REPLACE:
                if (targetRole == null) {
                    errors.add("Cannot replace: Target role is required");
                }
                break;
        }

        boolean isValid = errors.isEmpty();
        return new ValidationResult(isValid, errors, warnings);
    }

    public boolean checkCircularReference(Long devoteeId, Long newReportingId) {
        if (newReportingId == null) {
            return false;
        }

        if (devoteeId.equals(newReportingId)) {
            return true;
        }

        Set<Long> visited = new HashSet<>();
        Long currentId = newReportingId;

        while (currentId != null && !visited.contains(currentId)) {
            visited.add(currentId);

            if (currentId.equals(devoteeId)) {
                return true;
            }

            Optional<Devotee> current = devoteeRepository.findById(currentId);
            if (current.isPresent() && current.get().getReportingToDevoteeId() != null) {
                currentId = current.get().getReportingToDevoteeId();
            } else {
                break;
            }
        }

        return false;
    }

    public List<DevoteeDTO> getDirectSubordinates(Long devoteeId) {
        List<Devotee> subordinates = devoteeRepository.findByReportingToDevoteeId(devoteeId);
        return subordinates.stream()
                .map(dtoMapper::toDevoteeDTO)
                .collect(Collectors.toList());
    }
    
    public List<Devotee> getDirectSubordinatesEntities(Long devoteeId) {
        return devoteeRepository.findByReportingToDevoteeId(devoteeId);
    }

    public ValidationResult validateSubordinateTransfer(Long fromDevoteeId, Long toDevoteeId, List<Long> subordinateIds) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        List<Devotee> subordinates = devoteeRepository.findByReportingToDevoteeId(fromDevoteeId);
        Set<Long> validSubordinateIds = subordinates.stream()
                .map(Devotee::getId)
                .collect(Collectors.toSet());

        for (Long subordinateId : subordinateIds) {
            if (!validSubordinateIds.contains(subordinateId)) {
                errors.add("Subordinate ID " + subordinateId + " is not reporting to devotee " + fromDevoteeId);
            }
        }

        if (toDevoteeId != null) {
            Optional<Devotee> toDevotee = devoteeRepository.findById(toDevoteeId);
            if (toDevotee.isEmpty()) {
                errors.add("Target devotee " + toDevoteeId + " not found");
            } else if (toDevotee.get().getLeadershipRole() == null) {
                errors.add("Target devotee must have a leadership role");
            } else {
                for (Long subordinateId : subordinateIds) {
                    if (checkCircularReference(toDevoteeId, subordinateId)) {
                        errors.add("Cannot transfer subordinate " + subordinateId + " - would create circular reference");
                    }
                }
            }
        }

        boolean isValid = errors.isEmpty();
        return new ValidationResult(isValid, errors, warnings);
    }

    @Transactional
    public TransferResult transferSubordinates(com.namhatta.dto.TransferSubordinatesRequest request, Long userId) {
        InternalTransferResult result = transferSubordinatesInternal(request.getFromDevoteeId(), request.getToDevoteeId(), 
                                   request.getSubordinateIds(), request.getReason(), userId);
        
        List<DevoteeDTO> devoteeSubordinates = result.getUpdatedSubordinates().stream()
                .map(dtoMapper::toDevoteeDTO)
                .collect(Collectors.toList());
        
        return new TransferResult(result.getCount(), devoteeSubordinates, "Subordinates transferred successfully");
    }

    @Transactional
    private InternalTransferResult transferSubordinatesInternal(Long fromDevoteeId, Long toDevoteeId, 
                                              List<Long> subordinateIds, String reason, Long userId) {
        ValidationResult validation = validateSubordinateTransfer(fromDevoteeId, toDevoteeId, subordinateIds);
        if (!validation.isValid()) {
            throw new IllegalArgumentException("Transfer validation failed: " + String.join(", ", validation.getErrors()));
        }

        List<Devotee> updatedSubordinates = new ArrayList<>();

        for (Long subordinateId : subordinateIds) {
            Devotee subordinate = devoteeRepository.findById(subordinateId)
                    .orElseThrow(() -> new EntityNotFoundException("Subordinate not found: " + subordinateId));

            Long previousReportingTo = subordinate.getReportingToDevoteeId();
            subordinate.setReportingToDevoteeId(toDevoteeId);
            devoteeRepository.save(subordinate);

            RoleChangeHistory history = new RoleChangeHistory();
            history.setDevoteeId(subordinateId);
            history.setPreviousRole(subordinate.getLeadershipRole() != null ? subordinate.getLeadershipRole().toString() : null);
            history.setNewRole(subordinate.getLeadershipRole() != null ? subordinate.getLeadershipRole().toString() : null);
            history.setPreviousReportingTo(previousReportingTo);
            history.setNewReportingTo(toDevoteeId);
            history.setChangedBy(userId);
            history.setReason("Transfer: " + (reason != null ? reason : ""));
            roleChangeHistoryRepository.save(history);

            updatedSubordinates.add(subordinate);
        }

        return new InternalTransferResult(updatedSubordinates.size(), updatedSubordinates);
    }

    @Transactional
    public RoleChangeResult promoteDevotee(com.namhatta.dto.PromoteDevoteeRequest request, Long userId) {
        InternalRoleChangeResult result = promoteDevoteeInternal(request.getDevoteeId(), request.getTargetRole(), 
                            request.getNewReportingToId(), request.getReason(), userId);
        
        return new RoleChangeResult(
                dtoMapper.toDevoteeDTO(result.getDevotee()),
                result.getSubordinatesTransferred(),
                result.getRoleChangeRecord().getId(),
                "Devotee promoted successfully"
        );
    }

    @Transactional
    private InternalRoleChangeResult promoteDevoteeInternal(Long devoteeId, LeadershipRole targetRole, 
                                          Long newReportingTo, String reason, Long userId) {
        Devotee devotee = devoteeRepository.findById(devoteeId)
                .orElseThrow(() -> new EntityNotFoundException("Devotee not found: " + devoteeId));

        LeadershipRole currentRole = devotee.getLeadershipRole();
        ValidationResult validation = validateHierarchyChange(currentRole, targetRole, ChangeType.PROMOTE);
        
        if (!validation.isValid()) {
            throw new IllegalArgumentException("Promotion validation failed: " + String.join(", ", validation.getErrors()));
        }

        if (checkCircularReference(devoteeId, newReportingTo)) {
            throw new IllegalArgumentException("Cannot promote: would create circular reference");
        }

        List<Devotee> subordinates = getDirectSubordinatesEntities(devoteeId);
        int subordinatesTransferredCount = 0;

        if (!subordinates.isEmpty() && roleHierarchyRules.getRoleLevel(targetRole) < roleHierarchyRules.getRoleLevel(currentRole)) {
            List<Long> subordinateIds = subordinates.stream().map(Devotee::getId).collect(Collectors.toList());
            transferSubordinatesInternal(devoteeId, newReportingTo, subordinateIds, "Automatic transfer due to promotion", userId);
            subordinatesTransferredCount = subordinates.size();
        }

        Long previousReportingTo = devotee.getReportingToDevoteeId();
        devotee.setLeadershipRole(targetRole);
        devotee.setReportingToDevoteeId(newReportingTo);
        devoteeRepository.save(devotee);

        RoleChangeHistory history = new RoleChangeHistory();
        history.setDevoteeId(devoteeId);
        history.setPreviousRole(currentRole != null ? currentRole.toString() : null);
        history.setNewRole(targetRole.toString());
        history.setPreviousReportingTo(previousReportingTo);
        history.setNewReportingTo(newReportingTo);
        history.setChangedBy(userId);
        history.setReason("Promotion: " + (reason != null ? reason : ""));
        history.setSubordinatesTransferred(subordinatesTransferredCount);
        roleChangeHistoryRepository.save(history);

        return new InternalRoleChangeResult(devotee, subordinatesTransferredCount, history);
    }

    @Transactional
    public RoleChangeResult demoteDevotee(com.namhatta.dto.DemoteDevoteeRequest request, Long userId) {
        InternalRoleChangeResult result = demoteDevoteeInternal(request.getDevoteeId(), request.getTargetRole(), 
                           request.getNewReportingToId(), request.getReason(), userId);
        
        return new RoleChangeResult(
                dtoMapper.toDevoteeDTO(result.getDevotee()),
                result.getSubordinatesTransferred(),
                result.getRoleChangeRecord().getId(),
                "Devotee demoted successfully"
        );
    }

    @Transactional
    private InternalRoleChangeResult demoteDevoteeInternal(Long devoteeId, LeadershipRole targetRole, 
                                         Long newReportingTo, String reason, Long userId) {
        Devotee devotee = devoteeRepository.findById(devoteeId)
                .orElseThrow(() -> new EntityNotFoundException("Devotee not found: " + devoteeId));

        LeadershipRole currentRole = devotee.getLeadershipRole();
        ValidationResult validation = validateHierarchyChange(currentRole, targetRole, ChangeType.DEMOTE);
        
        if (!validation.isValid()) {
            throw new IllegalArgumentException("Demotion validation failed: " + String.join(", ", validation.getErrors()));
        }

        if (checkCircularReference(devoteeId, newReportingTo)) {
            throw new IllegalArgumentException("Cannot demote: would create circular reference");
        }

        List<Devotee> subordinates = getDirectSubordinatesEntities(devoteeId);
        int subordinatesTransferredCount = 0;

        if (!subordinates.isEmpty()) {
            if (newReportingTo == null) {
                throw new IllegalArgumentException("Cannot demote: must provide new supervisor for subordinates");
            }
            List<Long> subordinateIds = subordinates.stream().map(Devotee::getId).collect(Collectors.toList());
            transferSubordinatesInternal(devoteeId, newReportingTo, subordinateIds, "Automatic transfer due to demotion", userId);
            subordinatesTransferredCount = subordinates.size();
        }

        Long previousReportingTo = devotee.getReportingToDevoteeId();
        devotee.setLeadershipRole(targetRole);
        devotee.setReportingToDevoteeId(newReportingTo);
        devoteeRepository.save(devotee);

        RoleChangeHistory history = new RoleChangeHistory();
        history.setDevoteeId(devoteeId);
        history.setPreviousRole(currentRole != null ? currentRole.toString() : null);
        history.setNewRole(targetRole.toString());
        history.setPreviousReportingTo(previousReportingTo);
        history.setNewReportingTo(newReportingTo);
        history.setChangedBy(userId);
        history.setReason("Demotion: " + (reason != null ? reason : ""));
        history.setSubordinatesTransferred(subordinatesTransferredCount);
        roleChangeHistoryRepository.save(history);

        return new InternalRoleChangeResult(devotee, subordinatesTransferredCount, history);
    }

    @Transactional
    public RoleChangeResult removeRole(Long devoteeId, String reason, Long userId, Long newSupervisorId) {
        Devotee devotee = devoteeRepository.findById(devoteeId)
                .orElseThrow(() -> new EntityNotFoundException("Devotee not found: " + devoteeId));

        LeadershipRole currentRole = devotee.getLeadershipRole();
        ValidationResult validation = validateHierarchyChange(currentRole, null, ChangeType.REMOVE);
        
        if (!validation.isValid()) {
            throw new IllegalArgumentException("Role removal validation failed: " + String.join(", ", validation.getErrors()));
        }

        List<Devotee> subordinates = getDirectSubordinatesEntities(devoteeId);
        int subordinatesTransferredCount = 0;

        if (!subordinates.isEmpty()) {
            if (newSupervisorId == null) {
                throw new IllegalArgumentException("Cannot remove role: must provide new supervisor for subordinates");
            }
            List<Long> subordinateIds = subordinates.stream().map(Devotee::getId).collect(Collectors.toList());
            transferSubordinatesInternal(devoteeId, newSupervisorId, subordinateIds, "Automatic transfer due to role removal", userId);
            subordinatesTransferredCount = subordinates.size();
        }

        Long previousReportingTo = devotee.getReportingToDevoteeId();
        devotee.setLeadershipRole(null);
        devotee.setReportingToDevoteeId(null);
        devotee.setHasSystemAccess(false);
        devoteeRepository.save(devotee);

        RoleChangeHistory history = new RoleChangeHistory();
        history.setDevoteeId(devoteeId);
        history.setPreviousRole(currentRole != null ? currentRole.toString() : null);
        history.setNewRole(null);
        history.setPreviousReportingTo(previousReportingTo);
        history.setNewReportingTo(null);
        history.setChangedBy(userId);
        history.setReason("Role Removal: " + (reason != null ? reason : ""));
        history.setSubordinatesTransferred(subordinatesTransferredCount);
        roleChangeHistoryRepository.save(history);

        return new RoleChangeResult(
                dtoMapper.toDevoteeDTO(devotee),
                subordinatesTransferredCount,
                history.getId(),
                "Role removed successfully"
        );
    }

    public List<DevoteeDTO> getAvailableSupervisors(String districtCode, String targetRoleStr, List<Long> excludeIds) {
        LeadershipRole targetRole;
        try {
            targetRole = LeadershipRole.valueOf(targetRoleStr);
        } catch (IllegalArgumentException e) {
            return Collections.emptyList();
        }
        
        String requiredSupervisorRole = roleHierarchyRules.getReportingRole(targetRole);
        
        if (requiredSupervisorRole == null) {
            return Collections.emptyList();
        }

        LeadershipRole requiredRole;
        try {
            requiredRole = LeadershipRole.valueOf(requiredSupervisorRole);
        } catch (IllegalArgumentException e) {
            return Collections.emptyList();
        }

        List<Devotee> devotees = devoteeRepository.findByLeadershipRole(requiredRole);
        
        if (excludeIds != null && !excludeIds.isEmpty()) {
            devotees = devotees.stream()
                    .filter(d -> !excludeIds.contains(d.getId()))
                    .collect(Collectors.toList());
        }

        return devotees.stream()
                .map(dtoMapper::toDevoteeDTO)
                .collect(Collectors.toList());
    }

    public List<DevoteeDTO> getAllSubordinates(Long devoteeId) {
        Set<Devotee> allSubordinates = new HashSet<>();
        Queue<Long> queue = new LinkedList<>();
        queue.add(devoteeId);
        Set<Long> visited = new HashSet<>();

        while (!queue.isEmpty()) {
            Long currentId = queue.poll();
            if (visited.contains(currentId)) {
                continue;
            }
            visited.add(currentId);

            List<Devotee> directSubordinates = getDirectSubordinatesEntities(currentId);
            for (Devotee subordinate : directSubordinates) {
                allSubordinates.add(subordinate);
                queue.add(subordinate.getId());
            }
        }

        return allSubordinates.stream()
                .map(dtoMapper::toDevoteeDTO)
                .collect(Collectors.toList());
    }

    public Page<RoleChangeHistory> getRoleHistory(Long devoteeId, Pageable pageable) {
        return roleChangeHistoryRepository.findByDevoteeIdOrderByCreatedAtDesc(devoteeId, pageable);
    }
}
