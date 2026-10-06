package com.vehicle.retrieval.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VehicleRequest {

    @NotBlank(message = "Vehicle make is required (e.g. Toyota, Honda)")
    private String make;

    @NotBlank(message = "Vehicle model is required (e.g. Camry, Civic)")
    private String model;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotNull(message = "Vehicle manufacturing year is required")
    @Min(value = 1990, message = "Year must be 1990 or later")
    @Max(value = 2030, message = "Year cannot be in distant future")
    private Integer vehicleYear;

    @NotBlank(message = "Color is required")
    private String color;

    @NotBlank(message = "Vehicle type is required (e.g. SEDAN, SUV, HATCHBACK, BIKE)")
    private String vehicleType;
}
