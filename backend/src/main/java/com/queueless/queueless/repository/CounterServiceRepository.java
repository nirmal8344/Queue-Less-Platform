package com.queueless.queueless.repository;

import com.queueless.queueless.model.CounterServiceMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CounterServiceRepository extends JpaRepository<CounterServiceMapping, Long> {
    List<CounterServiceMapping> findByCounterId(Long counterId);
    List<CounterServiceMapping> findByServiceId(Long serviceId);
    void deleteByCounterId(Long counterId);
    boolean existsByCounterIdAndServiceId(Long counterId, Long serviceId);
}
