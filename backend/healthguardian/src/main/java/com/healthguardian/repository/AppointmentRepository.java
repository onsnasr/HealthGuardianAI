package com.healthguardian.repository;

import com.healthguardian.entity.Appointment;
import com.healthguardian.entity.Appointment.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // ✅ CORRIGÉ : Ajout de JOIN FETCH pour éviter les problèmes de lazy loading
    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.patient " +
            "JOIN FETCH a.doctor " +
            "WHERE a.patient.id = :patientId " +
            "ORDER BY a.appointmentDate DESC")
    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(@Param("patientId") Long patientId);

    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.patient " +
            "JOIN FETCH a.doctor " +
            "WHERE a.doctor.id = :doctorId " +
            "ORDER BY a.appointmentDate DESC")
    List<Appointment> findByDoctorIdOrderByAppointmentDateDesc(@Param("doctorId") Long doctorId);

    List<Appointment> findByStatus(AppointmentStatus status);

    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.patient " +
            "JOIN FETCH a.doctor " +
            "WHERE a.doctor.id = :doctorId AND a.status = :status " +
            "ORDER BY a.appointmentDate ASC")
    List<Appointment> findByDoctorIdAndStatusOrderByAppointmentDateAsc(
            @Param("doctorId") Long doctorId,
            @Param("status") AppointmentStatus status
    );

    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.patient " +
            "JOIN FETCH a.doctor " +
            "WHERE a.patient.id = :patientId AND a.status = :status " +
            "ORDER BY a.appointmentDate DESC")
    List<Appointment> findByPatientIdAndStatusOrderByAppointmentDateDesc(
            @Param("patientId") Long patientId,
            @Param("status") AppointmentStatus status
    );

    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.patient " +
            "JOIN FETCH a.doctor " +
            "WHERE a.doctor.id = :doctorId AND a.status = :status " +
            "ORDER BY a.createdAt DESC")
    List<Appointment> findByDoctorIdAndStatusOrderByCreatedAtDesc(
            @Param("doctorId") Long doctorId,
            @Param("status") AppointmentStatus status
    );

    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.patient " +
            "JOIN FETCH a.doctor " +
            "WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date")
    List<Appointment> findByDoctorIdAndAppointmentDate(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date
    );

    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.patient " +
            "JOIN FETCH a.doctor " +
            "WHERE a.doctor.id = :doctorId " +
            "AND a.appointmentDate >= :date AND a.status = :status " +
            "ORDER BY a.appointmentDate ASC, a.appointmentTime ASC")
    List<Appointment> findUpcomingAppointments(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("status") AppointmentStatus status
    );

    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.patient " +
            "JOIN FETCH a.doctor " +
            "WHERE a.patient.id = :patientId " +
            "AND a.appointmentDate >= :date " +
            "ORDER BY a.appointmentDate ASC, a.appointmentTime ASC")
    List<Appointment> findUpcomingPatientAppointments(
            @Param("patientId") Long patientId,
            @Param("date") LocalDate date
    );

    long countByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId " +
            "AND a.appointmentDate = :date AND a.appointmentTime = :time " +
            "AND a.status IN ('PENDING', 'CONFIRMED')")
    long countConflictingAppointments(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("time") java.time.LocalTime time
    );

    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.patient " +
            "JOIN FETCH a.doctor " +
            "WHERE a.doctor.id = :doctorId " +
            "AND a.appointmentDate BETWEEN :startDate AND :endDate " +
            "ORDER BY a.appointmentDate ASC, a.appointmentTime ASC")
    List<Appointment> findByDoctorAndDateRange(
            @Param("doctorId") Long doctorId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.patient " +
            "JOIN FETCH a.doctor " +
            "WHERE a.doctor.id = :doctorId " +
            "AND a.appointmentDate = :today AND a.status = 'CONFIRMED' " +
            "ORDER BY a.appointmentTime ASC")
    List<Appointment> findTodayAppointments(
            @Param("doctorId") Long doctorId,
            @Param("today") LocalDate today
    );
}