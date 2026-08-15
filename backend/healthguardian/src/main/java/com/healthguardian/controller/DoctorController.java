package com.healthguardian.controller;

import com.healthguardian.dto.DoctorProfileUpdateDTO;
import com.healthguardian.entity.Doctor;
import com.healthguardian.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for Doctor operations
 */
@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;

    /**
     * Get all doctors (public)
     */
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    /**
     * Get active doctors only (public)
     */
    @GetMapping("/active")
    public ResponseEntity<List<Doctor>> getActiveDoctors() {
        return ResponseEntity.ok(doctorService.getActiveDoctors());
    }

    /**
     * Get doctor by ID (public)
     */
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    /**
     * Get doctors by specialty (public)
     */
    @GetMapping("/specialty/{specialty}")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialty(@PathVariable String specialty) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty));
    }

    /**
     * Update doctor profile (doctor or admin only)
     */
    @PutMapping("/profile/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<Doctor> updateDoctorProfile(
            @PathVariable Long id,
            @Valid @RequestBody DoctorProfileUpdateDTO dto) {
        try {
            Doctor updatedDoctor = doctorService.updateDoctorProfile(id, dto);
            return ResponseEntity.ok(updatedDoctor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Check if license number exists
     */
    @GetMapping("/check-license")
    public ResponseEntity<Map<String, Boolean>> checkLicenseNumber(@RequestParam String licenseNumber) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", doctorService.licenseNumberExists(licenseNumber));
        return ResponseEntity.ok(response);
    }

    /**
     * Delete doctor (admin only)
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDoctor(@PathVariable long id) {
        try {
            doctorService.deleteDoctor(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}