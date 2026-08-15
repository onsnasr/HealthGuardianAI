package com.healthguardian.controller;

import com.healthguardian.dto.DoctorPatientDTO;
import com.healthguardian.dto.PatientHealthDashboardDTO;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.entity.User;
import com.healthguardian.entity.UserHealthHabits;
import com.healthguardian.repository.SimpleUserRepository;
import com.healthguardian.repository.UserHealthHabitsRepository;
import com.healthguardian.repository.UserRepository;
import com.healthguardian.service.DoctorPatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller pour gérer les patients d'un docteur
 */
@RestController
@RequestMapping("/api/doctor-patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorPatientController {

    private final DoctorPatientService doctorPatientService;
    private final UserRepository userRepository;
    private final SimpleUserRepository simpleUserRepository;
    private final UserHealthHabitsRepository healthHabitsRepository;

    /**
     * Récupérer tous les patients du docteur connecté
     * GET /api/doctor-patients
     */
    @GetMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<DoctorPatientDTO>> getMyPatients(Authentication authentication) {
        Long doctorId = getCurrentUserId(authentication.getName());
        List<DoctorPatientDTO> patients = doctorPatientService.getDoctorPatients(doctorId);
        return ResponseEntity.ok(patients);
    }

    /**
     * Rechercher des patients
     * GET /api/doctor-patients/search?query=...
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<DoctorPatientDTO>> searchPatients(
            @RequestParam String query,
            Authentication authentication) {
        Long doctorId = getCurrentUserId(authentication.getName());
        List<DoctorPatientDTO> patients = doctorPatientService.searchPatients(doctorId, query);
        return ResponseEntity.ok(patients);
    }

    /**
     * Compter les patients
     * GET /api/doctor-patients/count
     */
    @GetMapping("/count")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Long>> countPatients(Authentication authentication) {
        Long doctorId = getCurrentUserId(authentication.getName());
        Long count = doctorPatientService.countDoctorPatients(doctorId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Récupérer un patient spécifique
     * GET /api/doctor-patients/{patientId}
     */
    @GetMapping("/{patientId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> getPatient(
            @PathVariable Long patientId,
            Authentication authentication) {
        try {
            Long doctorId = getCurrentUserId(authentication.getName());
            DoctorPatientDTO patient = doctorPatientService.getDoctorPatient(doctorId, patientId);
            return ResponseEntity.ok(patient);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/patients/{patientId}/health-dashboard")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> getPatientHealthDashboard(
            @PathVariable Long patientId,
            Authentication authentication) {

        try {
            // 1️⃣ Récupérer l'ID du docteur connecté
            Long doctorId = getCurrentUserId(authentication.getName());

            // 2️⃣ Vérifier que le patient existe et est un SimpleUser
            User user = userRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

            if (!(user instanceof SimpleUser)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "User is not a patient (SimpleUser)"));
            }

            SimpleUser patient = (SimpleUser) user;

            // 3️⃣ Vérifier que le docteur a accès à ce patient
            if (!doctorPatientService.isDoctorPatient(doctorId, patientId)) {
                return ResponseEntity.status(403)
                        .body(Map.of("error", "Access denied: This patient is not under your care"));
            }

            // 4️⃣ Récupérer les habitudes de santé
            UserHealthHabits habits = healthHabitsRepository.findByUserId(patientId)
                    .orElse(null);

            // 5️⃣ Vérifier si le patient a complété ses habitudes
            boolean hasHealthHabits = habits != null;

            // 6️⃣ Calculer le BMI
            Float bmi = null;
            if (patient.getWeight() != null && patient.getHeight() != null && patient.getHeight() > 0) {
                bmi = patient.getWeight() / (patient.getHeight() * patient.getHeight());
            }

            // 7️⃣ Construire le DTO de réponse
            PatientHealthDashboardDTO.PatientHealthDashboardDTOBuilder builder = PatientHealthDashboardDTO.builder()
                    .userId(patient.getId())
                    .patientName(patient.getFirstName() + " " + patient.getLastName())
                    .patientEmail(patient.getEmail())
                    .age(patient.getAge())
                    .weight(patient.getWeight())
                    .height(patient.getHeight())
                    .bmi(bmi)
                    .hasHealthHabits(hasHealthHabits)
                    .isProfileComplete(patient.getIsProfileComplete());

            // 8️⃣ Ajouter les données des habitudes si elles existent
            if (hasHealthHabits) {
                builder
                        .hoursOfSleep(habits.getHoursOfSleep())
                        .bedtimeHour(habits.getBedtimeHour())
                        .exerciseHoursPerWeek(habits.getExerciseHoursPerWeek())
                        .dailySteps(habits.getDailySteps())
                        .litresEauJour(habits.getLitresEauJour())
                        .cafeJour(habits.getCafeJour())
                        .heuresTravailJour(habits.getHeuresTravailJour())
                        .jobType(habits.getJobType())
                        .activityStatus(habits.getActivityStatus())
                        .bpSystolic(habits.getBpSystolic())
                        .bpDiastolic(habits.getBpDiastolic());
            } else {
                builder.errorMessage("Patient has not completed health habits form yet");
            }

            PatientHealthDashboardDTO response = builder.build();

            // 9️⃣ Retourner la réponse
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Désactiver un patient
     * DELETE /api/doctor-patients/{patientId}
     */
    @DeleteMapping("/{patientId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> deactivatePatient(
            @PathVariable Long patientId,
            Authentication authentication) {
        try {
            Long doctorId = getCurrentUserId(authentication.getName());
            doctorPatientService.deactivatePatient(doctorId, patientId);
            return ResponseEntity.ok(Map.of("message", "Patient deactivated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Helper method pour récupérer l'ID de l'utilisateur connecté
     */
    private Long getCurrentUserId(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}