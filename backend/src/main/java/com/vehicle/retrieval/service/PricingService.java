package com.vehicle.retrieval.service;

import com.vehicle.retrieval.dto.CostEstimateResponse;
import com.vehicle.retrieval.dto.EstimateCostRequest;
import com.vehicle.retrieval.entity.Vehicle;
import com.vehicle.retrieval.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PricingService {

    private final VehicleRepository vehicleRepository;

    private static final double BASE_SERVICE_FEE = 300.0;
    private static final double PER_KM_RATE = 18.0;
    private static final double DEFAULT_FALLBACK_DISTANCE = 15.0; // km fallback if coords missing

    public CostEstimateResponse calculateEstimate(EstimateCostRequest request) {
        String vehicleType = request.getVehicleType();
        if ((vehicleType == null || vehicleType.isBlank()) && request.getVehicleId() != null) {
            vehicleType = vehicleRepository.findById(request.getVehicleId())
                    .map(Vehicle::getVehicleType)
                    .orElse("SEDAN");
        }

        double distanceKm = calculateDistanceKm(
                request.getPickupLatitude(), request.getPickupLongitude(),
                request.getDestinationLatitude(), request.getDestinationLongitude()
        );

        int durationMinutes = calculateDurationMinutes(distanceKm);
        double vehicleMultiplier = getVehicleMultiplier(vehicleType);
        double distanceCharge = Math.round(distanceKm * PER_KM_RATE * 100.0) / 100.0;
        double totalCost = Math.round((BASE_SERVICE_FEE + distanceCharge) * vehicleMultiplier);

        return CostEstimateResponse.builder()
                .distanceKm(Math.round(distanceKm * 100.0) / 100.0)
                .durationMinutes(durationMinutes)
                .baseFee(BASE_SERVICE_FEE)
                .distanceCharge(distanceCharge)
                .vehicleMultiplier(vehicleMultiplier)
                .totalEstimatedCost(totalCost)
                .build();
    }

    public double calculateDistanceKm(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return DEFAULT_FALLBACK_DISTANCE;
        }

        if (lat1.equals(lat2) && lon1.equals(lon2)) {
            return 2.5; // Minimum 2.5 km for same spot / local neighborhood
        }

        final int EARTH_RADIUS_KM = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double straightDistance = EARTH_RADIUS_KM * c;

        // Apply 1.25x road network detour factor to simulate actual road travel route
        double roadDistance = straightDistance * 1.25;

        return Math.max(2.5, Math.round(roadDistance * 100.0) / 100.0);
    }

    public int calculateDurationMinutes(double distanceKm) {
        // Average urban/highway travel speed ~40 km/h + 15 min buffer
        int drivingMins = (int) Math.round((distanceKm / 40.0) * 60.0);
        return drivingMins + 15;
    }

    public double getVehicleMultiplier(String vehicleType) {
        if (vehicleType == null) return 1.0;
        switch (vehicleType.toUpperCase().trim()) {
            case "SUV":
            case "TRUCK":
                return 1.25;
            case "HATCHBACK":
                return 0.95;
            case "BIKE":
            case "MOTORCYCLE":
                return 0.75;
            case "SEDAN":
            default:
                return 1.0;
        }
    }
}
