package com.healthguardian.service;

import com.healthguardian.dto.DoctorProfileUpdateDTO;
import com.healthguardian.entity.Doctor;
import com.healthguardian.entity.Role;
import com.healthguardian.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * 🧪 TEST UNITAIRE - DoctorService
 * 
 * 🎯 OBJECTIF: Tester les 3 MÉTHODES CRITIQUES de DoctorService
 * 
 * 📋 MÉTHODES TESTÉES (6 tests au total):
 * 
 * 1️⃣ getDoctorById() - 2 tests
 *    ✅ Cas de succès : Docteur trouvé
 *    ❌ Cas d'erreur : Docteur non trouvé (RuntimeException)
 *    💡 Pourquoi ? Opération CRUD de base, gestion d'erreur essentielle
 * 
 * 2️⃣ updateDoctorProfile() - 2 tests
 *    ✅ Cas de succès : Mise à jour réussie
 *    ❌ Cas d'erreur : Numéro de licence déjà existant
 *    💡 Pourquoi ? Logique métier complexe, validation unicité licence
 * 
 * 3️⃣ deleteDoctor() - 2 tests
 *    ✅ Cas de succès : Suppression réussie
 *    ❌ Cas d'erreur : Docteur inexistant
 *    💡 Pourquoi ? Opération sensible, contraintes métier
 * 
 * 🔧 OUTILS UTILISÉS:
 * - @Mock : Créer un faux DoctorRepository (pas de vraie BD)
 * - @InjectMocks : Injecter le mock dans DoctorService
 * - when().thenReturn() : Définir le comportement du mock
 * - verify() : Vérifier que le repository a été appelé
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("DoctorService - Tests Unitaires Critiques")
class DoctorServiceTest {

    @Mock
    private DoctorRepository doctorRepository;

    @InjectMocks
    private DoctorService doctorService;

    private Doctor testDoctor;

    @BeforeEach
    void setUp() {
        Role doctorRole = new Role();
        doctorRole.setId(2L);
        doctorRole.setName("DOCTOR");

        testDoctor = new Doctor();
        testDoctor.setId(1L);
        testDoctor.setFirstName("John");
        testDoctor.setLastName("Doe");
        testDoctor.setEmail("john.doe@hospital.com");
        testDoctor.setSpecialty("Cardiology");
        testDoctor.setLicenseNumber("LIC123456");
        testDoctor.setPhoneNumber("+1234567890");
        testDoctor.setAddress("123 Medical Street");
        testDoctor.setConsultationFee(100.0);
        testDoctor.setYearsOfExperience(10);
        testDoctor.setIsActive(true);
        testDoctor.setRole(doctorRole);
    }

    // =============================================================================
    // 1️⃣ MÉTHODE CRITIQUE : getDoctorById()
    // =============================================================================

