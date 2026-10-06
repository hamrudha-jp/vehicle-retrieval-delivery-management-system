package com.vehicle.retrieval.service;

import com.vehicle.retrieval.dto.*;
import com.vehicle.retrieval.entity.*;
import com.vehicle.retrieval.entity.enums.RequestStatus;
import com.vehicle.retrieval.entity.enums.Role;
import com.vehicle.retrieval.entity.enums.VerificationStatus;
import com.vehicle.retrieval.exception.BadRequestException;
import com.vehicle.retrieval.exception.ResourceNotFoundException;
import com.vehicle.retrieval.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RetrievalRequestService {

    private final RetrievalRequestRepository requestRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final DriverAssignmentRepository assignmentRepository;
    private final AuthService authService;
    private final VehicleService vehicleService;
    private final PricingService pricingService;
    private final PaymentService paymentService;

    @Transactional
    public RetrievalRequestResponse createRequest(String ownerEmail, CreateRetrievalRequest requestDto) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", ownerEmail));

        Vehicle vehicle = vehicleRepository.findByIdAndOwnerId(requestDto.getVehicleId(), owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", requestDto.getVehicleId()));

        // Calculate distance, duration and cost estimate using PricingService
        EstimateCostRequest estimateReq = new EstimateCostRequest();
        estimateReq.setVehicleId(vehicle.getId());
        estimateReq.setVehicleType(vehicle.getVehicleType());
        estimateReq.setPickupLatitude(requestDto.getPickupLatitude());
        estimateReq.setPickupLongitude(requestDto.getPickupLongitude());
        estimateReq.setDestinationLatitude(requestDto.getDestinationLatitude());
        estimateReq.setDestinationLongitude(requestDto.getDestinationLongitude());

        CostEstimateResponse estimate = pricingService.calculateEstimate(estimateReq);

        RetrievalRequest request = RetrievalRequest.builder()
                .owner(owner)
                .vehicle(vehicle)
                .pickupAddress(requestDto.getPickupAddress())
                .pickupLatitude(requestDto.getPickupLatitude())
                .pickupLongitude(requestDto.getPickupLongitude())
                .destinationAddress(requestDto.getDestinationAddress())
                .destinationLatitude(requestDto.getDestinationLatitude())
                .destinationLongitude(requestDto.getDestinationLongitude())
                .scheduledPickupTime(requestDto.getScheduledPickupTime())
                .specialInstructions(requestDto.getSpecialInstructions())
                .status(RequestStatus.CREATED)
                .estimatedDistanceKm(estimate.getDistanceKm())
                .estimatedDurationMinutes(estimate.getDurationMinutes())
                .estimatedCost(estimate.getTotalEstimatedCost())
                .build();

        RetrievalRequest saved = requestRepository.save(request);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RetrievalRequestResponse> getOwnerRequests(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", ownerEmail));

        return requestRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RetrievalRequestResponse> getAvailableRequestsForDrivers(String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", driverEmail));

        DriverProfile profile = driverProfileRepository.findByUser(driver)
                .orElseThrow(() -> new BadRequestException("Driver profile not found. Please complete profile setup first."));

        if (profile.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new BadRequestException("Your driver profile is not approved yet. Verification status: " + profile.getVerificationStatus());
        }

        return requestRepository.findByStatusOrderByCreatedAtDesc(RequestStatus.CREATED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RetrievalRequestResponse> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RetrievalRequestResponse getRequestById(Long id, String userEmail) {
        RetrievalRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RetrievalRequest", "id", id));

        if (userEmail != null && !userEmail.isBlank()) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

            boolean isOwner = request.getOwner().getId().equals(user.getId());
            boolean isAssignedDriver = assignmentRepository.findByRequest(request)
                    .map(a -> a.getDriver().getId().equals(user.getId()))
                    .orElse(false);
            boolean isAdmin = user.getRole() == Role.ADMIN;

            if (!isOwner && !isAssignedDriver && !isAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("Unauthorized: You do not have permission to view this request.");
            }
        }

        return mapToResponse(request);
    }

    @Transactional(readOnly = true)
    public RetrievalRequestResponse getRequestById(Long id) {
        return getRequestById(id, null);
    }

    @Transactional
    public RetrievalRequestResponse acceptRequest(Long requestId, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", driverEmail));

        DriverProfile profile = driverProfileRepository.findByUser(driver)
                .orElseThrow(() -> new BadRequestException("Driver profile not found. Please submit driver credentials first."));

        if (profile.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new BadRequestException("Only approved drivers can accept retrieval requests.");
        }

        RetrievalRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("RetrievalRequest", "id", requestId));

        if (request.getStatus() != RequestStatus.CREATED) {
            throw new BadRequestException("This request is no longer available (Status: " + request.getStatus() + ")");
        }

        if (assignmentRepository.existsByRequestId(requestId)) {
            throw new BadRequestException("This request has already been assigned to another driver.");
        }

        request.setStatus(RequestStatus.ACCEPTED);
        requestRepository.save(request);

        DriverAssignment assignment = DriverAssignment.builder()
                .request(request)
                .driver(driver)
                .status("ASSIGNED")
                .build();
        assignmentRepository.save(assignment);

        return mapToResponse(request);
    }

    @Transactional
    public RetrievalRequestResponse updateRequestStatus(Long requestId, RequestStatus newStatus, String userEmail) {
        RetrievalRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("RetrievalRequest", "id", requestId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        // Authorization Checks
        Optional<DriverAssignment> assignmentOpt = assignmentRepository.findByRequest(request);
        User assignedDriver = assignmentOpt.map(DriverAssignment::getDriver).orElse(null);

        boolean isAssignedDriver = assignedDriver != null && assignedDriver.getId().equals(user.getId());
        boolean isOwner = request.getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (newStatus == RequestStatus.IN_PROGRESS || newStatus == RequestStatus.DESTINATION_REACHED) {
            if (!isAssignedDriver && !isAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("Unauthorized: Only the assigned driver can update trip status to " + newStatus);
            }
        } else if (newStatus == RequestStatus.DELIVERED) {
            if (!isOwner && !isAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("Unauthorized: Only the vehicle owner can confirm delivery");
            }
        }

        // Enforce strict state machine transitions
        if (newStatus == RequestStatus.IN_PROGRESS) {
            if (request.getStatus() != RequestStatus.INSPECTION_PENDING) {
                throw new BadRequestException("Cannot start trip until Pickup OTP is verified and Pre-Trip Inspection is completed (Current Status: " + request.getStatus() + ")");
            }
        } else if (newStatus == RequestStatus.DESTINATION_REACHED) {
            if (request.getStatus() != RequestStatus.IN_PROGRESS) {
                throw new BadRequestException("Can only mark destination reached while trip is IN_PROGRESS (Current Status: " + request.getStatus() + ")");
            }
        } else if (newStatus == RequestStatus.DELIVERED) {
            if (request.getStatus() != RequestStatus.POST_INSPECTION_PENDING) {
                throw new BadRequestException("Cannot complete delivery until Delivery OTP is verified and Post-Trip Inspection is completed (Current Status: " + request.getStatus() + ")");
            }
        }

        request.setStatus(newStatus);
        RetrievalRequest saved = requestRepository.save(request);

        if (newStatus == RequestStatus.DELIVERED) {
            try {
                paymentService.createPendingPaymentForRequest(saved);
            } catch (Exception e) {
                // Log or ignore if payment initialization fails quietly
            }
        }

        return mapToResponse(saved);
    }

    public RetrievalRequestResponse mapToResponse(RetrievalRequest request) {
        UserResponse ownerResponse = authService.mapToUserResponse(request.getOwner());
        VehicleResponse vehicleResponse = vehicleService.mapToVehicleResponse(request.getVehicle());

        UserResponse driverResponse = null;
        Optional<DriverAssignment> assignment = assignmentRepository.findByRequest(request);
        if (assignment.isPresent()) {
            driverResponse = authService.mapToUserResponse(assignment.get().getDriver());
        }

        return RetrievalRequestResponse.builder()
                .id(request.getId())
                .owner(ownerResponse)
                .vehicle(vehicleResponse)
                .pickupAddress(request.getPickupAddress())
                .pickupLatitude(request.getPickupLatitude())
                .pickupLongitude(request.getPickupLongitude())
                .destinationAddress(request.getDestinationAddress())
                .destinationLatitude(request.getDestinationLatitude())
                .destinationLongitude(request.getDestinationLongitude())
                .scheduledPickupTime(request.getScheduledPickupTime())
                .specialInstructions(request.getSpecialInstructions())
                .status(request.getStatus())
                .estimatedDistanceKm(request.getEstimatedDistanceKm())
                .estimatedDurationMinutes(request.getEstimatedDurationMinutes())
                .estimatedCost(request.getEstimatedCost())
                .assignedDriver(driverResponse)
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
