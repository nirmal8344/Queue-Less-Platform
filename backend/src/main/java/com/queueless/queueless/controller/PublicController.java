package com.queueless.queueless.controller;

import com.queueless.queueless.dto.*;
import com.queueless.queueless.model.Branch;
import com.queueless.queueless.model.Holiday;
import com.queueless.queueless.model.Organization;
import com.queueless.queueless.model.ServiceEntity;
import com.queueless.queueless.service.*;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final BranchService branchService;
    private final ServiceManagementService serviceManagementService;
    private final CounterService counterService;
    private final AppointmentService appointmentService;
    private final QueueService queueService;

    public PublicController(BranchService branchService,
                            ServiceManagementService serviceManagementService,
                            CounterService counterService,
                            AppointmentService appointmentService,
                            QueueService queueService) {
        this.branchService = branchService;
        this.serviceManagementService = serviceManagementService;
        this.counterService = counterService;
        this.appointmentService = appointmentService;
        this.queueService = queueService;
    }

    @GetMapping("/organization")
    public ResponseEntity<ApiResponse<Organization>> getOrganization() {
        return ResponseEntity.ok(ApiResponse.ok(branchService.getOrganization()));
    }

    @GetMapping("/branches")
    public ResponseEntity<ApiResponse<List<BranchDTO>>> getActiveBranches() {
        List<BranchDTO> list = branchService.getActiveBranches().stream()
                .map(BranchDTO::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/branches/{id}")
    public ResponseEntity<ApiResponse<BranchDTO>> getBranchById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(BranchDTO.fromEntity(branchService.getBranchById(id))));
    }

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ServiceDTO>>> getServices(@RequestParam(required = false) Long branchId) {
        List<ServiceEntity> services = serviceManagementService.getServicesByBranch(branchId);
        List<ServiceDTO> list = services.stream().map(s -> {
            String bName = null;
            if (s.getBranchId() != null) {
                try {
                    bName = branchService.getBranchById(s.getBranchId()).getName();
                } catch (Exception e) {}
            }
            return ServiceDTO.fromEntity(s, bName);
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/counters")
    public ResponseEntity<ApiResponse<List<CounterDTO>>> getCounters(@RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(counterService.getAllCounters(branchId)));
    }

    @GetMapping("/available-slots")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableSlots(
            @RequestParam Long branchId,
            @RequestParam Long serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<String> slots = appointmentService.getAvailableSlots(branchId, serviceId, date);
        return ResponseEntity.ok(ApiResponse.ok(slots));
    }

    @GetMapping("/holidays")
    public ResponseEntity<ApiResponse<List<Holiday>>> getHolidays(@RequestParam(required = false) Long branchId) {
        if (branchId != null) {
            return ResponseEntity.ok(ApiResponse.ok(branchService.getHolidaysForBranch(branchId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(branchService.getAllHolidays()));
    }

    @GetMapping("/display/{branchId}")
    public ResponseEntity<ApiResponse<QueueDisplayDTO>> getQueueDisplay(@PathVariable Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.getQueueDisplay(branchId)));
    }

    @GetMapping("/live-queue/{branchId}")
    public ResponseEntity<ApiResponse<List<QueueTokenDTO>>> getLiveQueue(@PathVariable Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.getLiveQueue(branchId)));
    }

    @PostMapping("/token/walkin")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> createWalkInToken(@Valid @RequestBody WalkInTokenRequest request) {
        QueueTokenDTO token = queueService.generateWalkInToken(null, request);
        return ResponseEntity.ok(ApiResponse.ok("Walk-in token generated successfully", token));
    }
}
