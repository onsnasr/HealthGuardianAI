package com.healthguardian.dto;

import com.healthguardian.entity.Appointment.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    @Size(max = 500)
    private String rejectionReason;

    @Size(max = 1000)
    private String notes;
}