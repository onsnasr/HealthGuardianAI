package com.healthguardian.service;

import com.healthguardian.dto.*;
import com.healthguardian.entity.*;
import com.healthguardian.entity.Appointment.AppointmentStatus;
import com.healthguardian.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j  // Ajout du logger
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final SimpleUserRepository simpleUserRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;
    private final DoctorPatientService doctorPatientService;  // Ajout de l'injection
    private final DoctorAvailabilityExceptionRepository doctorAvailabilityExceptionRepository;

    /**
     * Create a new appointment (by patient)
     * ✅ MODIFIÉ : Ajoute validation des holidays/exceptions
     */
    @Transactional
    public AppointmentResponseDTO createAppointment(Long patientId, AppointmentCreateDTO dto) {
        log.info("📝 Creating appointment - Start");
        log.info("Patient ID: {}", patientId);
        log.info("Doctor ID: {}", dto.getDoctorId());
        log.info("Date: {}", dto.getAppointmentDate());
        log.info("Time: {}", dto.getAppointmentTime());

        // Validate patient
        SimpleUser patient = simpleUserRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        log.info("✅ Patient found: {}", patient.getFullName());

        // Validate doctor
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        log.info("✅ Doctor found: {}", doctor.getFullName());

        // Check if doctor is active
        if (!doctor.getIsActive()) {
            throw new RuntimeException("Doctor is not available");
        }

        // ✅ NOUVEAU : Vérifier si la date est bloquée par un holiday/exception
        List<DoctorAvailabilityException> exceptions =
                doctorAvailabilityExceptionRepository.findExceptionsForDate(
                        dto.getDoctorId(),
                        dto.getAppointmentDate()
                );

        if (!exceptions.isEmpty()) {
            DoctorAvailabilityException exception = exceptions.get(0);
            String reason = exception.getReason() != null ?
                    exception.getReason() : "Doctor not available";

            log.error("❌ Date blocked by exception: {}", reason);
            throw new RuntimeException("This date is not available: " + reason);
        }

        // Check if time slot is available
        long conflicts = appointmentRepository.countConflictingAppointments(
                dto.getDoctorId(),
                dto.getAppointmentDate(),
                dto.getAppointmentTime()
        );

        if (conflicts > 0) {
            throw new RuntimeException("This time slot is already booked");
        }

        // Create appointment
        Appointment appointment = new Appointment();

        // Set entities
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);

        // Set appointment details
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setAppointmentTime(dto.getAppointmentTime());
        appointment.setAppointmentType(dto.getAppointmentType());
        appointment.setReason(dto.getReason());
        appointment.setStatus(AppointmentStatus.PENDING);

        // Set patient info (denormalized)
        String patientName = patient.getFullName();
        String patientPhone = patient.getPhoneNumber();
        String patientEmail = patient.getEmail();

        if (patientName == null || patientName.trim().isEmpty()) {
            patientName = patient.getFirstName() + " " + patient.getLastName();
        }
        if (patientPhone == null || patientPhone.trim().isEmpty()) {
            patientPhone = "Not provided";
        }
        if (patientEmail == null || patientEmail.trim().isEmpty()) {
            patientEmail = "Not provided";
        }

        appointment.setPatientName(patientName);
        appointment.setPatientPhone(patientPhone);
        appointment.setPatientEmail(patientEmail);

        // Set doctor info (denormalized)
        String doctorName = doctor.getFullName();
        String doctorSpecialty = doctor.getSpecialty();

        if (doctorName == null || doctorName.trim().isEmpty()) {
            doctorName = doctor.getFirstName() + " " + doctor.getLastName();
        }
        if (doctorSpecialty == null || doctorSpecialty.trim().isEmpty()) {
            doctorSpecialty = "General Practitioner";
        }

        appointment.setDoctorName(doctorName);
        appointment.setDoctorSpecialty(doctorSpecialty);

        log.info("📋 Appointment object created");

        try {
            appointment = appointmentRepository.save(appointment);
            log.info("✅ Appointment saved successfully with ID: {}", appointment.getId());
        } catch (Exception e) {
            log.error("❌ Error saving appointment: {}", e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save appointment: " + e.getMessage());
        }

        return mapToResponseDTOOptimized(appointment);
    }

    /**
     * Get all appointments for a patient
     * ✅ MODIFIÉ : Utilise mapToResponseDTOOptimized
     */
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId)
                .stream()
                .map(this::mapToResponseDTOOptimized)
                .collect(Collectors.toList());
    }

    /**
     * Get upcoming appointments for a patient
     * ✅ MODIFIÉ : Utilise mapToResponseDTOOptimized
     */
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getUpcomingPatientAppointments(Long patientId) {
        return appointmentRepository.findUpcomingPatientAppointments(patientId, LocalDate.now())
                .stream()
                .map(this::mapToResponseDTOOptimized)
                .collect(Collectors.toList());
    }

    /**
     * Get all appointments for a doctor
     * ✅ MODIFIÉ : Utilise mapToResponseDTOOptimized
     */
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctorId)
                .stream()
                .map(this::mapToResponseDTOOptimized)
                .collect(Collectors.toList());
    }

    /**
     * Get pending appointments for a doctor
     * ✅ MODIFIÉ : Utilise mapToResponseDTOOptimized
     */
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getPendingAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorIdAndStatusOrderByCreatedAtDesc(
                        doctorId, AppointmentStatus.PENDING)
                .stream()
                .map(this::mapToResponseDTOOptimized)
                .collect(Collectors.toList());
    }

    /**
     * Get today's appointments for a doctor
     * ✅ MODIFIÉ : Utilise mapToResponseDTOOptimized
     */
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getTodayAppointments(Long doctorId) {
        return appointmentRepository.findTodayAppointments(doctorId, LocalDate.now())
                .stream()
                .map(this::mapToResponseDTOOptimized)
                .collect(Collectors.toList());
    }

    /**
     * Confirm appointment (by doctor)
     * ✅ MODIFIÉ : Utilise mapToResponseDTOOptimized
     */
    @Transactional
    public AppointmentResponseDTO confirmAppointment(Long appointmentId, Long doctorId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Verify doctor owns this appointment
        if (!appointment.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (!appointment.isPending()) {
            throw new RuntimeException("Only pending appointments can be confirmed");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setConfirmedAt(LocalDateTime.now());

        appointment = appointmentRepository.save(appointment);
        return mapToResponseDTOOptimized(appointment);
    }

    /**
     * Reject appointment (by doctor)
     * ✅ MODIFIÉ : Utilise mapToResponseDTOOptimized
     */
    @Transactional
    public AppointmentResponseDTO rejectAppointment(Long appointmentId, Long doctorId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Verify doctor owns this appointment
        if (!appointment.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (!appointment.isPending()) {
            throw new RuntimeException("Only pending appointments can be rejected");
        }

        appointment.setStatus(AppointmentStatus.REJECTED);
        appointment.setRejectionReason(reason);
        appointment.setRejectedAt(LocalDateTime.now());

        appointment = appointmentRepository.save(appointment);
        return mapToResponseDTOOptimized(appointment);
    }

    /**
     * Cancel appointment (by patient)
     * ✅ MODIFIÉ : Utilise mapToResponseDTOOptimized
     */
    @Transactional
    public AppointmentResponseDTO cancelAppointment(Long appointmentId, Long patientId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Verify patient owns this appointment
        if (!appointment.getPatient().getId().equals(patientId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (appointment.isCompleted()) {
            throw new RuntimeException("Cannot cancel completed appointments");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);

        return mapToResponseDTOOptimized(appointment);
    }

    /**
     * Compléter un rendez-vous (par le docteur)
     * ✅ CORRIGÉ: Ajoute automatiquement le patient à la liste du docteur
     */
    @Transactional
    public AppointmentResponseDTO completeAppointment(Long appointmentId, Long doctorId, String notes) {
        log.info("🔄 Completing appointment {} by doctor {}", appointmentId, doctorId);

        // Vérifier que le rendez-vous existe
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Vérifier que c'est le bon docteur
        if (!appointment.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("You can only complete your own appointments");
        }

        // Vérifier que le rendez-vous est confirmé
        if (!appointment.isConfirmed()) {
            throw new RuntimeException("Only confirmed appointments can be completed");
        }

        // Marquer comme complété
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setNotes(notes);
        appointment.setCompletedAt(LocalDateTime.now());

        appointment = appointmentRepository.save(appointment);
        log.info("✅ Appointment completed: {}", appointmentId);

        // ✅ NOUVEAU: Ajouter le patient à la liste du docteur
        try {
            log.info("👥 Adding patient to doctor's patient list...");
            doctorPatientService.addPatientToDoctor(
                    doctorId,
                    appointment.getPatient().getId(),
                    appointment
            );
            log.info("✅ Patient added to doctor's list");
        } catch (Exception e) {
            log.error("❌ Error adding patient to doctor's list: {}", e.getMessage());
            // Ne pas bloquer la complétion du rendez-vous si l'ajout échoue
        }

        return mapToResponseDTO(appointment);
    }

    // Dans AppointmentService.java, remplacez la méthode getAvailableTimeSlots par celle-ci :

    /**
     * Get available time slots for a doctor on a specific date
     * ✅ CORRIGÉ : Vérifie maintenant les exceptions (holidays/congés)
     */
    @Transactional(readOnly = true)
    public List<TimeSlotDTO> getAvailableTimeSlots(Long doctorId, LocalDate date) {
        log.info("🔍 Getting available slots for doctor {} on {}", doctorId, date);

        // Validate doctor exists
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // ✅ NOUVEAU : Vérifier si la date est bloquée par une exception (holiday)
        List<DoctorAvailabilityException> exceptions =
                doctorAvailabilityExceptionRepository.findExceptionsForDate(doctorId, date);

        if (!exceptions.isEmpty()) {
            log.info("❌ Date {} is blocked by exception: {}",
                    date, exceptions.get(0).getReason());
            // Retourner une liste vide si la date est bloquée
            return new ArrayList<>();
        }

        // Get day of week
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        log.info("📅 Day of week: {}", dayOfWeek);

        // Get doctor's availability for this day
        List<DoctorAvailability> availabilities = availabilityRepository
                .findByDoctorIdAndDayOfWeekAndIsAvailable(doctorId, dayOfWeek, true);

        if (availabilities.isEmpty()) {
            log.info("❌ Doctor not available on {}", dayOfWeek);
            return new ArrayList<>();
        }

        // Get existing appointments for this date
        List<Appointment> existingAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentDate(doctorId, date);

        log.info("📋 Found {} existing appointments", existingAppointments.size());

        List<TimeSlotDTO> slots = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");

        for (DoctorAvailability availability : availabilities) {
            LocalTime currentTime = availability.getStartTime();
            LocalTime endTime = availability.getEndTime();
            int slotDuration = availability.getSlotDurationMinutes();

            log.info("⏰ Generating slots from {} to {} (duration: {} min)",
                    currentTime, endTime, slotDuration);

            while (currentTime.plusMinutes(slotDuration).isBefore(endTime) ||
                    currentTime.plusMinutes(slotDuration).equals(endTime)) {

                LocalTime finalCurrentTime = currentTime;
                boolean isBooked = existingAppointments.stream()
                        .anyMatch(apt -> apt.getAppointmentTime().equals(finalCurrentTime) &&
                                (apt.getStatus() == AppointmentStatus.PENDING ||
                                        apt.getStatus() == AppointmentStatus.CONFIRMED));

                slots.add(TimeSlotDTO.builder()
                        .time(currentTime)
                        .isAvailable(!isBooked)
                        .displayTime(currentTime.format(formatter))
                        .build());

                currentTime = currentTime.plusMinutes(slotDuration);
            }
        }

        log.info("✅ Generated {} time slots", slots.size());
        return slots;
    }

    /**
     * Search doctors by name, phone, or email
     * ✅ MODIFIÉ : Amélioration de la recherche avec gestion des cas null
     */
    @Transactional(readOnly = true)
    public List<DoctorSearchDTO> searchDoctors(String query) {
        List<Doctor> doctors = doctorRepository.findAll();

        // ✅ Filtre uniquement les docteurs actifs
        doctors = doctors.stream()
                .filter(Doctor::getIsActive)
                .collect(Collectors.toList());

        // Si query est vide, retourner tous les docteurs actifs
        if (query == null || query.trim().isEmpty()) {
            return doctors.stream()
                    .map(this::mapToDoctorSearchDTO)
                    .collect(Collectors.toList());
        }

        String lowerQuery = query.toLowerCase().trim();

        return doctors.stream()
                .filter(d ->
                        d.getFirstName().toLowerCase().contains(lowerQuery) ||
                                d.getLastName().toLowerCase().contains(lowerQuery) ||
                                d.getFullName().toLowerCase().contains(lowerQuery) ||
                                (d.getEmail() != null && d.getEmail().toLowerCase().contains(lowerQuery)) ||
                                (d.getPhoneNumber() != null && d.getPhoneNumber().contains(query)) ||
                                (d.getSpecialty() != null && d.getSpecialty().toLowerCase().contains(lowerQuery))
                )
                .map(this::mapToDoctorSearchDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get appointment by ID
     * ✅ MODIFIÉ : Utilise mapToResponseDTOOptimized
     */
    @Transactional(readOnly = true)
    public AppointmentResponseDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        return mapToResponseDTOOptimized(appointment);
    }

    // ========================================================================
    // MAPPING METHODS
    // ========================================================================

    /**
     * ✅ NOUVELLE MÉTHODE : Mapping optimisé utilisant les colonnes dénormalisées
     * Évite les accès lazy loading qui causent des N+1 queries
     */
    private AppointmentResponseDTO mapToResponseDTOOptimized(Appointment appointment) {
        return AppointmentResponseDTO.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatientName())
                .patientPhone(appointment.getPatientPhone())
                .patientEmail(appointment.getPatientEmail())
                .doctorId(appointment.getDoctor().getId())
                // ✅ Utilise les colonnes dénormalisées au lieu d'accéder à l'objet Doctor
                .doctorName(appointment.getDoctorName())
                .doctorSpecialty(appointment.getDoctorSpecialty())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .appointmentType(appointment.getAppointmentType())
                .status(appointment.getStatus())
                .reason(appointment.getReason())
                .notes(appointment.getNotes())
                .rejectionReason(appointment.getRejectionReason())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .confirmedAt(appointment.getConfirmedAt())
                .rejectedAt(appointment.getRejectedAt())
                .completedAt(appointment.getCompletedAt())
                .build();
    }

    /**
     * ✅ ANCIEN MAPPING : Redirige vers la version optimisée
     * Gardé pour compatibilité si utilisé ailleurs
     */
    private AppointmentResponseDTO mapToResponseDTO(Appointment appointment) {
        return mapToResponseDTOOptimized(appointment);
    }

    /**
     * Map Doctor entity to DoctorSearchDTO
     */
    private DoctorSearchDTO mapToDoctorSearchDTO(Doctor doctor) {
        return DoctorSearchDTO.builder()
                .id(doctor.getId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .fullName(doctor.getFullName())
                .email(doctor.getEmail())
                .phoneNumber(doctor.getPhoneNumber())
                .specialty(doctor.getSpecialty())
                .licenseNumber(doctor.getLicenseNumber())
                .consultationFee(doctor.getConsultationFee())
                .yearsOfExperience(doctor.getYearsOfExperience())
                .bio(doctor.getBio())
                .isAvailable(doctor.getIsActive())
                .build();
    }
}