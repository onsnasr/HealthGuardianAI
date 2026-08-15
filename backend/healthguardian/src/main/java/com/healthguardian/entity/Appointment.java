package com.healthguardian.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ CHANGÉ : EAGER → LAZY pour améliorer les performances
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private SimpleUser patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Doctor doctor;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;

    @Column(name = "appointment_type", length = 100)
    private String appointmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    // Patient Information
    @Column(name = "patient_name", nullable = false, length = 100)
    private String patientName;

    @Column(name = "patient_phone", nullable = false, length = 20)
    private String patientPhone;

    @Column(name = "patient_email", nullable = false, length = 100)
    private String patientEmail;

    // ✅ AJOUTÉ : Informations docteur dénormalisées
    @Column(name = "doctor_name", length = 100)
    private String doctorName;

    @Column(name = "doctor_specialty", length = 100)
    private String doctorSpecialty;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = AppointmentStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isPending() {
        return status == AppointmentStatus.PENDING;
    }

    public boolean isConfirmed() {
        return status == AppointmentStatus.CONFIRMED;
    }

    public boolean isRejected() {
        return status == AppointmentStatus.REJECTED;
    }

    public boolean isCompleted() {
        return status == AppointmentStatus.COMPLETED;
    }

    public boolean isCancelled() {
        return status == AppointmentStatus.CANCELLED;
    }

    public enum AppointmentStatus {
        PENDING,
        CONFIRMED,
        REJECTED,
        COMPLETED,
        CANCELLED
    }
}