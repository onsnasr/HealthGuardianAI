package com.healthguardian.controller;

import com.healthguardian.dto.*;
import com.healthguardian.entity.User;
import com.healthguardian.repository.UserRepository;
import com.healthguardian.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller for Appointment operations
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;

    /**
     * Create a new appointment (by patient)
     * POST /api/appointments
     */
    @PostMapping
    @PreAuthorize("hasRole('SIMPLE_USER')")
    public ResponseEntity<?> createAppointment(
            @Valid @RequestBody AppointmentCreateDTO dto,
            Authentication authentication) {
        try {
            Long patientId = getCurrentUserId(authentication.getName());
            AppointmentResponseDTO appointment = appointmentService.createAppointment(patientId, dto);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Get all appointments for current patient
     * GET /api/appointments/my-appointments
     */
    @GetMapping("/my-appointments")
    @PreAuthorize("hasRole('SIMPLE_USER')")
    public ResponseEntity<List<AppointmentResponseDTO>> getMyAppointments(Authentication authentication) {
        Long patientId = getCurrentUserId(authentication.getName());
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patientId));
    }

    /**
     * Get upcoming appointments for current patient
     * GET /api/appointments/my-appointments/upcoming
     */
    @GetMapping("/my-appointments/upcoming")
    @PreAuthorize("hasRole('SIMPLE_USER')")
    public ResponseEntity<List<AppointmentResponseDTO>> getMyUpcomingAppointments(Authentication authentication) {
        Long patientId = getCurrentUserId(authentication.getName());
        return ResponseEntity.ok(appointmentService.getUpcomingPatientAppointments(patientId));
    }

    /**
     * Cancel appointment (by patient)
     * PUT /api/appointments/{id}/cancel
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('SIMPLE_USER')")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            Long patientId = getCurrentUserId(authentication.getName());
            AppointmentResponseDTO appointment = appointmentService.cancelAppointment(id, patientId);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Get all appointments for current doctor
     * GET /api/appointments/doctor/all
     */
    @GetMapping("/doctor/all")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getDoctorAppointments(Authentication authentication) {
        Long doctorId = getCurrentUserId(authentication.getName());
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctorId));
    }

    /**
     * Get pending appointments for current doctor
     * GET /api/appointments/doctor/pending
     */
    @GetMapping("/doctor/pending")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getPendingAppointments(Authentication authentication) {
        Long doctorId = getCurrentUserId(authentication.getName());
        return ResponseEntity.ok(appointmentService.getPendingAppointments(doctorId));
    }

    /**
     * Get today's appointments for current doctor
     * GET /api/appointments/doctor/today
     */
    @GetMapping("/doctor/today")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getTodayAppointments(Authentication authentication) {
        Long doctorId = getCurrentUserId(authentication.getName());
        return ResponseEntity.ok(appointmentService.getTodayAppointments(doctorId));
    }

    /**
     * Confirm appointment (by doctor)
     * PUT /api/appointments/{id}/confirm
     */
    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> confirmAppointment(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            Long doctorId = getCurrentUserId(authentication.getName());
            AppointmentResponseDTO appointment = appointmentService.confirmAppointment(id, doctorId);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Reject appointment (by doctor)
     * PUT /api/appointments/{id}/reject
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> rejectAppointment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            Long doctorId = getCurrentUserId(authentication.getName());
            String reason = body.get("reason");
            AppointmentResponseDTO appointment = appointmentService.rejectAppointment(id, doctorId, reason);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Complete appointment (by doctor)
     * PUT /api/appointments/{id}/complete
     */
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> completeAppointment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            Long doctorId = getCurrentUserId(authentication.getName());
            String notes = body.get("notes");
            AppointmentResponseDTO appointment = appointmentService.completeAppointment(id, doctorId, notes);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Get available time slots for a doctor on a specific date
     * GET /api/appointments/available-slots/{doctorId}
     */
    @GetMapping("/available-slots/{doctorId}")
    public ResponseEntity<List<TimeSlotDTO>> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailableTimeSlots(doctorId, date));
    }

    /**
     * Search doctors
     * GET /api/appointments/search-doctors
     */
    @GetMapping("/search-doctors")
    public ResponseEntity<List<DoctorSearchDTO>> searchDoctors(@RequestParam String query) {
        return ResponseEntity.ok(appointmentService.searchDoctors(query));
    }

    /**
     * Get appointment by ID
     * GET /api/appointments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id) {
        try {
            AppointmentResponseDTO appointment = appointmentService.getAppointmentById(id);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Helper method to get current user ID from email
     */
    private Long getCurrentUserId(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}