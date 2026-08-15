package com.healthguardian.entity;

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

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🧪 TEST D'INTÉGRATION - Appointment Entity
 * 
 * 🎯 OBJECTIF: Tester la persistance, les méthodes métier, et les statuts
 * 
 * 💡 COUVERTURE:
 * - Méthodes métier (isPending, isConfirmed, isRejected, etc.)
 * - @PrePersist et @PreUpdate
 * - Relations avec SimpleUser et Doctor
 * - Enum AppointmentStatus
 * - Timestamps automatiques
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("Appointment Entity - Tests d'Intégration")
class AppointmentTest {

    @Autowired
    private TestEntityManager entityManager;

    private Appointment testAppointment;
    private SimpleUser testPatient;
    private Doctor testDoctor;

    @BeforeEach
    void setUp() {
        // Créer un Role
        Role simpleUserRole = new Role();
        simpleUserRole.setName("SIMPLE_USER");
        entityManager.persist(simpleUserRole);

        Role doctorRole = new Role();
        doctorRole.setName("DOCTOR");
        entityManager.persist(doctorRole);

        // Créer un patient
        testPatient = new SimpleUser();
        testPatient.setFirstName("John");
        testPatient.setLastName("Patient");
        testPatient.setEmail("patient@test.com");
        testPatient.setPassword("password123");
        testPatient.setPhoneNumber("1234567890");
        testPatient.setIsActive(true);
        testPatient.setRole(simpleUserRole);
        testPatient = entityManager.persist(testPatient);

        // Créer un docteur
        testDoctor = new Doctor();
        testDoctor.setFirstName("Dr. Jane");
        testDoctor.setLastName("Doctor");
        testDoctor.setEmail("doctor@test.com");
        testDoctor.setPassword("password123");
        testDoctor.setSpecialty("Cardiology");
        testDoctor.setLicenseNumber("LIC123");
        testDoctor.setIsActive(true);
        testDoctor.setRole(doctorRole);
        testDoctor = entityManager.persist(testDoctor);

        // Créer un rendez-vous de test
        testAppointment = new Appointment();
        testAppointment.setPatient(testPatient);
        testAppointment.setDoctor(testDoctor);
        testAppointment.setAppointmentDate(LocalDate.now().plusDays(7));
        testAppointment.setAppointmentTime(LocalTime.of(10, 0));
        testAppointment.setAppointmentType("Consultation");
        testAppointment.setPatientName("John Patient");
        testAppointment.setPatientPhone("1234567890");
        testAppointment.setPatientEmail("patient@test.com");
        testAppointment.setDoctorName("Dr. Jane Doctor");
        testAppointment.setDoctorSpecialty("Cardiology");
        testAppointment.setReason("Regular checkup");
    }


    @Test
    @DisplayName("✅ @PrePersist - Devrait définir status par défaut et timestamps")
    void testPrePersist() {
        // ACT
        Appointment savedAppointment = entityManager.persistAndFlush(testAppointment);

        // ASSERT
        assertNotNull(savedAppointment.getId());
        assertEquals(Appointment.AppointmentStatus.PENDING, savedAppointment.getStatus());
        assertNotNull(savedAppointment.getCreatedAt());
        assertNotNull(savedAppointment.getUpdatedAt());
    }

    @Test
    @DisplayName("✅ isPending() - Devrait retourner true pour status PENDING")
    void testIsPending() {
        // ARRANGE
        testAppointment.setStatus(Appointment.AppointmentStatus.PENDING);

        // ASSERT
        assertTrue(testAppointment.isPending());
        assertFalse(testAppointment.isConfirmed());
        assertFalse(testAppointment.isRejected());
        assertFalse(testAppointment.isCompleted());
        assertFalse(testAppointment.isCancelled());
    }

    @Test
    @DisplayName("✅ isConfirmed() - Devrait retourner true pour status CONFIRMED")
    void testIsConfirmed() {
        // ARRANGE
        testAppointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);

