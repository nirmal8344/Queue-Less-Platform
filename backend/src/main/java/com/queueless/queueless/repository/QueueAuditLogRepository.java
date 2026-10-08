package com.queueless.queueless.repository;

import com.queueless.queueless.model.QueueAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueueAuditLogRepository extends JpaRepository<QueueAuditLog, Long> {
    List<QueueAuditLog> findByTokenIdOrderByTimestampDesc(Long tokenId);
    List<QueueAuditLog> findAllByOrderByTimestampDesc();
}
