package com.healthguardian.controller;

import com.healthguardian.dto.*;
import com.healthguardian.entity.User;
import com.healthguardian.repository.UserRepository;
import com.healthguardian.service.DoctorAvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

/**
 * Controller pour la gestion des disponibilités des docteurs
 */
@RestController
@RequestMapping("/api/doctor-availability")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;
    private final UserRepository userRepository;

    // ========================================================================
    // GESTION DE LA CONFIGURATION HEBDOMADAIRE
    // ========================================================================

    /**
     * Récupère la configuration hebdomadaire du docteur connecté
     * GET /api/doctor-availability/my-schedule
     */
    @GetMapping("/my-schedule")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<WeeklyScheduleDTO> getMySchedule(Authentication authentication) {
        Long doctorId = getCurrentUserId(authentication.getName());
        return ResponseEntity.ok(availabilityService.getWeeklySchedule(doctorId));
    }

    /**
     * Met à jour la disponibilité pour un jour spécifique
     * PUT /api/doctor-availability/update-day
     */
    @PutMapping("/update-day")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> updateDayAvailability(
            @Valid @RequestBody UpdateDayAvailabilityDTO dto,
            Authentication authentication) {
        try {
            Long doctorId = getCurrentUserId(authentication.getName());
            DoctorAvailabilityDTO result = availabilityService.updateDayAvailability(doctorId, dto);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Applique un template rapide (ex: Lun-Ven 9h-17h)
     * POST /api/doctor-availability/apply-template
     */
    @PostMapping("/apply-template")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> applyTemplate(
            @Valid @RequestBody ApplyTemplateDTO dto,
            Authentication authentication) {
        try {
            Long doctorId = getCurrentUserId(authentication.getName());
            WeeklyScheduleDTO result = availabilityService.applyTemplate(doctorId, dto);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Désactive un jour spécifique
     * PUT /api/doctor-availability/disable-day/{dayOfWeek}
     */
    @PutMapping("/disable-day/{dayOfWeek}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> disableDay(
            @PathVariable DayOfWeek dayOfWeek,
            Authentication authentication) {
        try {
            Long doctorId = getCurrentUserId(authentication.getName());
            availabilityService.disableDay(doctorId, dayOfWeek);
            return ResponseEntity.ok(Map.of("message", "Day disabled successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ========================================================================
    // GESTION DES EXCEPTIONS (CONGÉS)
    // ========================================================================

    /**
     * Crée une exception (congé, jour férié, etc.)
     * POST /api/doctor-availability/exceptions
     */
    @PostMapping("/exceptions")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> createException(
            @Valid @RequestBody CreateExceptionDTO dto,
            Authentication authentication) {
        try {
            Long doctorId = getCurrentUserId(authentication.getName());
            ExceptionResponseDTO result = availabilityService.createException(doctorId, dto);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Récupère toutes les exceptions du docteur connecté
     * GET /api/doctor-availability/exceptions
     */
    @GetMapping("/exceptions")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<ExceptionResponseDTO>> getMyExceptions(Authentication authentication) {
        Long doctorId = getCurrentUserId(authentication.getName());
        return ResponseEntity.ok(availabilityService.getExceptions(doctorId));
    }

    /**
     * Récupère les exceptions futures
     * GET /api/doctor-availability/exceptions/upcoming
     */
    @GetMapping("/exceptions/upcoming")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<ExceptionResponseDTO>> getUpcomingExceptions(Authentication authentication) {
        Long doctorId = getCurrentUserId(authentication.getName());
        return ResponseEntity.ok(availabilityService.getUpcomingExceptions(doctorId));
    }

    /**
     * Supprime une exception
     * DELETE /api/doctor-availability/exceptions/{id}
     */
    @DeleteMapping("/exceptions/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> deleteException(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            Long doctorId = getCurrentUserId(authentication.getName());
            availabilityService.deleteException(doctorId, id);
            return ResponseEntity.ok(Map.of("message", "Exception deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ========================================================================
    // HELPER
    // ========================================================================

    private Long getCurrentUserId(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}