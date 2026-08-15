package com.healthguardian.service;

import com.healthguardian.dto.*;
import com.healthguardian.entity.Doctor;
import com.healthguardian.entity.DoctorAvailability;
import com.healthguardian.entity.DoctorAvailabilityException;
import com.healthguardian.repository.DoctorAvailabilityExceptionRepository;
import com.healthguardian.repository.DoctorAvailabilityRepository;
import com.healthguardian.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 🧪 TEST UNITAIRE - DoctorAvailabilityService
 * Couverture complète des fonctionnalités de disponibilité et exceptions
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("DoctorAvailabilityService - Tests Complets")
class DoctorAvailabilityServiceTest {

    @Mock
    private DoctorAvailabilityRepository availabilityRepository;

    @Mock
    private DoctorAvailabilityExceptionRepository exceptionRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @InjectMocks
    private DoctorAvailabilityService availabilityService;

    private Doctor testDoctor;

    @BeforeEach
    void setUp() {
        testDoctor = new Doctor();
        testDoctor.setId(1L);
        testDoctor.setFirstName("Dr. Test");
    }

    // --- Tests Update Availability ---

    @Test
    @DisplayName("✅ updateDayAvailability should throw exception if times are invalid")
    void testInvalidTimes() {
        UpdateDayAvailabilityDTO dto = new UpdateDayAvailabilityDTO();
        dto.setDayOfWeek(DayOfWeek.MONDAY);
        dto.setIsAvailable(true);
        dto.setStartTime(LocalTime.of(10, 0));
        dto.setEndTime(LocalTime.of(9, 0)); // End before start

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));

        assertThrows(RuntimeException.class, () -> availabilityService.updateDayAvailability(1L, dto));
    }

    @Test
    @DisplayName("✅ updateDayAvailability should create new availability")
    void testCreateAvailability() {
        UpdateDayAvailabilityDTO dto = new UpdateDayAvailabilityDTO();
        dto.setDayOfWeek(DayOfWeek.MONDAY);
        dto.setIsAvailable(true);
        dto.setStartTime(LocalTime.of(9, 0));
        dto.setEndTime(LocalTime.of(17, 0));
        dto.setSlotDurationMinutes(30);

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        when(availabilityRepository.findByDoctorIdAndDayOfWeek(1L, DayOfWeek.MONDAY)).thenReturn(Optional.empty());
        
        DoctorAvailability saved = new DoctorAvailability();
        saved.setDayOfWeek(DayOfWeek.MONDAY);
        saved.setStartTime(LocalTime.of(9, 0));
        
        when(availabilityRepository.save(any(DoctorAvailability.class))).thenReturn(saved);

        DoctorAvailabilityDTO result = availabilityService.updateDayAvailability(1L, dto);
        
        assertNotNull(result);
        verify(availabilityRepository).save(any(DoctorAvailability.class));
    }

    @Test
    @DisplayName("✅ updateDayAvailability should update existing availability")
    void testUpdateAvailability() {
        UpdateDayAvailabilityDTO dto = new UpdateDayAvailabilityDTO();
        dto.setDayOfWeek(DayOfWeek.MONDAY);
        dto.setIsAvailable(false); // Switch to unavailable

        DoctorAvailability existing = new DoctorAvailability();
        existing.setDayOfWeek(DayOfWeek.MONDAY);
        existing.setIsAvailable(true);

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        when(availabilityRepository.findByDoctorIdAndDayOfWeek(1L, DayOfWeek.MONDAY)).thenReturn(Optional.of(existing));
        when(availabilityRepository.save(any(DoctorAvailability.class))).thenReturn(existing);

        availabilityService.updateDayAvailability(1L, dto);

        assertFalse(existing.getIsAvailable());
        verify(availabilityRepository).save(existing);
    }

    // --- Tests Weekly Schedule ---

    @Test
    @DisplayName("✅ getWeeklySchedule() - Retourne la semaine complète")
    void testGetWeeklySchedule() {
        DoctorAvailability monday = new DoctorAvailability();
        monday.setDayOfWeek(DayOfWeek.MONDAY);
        monday.setIsAvailable(true);

        when(availabilityRepository.findByDoctorId(1L)).thenReturn(Arrays.asList(monday));

        WeeklyScheduleDTO result = availabilityService.getWeeklySchedule(1L);

        assertNotNull(result);
        assertNotNull(result.getMonday());
        assertEquals(DayOfWeek.MONDAY, result.getMonday().getDayOfWeek());
        assertNull(result.getTuesday()); // Pas de config mardi
    }

    // --- Tests Templates ---

    @Test
    @DisplayName("✅ applyTemplate() - Applique WEEKDAYS_ONLY")
    void testApplyTemplate() {
        ApplyTemplateDTO dto = new ApplyTemplateDTO();
        dto.setTemplateType(ApplyTemplateDTO.TemplateType.WEEKDAYS_ONLY);
        dto.setStartTime(LocalTime.of(9, 0));
        dto.setEndTime(LocalTime.of(17, 0));
        dto.setSlotDurationMinutes(30);

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        // getWeeklySchedule will be called at the end
        when(availabilityRepository.findByDoctorId(1L)).thenReturn(Collections.emptyList());

        availabilityService.applyTemplate(1L, dto);

        // Devrait être appelé 5 fois (Lundi-Vendredi)
        verify(availabilityRepository, times(5)).save(any(DoctorAvailability.class));
    }

    @Test
    @DisplayName("✅ disableDay() - Désactive un jour")
    void testDisableDay() {
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        when(availabilityRepository.findByDoctorIdAndDayOfWeek(1L, DayOfWeek.FRIDAY)).thenReturn(Optional.empty());

        availabilityService.disableDay(1L, DayOfWeek.FRIDAY);

        verify(availabilityRepository).save(argThat(av -> 
            av.getDayOfWeek() == DayOfWeek.FRIDAY && !av.getIsAvailable()
        ));
    }

    // --- Tests Exceptions ---

    @Test
    @DisplayName("✅ createException() - Succès")
    void testCreateException() {
        CreateExceptionDTO dto = new CreateExceptionDTO();
        dto.setExceptionDate(LocalDate.now().plusDays(1));
        dto.setReason("Vacation");
        dto.setExceptionType(DoctorAvailabilityException.ExceptionType.VACATION);

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        when(exceptionRepository.countConflictingExceptions(any(), any(), any())).thenReturn(0L);
        
        DoctorAvailabilityException savedException = new DoctorAvailabilityException();
        savedException.setId(1L);
        savedException.setDoctor(testDoctor);
        savedException.setExceptionDate(dto.getExceptionDate());
        
        when(exceptionRepository.save(any(DoctorAvailabilityException.class))).thenReturn(savedException);

        ExceptionResponseDTO result = availabilityService.createException(1L, dto);

        assertNotNull(result);
        verify(exceptionRepository).save(any(DoctorAvailabilityException.class));
    }

    @Test
    @DisplayName("❌ createException() - Conflit de dates")
    void testCreateException_Conflict() {
        CreateExceptionDTO dto = new CreateExceptionDTO();
        dto.setExceptionDate(LocalDate.now());

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        when(exceptionRepository.countConflictingExceptions(any(), any(), any())).thenReturn(1L);

        assertThrows(RuntimeException.class, () -> availabilityService.createException(1L, dto));
        verify(exceptionRepository, never()).save(any());
    }

    @Test
    @DisplayName("❌ createException() - Date fin avant début")
    void testCreateException_InvalidDates() {
        CreateExceptionDTO dto = new CreateExceptionDTO();
        dto.setExceptionDate(LocalDate.now().plusDays(5));
        dto.setExceptionEndDate(LocalDate.now().plusDays(1));

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));

        assertThrows(RuntimeException.class, () -> availabilityService.createException(1L, dto));
    }

    @Test
    @DisplayName("✅ getExceptions() - Liste toutes les exceptions")
    void testGetExceptions() {
        DoctorAvailabilityException ex = new DoctorAvailabilityException();
        ex.setDoctor(testDoctor);
        ex.setExceptionDate(LocalDate.now());
        
        when(exceptionRepository.findByDoctorIdOrderByExceptionDateDesc(1L)).thenReturn(Arrays.asList(ex));

        List<ExceptionResponseDTO> result = availabilityService.getExceptions(1L);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("✅ deleteException() - Succès")
    void testDeleteException() {
        DoctorAvailabilityException ex = new DoctorAvailabilityException();
        ex.setId(10L);
        ex.setDoctor(testDoctor);

        when(exceptionRepository.findById(10L)).thenReturn(Optional.of(ex));

        availabilityService.deleteException(1L, 10L);

        verify(exceptionRepository).delete(ex);
    }

    @Test
    @DisplayName("❌ deleteException() - Non autorisé")
    void testDeleteException_Unauthorized() {
        Doctor otherDoctor = new Doctor();
        otherDoctor.setId(2L);
        
        DoctorAvailabilityException ex = new DoctorAvailabilityException();
        ex.setId(10L);
        ex.setDoctor(otherDoctor);

        when(exceptionRepository.findById(10L)).thenReturn(Optional.of(ex));

        assertThrows(RuntimeException.class, () -> availabilityService.deleteException(1L, 10L));
        verify(exceptionRepository, never()).delete(any());
    }

    @Test
    @DisplayName("✅ isDateBlocked() - Vérifie si bloqué")
    void testIsDateBlocked() {
        when(exceptionRepository.findExceptionsForDate(eq(1L), any(LocalDate.class)))
            .thenReturn(Arrays.asList(new DoctorAvailabilityException()));

        boolean result = availabilityService.isDateBlocked(1L, LocalDate.now());

        assertTrue(result);
    }
}