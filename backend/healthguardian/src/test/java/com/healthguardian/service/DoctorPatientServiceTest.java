package com.healthguardian.service;

import com.healthguardian.dto.DoctorPatientDTO;
import com.healthguardian.entity.Appointment;
import com.healthguardian.entity.Appointment.AppointmentStatus;
import com.healthguardian.entity.Doctor;
import com.healthguardian.entity.DoctorPatient;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.repository.DoctorPatientRepository;
import com.healthguardian.repository.DoctorRepository;
import com.healthguardian.repository.SimpleUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 🧪 TEST UNITAIRE - DoctorPatientService
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("DoctorPatientService - Tests Unitaires")
class DoctorPatientServiceTest {

    @Mock
    private DoctorPatientRepository doctorPatientRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private SimpleUserRepository simpleUserRepository;

    @InjectMocks
    private DoctorPatientService doctorPatientService;

    private Doctor testDoctor;
    private SimpleUser testPatient;
    private Appointment testAppointment;
    private DoctorPatient testDoctorPatient;

    @BeforeEach
    void setUp() {
        testDoctor = new Doctor();
        testDoctor.setId(1L);
        testDoctor.setFirstName("Dr");
        testDoctor.setLastName("House");
        testDoctor.setSpecialty("Diagnostician");

        testPatient = new SimpleUser();
        testPatient.setId(2L);
        testPatient.setFirstName("John");
        testPatient.setLastName("Doe");
        testPatient.setEmail("john@test.com");
        testPatient.setPhoneNumber("1234567890");

        testAppointment = new Appointment();
        testAppointment.setId(100L);
        testAppointment.setDoctor(testDoctor);
        testAppointment.setPatient(testPatient);
        testAppointment.setCompletedAt(LocalDateTime.now());
        testAppointment.setStatus(AppointmentStatus.COMPLETED);
        testAppointment.setPatientPhone("1234567890");

        testDoctorPatient = new DoctorPatient();
        testDoctorPatient.setId(1L);
        testDoctorPatient.setDoctor(testDoctor);
        testDoctorPatient.setPatient(testPatient);
        testDoctorPatient.setPatientName("John Doe"); // ✅ Ajouté
        testDoctorPatient.setIsActive(true);
        testDoctorPatient.setCompletedAppointments(1);
    }

    @Test
    @DisplayName("✅ addPatientToDoctor() - Nouveau patient")
    void testAddPatientToDoctor_New() {
        when(doctorPatientRepository.existsByDoctorIdAndPatientId(1L, 2L)).thenReturn(false);
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        when(simpleUserRepository.findById(2L)).thenReturn(Optional.of(testPatient));
        when(doctorPatientRepository.save(any(DoctorPatient.class))).thenAnswer(invocation -> {
            DoctorPatient dp = invocation.getArgument(0);
            dp.setId(1L);
            return dp;
        });

        DoctorPatientDTO result = doctorPatientService.addPatientToDoctor(1L, 2L, testAppointment);

        assertNotNull(result);
        assertEquals("John Doe", result.getPatientName());
        assertEquals("1234567890", result.getPatientPhone());
        assertEquals(1, result.getTotalAppointments());
        verify(doctorPatientRepository).save(any(DoctorPatient.class));
    }

    @Test
    @DisplayName("✅ addPatientToDoctor() - Relation existante")
    void testAddPatientToDoctor_Existing() {
        when(doctorPatientRepository.existsByDoctorIdAndPatientId(1L, 2L)).thenReturn(true);
        when(doctorPatientRepository.findByDoctorIdAndPatientId(1L, 2L)).thenReturn(Optional.of(testDoctorPatient));
        when(doctorPatientRepository.save(any(DoctorPatient.class))).thenReturn(testDoctorPatient);

        DoctorPatientDTO result = doctorPatientService.addPatientToDoctor(1L, 2L, testAppointment);

        assertNotNull(result);
        verify(doctorPatientRepository, never()).findById(any()); // Should call findByDoctorIdAndPatientId via update
        verify(doctorPatientRepository).save(testDoctorPatient);
    }

