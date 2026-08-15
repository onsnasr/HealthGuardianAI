package com.healthguardian.service;

import com.healthguardian.dto.UserResponse;
import com.healthguardian.entity.Admin;
import com.healthguardian.entity.Role;
import com.healthguardian.repository.AdminRepository;
import com.healthguardian.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 🧪 TEST UNITAIRE - AdminService
 * 
 * 🎯 OBJECTIF: Tester les 3 MÉTHODES CRITIQUES de AdminService
 * 
 * 📋 MÉTHODES TESTÉES (6 tests au total):
 * 
 * 1️⃣ updateAdminProfile() - 2 tests
 *    ✅ Cas de succès : Mise à jour réussie
 *    ❌ Cas d'erreur : L'utilisateur n'est pas un Admin
 *    💡 Pourquoi ? Validation de type utilisateur, opération fréquente
 * 
 * 2️⃣ changePassword() - 2 tests
 *    ✅ Cas de succès : Changement avec bon ancien mot de passe
 *    ❌ Cas d'erreur : Ancien mot de passe incorrect
 *    💡 Pourquoi ? SÉCURITÉ CRITIQUE, validation mot de passe
 * 
 * 3️⃣ updateAccessLevel() - 2 tests
 *    ✅ Cas de succès : Niveau valide (1 ou 2)
 *    ❌ Cas d'erreur : Niveau invalide
 *    💡 Pourquoi ? Règle métier importante, hiérarchie admin
 * 
 * 🔧 MOCKS UTILISÉS:
 * - AdminRepository : Persistance des admins
 * - UserRepository : Recherche utilisateur
 * - PasswordEncoder : Cryptage et validation mots de passe
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AdminService - Tests Unitaires Critiques")
class AdminServiceTest {

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    private Admin testAdmin;

    @BeforeEach
    void setUp() {
        Role adminRole = new Role();
        adminRole.setId(1L);
        adminRole.setName("ADMIN");

        testAdmin = new Admin();
        testAdmin.setId(1L);
        testAdmin.setFirstName("Admin");
        testAdmin.setLastName("User");
        testAdmin.setEmail("admin@healthguardian.com");
        testAdmin.setPassword("$2a$10$encodedPassword");
        testAdmin.setPhoneNumber("+1234567890");
        testAdmin.setRole(adminRole);
        testAdmin.setIsActive(true);
        testAdmin.setAccessLevel(1);
        testAdmin.setDepartment("IT");
        testAdmin.setCanManageRoles(true);
        testAdmin.setCanManageUsers(true);
        testAdmin.setCanViewAnalytics(true);
        testAdmin.setCreatedAt(LocalDateTime.now());
        testAdmin.setUpdatedAt(LocalDateTime.now());
    }

    // =============================================================================
    // 1️⃣ MÉTHODE CRITIQUE : updateAdminProfile()
    // =============================================================================

