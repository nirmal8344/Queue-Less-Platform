package com.queueless.queueless.repository;

import com.queueless.queueless.model.QueueStatus;
import com.queueless.queueless.model.QueueToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueTokenRepository extends JpaRepository<QueueToken, Long> {

    List<QueueToken> findByBranchIdOrderByIssueTimeDesc(Long branchId);

    List<QueueToken> findByCustomerIdOrderByIssueTimeDesc(Long customerId);

    Optional<QueueToken> findByTokenNumberAndBranchId(String tokenNumber, Long branchId);

    @Query("SELECT q FROM QueueToken q WHERE q.branchId = :branchId AND q.status = 'WAITING' ORDER BY q.priorityCategory DESC, q.issueTime ASC")
    List<QueueToken> findWaitingTokensForBranch(@Param("branchId") Long branchId);

    @Query("SELECT q FROM QueueToken q WHERE q.branchId = :branchId AND q.serviceId IN :serviceIds AND q.status = 'WAITING' ORDER BY q.priorityCategory DESC, q.issueTime ASC")
    List<QueueToken> findWaitingTokensForServices(@Param("branchId") Long branchId, @Param("serviceIds") List<Long> serviceIds);

    @Query("SELECT q FROM QueueToken q WHERE q.branchId = :branchId AND q.status IN ('CALLED', 'AT_COUNTER', 'IN_SERVICE', 'PAUSED') ORDER BY q.calledTime DESC")
    List<QueueToken> findActiveServingTokensForBranch(@Param("branchId") Long branchId);

    @Query("SELECT q FROM QueueToken q WHERE q.branchId = :branchId AND q.status IN ('WAITING', 'CALLED', 'AT_COUNTER', 'IN_SERVICE', 'PAUSED') ORDER BY q.issueTime ASC")
    List<QueueToken> findLiveQueueForBranch(@Param("branchId") Long branchId);

    @Query("SELECT q FROM QueueToken q WHERE q.branchId = :branchId AND q.status = 'COMPLETED' ORDER BY q.serviceEndTime DESC")
    List<QueueToken> findRecentCompletedForBranch(@Param("branchId") Long branchId);

    @Query("SELECT COUNT(q) FROM QueueToken q WHERE q.branchId = :branchId AND q.status = 'WAITING' AND (q.priorityCategory > :priority OR (q.priorityCategory = :priority AND q.issueTime < :issueTime))")
    long countAheadInQueue(@Param("branchId") Long branchId, @Param("priority") com.queueless.queueless.model.PriorityCategory priority, @Param("issueTime") LocalDateTime issueTime);

    @Query("SELECT COUNT(q) FROM QueueToken q WHERE q.customerId = :customerId AND q.status IN ('WAITING', 'CALLED', 'AT_COUNTER', 'IN_SERVICE', 'PAUSED')")
    long countActiveCustomerTokens(@Param("customerId") Long customerId);

    @Query("SELECT q FROM QueueToken q WHERE q.branchId = :branchId AND q.issueTime >= :startOfDay AND q.issueTime <= :endOfDay ORDER BY q.issueTime DESC")
    List<QueueToken> findTokensForDay(@Param("branchId") Long branchId, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    List<QueueToken> findByStatus(QueueStatus status);
}
