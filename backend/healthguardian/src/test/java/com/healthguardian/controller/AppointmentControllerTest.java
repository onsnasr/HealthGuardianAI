package com.healthguardian.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguardian.config.EmailVerificationFilter;
import com.healthguardian.config.JwtAuthenticationFilter;
import com.healthguardian.config.SecurityConfig;
import com.healthguardian.dto.*;
import com.healthguardian.entity.Appointment.AppointmentStatus;
import com.healthguardian.entity.User;
import com.healthguardian.repository.UserRepository;
import com.healthguardian.service.AppointmentService;
import com.healthguardian.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AppointmentController.class)
@Import(SecurityConfig.class)
public class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private EmailVerificationFilter emailVerificationFilter;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() throws Exception {
        doAnswer(invocation -> {
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(ServletRequest.class), any(ServletResponse.class), any(FilterChain.class));

        doAnswer(invocation -> {
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(emailVerificationFilter).doFilter(any(ServletRequest.class), any(ServletResponse.class), any(FilterChain.class));
    }

    @Test
    @DisplayName("✅ POST /api/appointments - Create Appointment (Success)")
    @WithMockUser(username = "patient@example.com", roles = "SIMPLE_USER")
    void testCreateAppointment() throws Exception {
        User user = new User() {
            @Override
            public boolean isAccountNonExpired() { return true; }
            @Override
            public boolean isAccountNonLocked() { return true; }
            @Override
            public boolean isCredentialsNonExpired() { return true; }
            @Override
            public boolean isEnabled() { return true; }
        };
        user.setId(1L);
        when(userRepository.findByEmail("patient@example.com")).thenReturn(Optional.of(user));

        AppointmentCreateDTO dto = new AppointmentCreateDTO();
        dto.setDoctorId(2L);
        dto.setAppointmentDate(LocalDate.now().plusDays(1));
        dto.setAppointmentTime(LocalTime.of(10, 0));
        dto.setAppointmentType("General Checkup");
        dto.setReason("Checkup");

        AppointmentResponseDTO response = new AppointmentResponseDTO();
        response.setId(10L);
        response.setDoctorId(2L);
        response.setAppointmentDate(dto.getAppointmentDate());
        response.setAppointmentTime(dto.getAppointmentTime());
        response.setAppointmentType(dto.getAppointmentType());
        response.setStatus(AppointmentStatus.PENDING);

        when(appointmentService.createAppointment(eq(1L), any(AppointmentCreateDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("✅ GET /api/appointments/my-appointments - Success")
    @WithMockUser(username = "patient@example.com", roles = "SIMPLE_USER")
    void testGetMyAppointments() throws Exception {
        User user = new User() {
            @Override
            public boolean isAccountNonExpired() { return true; }
            @Override
            public boolean isAccountNonLocked() { return true; }
            @Override
            public boolean isCredentialsNonExpired() { return true; }
            @Override
            public boolean isEnabled() { return true; }
        };
        user.setId(1L);
        when(userRepository.findByEmail("patient@example.com")).thenReturn(Optional.of(user));

        AppointmentResponseDTO app1 = new AppointmentResponseDTO();
        app1.setId(1L);
        when(appointmentService.getPatientAppointments(1L)).thenReturn(Collections.singletonList(app1));

        mockMvc.perform(get("/api/appointments/my-appointments"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }

    @Test
    @DisplayName("✅ PUT /api/appointments/{id}/cancel - Success")
    @WithMockUser(username = "patient@example.com", roles = "SIMPLE_USER")
    void testCancelAppointment() throws Exception {
        User user = new User() {
            @Override
            public boolean isAccountNonExpired() { return true; }
            @Override
            public boolean isAccountNonLocked() { return true; }
            @Override
            public boolean isCredentialsNonExpired() { return true; }
            @Override
            public boolean isEnabled() { return true; }
        };
        user.setId(1L);
        when(userRepository.findByEmail("patient@example.com")).thenReturn(Optional.of(user));

        AppointmentResponseDTO response = new AppointmentResponseDTO();
        response.setId(1L);
        response.setStatus(AppointmentStatus.CANCELLED);

        when(appointmentService.cancelAppointment(eq(1L), eq(1L))).thenReturn(response);

        mockMvc.perform(put("/api/appointments/1/cancel"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    @DisplayName("✅ GET /api/appointments/doctor/all - Success")
    @WithMockUser(username = "doctor@example.com", roles = "DOCTOR")
    void testGetDoctorAppointments() throws Exception {
        User user = new User() {
            @Override
            public boolean isAccountNonExpired() { return true; }
            @Override
            public boolean isAccountNonLocked() { return true; }
            @Override
            public boolean isCredentialsNonExpired() { return true; }
            @Override
            public boolean isEnabled() { return true; }
        };
        user.setId(2L);
        when(userRepository.findByEmail("doctor@example.com")).thenReturn(Optional.of(user));

        AppointmentResponseDTO app1 = new AppointmentResponseDTO();
        app1.setId(1L);
        when(appointmentService.getDoctorAppointments(2L)).thenReturn(Collections.singletonList(app1));

        mockMvc.perform(get("/api/appointments/doctor/all"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }

    @Test
    @DisplayName("✅ PUT /api/appointments/{id}/confirm - Success")
    @WithMockUser(username = "doctor@example.com", roles = "DOCTOR")
    void testConfirmAppointment() throws Exception {
        User user = new User() {
            @Override
            public boolean isAccountNonExpired() { return true; }
            @Override
            public boolean isAccountNonLocked() { return true; }
            @Override
            public boolean isCredentialsNonExpired() { return true; }
            @Override
            public boolean isEnabled() { return true; }
        };
        user.setId(2L);
        when(userRepository.findByEmail("doctor@example.com")).thenReturn(Optional.of(user));

        AppointmentResponseDTO response = new AppointmentResponseDTO();
        response.setId(1L);
        response.setStatus(AppointmentStatus.CONFIRMED);

        when(appointmentService.confirmAppointment(eq(1L), eq(2L))).thenReturn(response);

        mockMvc.perform(put("/api/appointments/1/confirm"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    @DisplayName("✅ PUT /api/appointments/{id}/reject - Success")
    @WithMockUser(username = "doctor@example.com", roles = "DOCTOR")
    void testRejectAppointment() throws Exception {
        User user = new User() {
            @Override
            public boolean isAccountNonExpired() { return true; }
            @Override
            public boolean isAccountNonLocked() { return true; }
            @Override
            public boolean isCredentialsNonExpired() { return true; }
            @Override
            public boolean isEnabled() { return true; }
        };
        user.setId(2L);
        when(userRepository.findByEmail("doctor@example.com")).thenReturn(Optional.of(user));

        AppointmentResponseDTO response = new AppointmentResponseDTO();
        response.setId(1L);
        response.setStatus(AppointmentStatus.REJECTED);

        when(appointmentService.rejectAppointment(eq(1L), eq(2L), eq("Busy"))).thenReturn(response);

        mockMvc.perform(put("/api/appointments/1/reject")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("reason", "Busy"))))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    @DisplayName("✅ GET /api/appointments/available-slots/{doctorId} - Success")
    @WithMockUser
    void testGetAvailableSlots() throws Exception {
        TimeSlotDTO slot = TimeSlotDTO.builder()
                .time(LocalTime.of(9, 0))
                .isAvailable(true)
                .displayTime("09:00")
                .build();
        when(appointmentService.getAvailableTimeSlots(eq(2L), any(LocalDate.class)))
                .thenReturn(Collections.singletonList(slot));

        mockMvc.perform(get("/api/appointments/available-slots/2")
                .param("date", LocalDate.now().toString()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }

    @Test
    @DisplayName("✅ GET /api/appointments/search-doctors - Success")
    @WithMockUser
    void testSearchDoctors() throws Exception {
        DoctorSearchDTO doctor = new DoctorSearchDTO();
        doctor.setId(2L);
        doctor.setFirstName("John");
        when(appointmentService.searchDoctors("Cardio")).thenReturn(Collections.singletonList(doctor));

        mockMvc.perform(get("/api/appointments/search-doctors")
                .param("query", "Cardio"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }

    @Test
    @DisplayName("❌ POST /api/appointments - Validation Failure")
    @WithMockUser(username = "patient@example.com", roles = "SIMPLE_USER")
    void testCreateAppointment_ValidationFailure() throws Exception {
        // Empty DTO should fail validation
        AppointmentCreateDTO dto = new AppointmentCreateDTO();
        // Missing required fields like doctorId, appointmentDate, appointmentTime, appointmentType

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}
