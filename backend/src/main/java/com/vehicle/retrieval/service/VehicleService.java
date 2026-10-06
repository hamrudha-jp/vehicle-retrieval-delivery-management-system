package com.vehicle.retrieval.service;

import com.vehicle.retrieval.dto.VehicleRequest;
import com.vehicle.retrieval.dto.VehicleResponse;
import com.vehicle.retrieval.entity.User;
import com.vehicle.retrieval.entity.Vehicle;
import com.vehicle.retrieval.exception.BadRequestException;
import com.vehicle.retrieval.exception.ResourceNotFoundException;
import com.vehicle.retrieval.repository.UserRepository;
import com.vehicle.retrieval.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    @Transactional
    public VehicleResponse addVehicle(String ownerEmail, VehicleRequest request) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", ownerEmail));

        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new BadRequestException("Vehicle registration number already exists!");
        }

        Vehicle vehicle = Vehicle.builder()
                .owner(owner)
                .make(request.getMake())
                .model(request.getModel())
                .registrationNumber(request.getRegistrationNumber().toUpperCase().trim())
                .vehicleYear(request.getVehicleYear())
                .color(request.getColor())
                .vehicleType(request.getVehicleType().toUpperCase().trim())
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToVehicleResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getMyVehicles(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", ownerEmail));

        return vehicleRepository.findByOwner(owner).stream()
                .map(this::mapToVehicleResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Long vehicleId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", ownerEmail));

        Vehicle vehicle = vehicleRepository.findByIdAndOwnerId(vehicleId, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        return mapToVehicleResponse(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long vehicleId, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", ownerEmail));

        Vehicle vehicle = vehicleRepository.findByIdAndOwnerId(vehicleId, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        vehicleRepository.delete(vehicle);
    }

    public VehicleResponse mapToVehicleResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .ownerId(vehicle.getOwner().getId())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .registrationNumber(vehicle.getRegistrationNumber())
                .vehicleYear(vehicle.getVehicleYear())
                .color(vehicle.getColor())
                .vehicleType(vehicle.getVehicleType())
                .createdAt(vehicle.getCreatedAt())
                .build();
    }
}
