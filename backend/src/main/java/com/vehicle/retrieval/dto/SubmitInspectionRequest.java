package com.vehicle.retrieval.dto;

import com.vehicle.retrieval.entity.enums.InspectionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitInspectionRequest {

    @NotNull(message = "Inspection type is required (PRE_TRIP or POST_TRIP)")
    private InspectionType inspectionType;

    @NotNull(message = "Odometer reading is required")
    @Min(value = 0, message = "Odometer reading cannot be negative")
    private Double odometerReading;

    @NotBlank(message = "Fuel level is required")
    private String fuelLevel;

    private String conditionNotes;

    private String photoUrls;
}
