package com.healthguardian.controller;

import com.healthguardian.dto.UserResponse;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.entity.User;
import com.healthguardian.repository.UserRepository;
import com.healthguardian.service.UserService;
import com.healthguardian.entity.Doctor;
import com.healthguardian.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for User-related endpoints
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    /**
     * Get current user profile
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        UserResponse user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    /**
     * Get user by ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Update SimpleUser profile (age, weight, height, phoneNumber, address, medicalHistory)
     * PUT /api/users/profile/{id}
     * ⚠️ NE TOUCHEZ PAS À CETTE MÉTHODE - Elle fonctionne pour SimpleUser
     */
    @PutMapping("/profile/{id}")
    public ResponseEntity<UserResponse> updateProfile(
            @PathVariable Long id,
            @RequestBody SimpleUser updatedData
    ) {
        UserResponse user = userService.updateSimpleUserProfile(id, updatedData);
        return ResponseEntity.ok(user);
    }

    /**
     * 🆕 Update Doctor profile (specialty, licenseNumber, consultationFee, etc.)
     * PUT /api/users/doctor-profile/{id}
     * Nouvelle route spécifique aux docteurs
     */
    @PutMapping("/doctor-profile/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<?> updateDoctorProfile(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Vérifier que c'est bien un Doctor
            if (!(user instanceof Doctor)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User is not a doctor"));
            }

            Doctor doctor = (Doctor) user;

            // Update personal information (optional)
            if (updates.containsKey("firstName")) {
                doctor.setFirstName((String) updates.get("firstName"));
            }
            if (updates.containsKey("lastName")) {
                doctor.setLastName((String) updates.get("lastName"));
            }
            if (updates.containsKey("phoneNumber")) {
                doctor.setPhoneNumber((String) updates.get("phoneNumber"));
            }
            if (updates.containsKey("address")) {
                doctor.setAddress((String) updates.get("address"));
            }

            // Update professional information
            if (updates.containsKey("specialty")) {
                doctor.setSpecialty((String) updates.get("specialty"));
            }

            if (updates.containsKey("licenseNumber")) {
                String newLicense = (String) updates.get("licenseNumber");
                // Vérifier si le license change et s'il existe déjà
                if (!newLicense.equals(doctor.getLicenseNumber())) {
                    Optional<Doctor> existingDoctor = doctorRepository.findByLicenseNumber(newLicense);
                    if (existingDoctor.isPresent() && !existingDoctor.get().getId().equals(id)) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "License number already exists"));
                    }
                    doctor.setLicenseNumber(newLicense);
                }
            }

            if (updates.containsKey("consultationFee")) {
                Object feeObj = updates.get("consultationFee");
                if (feeObj instanceof Number) {
                    doctor.setConsultationFee(((Number) feeObj).doubleValue());
                }
            }

            if (updates.containsKey("yearsOfExperience")) {
                Object expObj = updates.get("yearsOfExperience");
                if (expObj instanceof Number) {
                    doctor.setYearsOfExperience(((Number) expObj).intValue());
                }
            }

            if (updates.containsKey("bio")) {
                doctor.setBio((String) updates.get("bio"));
            }

            // Vérifier si le profil docteur est complet
            doctor.setIsProfileComplete(doctor.isDoctorProfileComplete());

            // Sauvegarder
            Doctor savedDoctor = doctorRepository.save(doctor);

            // Convertir en UserResponse en utilisant le service existant
            UserResponse response = userService.getUserById(savedDoctor.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to update doctor profile: " + e.getMessage()));
        }
    }

    /**
     * Check if profile is complete
     * GET /api/users/profile-status/{id}
     */
    @GetMapping("/profile-status/{id}")
    public ResponseEntity<Map<String, Object>> checkProfileStatus(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("isProfileComplete", user.getIsProfileComplete());
        response.put("message", user.getIsProfileComplete()
                ? "Profile is complete"
                : "Please complete your profile to access all features");

        return ResponseEntity.ok(response);
    }
}