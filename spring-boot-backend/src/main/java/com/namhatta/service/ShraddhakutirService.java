package com.namhatta.service;

import com.namhatta.model.entity.Shraddhakutir;
import com.namhatta.repository.ShraddhakutirRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShraddhakutirService {

    private final ShraddhakutirRepository shraddhakutirRepository;

    public ShraddhakutirService(ShraddhakutirRepository shraddhakutirRepository) {
        this.shraddhakutirRepository = shraddhakutirRepository;
    }

    public List<Shraddhakutir> getAllShraddhakutirs() {
        return shraddhakutirRepository.findAll();
    }

    public List<Shraddhakutir> getByDistrictCode(String districtCode) {
        return shraddhakutirRepository.findByDistrictCode(districtCode);
    }

    public Shraddhakutir createShraddhakutir(String name, String districtCode) {
        Shraddhakutir shraddhakutir = new Shraddhakutir();
        shraddhakutir.setName(name);
        shraddhakutir.setDistrictCode(districtCode);
        return shraddhakutirRepository.save(shraddhakutir);
    }
}
