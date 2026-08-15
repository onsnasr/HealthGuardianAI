package com.healthguardian.service;

import com.healthguardian.dto.HealthHabitsDTO;
import com.healthguardian.dto.HealthHabitsResponseDTO;
import com.healthguardian.entity.Role;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.entity.UserHealthHabits;
import com.healthguardian.repository.SimpleUserRepository;
import com.healthguardian.repository.UserHealthHabitsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 🧪 TEST UNITAIRE - UserHealthHabitsService
 * 
 * 🎯 OBJECTIF: Tester la logique métier du service
 * 
 * 💡 COUVERTURE:
 * - createOrUpdateHealthHabits() - Créer ou mettre à jour les habitudes
 * - getMyHealthHabits() - Récupérer les habitudes de l'utilisateur courant
 * - deleteMyHealthHabits() - Supprimer les habitudes
 * - hasHealthHabits() - Vérifier l'existence des habitudes
 * - Validation de la pression artérielle
 * - Mise à jour du statut de profil complet
 * 
 * 🔧 @ExtendWith(MockitoExtension.class): Active Mockito
 * 🔧 Mocks: Repository dependencies, Security context
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserHealthHabitsService - Tests Unitaires")
class UserHealthHabitsServiceTest {

    @Mock
    private UserHealthHabitsRepository healthHabitsRepository;

    @Mock
    private SimpleUserRepository simpleUserRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserHealthHabitsService healthHabitsService;

    private SimpleUser testUser;
    private UserHealthHabits testHealthHabits;
    private HealthHabitsDTO testDTO;
    private Role simpleUserRole;

    @BeforeEach
    void setUp() {
        // Configurer le rôle
        simpleUserRole = new Role();
        simpleUserRole.setId(3L);
        simpleUserRole.setName("SIMPLE_USER");

        // Configurer l'utilisateur de test
        testUser = new SimpleUser();
        testUser.setId(1L);
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john.doe@test.com");
        testUser.setPhoneNumber("1234567890");
        testUser.setAddress("123 Test St");
        testUser.setAge(30);
        testUser.setWeight(75.0f);
        testUser.setHeight(1.75f);
        testUser.setRole(simpleUserRole);
        testUser.setIsActive(true);

        // Configurer les habitudes de test
        testHealthHabits = new UserHealthHabits();
        testHealthHabits.setId(1L);
        testHealthHabits.setUser(testUser);
        testHealthHabits.setHoursOfSleep(new BigDecimal("7.5"));
        testHealthHabits.setBedtimeHour("23:00");
        testHealthHabits.setExerciseHoursPerWeek(new BigDecimal("5.0"));
        testHealthHabits.setDailySteps(8000);
        testHealthHabits.setLitresEauJour(new BigDecimal("2.5"));
        testHealthHabits.setCafeJour(2);
        testHealthHabits.setHeuresTravailJour(new BigDecimal("8.0"));
        testHealthHabits.setJobType("Bureau");
        testHealthHabits.setActivityStatus("Actif");
        testHealthHabits.setBpSystolic(120);
        testHealthHabits.setBpDiastolic(80);

        // Configurer le DTO
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

        // Configurer le contexte de sécurité
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(testUser);
        when(simpleUserRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
    }

    @Test
    @DisplayName("✅ createOrUpdateHealthHabits() - Créer nouvelles habitudes")
    void testCreateHealthHabits_Success() {
        // ARRANGE
        when(healthHabitsRepository.findByUserId(testUser.getId())).thenReturn(Optional.empty());
        when(healthHabitsRepository.save(any(UserHealthHabits.class))).thenReturn(testHealthHabits);
        when(simpleUserRepository.save(any(SimpleUser.class))).thenReturn(testUser);

        // ACT
        HealthHabitsResponseDTO result = healthHabitsService.createOrUpdateHealthHabits(testDTO);

        // ASSERT
        assertNotNull(result);
        assertEquals(testUser.getId(), result.getUserId());
        assertEquals(new BigDecimal("7.5"), result.getHoursOfSleep());
        assertEquals("23:00", result.getBedtimeHour());
        
        verify(healthHabitsRepository).findByUserId(testUser.getId());
        verify(healthHabitsRepository).save(any(UserHealthHabits.class));
        verify(simpleUserRepository).save(any(SimpleUser.class));
    }

    @Test
    @DisplayName("✅ createOrUpdateHealthHabits() - Mettre à jour habitudes existantes")
    void testUpdateHealthHabits_Success() {
        // ARRANGE
        when(healthHabitsRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testHealthHabits));
        when(healthHabitsRepository.save(any(UserHealthHabits.class))).thenReturn(testHealthHabits);
        when(simpleUserRepository.save(any(SimpleUser.class))).thenReturn(testUser);

        // Modifier le DTO
        testDTO.setDailySteps(10000);

        // ACT
        HealthHabitsResponseDTO result = healthHabitsService.createOrUpdateHealthHabits(testDTO);

        // ASSERT
        assertNotNull(result);
        verify(healthHabitsRepository).findByUserId(testUser.getId());
        verify(healthHabitsRepository).save(any(UserHealthHabits.class));
    }