    @Test
    @DisplayName("✅ addPatientToDoctor() - Téléphone manquant (fallback)")
    void testAddPatientToDoctor_MissingPhone() {
        testPatient.setPhoneNumber(null);
        testAppointment.setPatientPhone(null);

        when(doctorPatientRepository.existsByDoctorIdAndPatientId(1L, 2L)).thenReturn(false);
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        when(simpleUserRepository.findById(2L)).thenReturn(Optional.of(testPatient));
        when(doctorPatientRepository.save(any(DoctorPatient.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DoctorPatientDTO result = doctorPatientService.addPatientToDoctor(1L, 2L, testAppointment);

        assertEquals("Not provided", result.getPatientPhone());
    }

    @Test
    @DisplayName("❌ addPatientToDoctor() - Docteur non trouvé")
    void testAddPatientToDoctor_DoctorNotFound() {
        when(doctorPatientRepository.existsByDoctorIdAndPatientId(1L, 2L)).thenReturn(false);
        when(doctorRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> doctorPatientService.addPatientToDoctor(1L, 2L, testAppointment));
    }

    @Test
    @DisplayName("✅ updatePatientRelation() - Rendez-vous complété")
    void testUpdatePatientRelation_Completed() {
        testAppointment.setStatus(AppointmentStatus.COMPLETED);
        
        when(doctorPatientRepository.findByDoctorIdAndPatientId(1L, 2L)).thenReturn(Optional.of(testDoctorPatient));
        when(doctorPatientRepository.save(any(DoctorPatient.class))).thenReturn(testDoctorPatient);

        DoctorPatientDTO result = doctorPatientService.updatePatientRelation(1L, 2L, testAppointment);

        assertNotNull(result);
        verify(doctorPatientRepository).save(testDoctorPatient);
        // Note: DoctorPatient logic inside incrementCompletedAppointments is tested via integration or relying on pojo logic
    }

    @Test
    @DisplayName("✅ updatePatientRelation() - Rendez-vous annulé")
    void testUpdatePatientRelation_Cancelled() {
        testAppointment.setStatus(AppointmentStatus.CANCELLED);
        
        when(doctorPatientRepository.findByDoctorIdAndPatientId(1L, 2L)).thenReturn(Optional.of(testDoctorPatient));
        when(doctorPatientRepository.save(any(DoctorPatient.class))).thenReturn(testDoctorPatient);

        DoctorPatientDTO result = doctorPatientService.updatePatientRelation(1L, 2L, testAppointment);

        assertNotNull(result);
        verify(doctorPatientRepository).save(testDoctorPatient);
    }

    @Test
    @DisplayName("✅ getDoctorPatients() - Liste des patients")
    void testGetDoctorPatients() {
        when(doctorPatientRepository.findAllByDoctorId(1L)).thenReturn(Arrays.asList(testDoctorPatient));

        List<DoctorPatientDTO> result = doctorPatientService.getDoctorPatients(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getPatientName());
    }

    @Test
    @DisplayName("✅ searchPatients() - Recherche")
    void testSearchPatients() {
        when(doctorPatientRepository.searchPatients(1L, "John")).thenReturn(Arrays.asList(testDoctorPatient));

        List<DoctorPatientDTO> result = doctorPatientService.searchPatients(1L, "John");

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("✅ deactivatePatient() - Soft delete")
    void testDeactivatePatient() {
        when(doctorPatientRepository.findByDoctorIdAndPatientId(1L, 2L)).thenReturn(Optional.of(testDoctorPatient));
        when(doctorPatientRepository.save(any(DoctorPatient.class))).thenReturn(testDoctorPatient);

        doctorPatientService.deactivatePatient(1L, 2L);

        assertFalse(testDoctorPatient.getIsActive());
        verify(doctorPatientRepository).save(testDoctorPatient);
    }

    @Test
    @DisplayName("✅ isDoctorPatient() - Vérification accès")
    void testIsDoctorPatient() {
        when(doctorPatientRepository.existsByDoctorIdAndPatientId(1L, 2L)).thenReturn(true);
        assertTrue(doctorPatientService.isDoctorPatient(1L, 2L));
        
        when(doctorPatientRepository.existsByDoctorIdAndPatientId(1L, 2L)).thenReturn(false);
        assertFalse(doctorPatientService.isDoctorPatient(1L, 2L));
    }
    
    @Test
    @DisplayName("✅ getDoctorPatient() - Récupérer un patient spécifique")
    void testGetDoctorPatient() {
        when(doctorPatientRepository.findByDoctorIdAndPatientId(1L, 2L)).thenReturn(Optional.of(testDoctorPatient));
        
        DoctorPatientDTO result = doctorPatientService.getDoctorPatient(1L, 2L);
        
        assertNotNull(result);
        assertEquals(testPatient.getId(), result.getPatientId());
    }
    
    @Test
    @DisplayName("❌ getDoctorPatient() - Patient non trouvé")
    void testGetDoctorPatient_NotFound() {
        when(doctorPatientRepository.findByDoctorIdAndPatientId(1L, 2L)).thenReturn(Optional.empty());
        
        assertThrows(RuntimeException.class, () -> doctorPatientService.getDoctorPatient(1L, 2L));
    }
    
    @Test
    @DisplayName("✅ countDoctorPatients() - Compter les patients actifs")
    void testCountDoctorPatients() {
        when(doctorPatientRepository.countActivePatientsByDoctorId(1L)).thenReturn(5L);
        
        Long count = doctorPatientService.countDoctorPatients(1L);
        
        assertEquals(5L, count);
    }
}