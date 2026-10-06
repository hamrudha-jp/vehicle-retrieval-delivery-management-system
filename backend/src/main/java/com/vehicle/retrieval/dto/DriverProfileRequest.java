package com.vehicle.retrieval.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DriverProfileRequest {

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotNull(message = "Experience years is required")
    @Min(value = 1, message = "Experience years must be at least 1")
    private Integer experienceYears;
}
