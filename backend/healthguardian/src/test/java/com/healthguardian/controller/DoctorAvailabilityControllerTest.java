package com.healthguardian.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguardian.dto.*;
import com.healthguardian.entity.Doctor;
import com.healthguardian.entity.DoctorAvailabilityException.ExceptionType;
import com.healthguardian.repository.UserRepository;
import com.healthguardian.service.DoctorAvailabilityService;
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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
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
public class DoctorAvailabilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DoctorAvailabilityService availabilityService;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("✅ GET /api/doctor-availability/my-schedule - Succès")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testGetMySchedule() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        WeeklyScheduleDTO schedule = new WeeklyScheduleDTO();
        schedule.setMonday(new DoctorAvailabilityDTO()); // Dummy data to verify structure
        when(availabilityService.getWeeklySchedule(1L)).thenReturn(schedule);

        mockMvc.perform(get("/api/doctor-availability/my-schedule"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monday").exists());
    }

    @Test
    @DisplayName("✅ PUT /api/doctor-availability/update-day - Succès")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testUpdateDayAvailability() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        UpdateDayAvailabilityDTO dto = new UpdateDayAvailabilityDTO();
        dto.setDayOfWeek(DayOfWeek.MONDAY);
        dto.setIsAvailable(true);
        dto.setStartTime(LocalTime.of(9, 0));
        dto.setEndTime(LocalTime.of(17, 0));
        // Add other required fields if validation exists

        DoctorAvailabilityDTO result = new DoctorAvailabilityDTO();
        result.setDayOfWeek(DayOfWeek.MONDAY);
        when(availabilityService.updateDayAvailability(eq(1L), any(UpdateDayAvailabilityDTO.class))).thenReturn(result);

        mockMvc.perform(put("/api/doctor-availability/update-day")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dayOfWeek").value("MONDAY"));
    }

    @Test
    @DisplayName("✅ POST /api/doctor-availability/apply-template - Succès")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testApplyTemplate() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        ApplyTemplateDTO dto = new ApplyTemplateDTO();
        dto.setTemplateType(ApplyTemplateDTO.TemplateType.WEEKDAYS_ONLY);
        dto.setStartTime(LocalTime.of(9, 0));
        dto.setEndTime(LocalTime.of(17, 0));
        dto.setSlotDurationMinutes(30);

        WeeklyScheduleDTO result = new WeeklyScheduleDTO();
        result.setMonday(new DoctorAvailabilityDTO());
        when(availabilityService.applyTemplate(eq(1L), any(ApplyTemplateDTO.class))).thenReturn(result);

        mockMvc.perform(post("/api/doctor-availability/apply-template")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monday").exists());
    }

    @Test
    @DisplayName("✅ PUT /api/doctor-availability/disable-day/{dayOfWeek} - Succès")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testDisableDay() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        doNothing().when(availabilityService).disableDay(1L, DayOfWeek.FRIDAY);

        mockMvc.perform(put("/api/doctor-availability/disable-day/FRIDAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Day disabled successfully"));
    }

    @Test
    @DisplayName("✅ POST /api/doctor-availability/exceptions - Succès")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testCreateException() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        CreateExceptionDTO dto = new CreateExceptionDTO();
        dto.setExceptionType(ExceptionType.VACATION);
        dto.setExceptionDate(LocalDate.now().plusDays(1));
        dto.setReason("Vacation time");

        ExceptionResponseDTO response = new ExceptionResponseDTO();
        response.setId(10L);
        when(availabilityService.createException(eq(1L), any(CreateExceptionDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/doctor-availability/exceptions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10));
    }

    @Test
    @DisplayName("✅ GET /api/doctor-availability/exceptions - Succès")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testGetMyExceptions() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        when(availabilityService.getExceptions(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/doctor-availability/exceptions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));
    }

    @Test
    @DisplayName("✅ GET /api/doctor-availability/exceptions/upcoming - Succès")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testGetUpcomingExceptions() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        when(availabilityService.getUpcomingExceptions(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/doctor-availability/exceptions/upcoming"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));
    }

    @Test
    @DisplayName("✅ DELETE /api/doctor-availability/exceptions/{id} - Succès")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testDeleteException() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        doNothing().when(availabilityService).deleteException(1L, 100L);

        mockMvc.perform(delete("/api/doctor-availability/exceptions/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Exception deleted successfully"));
    }

    @Test
    @DisplayName("❌ Error Handling - RuntimeException")
    @WithMockUser(username = "doc@example.com", roles = "DOCTOR")
    void testErrorHandling() throws Exception {
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        when(userRepository.findByEmail("doc@example.com")).thenReturn(Optional.of(doctor));

        ApplyTemplateDTO dto = new ApplyTemplateDTO();
        dto.setTemplateType(ApplyTemplateDTO.TemplateType.WEEKDAYS_ONLY);
        dto.setStartTime(LocalTime.of(9, 0));
        dto.setEndTime(LocalTime.of(17, 0));
        dto.setSlotDurationMinutes(30);

        when(availabilityService.applyTemplate(eq(1L), any(ApplyTemplateDTO.class)))
                .thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(post("/api/doctor-availability/apply-template")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Test error"));
    }
}
