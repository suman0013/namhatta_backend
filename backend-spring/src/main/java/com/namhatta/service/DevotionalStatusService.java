package com.namhatta.service;

import com.namhatta.model.entity.DevotionalStatus;
import com.namhatta.repository.DevotionalStatusRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DevotionalStatusService {

    private final DevotionalStatusRepository devotionalStatusRepository;

    public DevotionalStatusService(DevotionalStatusRepository devotionalStatusRepository) {
        this.devotionalStatusRepository = devotionalStatusRepository;
    }

    public List<DevotionalStatus> getAllStatuses() {
        return devotionalStatusRepository.findAll();
    }

    public DevotionalStatus createStatus(String name) {
        DevotionalStatus status = new DevotionalStatus();
        status.setName(name);
        return devotionalStatusRepository.save(status);
    }

    public DevotionalStatus renameStatus(Long id, String newName) {
        DevotionalStatus status = devotionalStatusRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Devotional status not found with id: " + id));
        status.setName(newName);
        return devotionalStatusRepository.save(status);
    }
}
