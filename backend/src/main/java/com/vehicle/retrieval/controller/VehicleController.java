package com.vehicle.retrieval.controller;

import com.vehicle.retrieval.dto.ApiResponse;
import com.vehicle.retrieval.dto.VehicleRequest;
import com.vehicle.retrieval.dto.VehicleResponse;
import com.vehicle.retrieval.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> addVehicle(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VehicleRequest request) {
        VehicleResponse response = vehicleService.addVehicle(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle registered successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getMyVehicles(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<VehicleResponse> list = vehicleService.getMyVehicles(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Fetched user vehicles", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        VehicleResponse response = vehicleService.getVehicleById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Fetched vehicle details", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        vehicleService.deleteVehicle(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully"));
    }
}
