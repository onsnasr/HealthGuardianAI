package com.healthguardian.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * UserHealthHabits Entity - Health habits and preferences for SimpleUser
 * One-to-One relationship with SimpleUser (cascade delete)
 */
@Entity
@Table(name = "user_health_habits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserHealthHabits {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One-to-One relationship with SimpleUser
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private SimpleUser user;

    // ==================== Habitudes de sommeil ====================
    
    @NotNull(message = "Hours of sleep is required")
    @DecimalMin(value = "0.0", message = "Hours of sleep must be at least 0")
    @DecimalMax(value = "24.0", message = "Hours of sleep cannot exceed 24 hours")
    @Column(name = "hours_of_sleep", nullable = false, precision = 4, scale = 2)
    private BigDecimal hoursOfSleep;

    @NotBlank(message = "Bedtime hour is required")
    @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Bedtime must be in HH:MM format (00:00-23:59)")
    @Column(name = "bedtime_hour", nullable = false, length = 5)
    private String bedtimeHour;

    // ==================== Activité physique ====================
    
    @NotNull(message = "Exercise hours per week is required")
    @DecimalMin(value = "0.0", message = "Exercise hours must be at least 0")
    @DecimalMax(value = "168.0", message = "Exercise hours cannot exceed 168 hours per week")
    @Column(name = "exercise_hours_per_week", nullable = false, precision = 4, scale = 2)
    private BigDecimal exerciseHoursPerWeek = BigDecimal.ZERO;

    @NotNull(message = "Daily steps is required")
    @Min(value = 0, message = "Daily steps must be at least 0")
    @Max(value = 100000, message = "Daily steps cannot exceed 100,000")
    @Column(name = "daily_steps", nullable = false)
    private Integer dailySteps = 0;

    // ==================== Hydratation et stimulants ====================
    
    @NotNull(message = "Water intake is required")
    @DecimalMin(value = "0.0", message = "Water intake must be at least 0")
    @DecimalMax(value = "20.0", message = "Water intake cannot exceed 20 liters per day")
    @Column(name = "litres_eau_jour", nullable = false, precision = 4, scale = 2)
    private BigDecimal litresEauJour = BigDecimal.ZERO;

    @NotNull(message = "Coffee intake is required")
    @Min(value = 0, message = "Coffee cups must be at least 0")
    @Max(value = 20, message = "Coffee cups cannot exceed 20 per day")
    @Column(name = "cafe_jour", nullable = false)
    private Integer cafeJour = 0;

    // ==================== Travail ====================
    
    @NotNull(message = "Work hours per day is required")
    @DecimalMin(value = "0.0", message = "Work hours must be at least 0")
    @DecimalMax(value = "24.0", message = "Work hours cannot exceed 24 hours per day")
    @Column(name = "heures_travail_jour", nullable = false, precision = 4, scale = 2)
    private BigDecimal heuresTravailJour = BigDecimal.ZERO;

    @Pattern(regexp = "^(Bureau|Manuel|Mixte)$", message = "Job type must be: Bureau, Manuel, or Mixte")
    @Column(name = "job_type", length = 50)
    private String jobType;

    @Pattern(regexp = "^(Actif|Sédentaire|Très actif)$", message = "Activity status must be: Actif, Sédentaire, or Très actif")
    @Column(name = "activity_status", length = 50)
    private String activityStatus;

    // ==================== Données médicales ====================
    
    @Min(value = 70, message = "Systolic BP must be at least 70 mmHg")
    @Max(value = 250, message = "Systolic BP cannot exceed 250 mmHg")
    @Column(name = "bp_systolic")
    private Integer bpSystolic;

    @Min(value = 40, message = "Diastolic BP must be at least 40 mmHg")
    @Max(value = 150, message = "Diastolic BP cannot exceed 150 mmHg")
    @Column(name = "bp_diastolic")
    private Integer bpDiastolic;

    // ==================== Timestamps ====================
    
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

    // ==================== Custom Validation ====================
    
    /**
     * Validates that systolic BP is higher than diastolic BP
     */
    @AssertTrue(message = "Systolic blood pressure must be higher than diastolic")
    public boolean isBloodPressureValid() {
        if (bpSystolic == null || bpDiastolic == null) {
            return true; // Skip validation if values are null
        }
        return bpSystolic > bpDiastolic;
    }

}
