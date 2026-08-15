package com.healthguardian.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguardian.dto.DoctorPatientDTO;
import com.healthguardian.dto.PatientHealthDashboardDTO;
import com.healthguardian.entity.Doctor;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.entity.UserHealthHabits;
import com.healthguardian.repository.SimpleUserRepository;
import com.healthguardian.repository.UserHealthHabitsRepository;
import com.healthguardian.repository.UserRepository;
import com.healthguardian.service.DoctorPatientService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DoctorPatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DoctorPatientService doctorPatientService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private SimpleUserRepository simpleUserRepository;

    @MockBean
    private UserHealthHabitsRepository healthHabitsRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("✅ GET /api/doctor-patients - Succès")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testGetMyPatients() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        DoctorPatientDTO patientDTO = new DoctorPatientDTO();
        patientDTO.setPatientId(2L);
        
        when(doctorPatientService.getDoctorPatients(1L)).thenReturn(Collections.singletonList(patientDTO));

        mockMvc.perform(get("/api/doctor-patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }

    @Test
    @DisplayName("✅ GET /api/doctor-patients/search - Succès")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testSearchPatients() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        when(doctorPatientService.searchPatients(1L, "John")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/doctor-patients/search").param("query", "John"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));
    }

    @Test
    @DisplayName("✅ GET /api/doctor-patients/count - Succès")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testCountPatients() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        when(doctorPatientService.countDoctorPatients(1L)).thenReturn(5L);

        mockMvc.perform(get("/api/doctor-patients/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5));
    }

    @Test
    @DisplayName("✅ GET /api/doctor-patients/{patientId} - Succès")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testGetPatient() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        DoctorPatientDTO dto = new DoctorPatientDTO();
        dto.setPatientId(2L);
        when(doctorPatientService.getDoctorPatient(1L, 2L)).thenReturn(dto);

        mockMvc.perform(get("/api/doctor-patients/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientId").value(2));
    }

    @Test
    @DisplayName("✅ DELETE /api/doctor-patients/{patientId} - Succès")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testDeactivatePatient() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        doNothing().when(doctorPatientService).deactivatePatient(1L, 2L);

        mockMvc.perform(delete("/api/doctor-patients/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Patient deactivated successfully"));
    }

    // --- Tests pour getPatientHealthDashboard (Complex Logic) ---

    @Test
    @DisplayName("✅ GET /api/doctor-patients/patients/{id}/health-dashboard - Succès (Complet)")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testGetPatientHealthDashboard_Success() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        
        SimpleUser patient = new SimpleUser();
        patient.setId(2L);
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient.setWeight(80.0f);
        patient.setHeight(1.80f);
        patient.setIsProfileComplete(true);

        UserHealthHabits habits = new UserHealthHabits();
        habits.setHoursOfSleep(java.math.BigDecimal.valueOf(7.5)); // BigDecimal dans l'entité

        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));
        when(userRepository.findById(2L)).thenReturn(Optional.of(patient));
        when(doctorPatientService.isDoctorPatient(1L, 2L)).thenReturn(true);
        when(healthHabitsRepository.findByUserId(2L)).thenReturn(Optional.of(habits));

        mockMvc.perform(get("/api/doctor-patients/patients/2/health-dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientName").value("John Doe"))
                .andExpect(jsonPath("$.bmi").exists()) // 80 / (1.8*1.8) = ~24.69
                .andExpect(jsonPath("$.hasHealthHabits").value(true))
                .andExpect(jsonPath("$.hoursOfSleep").value(7.5));
    }

    @Test
    @DisplayName("❌ GET /api/doctor-patients/patients/{id}/health-dashboard - Access Denied")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testGetPatientHealthDashboard_AccessDenied() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        
        SimpleUser patient = new SimpleUser();
        patient.setId(2L);

        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));
        when(userRepository.findById(2L)).thenReturn(Optional.of(patient));
        when(doctorPatientService.isDoctorPatient(1L, 2L)).thenReturn(false); // Pas mon patient

        mockMvc.perform(get("/api/doctor-patients/patients/2/health-dashboard"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Access denied: This patient is not under your care"));
    }

    @Test
    @DisplayName("❌ GET /api/doctor-patients/patients/{id}/health-dashboard - Not A Patient")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testGetPatientHealthDashboard_NotAPatient() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        
        Doctor otherDoctor = new Doctor(); // C'est un docteur, pas un patient
        otherDoctor.setId(3L);

        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));
        when(userRepository.findById(3L)).thenReturn(Optional.of(otherDoctor));

        mockMvc.perform(get("/api/doctor-patients/patients/3/health-dashboard"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("User is not a patient (SimpleUser)"));
    }

    @Test
    @DisplayName("❌ GET /api/doctor-patients/patients/{id}/health-dashboard - Patient Not Found")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testGetPatientHealthDashboard_PatientNotFound() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/doctor-patients/patients/99/health-dashboard"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Patient not found with id: 99")); // RuntimeException caught
    }
}
