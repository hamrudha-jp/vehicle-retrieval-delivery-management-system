package com.vehicle.retrieval.service;

import com.vehicle.retrieval.dto.ReviewResponse;
import com.vehicle.retrieval.dto.SubmitReviewRequest;
import com.vehicle.retrieval.entity.DriverReview;
import com.vehicle.retrieval.entity.RetrievalRequest;
import com.vehicle.retrieval.entity.User;
import com.vehicle.retrieval.entity.enums.RequestStatus;
import com.vehicle.retrieval.repository.DriverAssignmentRepository;
import com.vehicle.retrieval.repository.DriverReviewRepository;
import com.vehicle.retrieval.repository.RetrievalRequestRepository;
import com.vehicle.retrieval.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final DriverReviewRepository reviewRepository;
    private final RetrievalRequestRepository requestRepository;
    private final DriverAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse submitReview(String ownerEmail, SubmitReviewRequest requestDto) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("Owner user not found"));

        RetrievalRequest request = requestRepository.findById(requestDto.getRequestId())
                .orElseThrow(() -> new RuntimeException("Retrieval request not found with ID: " + requestDto.getRequestId()));

        // Security check: Only request owner can submit review
        if (!request.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Unauthorized: Only the vehicle owner who created this request can submit a review");
        }

        // Request must be DELIVERED
        if (request.getStatus() != RequestStatus.DELIVERED) {
            throw new RuntimeException("Reviews can only be submitted after vehicle delivery is confirmed");
        }

        // Check duplicate review
        if (reviewRepository.existsByRequestId(request.getId())) {
            throw new RuntimeException("Duplicate Review: A review has already been submitted for this retrieval request");
        }

        // Find assigned driver
        User driver = assignmentRepository.findByRequestId(request.getId())
                .map(assignment -> assignment.getDriver())
                .orElseThrow(() -> new RuntimeException("No driver found assigned to this request"));

        DriverReview review = DriverReview.builder()
                .request(request)
                .owner(owner)
                .driver(driver)
                .rating(requestDto.getRating())
                .comment(requestDto.getComment())
                .build();

        DriverReview saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ReviewResponse getReviewByRequestId(Long requestId) {
        return reviewRepository.findByRequestId(requestId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDriverReviewsAndRating(Long driverId) {
        List<DriverReview> reviews = reviewRepository.findByDriverId(driverId);
        Double avgRating = reviewRepository.getAverageRatingForDriver(driverId);

        List<ReviewResponse> responseList = reviews.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("driverId", driverId);
        result.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        result.put("totalReviews", reviews.size());
        result.put("reviews", responseList);

        return result;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(DriverReview r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .requestId(r.getRequest() != null ? r.getRequest().getId() : null)
                .ownerId(r.getOwner() != null ? r.getOwner().getId() : null)
                .ownerName(r.getOwner() != null ? r.getOwner().getName() : "Owner")
                .driverId(r.getDriver() != null ? r.getDriver().getId() : null)
                .driverName(r.getDriver() != null ? r.getDriver().getName() : "Driver")
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
