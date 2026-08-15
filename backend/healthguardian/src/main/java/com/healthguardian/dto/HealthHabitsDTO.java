package com.healthguardian.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for creating or updating UserHealthHabits
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthHabitsDTO {

    // ==================== Habitudes de sommeil ====================
    
    @NotNull(message = "HOURS_OF_SLEEP_REQUIRED")
    @DecimalMin(value = "0.0", message = "HOURS_OF_SLEEP_MIN")
    @DecimalMax(value = "24.0", message = "HOURS_OF_SLEEP_MAX")
    private BigDecimal hoursOfSleep;

    @NotBlank(message = "BEDTIME_REQUIRED")
    @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", message = "BEDTIME_FORMAT_INVALID")
    private String bedtimeHour;

    // ==================== Activité physique ====================
    
    @NotNull(message = "EXERCISE_HOURS_REQUIRED")
    @DecimalMin(value = "0.0", message = "EXERCISE_HOURS_MIN")
    @DecimalMax(value = "168.0", message = "EXERCISE_HOURS_MAX")
    private BigDecimal exerciseHoursPerWeek;

    @NotNull(message = "DAILY_STEPS_REQUIRED")
    @Min(value = 0, message = "DAILY_STEPS_MIN")
    @Max(value = 100000, message = "DAILY_STEPS_MAX")
    private Integer dailySteps;

    // ==================== Hydratation et stimulants ====================
    
    @NotNull(message = "WATER_INTAKE_REQUIRED")
    @DecimalMin(value = "0.0", message = "WATER_INTAKE_MIN")
    @DecimalMax(value = "20.0", message = "WATER_INTAKE_MAX")
    private BigDecimal litresEauJour;

    @NotNull(message = "COFFEE_INTAKE_REQUIRED")
    @Min(value = 0, message = "COFFEE_INTAKE_MIN")
    @Max(value = 20, message = "COFFEE_INTAKE_MAX")
    private Integer cafeJour;

    // ==================== Travail ====================
    
    @NotNull(message = "WORK_HOURS_REQUIRED")
    @DecimalMin(value = "0.0", message = "WORK_HOURS_MIN")
    @DecimalMax(value = "24.0", message = "WORK_HOURS_MAX")
    private BigDecimal heuresTravailJour;

    @Pattern(regexp = "^(Bureau|Manuel|Mixte)$", message = "JOB_TYPE_INVALID")
    private String jobType;

    @Pattern(regexp = "^(Actif|Sédentaire|Très actif)$", message = "ACTIVITY_STATUS_INVALID")
    private String activityStatus;

    // ==================== Données médicales ====================
    
    @Min(value = 70, message = "BP_SYSTOLIC_MIN")
    @Max(value = 250, message = "BP_SYSTOLIC_MAX")
    private Integer bpSystolic;

    @Min(value = 40, message = "BP_DIASTOLIC_MIN")
    @Max(value = 150, message = "BP_DIASTOLIC_MAX")
    private Integer bpDiastolic;

}
