package com.healthguardian.controller;

import com.healthguardian.dto.HealthHabitsDTO;
import com.healthguardian.dto.HealthHabitsResponseDTO;
import com.healthguardian.service.UserHealthHabitsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for UserHealthHabits management
 * Only accessible by SIMPLE_USER role
 * 
 * ============================================
 * TESTING IN SWAGGER WITHOUT AUTHORIZATION:
 * ============================================
 * To test these endpoints in Swagger UI without dealing with authentication:
 * 
 * 1. Temporarily comment out the @PreAuthorize annotation on line 26
 *    (the one at the class level: @PreAuthorize("hasRole('SIMPLE_USER')"))
 * 
 * 2. Test your endpoints in Swagger UI
 * 
 * 3. IMPORTANT: Remember to uncomment the @PreAuthorize annotation 
 *    before committing your code or deploying to production!
 * 
 * Example:
 *   // @PreAuthorize("hasRole('SIMPLE_USER')")  <- Comment out for testing
 * ============================================
 */
@RestController
@RequestMapping("/api/health-habits")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
//@PreAuthorize("hasRole('SIMPLE_USER')")
public class UserHealthHabitsController {

    private final UserHealthHabitsService healthHabitsService;

    /**
     * Create or update health habits for the current user
     * POST /api/health-habits
     */
    @PostMapping("/createOrUpdateHealthHabits")
    public ResponseEntity<HealthHabitsResponseDTO> createOrUpdateHealthHabits(
            @Valid @RequestBody HealthHabitsDTO dto) {
        
        log.info("Creating/Updating health habits for current user");
        HealthHabitsResponseDTO response = healthHabitsService.createOrUpdateHealthHabits(dto);
        return ResponseEntity.ok(response);
    }

    /**
     * Update health habits (alias for POST - can use either POST or PUT)
     * PUT /api/health-habits
     */
    @PutMapping("/updateHealthHabits")
    public ResponseEntity<HealthHabitsResponseDTO> updateHealthHabits(
            @Valid @RequestBody HealthHabitsDTO dto) {
        log.info("Updating health habits for current user");
        HealthHabitsResponseDTO response = healthHabitsService.createOrUpdateHealthHabits(dto);
        return ResponseEntity.ok(response);
    }

    /**
     * Get health habits for the current user
     * GET /api/health-habits
     */
    @GetMapping("/getMyHealthHabits")
    public ResponseEntity<HealthHabitsResponseDTO> getMyHealthHabits() {
        log.info("Fetching health habits for current user");
        HealthHabitsResponseDTO response = healthHabitsService.getMyHealthHabits();
        return ResponseEntity.ok(response);
    }

    /**
     * Check if current user has health habits
     * GET /api/health-habits/exists
     */
    @GetMapping("/exists")
    public ResponseEntity<Map<String, Boolean>> checkHealthHabitsExist() {
        boolean exists = healthHabitsService.hasHealthHabits();
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Delete health habits for the current user
     * DELETE /api/health-habits
     */
    @DeleteMapping("/deleteMyHealthHabits")
    public ResponseEntity<Map<String, String>> deleteMyHealthHabits() {
        log.info("Deleting health habits for current user");
        healthHabitsService.deleteMyHealthHabits();
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Health habits deleted successfully");
        
        return ResponseEntity.ok(response);
    }
}

