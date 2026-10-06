package com.vehicle.retrieval.dto;

import com.vehicle.retrieval.entity.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RetrievalRequestResponse {
    private Long id;
    private UserResponse owner;
    private VehicleResponse vehicle;
    private String pickupAddress;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private String destinationAddress;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private LocalDateTime scheduledPickupTime;
    private String specialInstructions;
    private RequestStatus status;
    private Double estimatedDistanceKm;
    private Integer estimatedDurationMinutes;
    private Double estimatedCost;
    private UserResponse assignedDriver;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