    @Test
    @DisplayName("❌ createOrUpdateHealthHabits() - Échouer si BP systolic <= diastolic")
    void testCreateHealthHabits_InvalidBloodPressure() {
        // ARRANGE
        when(healthHabitsRepository.findByUserId(testUser.getId())).thenReturn(Optional.empty());
        
        // DTO avec BP invalide
        testDTO.setBpSystolic(80);
        testDTO.setBpDiastolic(120);

        // ACT & ASSERT
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> healthHabitsService.createOrUpdateHealthHabits(testDTO)
        );
        
        assertEquals("BP_SYSTOLIC_MUST_BE_HIGHER_THAN_DIASTOLIC", exception.getMessage());
        verify(healthHabitsRepository, never()).save(any(UserHealthHabits.class));
    }

    @Test
    @DisplayName("✅ getMyHealthHabits() - Récupérer les habitudes de l'utilisateur")
    void testGetMyHealthHabits_Success() {
        // ARRANGE
        when(healthHabitsRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testHealthHabits));

        // ACT
        HealthHabitsResponseDTO result = healthHabitsService.getMyHealthHabits();

        // ASSERT
        assertNotNull(result);
        assertEquals(testUser.getId(), result.getUserId());
        assertEquals(new BigDecimal("7.5"), result.getHoursOfSleep());
        verify(healthHabitsRepository).findByUserId(testUser.getId());
    }

    @Test
    @DisplayName("❌ getMyHealthHabits() - Échouer si habitudes non trouvées")
    void testGetMyHealthHabits_NotFound() {
        // ARRANGE
        when(healthHabitsRepository.findByUserId(testUser.getId())).thenReturn(Optional.empty());

        // ACT & ASSERT
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> healthHabitsService.getMyHealthHabits()
        );
        
        assertEquals("HEALTH_HABITS_NOT_FOUND", exception.getMessage());
    }

    @Test
    @DisplayName("✅ deleteMyHealthHabits() - Supprimer les habitudes")
    void testDeleteMyHealthHabits_Success() {
        // ARRANGE
        when(healthHabitsRepository.existsByUserId(testUser.getId())).thenReturn(true);
        doNothing().when(healthHabitsRepository).deleteByUserId(testUser.getId());

        // ACT
        healthHabitsService.deleteMyHealthHabits();

        // ASSERT
        verify(healthHabitsRepository).existsByUserId(testUser.getId());
        verify(healthHabitsRepository).deleteByUserId(testUser.getId());
    }

    @Test
    @DisplayName("❌ deleteMyHealthHabits() - Échouer si habitudes n'existent pas")
    void testDeleteMyHealthHabits_NotFound() {
        // ARRANGE
        when(healthHabitsRepository.existsByUserId(testUser.getId())).thenReturn(false);

        // ACT & ASSERT
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> healthHabitsService.deleteMyHealthHabits()
        );
        
        assertEquals("HEALTH_HABITS_NOT_FOUND", exception.getMessage());
        verify(healthHabitsRepository, never()).deleteByUserId(anyLong());
    }

    @Test
    @DisplayName("✅ hasHealthHabits() - Vérifier l'existence des habitudes")
    void testHasHealthHabits_True() {
        // ARRANGE
        when(healthHabitsRepository.existsByUserId(testUser.getId())).thenReturn(true);

        // ACT
        boolean result = healthHabitsService.hasHealthHabits();

        // ASSERT
        assertTrue(result);
        verify(healthHabitsRepository).existsByUserId(testUser.getId());
    }

    @Test
    @DisplayName("✅ hasHealthHabits() - Retourner false si pas d'habitudes")
    void testHasHealthHabits_False() {
        // ARRANGE
        when(healthHabitsRepository.existsByUserId(testUser.getId())).thenReturn(false);

        // ACT
        boolean result = healthHabitsService.hasHealthHabits();

        // ASSERT
        assertFalse(result);
    }

    @Test
    @DisplayName("✅ createOrUpdateHealthHabits() - Mettre à jour isProfileComplete")
    void testCreateHealthHabits_UpdatesProfileCompletionStatus() {
        // ARRANGE
        testUser.setHealthHabits(testHealthHabits); // Simuler que l'utilisateur a des habitudes
        when(healthHabitsRepository.findByUserId(testUser.getId())).thenReturn(Optional.empty());
        when(healthHabitsRepository.save(any(UserHealthHabits.class))).thenReturn(testHealthHabits);
        when(simpleUserRepository.save(any(SimpleUser.class))).thenReturn(testUser);

        // ACT
        healthHabitsService.createOrUpdateHealthHabits(testDTO);

        // ASSERT
        verify(simpleUserRepository).save(any(SimpleUser.class));
    }
}
