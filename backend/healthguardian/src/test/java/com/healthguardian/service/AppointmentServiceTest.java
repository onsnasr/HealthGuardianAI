package com.healthguardian.service;

import com.healthguardian.dto.AppointmentCreateDTO;
import com.healthguardian.dto.AppointmentResponseDTO;
import com.healthguardian.dto.DoctorSearchDTO;
import com.healthguardian.dto.TimeSlotDTO;
import com.healthguardian.entity.*;
import com.healthguardian.entity.Appointment.AppointmentStatus;
import com.healthguardian.repository.*;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 🧪 TEST UNITAIRE - AppointmentService
 * Tests complets incluant les cas d'erreur et branches conditionnelles
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AppointmentService - Tests Complets")
class AppointmentServiceTest {

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private DoctorRepository doctorRepository;
    @Mock private SimpleUserRepository simpleUserRepository;
    @Mock private DoctorAvailabilityExceptionRepository doctorAvailabilityExceptionRepository;
    @Mock private DoctorAvailabilityRepository availabilityRepository; // Added
    @Mock private DoctorPatientService doctorPatientService;

    @InjectMocks
    private AppointmentService appointmentService;

    private Doctor testDoctor;
    private SimpleUser testPatient;
    private Appointment testAppointment;

    @BeforeEach
    void setUp() {
        Role doctorRole = new Role();
        doctorRole.setId(2L);
        doctorRole.setName("DOCTOR");

        testDoctor = new Doctor();
        testDoctor.setId(1L);
        testDoctor.setFirstName("Dr. John");
        testDoctor.setLastName("Doe");
        testDoctor.setSpecialty("Cardiology");
        testDoctor.setIsActive(true);
        testDoctor.setRole(doctorRole);

        Role patientRole = new Role();
        patientRole.setId(3L);
        testPatient = new SimpleUser();
        testPatient.setId(2L);
        testPatient.setFirstName("Jane");
        testPatient.setLastName("Patient");
        testPatient.setPhoneNumber("+1234567890");
        testPatient.setRole(patientRole);

        testAppointment = new Appointment();
        testAppointment.setId(1L);
        testAppointment.setDoctor(testDoctor);
        testAppointment.setPatient(testPatient);
        testAppointment.setAppointmentDate(LocalDate.now().plusDays(1));
        testAppointment.setAppointmentTime(LocalTime.of(10, 0));
        testAppointment.setStatus(AppointmentStatus.PENDING);
        testAppointment.setPatientName("Jane Patient");
        testAppointment.setDoctorName("Dr. John Doe");
        testAppointment.setDoctorSpecialty("Cardiology");
    }

    @Test
    @DisplayName("❌ createAppointment() - Docteur inactif")
    void testCreateAppointment_DoctorInactive() {
        testDoctor.setIsActive(false);
        AppointmentCreateDTO dto = new AppointmentCreateDTO();
        dto.setDoctorId(1L);

        when(simpleUserRepository.findById(2L)).thenReturn(Optional.of(testPatient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));

        assertThrows(RuntimeException.class, () -> appointmentService.createAppointment(2L, dto));
    }

