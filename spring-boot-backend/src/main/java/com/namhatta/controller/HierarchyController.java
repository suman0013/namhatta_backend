package com.namhatta.controller;

import com.namhatta.model.entity.Leader;
import com.namhatta.model.enums.LeaderRole;
import com.namhatta.service.HierarchyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hierarchy")
public class HierarchyController {

    @Autowired
    private HierarchyService hierarchyService;

    @GetMapping
    public ResponseEntity<List<Leader>> getTopLevelLeaders() {
        List<Leader> leaders = hierarchyService.getTopLevelLeaders();
        return ResponseEntity.ok(leaders);
    }

    @GetMapping("/{level}")
    public ResponseEntity<List<Leader>> getLeadersByLevel(@PathVariable String level) {
        try {
            LeaderRole role = LeaderRole.valueOf(level.toUpperCase());
            List<Leader> leaders = hierarchyService.getLeadersByLevel(role);
            return ResponseEntity.ok(leaders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
