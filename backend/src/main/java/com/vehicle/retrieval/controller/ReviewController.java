package com.vehicle.retrieval.controller;

import com.vehicle.retrieval.dto.ApiResponse;
import com.vehicle.retrieval.dto.ReviewResponse;
import com.vehicle.retrieval.dto.SubmitReviewRequest;
import com.vehicle.retrieval.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<ReviewResponse>> submitReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SubmitReviewRequest request) {
        ReviewResponse response = reviewService.submitReview(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Driver review submitted successfully", response));
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewByRequestId(@PathVariable Long requestId) {
        ReviewResponse response = reviewService.getReviewByRequestId(requestId);
        return ResponseEntity.ok(ApiResponse.success("Fetched request review", response));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDriverReviews(@PathVariable Long driverId) {
        Map<String, Object> response = reviewService.getDriverReviewsAndRating(driverId);
        return ResponseEntity.ok(ApiResponse.success("Fetched driver reviews and rating", response));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getAllReviews() {
        List<ReviewResponse> response = reviewService.getAllReviews();
        return ResponseEntity.ok(ApiResponse.success("Fetched system reviews", response));
    }
}
