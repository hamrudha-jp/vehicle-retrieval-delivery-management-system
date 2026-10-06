package com.vehicle.retrieval.service;

import com.vehicle.retrieval.dto.SubmitInspectionRequest;
import com.vehicle.retrieval.dto.VehicleInspectionResponse;
import com.vehicle.retrieval.entity.DriverAssignment;
import com.vehicle.retrieval.entity.RetrievalRequest;
import com.vehicle.retrieval.entity.User;
import com.vehicle.retrieval.entity.VehicleInspection;
import com.vehicle.retrieval.entity.enums.InspectionType;
import com.vehicle.retrieval.entity.enums.RequestStatus;
import com.vehicle.retrieval.exception.BadRequestException;
import com.vehicle.retrieval.exception.ResourceNotFoundException;
import com.vehicle.retrieval.repository.DriverAssignmentRepository;
import com.vehicle.retrieval.repository.RetrievalRequestRepository;
import com.vehicle.retrieval.repository.UserRepository;
import com.vehicle.retrieval.repository.VehicleInspectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InspectionService {

    private final VehicleInspectionRepository inspectionRepository;
    private final RetrievalRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final DriverAssignmentRepository assignmentRepository;

    @Transactional
    public VehicleInspectionResponse submitInspection(Long requestId, SubmitInspectionRequest requestDto, String inspectorEmail) {
        RetrievalRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("RetrievalRequest", "id", requestId));

        User inspector = userRepository.findByEmail(inspectorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", inspectorEmail));

        DriverAssignment assignment = assignmentRepository.findByRequest(request)
                .orElseThrow(() -> new BadRequestException("No driver assigned to this request."));

        if (!assignment.getDriver().getId().equals(inspector.getId())) {
            throw new BadRequestException("Only the assigned driver can submit vehicle inspection records.");
        }

        if (requestDto.getInspectionType() == InspectionType.PRE_TRIP) {
            if (request.getStatus() != RequestStatus.PICKUP_VERIFIED && request.getStatus() != RequestStatus.INSPECTION_PENDING) {
                throw new BadRequestException("Pickup OTP must be verified before submitting Pre-Trip Inspection (Current Status: " + request.getStatus() + ")");
            }
        } else if (requestDto.getInspectionType() == InspectionType.POST_TRIP) {
            if (request.getStatus() != RequestStatus.DELIVERY_VERIFIED && request.getStatus() != RequestStatus.POST_INSPECTION_PENDING) {
                throw new BadRequestException("Delivery OTP must be verified before submitting Post-Trip Inspection (Current Status: " + request.getStatus() + ")");
            }
        }

        VehicleInspection inspection = inspectionRepository.findByRequestIdAndInspectionType(requestId, requestDto.getInspectionType())
                .orElse(null);

        if (inspection == null) {
            inspection = VehicleInspection.builder()
                    .request(request)
                    .inspectionType(requestDto.getInspectionType())
                    .inspector(inspector)
                    .odometerReading(requestDto.getOdometerReading())
                    .fuelLevel(requestDto.getFuelLevel())
                    .conditionNotes(requestDto.getConditionNotes())
                    .photoUrls(requestDto.getPhotoUrls())
                    .build();
        } else {
            inspection.setOdometerReading(requestDto.getOdometerReading());
            inspection.setFuelLevel(requestDto.getFuelLevel());
            inspection.setConditionNotes(requestDto.getConditionNotes());
            inspection.setPhotoUrls(requestDto.getPhotoUrls());
        }

        VehicleInspection saved = inspectionRepository.save(inspection);

        // Update Request State Machine
        if (requestDto.getInspectionType() == InspectionType.PRE_TRIP) {
            request.setStatus(RequestStatus.INSPECTION_PENDING);
        } else if (requestDto.getInspectionType() == InspectionType.POST_TRIP) {
            request.setStatus(RequestStatus.POST_INSPECTION_PENDING);
        }
        requestRepository.save(request);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<VehicleInspectionResponse> getInspections(Long requestId) {
        return inspectionRepository.findByRequestId(requestId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private VehicleInspectionResponse mapToResponse(VehicleInspection inspection) {
        return VehicleInspectionResponse.builder()
                .id(inspection.getId())
                .requestId(inspection.getRequest().getId())
                .inspectionType(inspection.getInspectionType())
                .inspectorName(inspection.getInspector().getName())
                .odometerReading(inspection.getOdometerReading())
                .fuelLevel(inspection.getFuelLevel())
                .conditionNotes(inspection.getConditionNotes())
                .photoUrls(inspection.getPhotoUrls())
                .inspectedAt(inspection.getInspectedAt())
                .build();
    }
}
