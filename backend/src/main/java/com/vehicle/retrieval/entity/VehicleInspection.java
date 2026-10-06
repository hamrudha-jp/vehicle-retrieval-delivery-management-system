package com.vehicle.retrieval.entity;

import com.vehicle.retrieval.entity.enums.InspectionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_inspections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private RetrievalRequest request;

    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_type", nullable = false, length = 20)
    private InspectionType inspectionType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inspector_id", nullable = false)
    private User inspector;

    @Column(name = "odometer_reading", nullable = false)
    private Double odometerReading;

    @Column(name = "fuel_level", nullable = false, length = 50)
    private String fuelLevel;

    @Column(name = "condition_notes", columnDefinition = "TEXT")
    private String conditionNotes;

    @Column(name = "photo_urls", columnDefinition = "TEXT")
    private String photoUrls;

    @CreationTimestamp
    @Column(name = "inspected_at", updatable = false)
    private LocalDateTime inspectedAt;
}
