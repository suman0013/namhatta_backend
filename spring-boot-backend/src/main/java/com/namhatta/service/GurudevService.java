package com.namhatta.service;

import com.namhatta.model.entity.Gurudev;
import com.namhatta.repository.GurudevRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GurudevService {

    private final GurudevRepository gurudevRepository;

    public GurudevService(GurudevRepository gurudevRepository) {
        this.gurudevRepository = gurudevRepository;
    }

    public List<Gurudev> getAllGurudevs() {
        return gurudevRepository.findAll();
    }

    public Gurudev createGurudev(String name, String title) {
        Gurudev gurudev = new Gurudev();
        gurudev.setName(name);
        gurudev.setTitle(title);
        return gurudevRepository.save(gurudev);
    }
}
