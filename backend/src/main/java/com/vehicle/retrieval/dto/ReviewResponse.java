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
public class ReviewResponse {
    private Long id;
    private Long requestId;
    private Long ownerId;
    private String ownerName;
    private Long driverId;
    private String driverName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
