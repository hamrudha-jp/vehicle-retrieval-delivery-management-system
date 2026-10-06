package com.vehicle.retrieval.repository;

import com.vehicle.retrieval.entity.VehicleInspection;
import com.vehicle.retrieval.entity.enums.InspectionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleInspectionRepository extends JpaRepository<VehicleInspection, Long> {
    Optional<VehicleInspection> findByRequestIdAndInspectionType(Long requestId, InspectionType inspectionType);
    List<VehicleInspection> findByRequestId(Long requestId);
}
