package com.healthguardian.service;

import com.healthguardian.dto.*;
import com.healthguardian.entity.*;
import com.healthguardian.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorAvailabilityExceptionRepository exceptionRepository;
    private final DoctorRepository doctorRepository;

    // ========================================================================
    // GESTION DE LA CONFIGURATION HEBDOMADAIRE
    // ========================================================================

    /**
     * Récupère la configuration hebdomadaire d'un docteur
     */
    @Transactional(readOnly = true)
    public WeeklyScheduleDTO getWeeklySchedule(Long doctorId) {
        List<DoctorAvailability> availabilities = availabilityRepository.findByDoctorId(doctorId);

        Map<DayOfWeek, DoctorAvailability> availabilityMap = availabilities.stream()
                .collect(Collectors.toMap(
                        DoctorAvailability::getDayOfWeek,
                        a -> a
                ));

        return WeeklyScheduleDTO.builder()
                .monday(mapToDTO(availabilityMap.get(DayOfWeek.MONDAY)))
                .tuesday(mapToDTO(availabilityMap.get(DayOfWeek.TUESDAY)))
                .wednesday(mapToDTO(availabilityMap.get(DayOfWeek.WEDNESDAY)))
                .thursday(mapToDTO(availabilityMap.get(DayOfWeek.THURSDAY)))
                .friday(mapToDTO(availabilityMap.get(DayOfWeek.FRIDAY)))
                .saturday(mapToDTO(availabilityMap.get(DayOfWeek.SATURDAY)))
                .sunday(mapToDTO(availabilityMap.get(DayOfWeek.SUNDAY)))
                .build();
    }

    /**
     * Met à jour ou crée la disponibilité pour un jour spécifique
     */
    @Transactional
    public DoctorAvailabilityDTO updateDayAvailability(Long doctorId, UpdateDayAvailabilityDTO dto) {
        log.info("Updating availability for doctor {} on {}", doctorId, dto.getDayOfWeek());

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Chercher si une config existe déjà pour ce jour
        Optional<DoctorAvailability> existingOpt = availabilityRepository
                .findByDoctorIdAndDayOfWeek(doctorId, dto.getDayOfWeek());

        DoctorAvailability availability;

        if (existingOpt.isPresent()) {
            // Mettre à jour
            availability = existingOpt.get();
        } else {
            // Créer
            availability = new DoctorAvailability();
            availability.setDoctor(doctor);
            availability.setDayOfWeek(dto.getDayOfWeek());
        }

        // Appliquer les modifications
        availability.setIsAvailable(dto.getIsAvailable());

        if (dto.getIsAvailable()) {
            // Si disponible, les horaires sont obligatoires
            if (dto.getStartTime() == null || dto.getEndTime() == null) {
                throw new RuntimeException("Start time and end time are required when setting availability");
            }

            if (dto.getEndTime().isBefore(dto.getStartTime()) || dto.getEndTime().equals(dto.getStartTime())) {
                throw new RuntimeException("End time must be after start time");
            }

            availability.setStartTime(dto.getStartTime());
            availability.setEndTime(dto.getEndTime());
            availability.setSlotDurationMinutes(dto.getSlotDurationMinutes() != null ? dto.getSlotDurationMinutes() : 30);
        }

        availability = availabilityRepository.save(availability);
        log.info("✅ Availability updated for {}", dto.getDayOfWeek());

        return mapToDTO(availability);
    }

    /**
     * Applique un template rapide (ex: Lun-Ven 9h-17h)
     */
    @Transactional
    public WeeklyScheduleDTO applyTemplate(Long doctorId, ApplyTemplateDTO dto) {
        log.info("Applying template {} for doctor {}", dto.getTemplateType(), doctorId);

        List<DayOfWeek> daysToApply = getDaysForTemplate(dto.getTemplateType());

        for (DayOfWeek day : daysToApply) {
            UpdateDayAvailabilityDTO dayDTO = UpdateDayAvailabilityDTO.builder()
                    .dayOfWeek(day)
                    .isAvailable(true)
                    .startTime(dto.getStartTime())
                    .endTime(dto.getEndTime())
                    .slotDurationMinutes(dto.getSlotDurationMinutes())
                    .build();

            updateDayAvailability(doctorId, dayDTO);
        }

        log.info("✅ Template applied successfully");
        return getWeeklySchedule(doctorId);
    }

    /**
     * Désactive complètement un jour
     */
    @Transactional
    public void disableDay(Long doctorId, DayOfWeek dayOfWeek) {
        log.info("Disabling {} for doctor {}", dayOfWeek, doctorId);

        UpdateDayAvailabilityDTO dto = UpdateDayAvailabilityDTO.builder()
                .dayOfWeek(dayOfWeek)
                .isAvailable(false)
                .build();

        updateDayAvailability(doctorId, dto);
    }

    // ========================================================================
    // GESTION DES EXCEPTIONS (CONGÉS)
    // ========================================================================

    /**
     * Crée une exception (congé, jour férié, etc.)
     */
    @Transactional
    public ExceptionResponseDTO createException(Long doctorId, CreateExceptionDTO dto) {
        log.info("Creating exception for doctor {} from {} to {}",
                doctorId, dto.getExceptionDate(), dto.getExceptionEndDate());

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Validation : end date doit être après start date
        if (dto.getExceptionEndDate() != null &&
                dto.getExceptionEndDate().isBefore(dto.getExceptionDate())) {
            throw new RuntimeException("End date must be after start date");
        }

        // Vérifier les conflits
        LocalDate endDate = dto.getExceptionEndDate() != null ?
                dto.getExceptionEndDate() : dto.getExceptionDate();

        long conflicts = exceptionRepository.countConflictingExceptions(
                doctorId, dto.getExceptionDate(), endDate);

        if (conflicts > 0) {
            throw new RuntimeException("There are already exceptions for some of these dates");
        }

        // Créer l'exception
        DoctorAvailabilityException exception = new DoctorAvailabilityException();
        exception.setDoctor(doctor);
        exception.setExceptionDate(dto.getExceptionDate());
        exception.setExceptionEndDate(dto.getExceptionEndDate());
        exception.setReason(dto.getReason());
        exception.setExceptionType(dto.getExceptionType());
        exception.setIsAvailable(false); // Bloqué par défaut

        exception = exceptionRepository.save(exception);
        log.info("✅ Exception created with ID: {}", exception.getId());

        return mapExceptionToDTO(exception);
    }

    /**
     * Récupère toutes les exceptions d'un docteur
     */
    @Transactional(readOnly = true)
    public List<ExceptionResponseDTO> getExceptions(Long doctorId) {
        return exceptionRepository.findByDoctorIdOrderByExceptionDateDesc(doctorId)
                .stream()
                .map(this::mapExceptionToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les exceptions futures
     */
    @Transactional(readOnly = true)
    public List<ExceptionResponseDTO> getUpcomingExceptions(Long doctorId) {
        return exceptionRepository.findUpcomingExceptions(doctorId, LocalDate.now())
                .stream()
                .map(this::mapExceptionToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Supprime une exception
     */
    @Transactional
    public void deleteException(Long doctorId, Long exceptionId) {
        DoctorAvailabilityException exception = exceptionRepository.findById(exceptionId)
                .orElseThrow(() -> new RuntimeException("Exception not found"));

        if (!exception.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Unauthorized to delete this exception");
        }

        exceptionRepository.delete(exception);
        log.info("✅ Exception {} deleted", exceptionId);
    }

    /**
     * ✅ MÉTHODE CRITIQUE : Vérifie si une date est bloquée par une exception
     */
    public boolean isDateBlocked(Long doctorId, LocalDate date) {
        List<DoctorAvailabilityException> exceptions =
                exceptionRepository.findExceptionsForDate(doctorId, date);
        return !exceptions.isEmpty();
    }

    // ========================================================================
    // MÉTHODES HELPER
    // ========================================================================

    private DoctorAvailabilityDTO mapToDTO(DoctorAvailability availability) {
        if (availability == null) {
            return null;
        }

        return DoctorAvailabilityDTO.builder()
                .id(availability.getId())
                .dayOfWeek(availability.getDayOfWeek())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .isAvailable(availability.getIsAvailable())
                .slotDurationMinutes(availability.getSlotDurationMinutes())
                .build();
    }

    private ExceptionResponseDTO mapExceptionToDTO(DoctorAvailabilityException exception) {
        int daysCount = 1;
        if (exception.getExceptionEndDate() != null) {
            daysCount = (int) ChronoUnit.DAYS.between(
                    exception.getExceptionDate(),
                    exception.getExceptionEndDate()) + 1;
        }

        return ExceptionResponseDTO.builder()
                .id(exception.getId())
                .doctorId(exception.getDoctor().getId())
                .exceptionDate(exception.getExceptionDate())
                .exceptionEndDate(exception.getExceptionEndDate())
                .reason(exception.getReason())
                .isAvailable(exception.getIsAvailable())
                .exceptionType(exception.getExceptionType())
                .daysCount(daysCount)
                .build();
    }

    private List<DayOfWeek> getDaysForTemplate(ApplyTemplateDTO.TemplateType type) {
        return switch (type) {
            case WEEKDAYS_ONLY -> Arrays.asList(
                    DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                    DayOfWeek.THURSDAY, DayOfWeek.FRIDAY
            );
            case WEEKENDS_ONLY -> Arrays.asList(DayOfWeek.SATURDAY, DayOfWeek.SUNDAY);
            case ALL_DAYS -> Arrays.asList(DayOfWeek.values());
            case MORNING_ONLY, AFTERNOON_ONLY -> Arrays.asList(DayOfWeek.values());
        };
    }
}