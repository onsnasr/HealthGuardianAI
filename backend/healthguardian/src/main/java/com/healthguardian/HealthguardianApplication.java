package com.healthguardian;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HealthguardianApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealthguardianApplication.class, args);
        System.out.println("\n" +
                "╔═══════════════════════════════════════════════════════════╗\n" +
                "║                                                           ║\n" +
                "║        🏥 HealthGuardian AI - Backend Started 🏥         ║\n" +
                "║                                                           ║\n" +
                "║  ✅ Server: http://localhost:8080                        ║\n" +
                "║  ✅ Default Admin: admin@healthguardian.com              ║\n" +
                "║  ✅ Password: Admin@123                                  ║\n" +
                "║                                                           ║\n" +
                "║  📚 API Endpoints:                                       ║\n" +
                "║     - POST /api/auth/signup                              ║\n" +
                "║     - POST /api/auth/signin                              ║\n" +
                "║     - GET  /api/users/me                                 ║\n" +
                "║     - GET  /api/admin/users (Admin only)                ║\n" +
                "║                                                           ║\n" +
                "╚═══════════════════════════════════════════════════════════╝\n");
    }

}
