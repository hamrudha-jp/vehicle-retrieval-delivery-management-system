package com.vehicle.retrieval.dto;

import com.vehicle.retrieval.entity.enums.InspectionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleInspectionResponse {
    private Long id;
    private Long requestId;
    private InspectionType inspectionType;
    private String inspectorName;
    private Double odometerReading;
    private String fuelLevel;
    private String conditionNotes;
    private String photoUrls;
    private LocalDateTime inspectedAt;
}
