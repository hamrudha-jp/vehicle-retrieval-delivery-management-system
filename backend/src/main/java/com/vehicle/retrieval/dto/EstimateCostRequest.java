package com.vehicle.retrieval.dto;

import lombok.Data;

@Data
public class EstimateCostRequest {
    private Long vehicleId;
    private String vehicleType; // Optional if vehicleId provided
    private Double pickupLatitude;
    private Double pickupLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
}
