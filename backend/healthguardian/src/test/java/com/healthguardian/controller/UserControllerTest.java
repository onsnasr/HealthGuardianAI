package com.healthguardian.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguardian.dto.UserResponse;
import com.healthguardian.entity.Doctor;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.entity.User;
import com.healthguardian.repository.DoctorRepository;
import com.healthguardian.repository.UserRepository;
import com.healthguardian.service.UserService;
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

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private DoctorRepository doctorRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("✅ GET /api/users/me - Succès")
    @WithMockUser(username = "test@example.com")
    void testGetCurrentUser() throws Exception {
        UserResponse userResponse = UserResponse.builder()
                .email("test@example.com")
                .firstName("John")
                .build();

        when(userService.getUserByEmail("test@example.com")).thenReturn(userResponse);

        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    @DisplayName("✅ GET /api/users/{id} - Succès (Admin)")
    @WithMockUser(roles = "ADMIN")
    void testGetUserById() throws Exception {
        UserResponse userResponse = UserResponse.builder().id(1L).build();
        when(userService.getUserById(1L)).thenReturn(userResponse);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @DisplayName("❌ GET /api/users/{id} - Forbidden (Simple User)")
    @WithMockUser(roles = "USER")
    void testGetUserById_Forbidden() throws Exception {
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("✅ PUT /api/users/profile/{id} - Succès (SimpleUser)")
    @WithMockUser
    void testUpdateSimpleUserProfile() throws Exception {
        Map<String, Object> updateMap = new HashMap<>();
        updateMap.put("firstName", "John");
        updateMap.put("lastName", "Doe");
        updateMap.put("email", "john.doe@example.com");
        updateMap.put("password", "Password123!");
        updateMap.put("age", 30);
        
        Map<String, Object> roleMap = new HashMap<>();
        roleMap.put("name", "ROLE_USER");
        updateMap.put("role", roleMap);

        UserResponse response = UserResponse.builder().id(1L).age(30).build();

        when(userService.updateSimpleUserProfile(eq(1L), any(SimpleUser.class))).thenReturn(response);

        mockMvc.perform(put("/api/users/profile/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateMap)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.age").value(30));
    }

    @Test
    @DisplayName("✅ GET /api/users/profile-status/{id} - Succès")
    @WithMockUser
    void testCheckProfileStatus() throws Exception {
        UserResponse response = UserResponse.builder().id(1L).isProfileComplete(true).build();
        when(userService.getUserById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/users/profile-status/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isProfileComplete").value(true));
    }

    // --- Tests spécifiques pour updateDoctorProfile (logique dans le contrôleur) ---

    @Test
    @DisplayName("✅ PUT /api/users/doctor-profile/{id} - Succès")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateDoctorProfile_Success() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        doctor.setLicenseNumber("OLD123");

        Map<String, Object> updates = new HashMap<>();
        updates.put("specialty", "Cardiology");
        updates.put("licenseNumber", "NEW123");
        updates.put("consultationFee", 200.0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(doctorRepository.findByLicenseNumber("NEW123")).thenReturn(Optional.empty()); // Pas de conflit
        when(doctorRepository.save(any(Doctor.class))).thenReturn(doctor);
        when(userService.getUserById(1L)).thenReturn(UserResponse.builder().id(1L).specialty("Cardiology").build());

        mockMvc.perform(put("/api/users/doctor-profile/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.specialty").value("Cardiology"));
        
        verify(doctorRepository).save(any(Doctor.class));
    }

    @Test
    @DisplayName("❌ PUT /api/users/doctor-profile/{id} - Pas un docteur")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateDoctorProfile_NotADoctor() throws Exception {
        SimpleUser simpleUser = new SimpleUser();
        simpleUser.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(simpleUser));

        Map<String, Object> updates = new HashMap<>();
        updates.put("specialty", "Cardiology");

        mockMvc.perform(put("/api/users/doctor-profile/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User is not a doctor"));
    }

    @Test
    @DisplayName("❌ PUT /api/users/doctor-profile/{id} - License Existe Déjà")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateDoctorProfile_LicenseExists() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        doctor.setLicenseNumber("OLD123");

        Doctor otherDoctor = new Doctor();
        otherDoctor.setId(2L); // Un autre docteur a déjà cette license

        Map<String, Object> updates = new HashMap<>();
        updates.put("licenseNumber", "TAKEN123");

        when(userRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(doctorRepository.findByLicenseNumber("TAKEN123")).thenReturn(Optional.of(otherDoctor));

        mockMvc.perform(put("/api/users/doctor-profile/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("License number already exists"));
    }

    @Test
    @DisplayName("❌ PUT /api/users/doctor-profile/{id} - User Not Found")
    @WithMockUser(roles = "DOCTOR")
    void testUpdateDoctorProfile_UserNotFound() throws Exception {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        Map<String, Object> updates = new HashMap<>();
        
        mockMvc.perform(put("/api/users/doctor-profile/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isBadRequest()); // Le catch(Exception) retourne BadRequest
    }
}
