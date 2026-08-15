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
public class UpdateDayAvailabilityDTO {

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Availability status is required")
    private Boolean isAvailable;

    private LocalTime startTime;
    private LocalTime endTime;

    @Min(15)
    @Max(120)
    private Integer slotDurationMinutes;
}