package com.healthguardian.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguardian.entity.Pharmacy;
import com.healthguardian.service.PharmacyService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 🧪 TEST FONCTIONNEL - PharmacyController
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PharmacyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PharmacyService pharmacyService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("✅ GET /api/pharmacies should return list")
    void testGetAllPharmacies() throws Exception {
        Pharmacy p = new Pharmacy();
        p.setPharmacyName("Controller Pharma");
        
        when(pharmacyService.getAllPharmacies()).thenReturn(Collections.singletonList(p));

        mockMvc.perform(get("/api/pharmacies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].pharmacyName").value("Controller Pharma"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("✅ POST /api/pharmacies should create pharmacy")
    void testCreatePharmacy() throws Exception {
        Pharmacy p = new Pharmacy();
        p.setPharmacyName("New Pharma");
        p.setEmail("new@test.com");

        when(pharmacyService.createPharmacy(any(Pharmacy.class))).thenReturn(p);

        mockMvc.perform(post("/api/pharmacies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(p)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pharmacyName").value("New Pharma"));
    }
}
