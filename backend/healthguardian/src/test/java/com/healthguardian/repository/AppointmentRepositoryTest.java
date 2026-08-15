package com.healthguardian.repository;

import com.healthguardian.entity.Appointment;
import com.healthguardian.entity.Appointment.AppointmentStatus;
import com.healthguardian.entity.Doctor;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.entity.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🔗 TEST D'INTÉGRATION - AppointmentRepository
 * Tests des requêtes complexes pour les rendez-vous
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("AppointmentRepository - Tests d'Intégration")
class AppointmentRepositoryTest {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Doctor testDoctor;
    private SimpleUser testPatient;
    private Appointment testAppointment;

    @BeforeEach
    void setUp() {
        appointmentRepository.deleteAll();

        // Créer Roles
        Role doctorRole = new Role();
        doctorRole.setName("DOCTOR");
        entityManager.persist(doctorRole);

        Role patientRole = new Role();
        patientRole.setName("PATIENT");
        entityManager.persist(patientRole);

        // Créer et persister un docteur
        testDoctor = new Doctor();
        testDoctor.setFirstName("Dr. John");
        testDoctor.setLastName("Doe");
        testDoctor.setEmail("doctor@test.com");
        testDoctor.setPassword("password123");  // ← FIX validation
        testDoctor.setSpecialty("Cardiology");
        testDoctor.setLicenseNumber("LIC123");
        testDoctor.setRole(doctorRole); // FIX: Role required
        testDoctor = entityManager.persistAndFlush(testDoctor);

        // Créer et persister un patient
        testPatient = new SimpleUser();
        testPatient.setFirstName("Jane");
        testPatient.setLastName("Patient");
        testPatient.setEmail("patient@test.com");
        testPatient.setPassword("password");
        testPatient.setIsProfileComplete(true);
        testPatient.setRole(patientRole); // FIX: Role required
        testPatient = entityManager.persistAndFlush(testPatient);

        // Créer un rendez-vous
        testAppointment = new Appointment();
        testAppointment.setDoctor(testDoctor);
        testAppointment.setPatient(testPatient);
        testAppointment.setAppointmentDate(LocalDate.now().plusDays(1));
        testAppointment.setAppointmentTime(LocalTime.of(10, 0));
        testAppointment.setStatus(AppointmentStatus.PENDING);
        testAppointment.setPatientName("Jane Patient");
        testAppointment.setPatientPhone("123456789"); // FIX: Required field
        testAppointment.setPatientEmail("patient@test.com"); // FIX: Required field
        testAppointment.setDoctorName("Dr. John Doe");
    }

    @Test
    @DisplayName("✅ findByDoctorIdAndStatusOrderByCreatedAtDesc() - Filtrer par statut")
    void testFindByDoctorIdAndStatus() {
        appointmentRepository.save(testAppointment);

        List<Appointment> pending = appointmentRepository
            .findByDoctorIdAndStatusOrderByCreatedAtDesc(testDoctor.getId(), AppointmentStatus.PENDING);

        assertEquals(1, pending.size());
        assertEquals(AppointmentStatus.PENDING, pending.get(0).getStatus());
    }

    @Test
    @DisplayName("✅ countConflictingAppointments() - Détecter conflits")
    void testCountConflictingAppointments() {
        appointmentRepository.save(testAppointment);

        long conflicts = appointmentRepository.countConflictingAppointments(
            testDoctor.getId(),
            testAppointment.getAppointmentDate(),
            testAppointment.getAppointmentTime()
        );

        assertEquals(1, conflicts); // Le rendez-vous lui-même
    }

    @Test
    @DisplayName("✅ findByPatientIdOrderByAppointmentDateDesc() - Rendez-vous patient")
    void testFindByPatientId() {
        appointmentRepository.save(testAppointment);

        List<Appointment> appointments = appointmentRepository
            .findByPatientIdOrderByAppointmentDateDesc(testPatient.getId());

        assertEquals(1, appointments.size());
        assertEquals(testPatient.getId(), appointments.get(0).getPatient().getId());
    }
}
