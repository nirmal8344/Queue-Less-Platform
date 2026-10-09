package com.queueless.queueless.service;

import com.queueless.queueless.dto.QueueDisplayDTO;
import com.queueless.queueless.dto.QueueTokenDTO;
import com.queueless.queueless.dto.WalkInTokenRequest;
import com.queueless.queueless.exception.BadRequestException;
import com.queueless.queueless.exception.ResourceNotFoundException;
import com.queueless.queueless.model.*;
import com.queueless.queueless.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class QueueService {

    private final QueueTokenRepository tokenRepository;
    private final QueueAuditLogRepository auditLogRepository;
    private final BranchRepository branchRepository;
    private final ServiceRepository serviceRepository;
    private final CounterRepository counterRepository;
    private final CounterServiceRepository counterServiceRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final QueueBroadcastService broadcastService;

    // In-memory counter for daily tokens per branch (e.g. A-101, B-102)
    private final AtomicInteger dailySequence = new AtomicInteger(100);

    public QueueService(QueueTokenRepository tokenRepository,
                        QueueAuditLogRepository auditLogRepository,
                        BranchRepository branchRepository,
                        ServiceRepository serviceRepository,
                        CounterRepository counterRepository,
                        CounterServiceRepository counterServiceRepository,
                        UserRepository userRepository,
                        AppointmentRepository appointmentRepository,
                        NotificationService notificationService,
                        QueueBroadcastService broadcastService) {
        this.tokenRepository = tokenRepository;
        this.auditLogRepository = auditLogRepository;
        this.branchRepository = branchRepository;
        this.serviceRepository = serviceRepository;
        this.counterRepository = counterRepository;
        this.counterServiceRepository = counterServiceRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
        this.broadcastService = broadcastService;
    }

    @Transactional
    public QueueTokenDTO generateWalkInToken(Long customerId, WalkInTokenRequest request) {
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (!service.isActive()) {
            throw new BadRequestException("This service is currently unavailable.");
        }

        // Generate token prefix based on service code or name
        String prefix = (service.getCode() != null && !service.getCode().isBlank()) ?
                service.getCode().substring(0, 1).toUpperCase() : "T";
        int nextNum = dailySequence.incrementAndGet();
        String tokenNum = prefix + "-" + nextNum;

        QueueToken token = new QueueToken();
        token.setTokenNumber(tokenNum);
        token.setBranchId(request.getBranchId());
        token.setServiceId(request.getServiceId());
        token.setPriorityCategory(request.getPriorityCategory() != null ? request.getPriorityCategory() : PriorityCategory.GENERAL);
        token.setStatus(QueueStatus.WAITING);
        token.setIssueTime(LocalDateTime.now());
        token.setNotes(request.getNotes());

        if (customerId != null) {
            userRepository.findById(customerId).ifPresent(u -> {
                token.setCustomerId(u.getId());
                token.setCustomerName(u.getName());
                token.setCustomerEmail(u.getEmail());
                token.setCustomerPhone(u.getPhone());
            });
        } else {
            token.setCustomerName(request.getCustomerName() != null ? request.getCustomerName() : "Walk-in Guest");
            token.setCustomerPhone(request.getCustomerPhone());
            token.setCustomerEmail(request.getCustomerEmail());
        }

        // Calculate estimated wait time based on waiting queue & open counters
        int estWait = calculateEstimatedWaitTime(branch.getId(), service.getId(), token.getPriorityCategory(), token.getIssueTime());
        token.setEstimatedWaitMinutes(estWait);

        QueueToken saved = tokenRepository.save(token);

        // Audit log
        createAuditLog(saved.getId(), null, QueueStatus.WAITING, customerId, saved.getCustomerName(), "CUSTOMER", "Walk-in token issued");

        // Send notification
        if (saved.getCustomerId() != null) {
            String msg = String.format("Your token #%s has been issued for %s at %s. Estimated wait: ~%d mins.",
                    saved.getTokenNumber(), service.getName(), branch.getName(), estWait);
            notificationService.createAndSendNotification(saved.getCustomerId(), "Token Issued", msg, "TOKEN_GENERATED", saved.getId(), null);
        }

        broadcastUpdates(saved.getBranchId());

        return toDTO(saved);
    }

    @Transactional
    public QueueTokenDTO checkInAppointment(Long appointmentId, Long customerId) {
        Appointment apt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (apt.getStatus() == AppointmentStatus.CANCELLED || apt.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Appointment is already " + apt.getStatus());
        }

        ServiceEntity service = serviceRepository.findById(apt.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        Branch branch = branchRepository.findById(apt.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        apt.setStatus(AppointmentStatus.WAITING);
        apt.setCheckInTime(LocalDateTime.now());
        appointmentRepository.save(apt);

        String prefix = "A";
        int nextNum = dailySequence.incrementAndGet();
        String tokenNum = prefix + "-" + nextNum;

        QueueToken token = new QueueToken();
        token.setTokenNumber(tokenNum);
        token.setBranchId(apt.getBranchId());
        token.setServiceId(apt.getServiceId());
        token.setAppointmentId(apt.getId());
        token.setCustomerId(apt.getCustomerId());
        token.setCustomerName(apt.getCustomerName());
        token.setCustomerEmail(apt.getCustomerEmail());
        token.setCustomerPhone(apt.getCustomerPhone());
        token.setPriorityCategory(PriorityCategory.SPECIAL_APPOINTMENT); // Appointments receive appointment priority
        token.setStatus(QueueStatus.WAITING);
        token.setIssueTime(LocalDateTime.now());

        int estWait = calculateEstimatedWaitTime(branch.getId(), service.getId(), token.getPriorityCategory(), token.getIssueTime());
        token.setEstimatedWaitMinutes(estWait);

        QueueToken saved = tokenRepository.save(token);

        createAuditLog(saved.getId(), null, QueueStatus.WAITING, customerId, saved.getCustomerName(), "CUSTOMER", "Appointment check-in token issued");

        if (saved.getCustomerId() != null) {
            String msg = String.format("Checked in successfully! Your token is #%s for appointment %s. Estimated wait: ~%d mins.",
                    saved.getTokenNumber(), apt.getReferenceCode(), estWait);
            notificationService.createAndSendNotification(saved.getCustomerId(), "Checked In - Token #" + saved.getTokenNumber(), msg, "TOKEN_GENERATED", saved.getId(), apt.getId());
        }

        broadcastUpdates(saved.getBranchId());

        return toDTO(saved);
    }

    @Transactional
    public QueueTokenDTO callNextToken(Long branchId, Long counterId, Long staffId, Long preferredServiceId) {
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new ResourceNotFoundException("Counter not found"));
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));

        List<Long> supportedServiceIds;
        if (preferredServiceId != null) {
            supportedServiceIds = List.of(preferredServiceId);
        } else {
            supportedServiceIds = counterServiceRepository.findByCounterId(counterId)
                    .stream().map(CounterServiceMapping::getServiceId).collect(Collectors.toList());
        }

        List<QueueToken> waiting;
        if (supportedServiceIds.isEmpty()) {
            waiting = tokenRepository.findWaitingTokensForBranch(branchId);
        } else {
            waiting = tokenRepository.findWaitingTokensForServices(branchId, supportedServiceIds);
        }

        if (waiting.isEmpty()) {
            throw new BadRequestException("No customers currently waiting for this counter/services.");
        }

        QueueToken nextToken = waiting.get(0);
        return callTokenInternal(nextToken, counter, staff);
    }

    @Transactional
    public QueueTokenDTO callSpecificToken(Long tokenId, Long counterId, Long staffId) {
        QueueToken token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found"));
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new ResourceNotFoundException("Counter not found"));
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        if (token.getStatus() != QueueStatus.WAITING && token.getStatus() != QueueStatus.SKIPPED) {
            throw new BadRequestException("Token cannot be called from status: " + token.getStatus());
        }

        return callTokenInternal(token, counter, staff);
    }

    private QueueTokenDTO callTokenInternal(QueueToken token, Counter counter, User staff) {
        QueueStatus prev = token.getStatus();
        token.setStatus(QueueStatus.CALLED);
        token.setCounterId(counter.getId());
        token.setCounterName(counter.getName());
        token.setStaffId(staff.getId());
        token.setStaffName(staff.getName());
        token.setCalledTime(LocalDateTime.now());

        counter.setCurrentTokenId(token.getId());
        counter.setStatus("OPEN");
        counterRepository.save(counter);

        QueueToken saved = tokenRepository.save(token);

        createAuditLog(saved.getId(), prev, QueueStatus.CALLED, staff.getId(), staff.getName(), "STAFF", "Called to " + counter.getName());

        if (saved.getCustomerId() != null) {
            String msg = String.format("Token #%s! Please proceed to %s. Handled by %s.",
                    saved.getTokenNumber(), counter.getName(), staff.getName());
            notificationService.createAndSendNotification(saved.getCustomerId(), "Token Called - " + saved.getTokenNumber(), msg, "TOKEN_CALLED", saved.getId(), saved.getAppointmentId());
        }

        // Notify upcoming tokens in waiting line
        notifyApproachingCustomers(token.getBranchId());

        broadcastUpdates(saved.getBranchId());

        return toDTO(saved);
    }

    @Transactional
    public QueueTokenDTO recallToken(Long tokenId, Long staffId) {
        QueueToken token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found"));
        User staff = userRepository.findById(staffId).orElse(null);
        String staffName = staff != null ? staff.getName() : "Staff";

        QueueStatus prev = token.getStatus();
        token.setStatus(QueueStatus.CALLED);
        token.setCalledTime(LocalDateTime.now());

        QueueToken saved = tokenRepository.save(token);
        createAuditLog(saved.getId(), prev, QueueStatus.CALLED, staffId, staffName, "STAFF", "Token recalled");

        if (saved.getCustomerId() != null) {
            String msg = String.format("Recall Announcement: Token #%s please proceed immediately to %s.",
                    saved.getTokenNumber(), saved.getCounterName() != null ? saved.getCounterName() : "assigned counter");
            notificationService.createAndSendNotification(saved.getCustomerId(), "Recall Announcement: " + saved.getTokenNumber(), msg, "TOKEN_CALLED", saved.getId(), saved.getAppointmentId());
        }

        broadcastUpdates(saved.getBranchId());
        return toDTO(saved);
    }

    @Transactional
    public QueueTokenDTO startService(Long tokenId, Long staffId) {
        QueueToken token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found"));
        User staff = userRepository.findById(staffId).orElse(null);
        String staffName = staff != null ? staff.getName() : "Staff";

        if (token.getStatus() != QueueStatus.CALLED && token.getStatus() != QueueStatus.WAITING) {
            throw new BadRequestException("Cannot start service for token in status: " + token.getStatus());
        }

        QueueStatus prev = token.getStatus();
        token.setStatus(QueueStatus.IN_SERVICE);
        token.setServiceStartTime(LocalDateTime.now());

        QueueToken saved = tokenRepository.save(token);

        if (saved.getAppointmentId() != null) {
            appointmentRepository.findById(saved.getAppointmentId()).ifPresent(a -> {
                a.setStatus(AppointmentStatus.IN_SERVICE);
                appointmentRepository.save(a);
            });
        }

        createAuditLog(saved.getId(), prev, QueueStatus.IN_SERVICE, staffId, staffName, "STAFF", "Service started");
        broadcastUpdates(saved.getBranchId());

        return toDTO(saved);
    }

    @Transactional
    public QueueTokenDTO pauseService(Long tokenId, Long staffId, String remarks) {
        QueueToken token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found"));
        User staff = userRepository.findById(staffId).orElse(null);
        String staffName = staff != null ? staff.getName() : "Staff";

        if (token.getStatus() != QueueStatus.IN_SERVICE && token.getStatus() != QueueStatus.CALLED && token.getStatus() != QueueStatus.AT_COUNTER) {
            throw new BadRequestException("Cannot pause service for token in status: " + token.getStatus());
        }

        QueueStatus prev = token.getStatus();
        token.setStatus(QueueStatus.PAUSED);

        QueueToken saved = tokenRepository.save(token);

        createAuditLog(saved.getId(), prev, QueueStatus.PAUSED, staffId, staffName, "STAFF", remarks != null ? remarks : "Service paused by staff");

        if (saved.getCustomerId() != null) {
            String msg = String.format("Your service for token #%s has been temporarily paused. Staff will resume shortly.", saved.getTokenNumber());
            notificationService.createAndSendNotification(saved.getCustomerId(), "Service Paused", msg, "SERVICE_PAUSED", saved.getId(), saved.getAppointmentId());
        }

        broadcastUpdates(saved.getBranchId());
        return toDTO(saved);
    }

    @Transactional
    public QueueTokenDTO resumeService(Long tokenId, Long staffId) {
        QueueToken token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found"));
        User staff = userRepository.findById(staffId).orElse(null);
        String staffName = staff != null ? staff.getName() : "Staff";

        if (token.getStatus() != QueueStatus.PAUSED) {
            throw new BadRequestException("Cannot resume service for token in status: " + token.getStatus());
        }

        QueueStatus prev = token.getStatus();
        token.setStatus(QueueStatus.IN_SERVICE);

        QueueToken saved = tokenRepository.save(token);

        createAuditLog(saved.getId(), prev, QueueStatus.IN_SERVICE, staffId, staffName, "STAFF", "Service resumed");

        if (saved.getCustomerId() != null) {
            String msg = String.format("Your service for token #%s has been resumed.", saved.getTokenNumber());
            notificationService.createAndSendNotification(saved.getCustomerId(), "Service Resumed", msg, "SERVICE_RESUMED", saved.getId(), saved.getAppointmentId());
        }

        broadcastUpdates(saved.getBranchId());
        return toDTO(saved);
    }

    @Transactional
    public QueueTokenDTO completeService(Long tokenId, Long staffId, String notes) {
        QueueToken token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found"));
        User staff = userRepository.findById(staffId).orElse(null);
        String staffName = staff != null ? staff.getName() : "Staff";

        if (token.getStatus() != QueueStatus.IN_SERVICE && token.getStatus() != QueueStatus.CALLED && token.getStatus() != QueueStatus.PAUSED) {
            throw new BadRequestException("Cannot complete token in status: " + token.getStatus());
        }

        QueueStatus prev = token.getStatus();
        token.setStatus(QueueStatus.COMPLETED);
        token.setServiceEndTime(LocalDateTime.now());
        if (token.getServiceStartTime() == null) {
            token.setServiceStartTime(token.getCalledTime() != null ? token.getCalledTime() : LocalDateTime.now().minusMinutes(5));
        }
        if (notes != null) {
            token.setNotes(notes);
        }

        // Clear counter assignment
        if (token.getCounterId() != null) {
            counterRepository.findById(token.getCounterId()).ifPresent(c -> {
                if (token.getId().equals(c.getCurrentTokenId())) {
                    c.setCurrentTokenId(null);
                    counterRepository.save(c);
                }
            });
        }

        QueueToken saved = tokenRepository.save(token);

        if (saved.getAppointmentId() != null) {
            appointmentRepository.findById(saved.getAppointmentId()).ifPresent(a -> {
                a.setStatus(AppointmentStatus.COMPLETED);
                appointmentRepository.save(a);
            });
        }

        createAuditLog(saved.getId(), prev, QueueStatus.COMPLETED, staffId, staffName, "STAFF", "Service completed. Notes: " + (notes != null ? notes : "None"));

        if (saved.getCustomerId() != null) {
            String msg = String.format("Thank you! Your service for token #%s has been successfully completed.", saved.getTokenNumber());
            notificationService.createAndSendNotification(saved.getCustomerId(), "Service Completed", msg, "SERVICE_COMPLETED", saved.getId(), saved.getAppointmentId());
        }

        broadcastUpdates(saved.getBranchId());
        return toDTO(saved);
    }

    @Transactional
    public QueueTokenDTO skipToken(Long tokenId, Long staffId, String remarks) {
        QueueToken token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found"));
        User staff = userRepository.findById(staffId).orElse(null);
        String staffName = staff != null ? staff.getName() : "Staff";

        QueueStatus prev = token.getStatus();
        token.setStatus(QueueStatus.SKIPPED);

        if (token.getCounterId() != null) {
            counterRepository.findById(token.getCounterId()).ifPresent(c -> {
                if (token.getId().equals(c.getCurrentTokenId())) {
                    c.setCurrentTokenId(null);
                    counterRepository.save(c);
                }
            });
        }

        QueueToken saved = tokenRepository.save(token);
        createAuditLog(saved.getId(), prev, QueueStatus.SKIPPED, staffId, staffName, "STAFF", remarks != null ? remarks : "Customer skipped / not ready");

        if (saved.getCustomerId() != null) {
            String msg = String.format("Your token #%s was skipped because you were not at the counter. You may request staff to recall your token.", saved.getTokenNumber());
            notificationService.createAndSendNotification(saved.getCustomerId(), "Token Skipped", msg, "TOKEN_SKIPPED", saved.getId(), saved.getAppointmentId());
        }

        broadcastUpdates(saved.getBranchId());
        return toDTO(saved);
    }

    @Transactional
    public QueueTokenDTO markNoShow(Long tokenId, Long staffId, String remarks) {
        QueueToken token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found"));
        User staff = userRepository.findById(staffId).orElse(null);
        String staffName = staff != null ? staff.getName() : "Staff";

        QueueStatus prev = token.getStatus();
        token.setStatus(QueueStatus.NO_SHOW);
        token.setServiceEndTime(LocalDateTime.now());

        if (token.getCounterId() != null) {
            counterRepository.findById(token.getCounterId()).ifPresent(c -> {
                if (token.getId().equals(c.getCurrentTokenId())) {
                    c.setCurrentTokenId(null);
                    counterRepository.save(c);
                }
            });
        }

        QueueToken saved = tokenRepository.save(token);

        if (saved.getAppointmentId() != null) {
            appointmentRepository.findById(saved.getAppointmentId()).ifPresent(a -> {
                a.setStatus(AppointmentStatus.NO_SHOW);
                appointmentRepository.save(a);
            });
        }

        createAuditLog(saved.getId(), prev, QueueStatus.NO_SHOW, staffId, staffName, "STAFF", remarks != null ? remarks : "Marked as No-Show");

        if (saved.getCustomerId() != null) {
            String msg = String.format("Token #%s was marked as No-Show after multiple unanswered calls.", saved.getTokenNumber());
            notificationService.createAndSendNotification(saved.getCustomerId(), "Marked as No-Show", msg, "NO_SHOW", saved.getId(), saved.getAppointmentId());
        }

        broadcastUpdates(saved.getBranchId());
        return toDTO(saved);
    }

    @Transactional
    public QueueTokenDTO cancelToken(Long tokenId, Long userId, String remarks) {
        QueueToken token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found"));

        if (token.getStatus() == QueueStatus.COMPLETED || token.getStatus() == QueueStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel token in status: " + token.getStatus());
        }

        QueueStatus prev = token.getStatus();
        token.setStatus(QueueStatus.CANCELLED);
        token.setServiceEndTime(LocalDateTime.now());

        if (token.getCounterId() != null) {
            counterRepository.findById(token.getCounterId()).ifPresent(c -> {
                if (token.getId().equals(c.getCurrentTokenId())) {
                    c.setCurrentTokenId(null);
                    counterRepository.save(c);
                }
            });
        }

        QueueToken saved = tokenRepository.save(token);

        User user = userRepository.findById(userId).orElse(null);
        String userName = user != null ? user.getName() : "User";
        String role = user != null ? user.getRole().name() : "CUSTOMER";

        createAuditLog(saved.getId(), prev, QueueStatus.CANCELLED, userId, userName, role, remarks != null ? remarks : "Cancelled by user");
        broadcastUpdates(saved.getBranchId());
        return toDTO(saved);
    }

    public List<QueueTokenDTO> getWaitingTokens(Long branchId) {
        return tokenRepository.findWaitingTokensForBranch(branchId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<QueueTokenDTO> getLiveQueue(Long branchId) {
        return tokenRepository.findLiveQueueForBranch(branchId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<QueueTokenDTO> getBranchQueue(Long branchId) {
        return tokenRepository.findByBranchIdOrderByIssueTimeDesc(branchId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<QueueTokenDTO> getCustomerTokens(Long customerId) {
        return tokenRepository.findByCustomerIdOrderByIssueTimeDesc(customerId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Optional<QueueTokenDTO> getActiveCustomerToken(Long customerId) {
        List<QueueToken> tokens = tokenRepository.findByCustomerIdOrderByIssueTimeDesc(customerId);
        return tokens.stream()
                .filter(t -> t.getStatus() == QueueStatus.WAITING || t.getStatus() == QueueStatus.CALLED ||
                        t.getStatus() == QueueStatus.AT_COUNTER || t.getStatus() == QueueStatus.IN_SERVICE ||
                        t.getStatus() == QueueStatus.PAUSED || t.getStatus() == QueueStatus.SKIPPED)
                .findFirst()
                .map(this::toDTO);
    }

    public QueueTokenDTO getTokenById(Long id) {
        return toDTO(tokenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Token not found with ID: " + id)));
    }

    public QueueDisplayDTO getQueueDisplay(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        QueueDisplayDTO display = new QueueDisplayDTO();
        display.setBranchId(branch.getId());
        display.setBranchName(branch.getName());

        List<QueueToken> activeServing = tokenRepository.findActiveServingTokensForBranch(branchId);
        List<QueueDisplayDTO.ServingItem> servingItems = activeServing.stream().map(t -> {
            String sName = serviceRepository.findById(t.getServiceId()).map(ServiceEntity::getName).orElse("General");
            return new QueueDisplayDTO.ServingItem(
                    t.getTokenNumber(),
                    t.getCounterName() != null ? t.getCounterName() : "Counter",
                    sName,
                    t.getPriorityCategory().getDisplayName(),
                    t.getStatus().name()
            );
        }).collect(Collectors.toList());
        display.setCurrentlyServing(servingItems);

        List<QueueToken> waiting = tokenRepository.findWaitingTokensForBranch(branchId);
        List<QueueDisplayDTO.WaitingItem> waitingItems = waiting.stream().limit(8).map(t -> {
            String sName = serviceRepository.findById(t.getServiceId()).map(ServiceEntity::getName).orElse("General");
            return new QueueDisplayDTO.WaitingItem(
                    t.getTokenNumber(),
                    sName,
                    t.getPriorityCategory().getDisplayName(),
                    t.getEstimatedWaitMinutes()
            );
        }).collect(Collectors.toList());
        display.setWaitingTokens(waitingItems);

        List<QueueToken> completed = tokenRepository.findRecentCompletedForBranch(branchId);
        List<QueueDisplayDTO.CompletedItem> compItems = completed.stream().limit(5).map(t -> {
            String sName = serviceRepository.findById(t.getServiceId()).map(ServiceEntity::getName).orElse("General");
            return new QueueDisplayDTO.CompletedItem(
                    t.getTokenNumber(),
                    t.getCounterName() != null ? t.getCounterName() : "-",
                    sName
            );
        }).collect(Collectors.toList());
        display.setRecentCompleted(compItems);

        return display;
    }

    public List<QueueAuditLog> getAuditLogsForToken(Long tokenId) {
        return auditLogRepository.findByTokenIdOrderByTimestampDesc(tokenId);
    }

    public List<QueueAuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    private void notifyApproachingCustomers(Long branchId) {
        List<QueueToken> waiting = tokenRepository.findWaitingTokensForBranch(branchId);
        for (int i = 0; i < Math.min(3, waiting.size()); i++) {
            QueueToken t = waiting.get(i);
            if (t.getCustomerId() != null) {
                int ahead = i;
                if (ahead <= 2) {
                    String msg = String.format("Your turn is approaching! Token #%s is now #%d in line. Please get ready.",
                            t.getTokenNumber(), ahead + 1);
                    notificationService.createAndSendNotification(t.getCustomerId(), "Turn Approaching (" + t.getTokenNumber() + ")", msg, "TOKEN_APPROACHING", t.getId(), t.getAppointmentId());
                }
            }
        }
    }

    private void broadcastUpdates(Long branchId) {
        if (branchId == null) return;
        try {
            QueueDisplayDTO display = getQueueDisplay(branchId);
            broadcastService.broadcastDisplayUpdate(branchId, display);

            List<QueueTokenDTO> liveList = getLiveQueue(branchId);
            broadcastService.broadcastQueueUpdate(branchId, liveList);
        } catch (Exception e) {
            // WS log
        }
    }

    public int calculateEstimatedWaitTime(Long branchId, Long serviceId, PriorityCategory priority, LocalDateTime issueTime) {
        long ahead = tokenRepository.countAheadInQueue(branchId, priority, issueTime);
        ServiceEntity s = serviceRepository.findById(serviceId).orElse(null);
        int duration = s != null ? s.getEstimatedDurationMinutes() : 15;

        List<Counter> activeCounters = counterRepository.findByBranchIdAndStatus(branchId, "OPEN");
        int counterCount = Math.max(1, activeCounters.size());

        return (int) Math.ceil((double) (ahead * duration) / counterCount);
    }

    private void createAuditLog(Long tokenId, QueueStatus prev, QueueStatus next, Long userId, String userName, String role, String remarks) {
        QueueAuditLog log = new QueueAuditLog(tokenId, prev, next, userId, userName, role, remarks);
        auditLogRepository.save(log);
    }

    public QueueTokenDTO toDTO(QueueToken t) {
        String branchName = branchRepository.findById(t.getBranchId())
                .map(Branch::getName).orElse("Branch #" + t.getBranchId());
        String serviceName = serviceRepository.findById(t.getServiceId())
                .map(ServiceEntity::getName).orElse("Service #" + t.getServiceId());

        long peopleAhead = 0;
        if (t.getStatus() == QueueStatus.WAITING) {
            peopleAhead = tokenRepository.countAheadInQueue(t.getBranchId(), t.getPriorityCategory(), t.getIssueTime());
        }

        return QueueTokenDTO.fromEntity(t, branchName, serviceName, peopleAhead);
    }
}
