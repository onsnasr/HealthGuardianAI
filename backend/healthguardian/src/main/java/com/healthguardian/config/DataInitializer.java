package com.healthguardian.config;

import com.healthguardian.entity.Admin;
import com.healthguardian.entity.Role;
import com.healthguardian.repository.AdminRepository;
import com.healthguardian.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initializes default roles and first admin account on application startup
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeDefaultAdmin();
    }

    private void initializeRoles() {
        // Create 4 default roles if they don't exist
        String[] roleNames = {"SIMPLE_USER", "DOCTOR", "PHARMACY", "ADMIN"};
        String[] descriptions = {
                "Regular user who tracks health habits",
                "Medical professional who monitors patients",
                "Pharmacy that provides medication information",
                "System administrator"
        };

        for (int i = 0; i < roleNames.length; i++) {
            if (!roleRepository.existsByName(roleNames[i])) {
                Role role = new Role(roleNames[i], descriptions[i]);
                roleRepository.save(role);
                log.info("Created role: {}", roleNames[i]);
            }
        }

        log.info("✅ All default roles initialized");
    }

    private void initializeDefaultAdmin() {
        // Create default admin if no admin exists
        if (adminRepository.count() == 0) {
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            Admin admin = new Admin();
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setEmail("admin@healthguardian.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(adminRole);
            admin.setIsActive(true);
            admin.setIsProfileComplete(true);
            admin.setAccessLevel(2); // Super Admin
            admin.setDepartment("System Management");

            adminRepository.save(admin);
            log.info("✅ Default admin created - Email: admin@healthguardian.com | Password: Admin@123");
        }
    }
}