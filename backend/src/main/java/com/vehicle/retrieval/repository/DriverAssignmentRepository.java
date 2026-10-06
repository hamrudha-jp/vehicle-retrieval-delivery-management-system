package com.vehicle.retrieval.repository;

import com.vehicle.retrieval.entity.DriverAssignment;
import com.vehicle.retrieval.entity.RetrievalRequest;
import com.vehicle.retrieval.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverAssignmentRepository extends JpaRepository<DriverAssignment, Long> {
    Optional<DriverAssignment> findByRequest(RetrievalRequest request);
    Optional<DriverAssignment> findByRequestId(Long requestId);
    List<DriverAssignment> findByDriverOrderByAssignedAtDesc(User driver);
    List<DriverAssignment> findByDriverIdOrderByAssignedAtDesc(Long driverId);
    Boolean existsByRequestId(Long requestId);
}
