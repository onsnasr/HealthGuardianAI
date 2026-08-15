package com.healthguardian.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguardian.entity.Medicine;
import com.healthguardian.service.MedicineService;
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
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 🧪 TEST FONCTIONNEL - MedicineController
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MedicineControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MedicineService medicineService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("✅ GET /api/medicines should return list of medicines")
    void testGetAllMedicines() throws Exception {
        Medicine m = new Medicine();
        m.setId(1L);
        m.setName("Advil");
        
        when(medicineService.getAllMedicines()).thenReturn(Collections.singletonList(m));

        mockMvc.perform(get("/api/medicines"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Advil"));
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    @DisplayName("✅ POST /api/medicines/pharmacy/{id} should create medicine")
    void testCreateMedicine() throws Exception {
        Medicine m = new Medicine();
        m.setName("New Med");
        m.setPrice(BigDecimal.TEN);

        when(medicineService.createMedicine(eq(1L), any(Medicine.class))).thenReturn(m);

        mockMvc.perform(post("/api/medicines/pharmacy/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(m)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Med"));
    }
}
