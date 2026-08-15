package com.healthguardian.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

/**
 * Représente la relation entre un docteur et ses patients
 * Un patient devient "patient du docteur" après le premier rendez-vous complété
 */
@Entity
@Table(name = "doctor_patients", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"doctor_id", "patient_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorPatient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private SimpleUser patient;

    // Informations dénormalisées pour performance
    @Column(name = "patient_name", length = 100)
    private String patientName;

    @Column(name = "patient_email", length = 100)
    private String patientEmail;

    @Column(name = "patient_phone", length = 20)
    private String patientPhone;

    @Column(name = "first_appointment_id")
    private Long firstAppointmentId;

    @Column(name = "first_appointment_date")
    private LocalDateTime firstAppointmentDate;

    @Column(name = "last_appointment_id")
    private Long lastAppointmentId;

    @Column(name = "last_appointment_date")
    private LocalDateTime lastAppointmentDate;

    @Column(name = "total_appointments")
    private Integer totalAppointments = 0;

    @Column(name = "completed_appointments")
    private Integer completedAppointments = 0;

    @Column(name = "cancelled_appointments")
    private Integer cancelledAppointments = 0;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
        if (totalAppointments == null) {
            totalAppointments = 0;
        }
        if (completedAppointments == null) {
            completedAppointments = 0;
        }
        if (cancelledAppointments == null) {
            cancelledAppointments = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Incrémenter le compteur de rendez-vous complétés
     */
    public void incrementCompletedAppointments(Long appointmentId, LocalDateTime appointmentDate) {
        this.completedAppointments++;
        this.totalAppointments++;
        this.lastAppointmentId = appointmentId;
        this.lastAppointmentDate = appointmentDate;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Incrémenter le compteur de rendez-vous annulés
     */
    public void incrementCancelledAppointments() {
        this.cancelledAppointments++;
        this.totalAppointments++;
        this.updatedAt = LocalDateTime.now();
    }
}