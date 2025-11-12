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
    public ResponseEntity<List<MapDataService.CountryCountDTO>> getNamhattaCountsByCountry() {
        List<MapDataService.CountryCountDTO> counts = mapDataService.getNamhattaCountsByCountry();
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/states")
    public ResponseEntity<List<MapDataService.StateCountDTO>> getNamhattaCountsByState() {
        List<MapDataService.StateCountDTO> counts = mapDataService.getNamhattaCountsByState();
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/districts")
    public ResponseEntity<List<MapDataService.DistrictCountDTO>> getNamhattaCountsByDistrict() {
        List<MapDataService.DistrictCountDTO> counts = mapDataService.getNamhattaCountsByDistrict();
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/sub-districts")
    public ResponseEntity<List<MapDataService.SubDistrictCountDTO>> getNamhattaCountsBySubDistrict() {
        List<MapDataService.SubDistrictCountDTO> counts = mapDataService.getNamhattaCountsBySubDistrict();
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/villages")
    public ResponseEntity<List<MapDataService.VillageCountDTO>> getNamhattaCountsByVillage() {
        List<MapDataService.VillageCountDTO> counts = mapDataService.getNamhattaCountsByVillage();
        return ResponseEntity.ok(counts);
    }
}
