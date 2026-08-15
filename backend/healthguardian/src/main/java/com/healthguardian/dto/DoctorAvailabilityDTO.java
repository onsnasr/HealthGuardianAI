package com.healthguardian.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorAvailabilityDTO {
    private Long id;
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotNull(message = "Availability status is required")
    private Boolean isAvailable;

    @Min(value = 15, message = "Slot duration must be at least 15 minutes")
    @Max(value = 120, message = "Slot duration cannot exceed 120 minutes")
    private Integer slotDurationMinutes;
}