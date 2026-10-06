package com.vehicle.retrieval.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Long id;
    private Long ownerId;
    private String make;
    private String model;
    private String registrationNumber;
    private Integer vehicleYear;
    private String color;
    private String vehicleType;
    private LocalDateTime createdAt;
}