    @Test
    @DisplayName("❌ confirmAppointment() - Rendez-vous déjà traité")
    void testConfirmAppointment_NotPending() {
        testAppointment.setStatus(AppointmentStatus.CONFIRMED);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));

        assertThrows(RuntimeException.class, () -> appointmentService.confirmAppointment(1L, 1L));
    }

    @Test
    @DisplayName("✅ rejectAppointment() - Succès")
    void testRejectAppointment() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

        AppointmentResponseDTO result = appointmentService.rejectAppointment(1L, 1L, "Busy");

        assertEquals(AppointmentStatus.REJECTED, result.getStatus());
        assertEquals("Busy", result.getRejectionReason());
    }

    @Test
    @DisplayName("❌ completeAppointment() - Non confirmé")
    void testCompleteAppointment_NotConfirmed() {
        testAppointment.setStatus(AppointmentStatus.PENDING); // Not confirmed yet
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));

        assertThrows(RuntimeException.class, () -> appointmentService.completeAppointment(1L, 1L, "Done"));
    }

    @Test
    @DisplayName("✅ completeAppointment() - Succès")
    void testCompleteAppointment_Success() {
        testAppointment.setStatus(AppointmentStatus.CONFIRMED);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

        AppointmentResponseDTO result = appointmentService.completeAppointment(1L, 1L, "All good");

        assertEquals(AppointmentStatus.COMPLETED, result.getStatus());
        assertEquals("All good", result.getNotes());
        // Verify patient added to doctor list
        verify(doctorPatientService).addPatientToDoctor(eq(1L), eq(2L), any());
    }

    @Test
    @DisplayName("✅ createAppointment() - Succès")
    void testCreateAppointment_Success() {
        AppointmentCreateDTO dto = new AppointmentCreateDTO();
        dto.setDoctorId(1L);
        dto.setAppointmentDate(LocalDate.now().plusDays(1));
        dto.setAppointmentTime(LocalTime.of(10, 0));

        when(simpleUserRepository.findById(2L)).thenReturn(Optional.of(testPatient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        when(doctorAvailabilityExceptionRepository.findExceptionsForDate(any(), any()))
            .thenReturn(Collections.emptyList());
        when(appointmentRepository.countConflictingAppointments(any(), any(), any())).thenReturn(0L);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

        AppointmentResponseDTO result = appointmentService.createAppointment(2L, dto);

        assertNotNull(result);
        assertEquals(AppointmentStatus.PENDING, result.getStatus());
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("❌ createAppointment() - Conflit créneau")
    void testCreateAppointment_TimeSlotConflict() {
        AppointmentCreateDTO dto = new AppointmentCreateDTO();
        dto.setDoctorId(1L);
        dto.setAppointmentDate(LocalDate.now().plusDays(1));
        dto.setAppointmentTime(LocalTime.of(10, 0));

        when(simpleUserRepository.findById(2L)).thenReturn(Optional.of(testPatient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        when(doctorAvailabilityExceptionRepository.findExceptionsForDate(any(), any()))
            .thenReturn(Collections.emptyList());
        when(appointmentRepository.countConflictingAppointments(any(), any(), any())).thenReturn(1L);

        assertThrows(RuntimeException.class, () -> appointmentService.createAppointment(2L, dto));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("❌ createAppointment() - Patient inexistant")
    void testCreateAppointment_PatientNotFound() {
        AppointmentCreateDTO dto = new AppointmentCreateDTO();
        when(simpleUserRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> appointmentService.createAppointment(999L, dto));
    }

    @Test
    @DisplayName("✅ confirmAppointment() - Succès")
    void testConfirmAppointment_Success() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

        AppointmentResponseDTO result = appointmentService.confirmAppointment(1L, 1L);

        assertNotNull(result);
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("❌ confirmAppointment() - Mauvais docteur")
    void testConfirmAppointment_UnauthorizedDoctor() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));

        assertThrows(RuntimeException.class, () -> appointmentService.confirmAppointment(1L, 999L));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("✅ cancelAppointment() - Succès")
    void testCancelAppointment_Success() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

        AppointmentResponseDTO result = appointmentService.cancelAppointment(1L, 2L);

        assertNotNull(result);
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("❌ cancelAppointment() - Mauvais patient")
    void testCancelAppointment_UnauthorizedPatient() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));

        assertThrows(RuntimeException.class, () -> appointmentService.cancelAppointment(1L, 999L));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("❌ createAppointment() - Date bloquée par exception")
    void testCreateAppointment_DateBlockedByException() {
        AppointmentCreateDTO dto = new AppointmentCreateDTO();
        dto.setDoctorId(1L);
        dto.setAppointmentDate(LocalDate.now());
        
        when(simpleUserRepository.findById(2L)).thenReturn(Optional.of(testPatient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        
        DoctorAvailabilityException exception = new DoctorAvailabilityException();
        exception.setReason("Holiday");
        when(doctorAvailabilityExceptionRepository.findExceptionsForDate(eq(1L), any()))
            .thenReturn(List.of(exception));

        assertThrows(RuntimeException.class, () -> appointmentService.createAppointment(2L, dto));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("✅ getAvailableTimeSlots() - Succès")
    void testGetAvailableTimeSlots_Success() {
        LocalDate date = LocalDate.of(2026, 1, 1); // Thursday
        
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        when(doctorAvailabilityExceptionRepository.findExceptionsForDate(eq(1L), eq(date)))
            .thenReturn(Collections.emptyList());
            
        DoctorAvailability availability = new DoctorAvailability();
        availability.setStartTime(LocalTime.of(9, 0));
        availability.setEndTime(LocalTime.of(10, 0));
        availability.setSlotDurationMinutes(30);
        
        when(availabilityRepository.findByDoctorIdAndDayOfWeekAndIsAvailable(eq(1L), any(DayOfWeek.class), eq(true)))
            .thenReturn(List.of(availability));
            
        when(appointmentRepository.findByDoctorIdAndAppointmentDate(eq(1L), eq(date)))
            .thenReturn(Collections.emptyList());

        List<TimeSlotDTO> slots = appointmentService.getAvailableTimeSlots(1L, date);

        assertNotNull(slots);
        assertEquals(2, slots.size()); // 9:00, 9:30
        assertTrue(slots.get(0).getIsAvailable());
    }

    @Test
    @DisplayName("❌ getAvailableTimeSlots() - Date bloquée")
    void testGetAvailableTimeSlots_DateBlocked() {
        LocalDate date = LocalDate.now();
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        
        DoctorAvailabilityException exception = new DoctorAvailabilityException();
        exception.setReason("Holiday");
        when(doctorAvailabilityExceptionRepository.findExceptionsForDate(eq(1L), eq(date)))
            .thenReturn(List.of(exception));

        List<TimeSlotDTO> slots = appointmentService.getAvailableTimeSlots(1L, date);

        assertNotNull(slots);
        assertTrue(slots.isEmpty());
    }

    @Test
    @DisplayName("✅ searchDoctors() - Recherche par nom")
    void testSearchDoctors_ByName() {
        when(doctorRepository.findAll()).thenReturn(List.of(testDoctor));
        
        List<DoctorSearchDTO> results = appointmentService.searchDoctors("Doe");
        
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Dr. John Doe", results.get(0).getFullName());
    }

    @Test
    @DisplayName("✅ searchDoctors() - Vide retourne tout")
    void testSearchDoctors_Empty() {
        when(doctorRepository.findAll()).thenReturn(List.of(testDoctor));
        
        List<DoctorSearchDTO> results = appointmentService.searchDoctors("");
        
        assertNotNull(results);
        assertEquals(1, results.size());
    }
}