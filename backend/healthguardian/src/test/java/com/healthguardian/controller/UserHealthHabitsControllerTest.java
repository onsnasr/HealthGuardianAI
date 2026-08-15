package com.healthguardian.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguardian.dto.HealthHabitsDTO;
import com.healthguardian.dto.HealthHabitsResponseDTO;
import com.healthguardian.service.UserHealthHabitsService;
import org.junit.jupiter.api.BeforeEach;
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

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 🌐 INTEGRATION TEST - UserHealthHabitsController
 * 
 * 🎯 OBJECTIF: Tester les endpoints REST avec le contexte Spring complet
 * 
 * 💡 COUVERTURE:
 * - POST /api/health-habits/createOrUpdateHealthHabits - Créer/mettre à jour
 * - PUT /api/health-habits/updateHealthHabits - Mettre à jour
 * - GET /api/health-habits/getMyHealthHabits - Récupérer
 * - GET /api/health-habits/exists - Vérifier existence
 * - DELETE /api/health-habits/deleteMyHealthHabits - Supprimer
 * 
 * ✅ Utilise SpringBootTest pour tester avec vrais services
 * ✅ Mock les services pour isoler le controller
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("UserHealthHabitsController - Tests d'Intégration")
class UserHealthHabitsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserHealthHabitsService healthHabitsService;

    private HealthHabitsDTO testDTO;
    private HealthHabitsResponseDTO testResponse;

    @BeforeEach
    void setUp() {
        // Préparer le DTO de requête
        testDTO = new HealthHabitsDTO();
        testDTO.setHoursOfSleep(new BigDecimal("7.5"));
        testDTO.setBedtimeHour("23:00");
        testDTO.setExerciseHoursPerWeek(new BigDecimal("5.0"));
        testDTO.setDailySteps(8000);
        testDTO.setLitresEauJour(new BigDecimal("2.5"));
        testDTO.setCafeJour(2);
        testDTO.setHeuresTravailJour(new BigDecimal("8.0"));
        testDTO.setJobType("Bureau");
        testDTO.setActivityStatus("Actif");
        testDTO.setBpSystolic(120);
        testDTO.setBpDiastolic(80);

        // Préparer le DTO de réponse
        testResponse = HealthHabitsResponseDTO.builder()
                .id(1L)
                .userId(1L)
                .hoursOfSleep(new BigDecimal("7.5"))
                .bedtimeHour("23:00")
                .exerciseHoursPerWeek(new BigDecimal("5.0"))
                .dailySteps(8000)
                .litresEauJour(new BigDecimal("2.5"))
                .cafeJour(2)
                .heuresTravailJour(new BigDecimal("8.0"))
                .jobType("Bureau")
                .activityStatus("Actif")
                .bpSystolic(120)
                .bpDiastolic(80)
                .build();
    }

    @Test
    @WithMockUser(roles = "SIMPLE_USER")
    @DisplayName("✅ POST /api/health-habits/createOrUpdateHealthHabits - Créer des habitudes")
    void testCreateOrUpdateHealthHabits_Success() throws Exception {
        // ARRANGE
        when(healthHabitsService.createOrUpdateHealthHabits(any(HealthHabitsDTO.class)))
                .thenReturn(testResponse);

        // ACT & ASSERT
        mockMvc.perform(post("/api/health-habits/createOrUpdateHealthHabits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.hoursOfSleep").value(7.5))
                .andExpect(jsonPath("$.bedtimeHour").value("23:00"))
                .andExpect(jsonPath("$.dailySteps").value(8000));

        verify(healthHabitsService).createOrUpdateHealthHabits(any(HealthHabitsDTO.class));
    }

    @Test
    @WithMockUser(roles = "SIMPLE_USER")
    @DisplayName("✅ PUT /api/health-habits/updateHealthHabits - Mettre à jour des habitudes")
    void testUpdateHealthHabits_Success() throws Exception {
        // ARRANGE
        when(healthHabitsService.createOrUpdateHealthHabits(any(HealthHabitsDTO.class)))
                .thenReturn(testResponse);

        // ACT & ASSERT
        mockMvc.perform(put("/api/health-habits/updateHealthHabits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1));

        verify(healthHabitsService).createOrUpdateHealthHabits(any(HealthHabitsDTO.class));
    }

    @Test
    @WithMockUser(roles = "SIMPLE_USER")
    @DisplayName("✅ GET /api/health-habits/getMyHealthHabits - Récupérer les habitudes")
    void testGetMyHealthHabits_Success() throws Exception {
        // ARRANGE
        when(healthHabitsService.getMyHealthHabits()).thenReturn(testResponse);

        // ACT & ASSERT
        mockMvc.perform(get("/api/health-habits/getMyHealthHabits")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.hoursOfSleep").value(7.5));

        verify(healthHabitsService).getMyHealthHabits();
    }

    @Test
    @WithMockUser(roles = "SIMPLE_USER")
    @DisplayName("❌ GET /api/health-habits/getMyHealthHabits - Habitudes non trouvées")
    void testGetMyHealthHabits_NotFound() throws Exception {
        // ARRANGE
        when(healthHabitsService.getMyHealthHabits())
                .thenThrow(new IllegalArgumentException("HEALTH_HABITS_NOT_FOUND"));

        // ACT & ASSERT
        mockMvc.perform(get("/api/health-habits/getMyHealthHabits")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().is4xxClientError());

        verify(healthHabitsService).getMyHealthHabits();
    }

    @Test
    @WithMockUser(roles = "SIMPLE_USER")
    @DisplayName("✅ GET /api/health-habits/exists - Vérifier l'existence")
    void testCheckHealthHabitsExist_True() throws Exception {
        // ARRANGE
        when(healthHabitsService.hasHealthHabits()).thenReturn(true);

        // ACT & ASSERT
        mockMvc.perform(get("/api/health-habits/exists")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.exists").value(true));

        verify(healthHabitsService).hasHealthHabits();
    }

    @Test
    @WithMockUser(roles = "SIMPLE_USER")
    @DisplayName("✅ GET /api/health-habits/exists - Habitudes n'existent pas")
    void testCheckHealthHabitsExist_False() throws Exception {
        // ARRANGE
        when(healthHabitsService.hasHealthHabits()).thenReturn(false);

        // ACT & ASSERT
        mockMvc.perform(get("/api/health-habits/exists")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(false));

        verify(healthHabitsService).hasHealthHabits();
    }

    @Test
    @WithMockUser(roles = "SIMPLE_USER")
    @DisplayName("✅ DELETE /api/health-habits/deleteMyHealthHabits - Supprimer les habitudes")
    void testDeleteMyHealthHabits_Success() throws Exception {
        // ARRANGE
        doNothing().when(healthHabitsService).deleteMyHealthHabits();

        // ACT & ASSERT
        mockMvc.perform(delete("/api/health-habits/deleteMyHealthHabits")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Health habits deleted successfully"));

        verify(healthHabitsService).deleteMyHealthHabits();
    }

    @Test
    @WithMockUser(roles = "SIMPLE_USER")
    @DisplayName("❌ POST - Validation échoue pour données invalides")
    void testCreateHealthHabits_ValidationError() throws Exception {
        // ARRANGE - DTO avec des données invalides
        testDTO.setHoursOfSleep(new BigDecimal("30.0")); // Plus de 24h!
        testDTO.setBedtimeHour("25:00"); // Heure invalide

        // ACT & ASSERT
        mockMvc.perform(post("/api/health-habits/createOrUpdateHealthHabits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testDTO)))
                .andDo(print())
                .andExpect(status().is4xxClientError());

        verify(healthHabitsService, never()).createOrUpdateHealthHabits(any());
    }

    @Test
    @WithMockUser(roles = "SIMPLE_USER")
    @DisplayName("❌ POST - BP invalide (systolic <= diastolic)")
    void testCreateHealthHabits_InvalidBloodPressure() throws Exception {
        // ARRANGE
        testDTO.setBpSystolic(80);
        testDTO.setBpDiastolic(120);
        
        when(healthHabitsService.createOrUpdateHealthHabits(any(HealthHabitsDTO.class)))
                .thenThrow(new IllegalArgumentException("BP_SYSTOLIC_MUST_BE_HIGHER_THAN_DIASTOLIC"));

        // ACT & ASSERT
        mockMvc.perform(post("/api/health-habits/createOrUpdateHealthHabits")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testDTO)))
                .andDo(print())
                .andExpect(status().is4xxClientError());
    }
}
