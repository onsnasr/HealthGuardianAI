package com.healthguardian.service;

import com.healthguardian.dto.UserResponse;
import com.healthguardian.entity.Admin;
import com.healthguardian.entity.Doctor;
import com.healthguardian.entity.Role;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.entity.User;
import com.healthguardian.repository.AdminRepository;
import com.healthguardian.repository.DoctorRepository;
import com.healthguardian.repository.SimpleUserRepository;
import com.healthguardian.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 🧪 TEST UNITAIRE - UserService
 * Tests des méthodes réelles du service
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService - Tests Unitaires")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SimpleUserRepository simpleUserRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private RoleService roleService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private SimpleUser testSimpleUser;

    @BeforeEach
    void setUp() {
        // Créer un Role pour éviter NullPointerException
        Role patientRole = new Role();
        patientRole.setId(3L);
        patientRole.setName("PATIENT");  // ← FIX le NPE
        
        testSimpleUser = new SimpleUser();
        testSimpleUser.setId(1L);
        testSimpleUser.setFirstName("John");
        testSimpleUser.setLastName("Patient");
        testSimpleUser.setEmail("patient@test.com");
        testSimpleUser.setRole(patientRole);  // ← Assigner le Role
        testSimpleUser.setIsActive(true);

        testUser = testSimpleUser;
    }

    @Test
    @DisplayName("✅ getAllUsers() - Retourner tous les utilisateurs")
    void testGetAllUsers() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(testUser));

        List<UserResponse> result = userService.getAllUsers();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(userRepository).findAll();
    }

    @Test
    @DisplayName("✅ getUserById() - Trouver utilisateur par ID")
    void testGetUserById() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        UserResponse result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals("John", result.getFirstName());
        verify(userRepository).findById(1L);
    }

    @Test
    @DisplayName("❌ getUserById() - Utilisateur non trouvé")
    void testGetUserById_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.getUserById(999L));
    }

    @Test
    @DisplayName("✅ updateSimpleUserProfile() - Mettre à jour profil patient")
    void testUpdateSimpleUserProfile() {
        SimpleUser updatedData = new SimpleUser();
        updatedData.setFirstName("Updated");
        updatedData.setAge(30);

        when(simpleUserRepository.findById(1L)).thenReturn(Optional.of(testSimpleUser));
        when(simpleUserRepository.save(any(SimpleUser.class))).thenReturn(testSimpleUser);

        UserResponse result = userService.updateSimpleUserProfile(1L, updatedData);

        assertNotNull(result);
        verify(simpleUserRepository).findById(1L);
        verify(simpleUserRepository).save(any(SimpleUser.class));
    }

    @Test
    @DisplayName("✅ toggleUserActivation() - Activer/Désactiver utilisateur")
    void testToggleUserActivation() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Initial state: true -> false
        String message = userService.toggleUserActivation(1L);
        assertFalse(testUser.getIsActive());
        assertEquals("User deactivated successfully", message);

        // Second call: false -> true
        message = userService.toggleUserActivation(1L);
        assertTrue(testUser.getIsActive());
        assertEquals("User activated successfully", message);
    }

    @Test
    @DisplayName("❌ deleteUser() - Empêcher suppression Admin")
    void testDeleteUser_AdminProtection() {
        Admin admin = new Admin();
        admin.setId(10L);
        admin.setEmail("admin@test.com");
        
        when(userRepository.findById(10L)).thenReturn(Optional.of(admin));

        assertThrows(RuntimeException.class, () -> userService.deleteUser(10L));
        verify(userRepository, never()).delete(any());
    }

    @Test
    @DisplayName("✅ createDoctor() - Succès")
    void testCreateDoctor() {
        Doctor doctor = new Doctor();
        doctor.setEmail("newdoc@test.com");
        
        when(userRepository.existsByEmail(doctor.getEmail())).thenReturn(false);
        when(roleService.getRoleByName("DOCTOR")).thenReturn(new Role());
        when(passwordEncoder.encode(any())).thenReturn("encodedPass");
        when(doctorRepository.save(any(Doctor.class))).thenReturn(doctor);
        
        UserResponse response = userService.createDoctor(doctor, "password");
        
        assertNotNull(response);
        verify(doctorRepository).save(any(Doctor.class));
    }

    @Test
    @DisplayName("❌ createDoctor() - Email existant")
    void testCreateDoctor_EmailExists() {
        Doctor doctor = new Doctor();
        doctor.setEmail("existing@test.com");
        
        when(userRepository.existsByEmail(doctor.getEmail())).thenReturn(true);
        
        assertThrows(RuntimeException.class, () -> userService.createDoctor(doctor, "password"));
        verify(doctorRepository, never()).save(any());
    }

    @Test
    @DisplayName("❌ createAdmin() - Email existant")
    void testCreateAdmin_EmailExists() {
        Admin admin = new Admin();
        admin.setEmail("admin@test.com");

        when(userRepository.existsByEmail(admin.getEmail())).thenReturn(true);

        assertThrows(RuntimeException.class, () -> userService.createAdmin(admin, "password"));
        verify(adminRepository, never()).save(any());
    }

    @Test
    @DisplayName("✅ createAdmin() - Succès")
    void testCreateAdmin_Success() {
        Admin admin = new Admin();
        admin.setEmail("newadmin@test.com");

        when(userRepository.existsByEmail(admin.getEmail())).thenReturn(false);
        when(roleService.getRoleByName("ADMIN")).thenReturn(new Role());
        when(passwordEncoder.encode(any())).thenReturn("encodedPass");
        when(adminRepository.save(any(Admin.class))).thenReturn(admin);

        UserResponse response = userService.createAdmin(admin, "password");

        assertNotNull(response);
        verify(adminRepository).save(any(Admin.class));
    }

    @Test
    @DisplayName("❌ toggleUserActivation() - Dernier admin actif")
    void testToggleUserActivation_LastAdmin() {
        Admin admin = new Admin();
        admin.setId(1L);
        admin.setIsActive(true);
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(adminRepository.countActiveAdmins()).thenReturn(1L);

        assertThrows(RuntimeException.class, () -> userService.toggleUserActivation(1L));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("✅ updateSimpleUserProfile() - Mise à jour partielle")
    void testUpdateSimpleUserProfile_Partial() {
        SimpleUser current = new SimpleUser();
        current.setId(1L);
        current.setFirstName("Old");
        current.setLastName("Name");
        Role role = new Role();
        role.setName("PATIENT");
        current.setRole(role); // Fix: Assign Role

        SimpleUser update = new SimpleUser();
        update.setFirstName("New");
        // LastName is null

        when(simpleUserRepository.findById(1L)).thenReturn(Optional.of(current));
        when(simpleUserRepository.save(any(SimpleUser.class))).thenReturn(current);

        userService.updateSimpleUserProfile(1L, update);

        assertEquals("New", current.getFirstName());
        assertEquals("Name", current.getLastName()); // Should remain unchanged
    }

    @Test
    @DisplayName("❌ deleteUser() - Utilisateur non trouvé")
    void testDeleteUser_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> userService.deleteUser(999L));
    }
}
