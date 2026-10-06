package com.vehicle.retrieval.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostEstimateResponse {
    private Double distanceKm;
    private Integer durationMinutes;
    private Double baseFee;
    private Double distanceCharge;
    private Double vehicleMultiplier;
    private Double totalEstimatedCost;
}
