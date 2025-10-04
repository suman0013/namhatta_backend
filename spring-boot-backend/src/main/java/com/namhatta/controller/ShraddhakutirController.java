package com.namhatta.controller;

import com.namhatta.model.entity.Shraddhakutir;
import com.namhatta.service.ShraddhakutirService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shraddhakutirs")
public class ShraddhakutirController {

    @Autowired
    private ShraddhakutirService shraddhakutirService;

    @GetMapping
    public ResponseEntity<List<Shraddhakutir>> getAllShraddhakutirs(
            @RequestParam(required = false) String district) {
        
        List<Shraddhakutir> shraddhakutirs;
        if (district != null && !district.isEmpty()) {
            shraddhakutirs = shraddhakutirService.getByDistrictCode(district);
        } else {
            shraddhakutirs = shraddhakutirService.getAllShraddhakutirs();
        }
        return ResponseEntity.ok(shraddhakutirs);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICE')")
    public ResponseEntity<Shraddhakutir> createShraddhakutir(@Valid @RequestBody Map<String, String> request) {
        String name = request.get("name");
        String districtCode = request.get("districtCode");
        Shraddhakutir shraddhakutir = shraddhakutirService.createShraddhakutir(name, districtCode);
        return ResponseEntity.status(HttpStatus.CREATED).body(shraddhakutir);
    }
}
