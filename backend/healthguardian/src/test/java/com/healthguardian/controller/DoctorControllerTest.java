package com.healthguardian.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguardian.dto.DoctorProfileUpdateDTO;
import com.healthguardian.entity.Doctor;
import com.healthguardian.service.DoctorService;
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

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DoctorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DoctorService doctorService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("✅ GET /api/doctors - Succès")
    @WithMockUser
    void testGetAllDoctors() throws Exception {
        com.healthguardian.entity.Role role = new com.healthguardian.entity.Role();
        role.setName("ROLE_DOCTOR");

        Doctor d1 = new Doctor();
        d1.setId(1L);
        d1.setFirstName("John");
        d1.setRole(role);
        
        Doctor d2 = new Doctor();
        d2.setId(2L);
        d2.setFirstName("Jane");
        d2.setRole(role);

        when(doctorService.getAllDoctors()).thenReturn(Arrays.asList(d1, d2));

        mockMvc.perform(get("/api/doctors"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].firstName").value("John"));
    }

    @Test
    @DisplayName("✅ GET /api/doctors/active - Succès")
    @WithMockUser
    void testGetActiveDoctors() throws Exception {
        com.healthguardian.entity.Role role = new com.healthguardian.entity.Role();
        role.setName("ROLE_DOCTOR");

        Doctor d1 = new Doctor();
        d1.setId(1L);
        d1.setIsActive(true);
        d1.setRole(role);

        when(doctorService.getActiveDoctors()).thenReturn(Collections.singletonList(d1));

        mockMvc.perform(get("/api/doctors/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].isActive").value(true));
    }

    @Test
    @DisplayName("✅ GET /api/doctors/{id} - Succès")
    @WithMockUser
    void testGetDoctorById() throws Exception {
        com.healthguardian.entity.Role role = new com.healthguardian.entity.Role();
        role.setName("ROLE_DOCTOR");

        Doctor d1 = new Doctor();
        d1.setId(1L);
        d1.setFirstName("House");
        d1.setRole(role);

        when(doctorService.getDoctorById(1L)).thenReturn(d1);

        mockMvc.perform(get("/api/doctors/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("House"));
    }

    @Test
    @DisplayName("✅ GET /api/doctors/specialty/{specialty} - Succès")
    @WithMockUser
    void testGetDoctorsBySpecialty() throws Exception {
        com.healthguardian.entity.Role role = new com.healthguardian.entity.Role();
        role.setName("ROLE_DOCTOR");

        Doctor d1 = new Doctor();
        d1.setId(1L);
        d1.setSpecialty("Cardiology");
        d1.setRole(role);

        when(doctorService.getDoctorsBySpecialty("Cardiology")).thenReturn(Collections.singletonList(d1));

        mockMvc.perform(get("/api/doctors/specialty/Cardiology"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].specialty").value("Cardiology"));
    }

    @Test
    @DisplayName("✅ PUT /api/doctors/profile/{id} - Succès (Docteur)")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateDoctorProfile_Success() throws Exception {
        com.healthguardian.entity.Role role = new com.healthguardian.entity.Role();
        role.setName("ROLE_DOCTOR");

        DoctorProfileUpdateDTO dto = new DoctorProfileUpdateDTO();
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setLicenseNumber("LIC123");
        dto.setSpecialty("Neurology");
        dto.setConsultationFee(150.0);
        dto.setBio("Updated Bio");
        
        Doctor updatedDoctor = new Doctor();
        updatedDoctor.setId(1L);
        updatedDoctor.setSpecialty("Neurology");
        updatedDoctor.setRole(role);

        when(doctorService.updateDoctorProfile(eq(1L), any(DoctorProfileUpdateDTO.class)))
                .thenReturn(updatedDoctor);

        mockMvc.perform(put("/api/doctors/profile/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.specialty").value("Neurology"));
    }

    @Test
    @DisplayName("❌ PUT /api/doctors/profile/{id} - Accès Refusé (User)")
    @WithMockUser(roles = "USER")
    void testUpdateDoctorProfile_Forbidden() throws Exception {
        DoctorProfileUpdateDTO dto = new DoctorProfileUpdateDTO();
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setLicenseNumber("LIC123");
        dto.setSpecialty("Neurology");
        
        mockMvc.perform(put("/api/doctors/profile/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("❌ PUT /api/doctors/profile/{id} - Bad Request")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateDoctorProfile_BadRequest() throws Exception {
        DoctorProfileUpdateDTO dto = new DoctorProfileUpdateDTO();
        
        when(doctorService.updateDoctorProfile(eq(1L), any(DoctorProfileUpdateDTO.class)))
                .thenThrow(new RuntimeException("Invalid data"));

        mockMvc.perform(put("/api/doctors/profile/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("✅ GET /api/doctors/check-license - Succès")
    @WithMockUser
    void testCheckLicenseNumber() throws Exception {
        when(doctorService.licenseNumberExists("LIC123")).thenReturn(true);

        mockMvc.perform(get("/api/doctors/check-license").param("licenseNumber", "LIC123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true));
    }

    @Test
    @DisplayName("✅ DELETE /api/doctors/admin/{id} - Succès (Admin)")
    @WithMockUser(roles = "ADMIN")
    void testDeleteDoctor_Success() throws Exception {
        doNothing().when(doctorService).deleteDoctor(1L);

        mockMvc.perform(delete("/api/doctors/admin/1"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("❌ DELETE /api/doctors/admin/{id} - Forbidden (Doctor)")
    @WithMockUser(roles = "DOCTOR")
    void testDeleteDoctor_Forbidden() throws Exception {
        mockMvc.perform(delete("/api/doctors/admin/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("❌ DELETE /api/doctors/admin/{id} - Not Found / Bad Request")
    @WithMockUser(roles = "ADMIN")
    void testDeleteDoctor_Error() throws Exception {
        doThrow(new RuntimeException("Doctor not found")).when(doctorService).deleteDoctor(99L);

        mockMvc.perform(delete("/api/doctors/admin/99"))
                .andExpect(status().isBadRequest()); // Controller catches RuntimeException and returns BadRequest
    }
}
