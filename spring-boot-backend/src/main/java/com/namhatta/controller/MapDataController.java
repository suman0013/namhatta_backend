package com.namhatta.controller;

import com.namhatta.service.MapDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/map")
public class MapDataController {

    @Autowired
    private MapDataService mapDataService;

    @GetMapping("/countries")
    public ResponseEntity<List<Map<String, Object>>> getNamhattaCountsByCountry() {
        List<Map<String, Object>> counts = mapDataService.getNamhattaCountsByCountry();
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/states")
    public ResponseEntity<List<Map<String, Object>>> getNamhattaCountsByState() {
        List<Map<String, Object>> counts = mapDataService.getNamhattaCountsByState();
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/districts")
    public ResponseEntity<List<Map<String, Object>>> getNamhattaCountsByDistrict() {
        List<Map<String, Object>> counts = mapDataService.getNamhattaCountsByDistrict();
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/sub-districts")
    public ResponseEntity<List<Map<String, Object>>> getNamhattaCountsBySubDistrict() {
        List<Map<String, Object>> counts = mapDataService.getNamhattaCountsBySubDistrict();
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/villages")
    public ResponseEntity<List<Map<String, Object>>> getNamhattaCountsByVillage() {
        List<Map<String, Object>> counts = mapDataService.getNamhattaCountsByVillage();
        return ResponseEntity.ok(counts);
    }
}