        // ASSERT
        assertTrue(testAppointment.isConfirmed());
        assertFalse(testAppointment.isPending());
        assertFalse(testAppointment.isRejected());
    }

    @Test
    @DisplayName("✅ isRejected() - Devrait retourner true pour status REJECTED")
    void testIsRejected() {
        // ARRANGE
        testAppointment.setStatus(Appointment.AppointmentStatus.REJECTED);

        // ASSERT
        assertTrue(testAppointment.isRejected());
        assertFalse(testAppointment.isPending());
        assertFalse(testAppointment.isConfirmed());
    }

    @Test
    @DisplayName("✅ isCompleted() - Devrait retourner true pour status COMPLETED")
    void testIsCompleted() {
        // ARRANGE
        testAppointment.setStatus(Appointment.AppointmentStatus.COMPLETED);

        // ASSERT
        assertTrue(testAppointment.isCompleted());
        assertFalse(testAppointment.isPending());
        assertFalse(testAppointment.isCancelled());
    }

    @Test
    @DisplayName("✅ isCancelled() - Devrait retourner true pour status CANCELLED")
    void testIsCancelled() {
        // ARRANGE
        testAppointment.setStatus(Appointment.AppointmentStatus.CANCELLED);

        // ASSERT
        assertTrue(testAppointment.isCancelled());
        assertFalse(testAppointment.isPending());
        assertFalse(testAppointment.isCompleted());
    }

    @Test
    @DisplayName("✅ @PreUpdate - Devrait mettre à jour updatedAt")
    void testPreUpdate() throws InterruptedException {
        // ARRANGE
        Appointment savedAppointment = entityManager.persistAndFlush(testAppointment);
        var originalUpdatedAt = savedAppointment.getUpdatedAt();
        
        Thread.sleep(10);

        // ACT
        savedAppointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        Appointment updatedAppointment = entityManager.persistAndFlush(savedAppointment);

        // ASSERT
        assertNotNull(updatedAppointment.getUpdatedAt());
        assertEquals(Appointment.AppointmentStatus.CONFIRMED, updatedAppointment.getStatus());
    }

    @Test
    @DisplayName("✅ Relationships - Devrait maintenir les relations avec Patient et Doctor")
    void testRelationships() {
        // ACT
        Appointment savedAppointment = entityManager.persistAndFlush(testAppointment);
        entityManager.clear();

        Appointment foundAppointment = entityManager.find(Appointment.class, savedAppointment.getId());

        // ASSERT
        assertNotNull(foundAppointment);
        assertNotNull(foundAppointment.getPatient());
        assertNotNull(foundAppointment.getDoctor());
        assertEquals(testPatient.getId(), foundAppointment.getPatient().getId());
        assertEquals(testDoctor.getId(), foundAppointment.getDoctor().getId());
    }

    @Test
    @DisplayName("✅ All Status Methods - Tester tous les états")
    void testAllStatusMethods() {
        // Test PENDING
        testAppointment.setStatus(Appointment.AppointmentStatus.PENDING);
        assertTrue(testAppointment.isPending());

        // Test CONFIRMED
        testAppointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        assertTrue(testAppointment.isConfirmed());

        // Test REJECTED
        testAppointment.setStatus(Appointment.AppointmentStatus.REJECTED);
        assertTrue(testAppointment.isRejected());

        // Test COMPLETED
        testAppointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
        assertTrue(testAppointment.isCompleted());

        // Test CANCELLED
        testAppointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        assertTrue(testAppointment.isCancelled());
    }

    @Test
    @DisplayName("✅ Enum Values - Tester tous les statuts disponibles")
    void testAppointmentStatusEnum() {
        // ACT
        Appointment.AppointmentStatus[] statuses = Appointment.AppointmentStatus.values();

        // ASSERT
        assertEquals(5, statuses.length);
        assertEquals(Appointment.AppointmentStatus.PENDING, statuses[0]);
        assertEquals(Appointment.AppointmentStatus.CONFIRMED, statuses[1]);
        assertEquals(Appointment.AppointmentStatus.REJECTED, statuses[2]);
        assertEquals(Appointment.AppointmentStatus.COMPLETED, statuses[3]);
        assertEquals(Appointment.AppointmentStatus.CANCELLED, statuses[4]);
    }

    @Test
    @DisplayName("✅ Persistence - Devrait sauvegarder toutes les données")
    void testPersistence() {
        // ACT
        Appointment savedAppointment = entityManager.persistAndFlush(testAppointment);
        entityManager.clear();

        Appointment foundAppointment = entityManager.find(Appointment.class, savedAppointment.getId());

        // ASSERT
        assertNotNull(foundAppointment);
        assertEquals("Regular checkup", foundAppointment.getReason());
        assertEquals("Consultation", foundAppointment.getAppointmentType());
        assertEquals("John Patient", foundAppointment.getPatientName());
        assertEquals("Dr. Jane Doctor", foundAppointment.getDoctorName());
        assertEquals("Cardiology", foundAppointment.getDoctorSpecialty());
    }
}