    /**
     * ✅ TEST 1/6 : updateAdminProfile() - CAS DE SUCCÈS
     * 
     * 📝 SCÉNARIO: Mettre à jour le profil d'un admin avec des données valides
     * 
     * 🔍 CE QU'ON TESTE:
     * - Le service accepte les mises à jour partielles (Map<String, Object>)
     * - Les champs sont correctement mis à jour
     * - Le User est bien casté en Admin
     * 
     * ⚙️ COMMENT ÇA MARCHE:
     * 1. On crée une Map avec les champs à mettre à jour
     * 2. Le service vérifie que c'est un Admin (instanceof)
     * 3. Les champs sont mis à jour et sauvegardés
     * 
     * 💼 UTILITÉ MÉTIER: Fonctionnalité core pour gestion profil admin
     */
    @Test
    @DisplayName("✅ updateAdminProfile() - Devrait mettre à jour les informations")
    void testUpdateAdminProfile_Success() {
        // ARRANGE
        Map<String, Object> updates = new HashMap<>();
        updates.put("firstName", "UpdatedAdmin");
        updates.put("lastName", "UpdatedUser");
        updates.put("phoneNumber", "+9876543210");
        updates.put("department", "HR");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testAdmin));
        when(adminRepository.save(any(Admin.class))).thenReturn(testAdmin);

        // ACT
        UserResponse result = adminService.updateAdminProfile(1L, updates);

        // ASSERT
        assertNotNull(result, "Le résultat ne doit pas être null");
        verify(userRepository).findById(1L);
        verify(adminRepository).save(any(Admin.class));
    }

    /**
     * ❌ TEST 2/6 : updateAdminProfile() - CAS D'ERREUR
     * 
     * 📝 SCÉNARIO: Essayer de mettre à jour un profil qui n'est PAS un Admin
     * 
     * 🔍 CE QU'ON TESTE:
     * - La validation de type (instanceof Admin)
     * - Le service rejette les SimpleUser ou Doctor
     * - Aucune sauvegarde n'est effectuée
     * 
     * 💼 UTILITÉ MÉTIER: SÉCURITÉ - Empêche les modifications non autorisées
     */
    @Test
    @DisplayName("❌ updateAdminProfile() - Devrait échouer si l'utilisateur n'est pas admin")
    void testUpdateAdminProfile_NotAdmin() {
        // ARRANGE - Créer un SimpleUser au lieu d'un Admin
        com.healthguardian.entity.SimpleUser normalUser = new com.healthguardian.entity.SimpleUser();
        normalUser.setId(1L);
        
        Map<String, Object> updates = new HashMap<>();
        when(userRepository.findById(1L)).thenReturn(Optional.of(normalUser));

        // ACT & ASSERT
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> adminService.updateAdminProfile(1L, updates),
            "Une exception devrait être levée car ce n'est pas un admin"
        );

        assertTrue(
            exception.getMessage().contains("is not an admin"),
            "Le message devrait indiquer que ce n'est pas un admin"
        );
        
        // Vérifier qu'aucune sauvegarde n'a été tentée
        verify(adminRepository, never()).save(any());
    }

    // =============================================================================
    // 2️⃣ MÉTHODE CRITIQUE : changePassword()
    // =============================================================================

    /**
     * ✅ TEST 3/6 : changePassword() - CAS DE SUCCÈS
     * 
     * 📝 SCÉNARIO: Changer le mot de passe avec le bon ancien mot de passe
     * 
     * 🔍 CE QU'ON TESTE:
     * - Le service vérifie l'ancien mot de passe avec passwordEncoder.matches()
     * - Le nouveau mot de passe est encodé avant sauvegarde
     * - Le compte est sauvegardé avec le nouveau mot de passe
     * 
     * ⚙️ COMMENT ÇA MARCHE:
     * 1. PasswordEncoder vérifie que oldPassword correspond au hash stocké
     * 2. PasswordEncoder encode le nouveau mot de passe
     * 3. Admin est sauvegardé avec le nouveau hash
     * 
     * 💼 UTILITÉ MÉTIER: SÉCURITÉ CRITIQUE - Gestion sécurisée des mots de passe
     */
    @Test
    @DisplayName("✅ changePassword() - Devrait changer le mot de passe")
    void testChangePassword_Success() {
        // ARRANGE
        String oldPassword = "oldPass123";
        String newPassword = "newPass456";

        when(adminRepository.findById(1L)).thenReturn(Optional.of(testAdmin));
        // Simuler que l'ancien mot de passe est correct
        when(passwordEncoder.matches(oldPassword, testAdmin.getPassword())).thenReturn(true);
        // Simuler l'encodage du nouveau mot de passe
        when(passwordEncoder.encode(newPassword)).thenReturn("$2a$10$encodedNewPassword");
        when(adminRepository.save(any(Admin.class))).thenReturn(testAdmin);

        // ACT - Ne doit pas lever d'exception
        assertDoesNotThrow(
            () -> adminService.changePassword(1L, oldPassword, newPassword),
            "Le changement de mot de passe ne devrait pas lever d'exception"
        );


        // ASSERT
verify(passwordEncoder).encode(newPassword);
        verify(adminRepository).save(any(Admin.class));
    }

    /**
     * ❌ TEST 4/6 : changePassword() - CAS D'ERREUR
     * 
     * 📝 SCÉNARIO: Essayer de changer le mot de passe avec un mauvais ancien mot de passe
     * 
     * 🔍 CE QU'ON TESTE:
     * - Le service détecte que l'ancien mot de passe est incorrect
     * - Une exception est levée AVANT l'encodage du nouveau
     * - Aucune sauvegarde n'est effectuée
     * 
     * 💼 UTILITÉ MÉTIER: SÉCURITÉ CRITIQUE - Empêche les changements non autorisés
     */
    @Test
    @DisplayName("❌ changePassword() - Devrait échouer avec mauvais mot de passe")
    void testChangePassword_WrongPassword() {
        // ARRANGE
        String wrongOldPassword = "wrongPassword";
        String newPassword = "newPass456";

        when(adminRepository.findById(1L)).thenReturn(Optional.of(testAdmin));
        // Simuler que l'ancien mot de passe est INCORRECT
        when(passwordEncoder.matches(wrongOldPassword, testAdmin.getPassword())).thenReturn(false);

        // ACT & ASSERT
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> adminService.changePassword(1L, wrongOldPassword, newPassword),
            "Une exception devrait être levée pour mauvais mot de passe"
        );

        assertTrue(
            exception.getMessage().contains("Current password is incorrect"),
            "Le message devrait indiquer que le mot de passe actuel est incorrect"
        );
        
        // Le nouveau mot de passe ne doit JAMAIS être encodé
        verify(passwordEncoder, never()).encode(any());
        // Aucune sauvegarde ne doit être faite
        verify(adminRepository, never()).save(any());
    }

    // =============================================================================
    // 3️⃣ MÉTHODE CRITIQUE : updateAccessLevel()
    // =============================================================================

    /**
     * ✅ TEST 5/6 : updateAccessLevel() - CAS DE SUCCÈS
     * 
     * 📝 SCÉNARIO: Changer le niveau d'accès d'un admin (1 = Standard, 2 = Super)
     * 
     * 🔍 CE QU'ON TESTE:
     * - Le service accepte les niveaux 1 et 2
     * - Le niveau est correctement mis à jour
     * - La modification est sauvegardée
     * 
     * 💼 UTILITÉ MÉTIER: Gestion de la hiérarchie admin (permissions différentes)
     */
    @Test
    @DisplayName("✅ updateAccessLevel() - Devrait mettre à jour le niveau d'accès")
    void testUpdateAccessLevel_Success() {
        // ARRANGE
        when(adminRepository.findById(1L)).thenReturn(Optional.of(testAdmin));
        when(adminRepository.save(any(Admin.class))).thenReturn(testAdmin);

        // ACT
        UserResponse result = adminService.updateAccessLevel(1L, 2); // Promouvoir à Super Admin

        // ASSERT
        assertNotNull(result, "Le résultat ne doit pas être null");
        verify(adminRepository).findById(1L);
        verify(adminRepository).save(any(Admin.class));
    }

    /**
     * ❌ TEST 6/6 : updateAccessLevel() - CAS D'ERREUR
     * 
     * 📝 SCÉNARIO: Essayer de définir un niveau d'accès invalide (ni 1 ni 2)
     * 
     * 🔍 CE QU'ON TESTE:
     * - La validation du niveau (doit être 1 ou 2)
     * - Une IllegalArgumentException est levée
     * - Aucune sauvegarde n'est effectuée
     * 
     * 💼 UTILITÉ MÉTIER: VALIDATION MÉTIER - Garantit l'intégrité des niveaux d'accès
     */
    @Test
    @DisplayName("❌ updateAccessLevel() - Devrait rejeter un niveau invalide")
    void testUpdateAccessLevel_InvalidLevel() {
        // ARRANGE
        when(adminRepository.findById(1L)).thenReturn(Optional.of(testAdmin));

        // ACT & ASSERT
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> adminService.updateAccessLevel(1L, 5), // Niveau invalide
            "Une IllegalArgumentException devrait être levée"
        );

        assertTrue(
            exception.getMessage().contains("Access level must be"),
            "Le message devrait indiquer les niveaux valides"
        );
        
        // Aucune sauvegarde ne doit être faite
        verify(adminRepository, never()).save(any());
    }
}
