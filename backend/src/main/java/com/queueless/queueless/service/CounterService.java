package com.queueless.queueless.service;

import com.queueless.queueless.dto.CounterDTO;
import com.queueless.queueless.exception.ResourceNotFoundException;
import com.queueless.queueless.model.Branch;
import com.queueless.queueless.model.Counter;
import com.queueless.queueless.model.CounterServiceMapping;
import com.queueless.queueless.model.QueueToken;
import com.queueless.queueless.model.ServiceEntity;
import com.queueless.queueless.model.User;
import com.queueless.queueless.repository.BranchRepository;
import com.queueless.queueless.repository.CounterRepository;
import com.queueless.queueless.repository.CounterServiceRepository;
import com.queueless.queueless.repository.QueueTokenRepository;
import com.queueless.queueless.repository.ServiceRepository;
import com.queueless.queueless.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CounterService {

    private final CounterRepository counterRepository;
    private final CounterServiceRepository counterServiceRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final QueueTokenRepository queueTokenRepository;
    private final NotificationService notificationService;

    public CounterService(CounterRepository counterRepository,
                          CounterServiceRepository counterServiceRepository,
                          BranchRepository branchRepository,
                          UserRepository userRepository,
                          ServiceRepository serviceRepository,
                          QueueTokenRepository queueTokenRepository,
                          NotificationService notificationService) {
        this.counterRepository = counterRepository;
        this.counterServiceRepository = counterServiceRepository;
        this.branchRepository = branchRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
        this.queueTokenRepository = queueTokenRepository;
        this.notificationService = notificationService;
    }

    public List<CounterDTO> getAllCounters(Long branchId) {
        List<Counter> counters = (branchId != null) ?
                counterRepository.findByBranchId(branchId) : counterRepository.findAll();
        return counters.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Counter getCounterById(Long id) {
        return counterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Counter not found with ID: " + id));
    }

    public CounterDTO getCounterDTOById(Long id) {
        return toDTO(getCounterById(id));
    }

    @Transactional
    public CounterDTO createCounter(Counter counter, List<Long> serviceIds) {
        Counter saved = counterRepository.save(counter);
        if (serviceIds != null) {
            for (Long sId : serviceIds) {
                counterServiceRepository.save(new CounterServiceMapping(saved.getId(), sId));
            }
        }
        if (saved.getAssignedStaffId() != null) {
            notifyCounterAssigned(saved.getAssignedStaffId(), saved);
        }
        return toDTO(saved);
    }

    @Transactional
    public CounterDTO updateCounter(Long id, Counter updated, List<Long> serviceIds) {
        Counter counter = getCounterById(id);
        Long prevStaffId = counter.getAssignedStaffId();
        counter.setName(updated.getName());
        counter.setCounterNumber(updated.getCounterNumber());
        counter.setLocationInfo(updated.getLocationInfo());
        counter.setBranchId(updated.getBranchId());
        if (updated.getStatus() != null) {
            counter.setStatus(updated.getStatus());
        }
        counter = counterRepository.save(counter);

        if (serviceIds != null) {
            counterServiceRepository.deleteByCounterId(counter.getId());
            for (Long sId : serviceIds) {
                counterServiceRepository.save(new CounterServiceMapping(counter.getId(), sId));
            }
        }

        if (counter.getAssignedStaffId() != null && !counter.getAssignedStaffId().equals(prevStaffId)) {
            notifyCounterAssigned(counter.getAssignedStaffId(), counter);
        }

        return toDTO(counter);
    }

    @Transactional
    public CounterDTO assignStaff(Long counterId, Long staffId) {
        Counter counter = getCounterById(counterId);
        counter.setAssignedStaffId(staffId);
        if (staffId != null) {
            counter.setStatus("OPEN");
            userRepository.findById(staffId).ifPresent(u -> {
                u.setAssignedBranchId(counter.getBranchId());
                u.setAssignedCounterId(counter.getId());
                userRepository.save(u);
            });
            notifyCounterAssigned(staffId, counter);
        }
        return toDTO(counterRepository.save(counter));
    }

    private void notifyCounterAssigned(Long staffId, Counter counter) {
        if (staffId == null || counter == null) return;
        Branch branch = branchRepository.findById(counter.getBranchId()).orElse(null);
        String branchName = branch != null ? branch.getName() : "Branch #" + counter.getBranchId();
        String msg = String.format("You have been assigned to %s at %s.", counter.getName(), branchName);
        notificationService.createAndSendNotification(staffId, "Counter Assigned", msg, "COUNTER_ASSIGNED", null, null);
    }


    @Transactional
    public CounterDTO updateStatus(Long counterId, String status) {
        Counter counter = getCounterById(counterId);
        counter.setStatus(status.toUpperCase());
        return toDTO(counterRepository.save(counter));
    }

    @Transactional
    public void deleteCounter(Long id) {
        counterServiceRepository.deleteByCounterId(id);
        counterRepository.deleteById(id);
    }

    public List<Long> getSupportedServicesForCounter(Long counterId) {
        return counterServiceRepository.findByCounterId(counterId)
                .stream()
                .map(CounterServiceMapping::getServiceId)
                .collect(Collectors.toList());
    }

    public CounterDTO toDTO(Counter c) {
        String branchName = branchRepository.findById(c.getBranchId())
                .map(Branch::getName).orElse("Branch #" + c.getBranchId());

        String staffName = null;
        if (c.getAssignedStaffId() != null) {
            staffName = userRepository.findById(c.getAssignedStaffId())
                    .map(User::getName).orElse(null);
        }

        String currentTokenNumber = null;
        if (c.getCurrentTokenId() != null) {
            currentTokenNumber = queueTokenRepository.findById(c.getCurrentTokenId())
                    .map(QueueToken::getTokenNumber).orElse(null);
        }

        List<Long> sIds = counterServiceRepository.findByCounterId(c.getId())
                .stream().map(CounterServiceMapping::getServiceId).collect(Collectors.toList());

        List<String> sNames = new ArrayList<>();
        if (!sIds.isEmpty()) {
            sNames = serviceRepository.findAllById(sIds).stream()
                    .map(ServiceEntity::getName).collect(Collectors.toList());
        }

        return CounterDTO.fromEntity(c, branchName, staffName, currentTokenNumber, sIds, sNames);
    }
}
