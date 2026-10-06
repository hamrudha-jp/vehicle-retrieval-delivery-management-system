package com.vehicle.retrieval.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateRetrievalRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    private Double pickupLatitude;
    private Double pickupLongitude;

    @NotBlank(message = "Destination address is required")
    private String destinationAddress;

    private Double destinationLatitude;
    private Double destinationLongitude;

    @NotNull(message = "Scheduled pickup date and time is required")
    private LocalDateTime scheduledPickupTime;

    private String specialInstructions;
}
