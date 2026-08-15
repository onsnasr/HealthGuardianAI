package com.healthguardian.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplyTemplateDTO {

    @NotNull
    private TemplateType templateType;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @Min(15)
    @Max(120)
    private Integer slotDurationMinutes = 30;

    public enum TemplateType {
        WEEKDAYS_ONLY,      // Lun-Ven
        WEEKENDS_ONLY,      // Sam-Dim
        ALL_DAYS,           // Tous les jours
        MORNING_ONLY,       // Matins seulement
        AFTERNOON_ONLY      // Après-midis seulement
    }
}
