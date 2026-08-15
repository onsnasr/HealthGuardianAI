package com.healthguardian.service;

import com.healthguardian.dto.DoctorPatientDTO;
import com.healthguardian.entity.Appointment;
import com.healthguardian.entity.Doctor;
import com.healthguardian.entity.DoctorPatient;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.repository.DoctorPatientRepository;
import com.healthguardian.repository.DoctorRepository;
import com.healthguardian.repository.SimpleUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorPatientService {

    private final DoctorPatientRepository doctorPatientRepository;
    private final DoctorRepository doctorRepository;
    private final SimpleUserRepository simpleUserRepository;

    /**
     * Ajouter un patient au docteur après le premier rendez-vous complété
     * ✅ MODIFIÉ : Gestion améliorée du numéro de téléphone
     */
    @Transactional
    public DoctorPatientDTO addPatientToDoctor(Long doctorId, Long patientId, Appointment appointment) {
        log.info("🔍 Adding patient {} to doctor {}", patientId, doctorId);

        // Vérifier si la relation existe déjà
        if (doctorPatientRepository.existsByDoctorIdAndPatientId(doctorId, patientId)) {
            log.info("✅ Patient already exists, updating...");
            return updatePatientRelation(doctorId, patientId, appointment);
        }

        // Récupérer le docteur et le patient
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        SimpleUser patient = simpleUserRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // ✅ AMÉLIORATION : Récupération intelligente du téléphone
        String phoneNumber = patient.getPhoneNumber();

        // Si le numéro du patient est null ou vide, essayer de prendre celui de l'appointment
        if (phoneNumber == null || phoneNumber.trim().isEmpty() || phoneNumber.equals("Not provided")) {
            phoneNumber = appointment.getPatientPhone();
            log.info("📞 Using phone from appointment: {}", phoneNumber);
        }

        // Si toujours null/vide, utiliser une valeur par défaut
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            phoneNumber = "Not provided";
            log.warn("⚠️ No phone number available for patient {}", patientId);
        }

        log.info("📋 Patient info:");
        log.info("  - Name: {}", patient.getFirstName() + " " + patient.getLastName());
        log.info("  - Email: {}", patient.getEmail());
        log.info("  - Phone: {}", phoneNumber);

        // Créer la relation
        DoctorPatient doctorPatient = new DoctorPatient();
        doctorPatient.setDoctor(doctor);
        doctorPatient.setPatient(patient);
        doctorPatient.setPatientName(patient.getFirstName() + " " + patient.getLastName());
        doctorPatient.setPatientEmail(patient.getEmail());
        doctorPatient.setPatientPhone(phoneNumber); // ✅ Utilise le numéro récupéré
        doctorPatient.setFirstAppointmentId(appointment.getId());
        doctorPatient.setFirstAppointmentDate(appointment.getCompletedAt());
        doctorPatient.setLastAppointmentId(appointment.getId());
        doctorPatient.setLastAppointmentDate(appointment.getCompletedAt());
        doctorPatient.setTotalAppointments(1);
        doctorPatient.setCompletedAppointments(1);
        doctorPatient.setIsActive(true);

        doctorPatient = doctorPatientRepository.save(doctorPatient);
        log.info("✅ Patient added successfully: {}", doctorPatient.getId());

        return mapToDTO(doctorPatient);
    }

    /**
     * Mettre à jour la relation existante
     */
    @Transactional
    public DoctorPatientDTO updatePatientRelation(Long doctorId, Long patientId, Appointment appointment) {
        DoctorPatient doctorPatient = doctorPatientRepository
                .findByDoctorIdAndPatientId(doctorId, patientId)
                .orElseThrow(() -> new RuntimeException("Doctor-Patient relation not found"));

        // Incrémenter le compteur selon le statut
        if (appointment.isCompleted()) {
            doctorPatient.incrementCompletedAppointments(
                    appointment.getId(),
                    appointment.getCompletedAt()
            );
        } else if (appointment.isCancelled()) {
            doctorPatient.incrementCancelledAppointments();
        }

        doctorPatient = doctorPatientRepository.save(doctorPatient);
        log.info("✅ Patient relation updated: {}", doctorPatient.getId());

        return mapToDTO(doctorPatient);
    }

    /**
     * Récupérer tous les patients d'un docteur
     */
    public List<DoctorPatientDTO> getDoctorPatients(Long doctorId) {
        log.info("🔍 Fetching patients for doctor: {}", doctorId);

        List<DoctorPatient> patients = doctorPatientRepository.findAllByDoctorId(doctorId);

        log.info("✅ Found {} patients", patients.size());

        return patients.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Rechercher des patients
     */
    public List<DoctorPatientDTO> searchPatients(Long doctorId, String query) {
        log.info("🔍 Searching patients for doctor {} with query: {}", doctorId, query);

        List<DoctorPatient> patients = doctorPatientRepository.searchPatients(doctorId, query);

        return patients.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Compter les patients d'un docteur
     */
    public Long countDoctorPatients(Long doctorId) {
        return doctorPatientRepository.countActivePatientsByDoctorId(doctorId);
    }

    /**
     * Récupérer un patient spécifique
     */
    public DoctorPatientDTO getDoctorPatient(Long doctorId, Long patientId) {
        DoctorPatient doctorPatient = doctorPatientRepository
                .findByDoctorIdAndPatientId(doctorId, patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        return mapToDTO(doctorPatient);
    }

    /**
     * Désactiver un patient (soft delete)
     */
    @Transactional
    public void deactivatePatient(Long doctorId, Long patientId) {
        DoctorPatient doctorPatient = doctorPatientRepository
                .findByDoctorIdAndPatientId(doctorId, patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        doctorPatient.setIsActive(false);
        doctorPatientRepository.save(doctorPatient);

        log.info("✅ Patient deactivated: {}", patientId);
    }

    /**
     * Mapper l'entité vers DTO
     */
    private DoctorPatientDTO mapToDTO(DoctorPatient dp) {
        return DoctorPatientDTO.builder()
                .id(dp.getId())
                .doctorId(dp.getDoctor().getId())
                .doctorName(dp.getDoctor().getFirstName() + " " + dp.getDoctor().getLastName())
                .doctorSpecialty(dp.getDoctor().getSpecialty())
                .patientId(dp.getPatient().getId())
                .patientName(dp.getPatientName())
                .patientEmail(dp.getPatientEmail())
                .patientPhone(dp.getPatientPhone())
                .firstAppointmentId(dp.getFirstAppointmentId())
                .firstAppointmentDate(dp.getFirstAppointmentDate())
                .lastAppointmentId(dp.getLastAppointmentId())
                .lastAppointmentDate(dp.getLastAppointmentDate())
                .totalAppointments(dp.getTotalAppointments())
                .completedAppointments(dp.getCompletedAppointments())
                .cancelledAppointments(dp.getCancelledAppointments())
                .notes(dp.getNotes())
                .isActive(dp.getIsActive())
                .createdAt(dp.getCreatedAt())
                .updatedAt(dp.getUpdatedAt())
                .build();
    }

    /**
     * Vérifie si un patient appartient bien à ce docteur
     * Utilisé pour la sécurité du endpoint Health Dashboard
     *
     * @param doctorId ID du docteur
     * @param patientId ID du patient
     * @return true si le patient est sous les soins de ce docteur, false sinon
     */
    public boolean isDoctorPatient(Long doctorId, Long patientId) {
        log.info("🔍 Checking if patient {} belongs to doctor {}", patientId, doctorId);

        boolean exists = doctorPatientRepository.existsByDoctorIdAndPatientId(doctorId, patientId);

        if (exists) {
            log.info("✅ Access granted: Patient {} is under doctor {}'s care", patientId, doctorId);
        } else {
            log.warn("⛔ Access denied: Patient {} is NOT under doctor {}'s care", patientId, doctorId);
        }

        return exists;
    }
}