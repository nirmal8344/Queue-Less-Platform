package com.queueless.queueless.repository;

import com.queueless.queueless.model.Counter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CounterRepository extends JpaRepository<Counter, Long> {
    List<Counter> findByBranchId(Long branchId);
    List<Counter> findByBranchIdAndStatus(Long branchId, String status);
    List<Counter> findByAssignedStaffId(Long staffId);
}
