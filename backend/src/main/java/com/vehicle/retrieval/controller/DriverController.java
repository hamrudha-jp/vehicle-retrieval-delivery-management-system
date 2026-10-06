package com.vehicle.retrieval.controller;

import com.vehicle.retrieval.dto.ApiResponse;
import com.vehicle.retrieval.dto.DriverProfileRequest;
import com.vehicle.retrieval.dto.DriverProfileResponse;
import com.vehicle.retrieval.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<DriverProfileResponse>> createOrUpdateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody DriverProfileRequest request) {
        DriverProfileResponse response = driverService.createOrUpdateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Driver profile submitted successfully", response));
    }

    @GetMapping("/profile/me")
    public ResponseEntity<ApiResponse<DriverProfileResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        DriverProfileResponse response = driverService.getDriverProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Fetched driver profile", response));
    }
}