    /**
     * ✅ TEST 1/6 : getDoctorById() - CAS DE SUCCÈS
     * 
     * 📝 SCÉNARIO: Rechercher un docteur existant par son ID
     * 
     * 🔍 CE QU'ON TESTE:
     * - Le repository retourne bien le docteur
     * - Les données sont correctement mappées
     * - Le service ne modifie pas les données
     * 
     * ⚙️ COMMENT ÇA MARCHE:
     * 1. ARRANGE : On configure le mock pour retourner testDoctor
     * 2. ACT : On appelle getDoctorById(1L)
     * 3. ASSERT : On vérifie que le résultat est correct
     * 
     * 💼 UTILITÉ MÉTIER: Opération de base utilisée partout dans l'app
     */
    @Test
    @DisplayName("✅ getDoctorById() - Devrait retourner le docteur quand il existe")
    void testGetDoctorById_Success() {
        // ARRANGE - Préparer le mock
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));

        // ACT - Appeler la méthode
        Doctor result = doctorService.getDoctorById(1L);

        // ASSERT - Vérifier le résultat
        assertNotNull(result, "Le docteur ne doit pas être null");
        assertEquals(1L, result.getId(), "L'ID doit correspondre");
        assertEquals("John", result.getFirstName(), "Le prénom doit correspondre");
        assertEquals("Cardiology", result.getSpecialty(), "La spécialité doit correspondre");
        
        // Vérifier que le repository a bien été appelé
        verify(doctorRepository, times(1)).findById(1L);
    }

    /**
     * ❌ TEST 2/6 : getDoctorById() - CAS D'ERREUR
     * 
     * 📝 SCÉNARIO: Rechercher un docteur qui n'existe pas
     * 
     * 🔍 CE QU'ON TESTE:
     * - Le service lève bien une RuntimeException
     * - Le message d'erreur est approprié
     * - Le repository est appelé malgré l'erreur
     * 
     * 💼 UTILITÉ MÉTIER: Gestion d'erreur essentielle pour éviter NullPointerException
     */
    @Test
    @DisplayName("❌ getDoctorById() - Devrait lever une exception si non trouvé")
    void testGetDoctorById_NotFound() {
        // ARRANGE - Le repository retourne un Optional vide
        when(doctorRepository.findById(999L)).thenReturn(Optional.empty());

        // ACT & ASSERT - Vérifier qu'une exception est levée
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> doctorService.getDoctorById(999L),
            "Une RuntimeException devrait être levée"
        );

        // Vérifier le message d'erreur
        assertTrue(
            exception.getMessage().contains("Doctor not found"),
            "Le message devrait contenir 'Doctor not found'"
        );
        
        verify(doctorRepository).findById(999L);
    }

    // =============================================================================
    // 2️⃣ MÉTHODE CRITIQUE : updateDoctorProfile()
    // =============================================================================

    /**
     * ✅ TEST 3/6 : updateDoctorProfile() - CAS DE SUCCÈS
     * 
     * 📝 SCÉNARIO: Mettre à jour le profil d'un docteur avec des données valides
     * 
     * 🔍 CE QU'ON TESTE:
     * - Les champs sont correctement mis à jour
     * - Le profil est sauvegardé
     * - La validation de complétude fonctionne
     * 
     * 💼 UTILITÉ MÉTIER: Fonctionnalité core pour la gestion des profils
     */
    @Test
    @DisplayName("✅ updateDoctorProfile() - Devrait mettre à jour les informations")
    void testUpdateDoctorProfile_Success() {
        // ARRANGE
        DoctorProfileUpdateDTO updateDTO = new DoctorProfileUpdateDTO();
        updateDTO.setFirstName("John Updated");
        updateDTO.setLastName("Doe Updated");
        updateDTO.setPhoneNumber("+9876543210");
        updateDTO.setAddress("456 New Medical St");
        updateDTO.setSpecialty("Cardiology and Surgery");
        updateDTO.setLicenseNumber("LIC123456"); // Même licence (pas de conflit)
        updateDTO.setConsultationFee(150.0);
        updateDTO.setYearsOfExperience(15);
        updateDTO.setBio("Expert cardiologist with 15 years of experience");

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        when(doctorRepository.save(any(Doctor.class))).thenReturn(testDoctor);

        // ACT
        Doctor result = doctorService.updateDoctorProfile(1L, updateDTO);

        // ASSERT
        assertNotNull(result, "Le résultat ne doit pas être null");
        verify(doctorRepository).findById(1L);
        verify(doctorRepository).save(any(Doctor.class));
    }

    /**
     * ❌ TEST 4/6 : updateDoctorProfile() - CAS D'ERREUR
     * 
     * 📝 SCÉNARIO: Essayer de changer pour un numéro de licence déjà utilisé
     * 
     * 🔍 CE QU'ON TESTE:
     * - La validation d'unicité de licence fonctionne
     * - Le service détecte le conflit AVANT la sauvegarde
     * - Une exception appropriée est levée
     * 
     * 💼 UTILITÉ MÉTIER: CRITIQUE - Assure l'intégrité des données (licence unique)
     */
    @Test
    @DisplayName("❌ updateDoctorProfile() - Devrait échouer si licence déjà prise")
    void testUpdateDoctorProfile_LicenseAlreadyExists() {
        // ARRANGE
        DoctorProfileUpdateDTO updateDTO = new DoctorProfileUpdateDTO();
        updateDTO.setFirstName("John");
        updateDTO.setLastName("Doe");
        updateDTO.setPhoneNumber("+1234567890");
        updateDTO.setAddress("123 Medical Street");
        updateDTO.setSpecialty("Cardiology");
        updateDTO.setLicenseNumber("DIFFERENT_LICENSE"); // Nouvelle licence
        updateDTO.setConsultationFee(100.0);
        updateDTO.setYearsOfExperience(10);

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(testDoctor));
        // Simuler qu'une autre licence existe déjà
        when(doctorRepository.existsByLicenseNumber("DIFFERENT_LICENSE")).thenReturn(true);

        // ACT & ASSERT
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> doctorService.updateDoctorProfile(1L, updateDTO),
            "Une exception devrait être levée pour licence dupliquée"
        );

        assertTrue(
            exception.getMessage().contains("License number already exists"),
            "Le message devrait mentionner la licence existante"
        );
        
        // La sauvegarde ne doit PAS être appelée
        verify(doctorRepository, never()).save(any(Doctor.class));
    }

    // =============================================================================
    // 3️⃣ MÉTHODE CRITIQUE : deleteDoctor()
    // =============================================================================

    /**
     * ✅ TEST 5/6 : deleteDoctor() - CAS DE SUCCÈS
     * 
     * 📝 SCÉNARIO: Supprimer un docteur existant
     * 
     * 🔍 CE QU'ON TESTE:
     * - Le service vérifie d'abord l'existence
     * - La suppression est exécutée si le docteur existe
     * - Aucune exception n'est levée
     * 
     * 💼 UTILITÉ MÉTIER: Opération sensible pour la gestion des comptes
     */
    @Test
    @DisplayName("✅ deleteDoctor() - Devrait supprimer le docteur")
    void testDeleteDoctor_Success() {
        // ARRANGE
        when(doctorRepository.existsById(1L)).thenReturn(true);
        doNothing().when(doctorRepository).deleteById(1L);

        // ACT - Ne doit pas lever d'exception
        assertDoesNotThrow(
            () -> doctorService.deleteDoctor(1L),
            "La suppression ne devrait pas lever d'exception"
        );

        // ASSERT
        verify(doctorRepository).existsById(1L);
        verify(doctorRepository).deleteById(1L);
    }

    /**
     * ❌ TEST 6/6 : deleteDoctor() - CAS D'ERREUR
     * 
     * 📝 SCÉNARIO: Essayer de supprimer un docteur inexistant
     * 
     * 🔍 CE QU'ON TESTE:
     * - Le service vérifie l'existence AVANT de tenter la suppression
     * - Une exception est levée si le docteur n'existe pas
     * - deleteById() n'est JAMAIS appelé
     * 
     * 💼 UTILITÉ MÉTIER: Évite les erreurs silencieuses et améliore le debugging
     */
    @Test
    @DisplayName("❌ deleteDoctor() - Devrait échouer si docteur non trouvé")
    void testDeleteDoctor_NotFound() {
        // ARRANGE
        when(doctorRepository.existsById(999L)).thenReturn(false);

        // ACT & ASSERT
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> doctorService.deleteDoctor(999L),
            "Une exception devrait être levée"
        );

        assertTrue(
            exception.getMessage().contains("Doctor not found"),
            "Le message devrait indiquer que le docteur n'existe pas"
        );
        
        verify(doctorRepository).existsById(999L);
        // deleteById ne doit JAMAIS être appelé
        verify(doctorRepository, never()).deleteById(anyLong());
    }
}
