package com.vehicle.retrieval.repository;

import com.vehicle.retrieval.entity.RetrievalRequest;
import com.vehicle.retrieval.entity.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RetrievalRequestRepository extends JpaRepository<RetrievalRequest, Long> {
    List<RetrievalRequest> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<RetrievalRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);
    List<RetrievalRequest> findAllByOrderByCreatedAtDesc();
}
