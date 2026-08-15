package com.healthguardian.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity pour gérer les exceptions de disponibilité (congés, jours fériés, etc.)
 */
@Entity
@Table(name = "doctor_availability_exceptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAvailabilityException {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Doctor doctor;

    @Column(name = "exception_date", nullable = false)
    private LocalDate exceptionDate;

    @Column(name = "exception_end_date")
    private LocalDate exceptionEndDate; // Pour les plages de dates (vacances)

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = false; // false = bloqué

    @Enumerated(EnumType.STRING)
    @Column(name = "exception_type")
    private ExceptionType exceptionType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ExceptionType {
        VACATION,      // Vacances
        SICK_LEAVE,    // Congé maladie
        CONFERENCE,    // Conférence
        EMERGENCY,     // Urgence
        HOLIDAY,       // Jour férié
        OTHER          // Autre
    }

    /**
     * Vérifie si une date donnée est dans la plage d'exception
     */
    public boolean isDateInRange(LocalDate date) {
        if (exceptionEndDate == null) {
            // Exception pour un seul jour
            return date.equals(exceptionDate);
        } else {
            // Exception pour une plage de dates
            return !date.isBefore(exceptionDate) && !date.isAfter(exceptionEndDate);
        }
    }
}