package com.queueless.queueless.repository;

import com.queueless.queueless.model.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByBranchIdAndActiveTrue(Long branchId);
    List<ServiceEntity> findByBranchId(Long branchId);
    List<ServiceEntity> findByActiveTrue();
}
