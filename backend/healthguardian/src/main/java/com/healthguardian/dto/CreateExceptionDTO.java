package com.healthguardian.dto;

import com.healthguardian.entity.DoctorAvailabilityException.ExceptionType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateExceptionDTO {

    @NotNull(message = "Exception date is required")
    @FutureOrPresent(message = "Exception date must be today or in the future")
    private LocalDate exceptionDate;

    @FutureOrPresent(message = "End date must be today or in the future")
    private LocalDate exceptionEndDate; // Optionnel : pour plages de dates

    @NotBlank(message = "Reason is required")
    @Size(max = 255)
    private String reason;

    @NotNull(message = "Exception type is required")
    private ExceptionType exceptionType;
}