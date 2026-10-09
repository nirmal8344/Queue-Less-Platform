package com.queueless.queueless.controller;

import com.queueless.queueless.dto.*;
import com.queueless.queueless.model.*;
import com.queueless.queueless.service.*;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final BranchService branchService;
    private final ServiceManagementService serviceManagementService;
    private final CounterService counterService;
    private final AppointmentService appointmentService;
    private final QueueService queueService;
    private final AnalyticsService analyticsService;
    private final AuthService authService;
    private final OperationalSettingService settingService;

    public AdminController(BranchService branchService,
                           ServiceManagementService serviceManagementService,
                           CounterService counterService,
                           AppointmentService appointmentService,
                           QueueService queueService,
                           AnalyticsService analyticsService,
                           AuthService authService,
                           OperationalSettingService settingService) {
        this.branchService = branchService;
        this.serviceManagementService = serviceManagementService;
        this.counterService = counterService;
        this.appointmentService = appointmentService;
        this.queueService = queueService;
        this.analyticsService = analyticsService;
        this.authService = authService;
        this.settingService = settingService;
    }

    // --- Organization & Branches ---
    @PutMapping("/organization")
    public ResponseEntity<ApiResponse<Organization>> updateOrganization(@RequestBody Organization org) {
        return ResponseEntity.ok(ApiResponse.ok("Organization updated", branchService.updateOrganization(org)));
    }

    @GetMapping("/branches")
    public ResponseEntity<ApiResponse<List<BranchDTO>>> getAllBranches() {
        return ResponseEntity.ok(ApiResponse.ok(
                branchService.getAllBranches().stream().map(BranchDTO::fromEntity).collect(Collectors.toList())
        ));
    }

    @PostMapping("/branches")
    public ResponseEntity<ApiResponse<BranchDTO>> createBranch(@RequestBody Branch branch) {
        Branch created = branchService.createBranch(branch);
        return ResponseEntity.ok(ApiResponse.ok("Branch created successfully", BranchDTO.fromEntity(created)));
    }

    @PutMapping("/branches/{id}")
    public ResponseEntity<ApiResponse<BranchDTO>> updateBranch(@PathVariable Long id, @RequestBody Branch branch) {
        Branch updated = branchService.updateBranch(id, branch);
        return ResponseEntity.ok(ApiResponse.ok("Branch updated successfully", BranchDTO.fromEntity(updated)));
    }

    @DeleteMapping("/branches/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBranch(@PathVariable Long id) {
        branchService.deleteBranch(id);
        return ResponseEntity.ok(ApiResponse.ok("Branch deactivated", null));
    }

    // --- Holidays ---
    @PostMapping("/holidays")
    public ResponseEntity<ApiResponse<Holiday>> addHoliday(@RequestBody Holiday holiday) {
        return ResponseEntity.ok(ApiResponse.ok("Holiday added", branchService.addHoliday(holiday)));
    }

    @DeleteMapping("/holidays/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHoliday(@PathVariable Long id) {
        branchService.deleteHoliday(id);
        return ResponseEntity.ok(ApiResponse.ok("Holiday deleted", null));
    }

    // --- Services ---
    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ServiceDTO>>> getAllServices(@RequestParam(required = false) Long branchId) {
        List<ServiceEntity> services = serviceManagementService.getAllServicesByBranch(branchId);
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

    @PostMapping("/services")
    public ResponseEntity<ApiResponse<ServiceDTO>> createService(@RequestBody ServiceEntity service) {
        ServiceEntity created = serviceManagementService.createService(service);
        String bName = (created.getBranchId() != null) ? branchService.getBranchById(created.getBranchId()).getName() : "Universal";
        return ResponseEntity.ok(ApiResponse.ok("Service created", ServiceDTO.fromEntity(created, bName)));
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<ApiResponse<ServiceDTO>> updateService(@PathVariable Long id, @RequestBody ServiceEntity service) {
        ServiceEntity updated = serviceManagementService.updateService(id, service);
        String bName = (updated.getBranchId() != null) ? branchService.getBranchById(updated.getBranchId()).getName() : "Universal";
        return ResponseEntity.ok(ApiResponse.ok("Service updated", ServiceDTO.fromEntity(updated, bName)));
    }

    @PatchMapping("/services/{id}/toggle")
    public ResponseEntity<ApiResponse<ServiceDTO>> toggleService(@PathVariable Long id) {
        ServiceEntity toggled = serviceManagementService.toggleServiceStatus(id);
        String bName = (toggled.getBranchId() != null) ? branchService.getBranchById(toggled.getBranchId()).getName() : "Universal";
        return ResponseEntity.ok(ApiResponse.ok("Service status toggled", ServiceDTO.fromEntity(toggled, bName)));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        serviceManagementService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.ok("Service deactivated", null));
    }

    // --- Counters ---
    @GetMapping("/counters")
    public ResponseEntity<ApiResponse<List<CounterDTO>>> getAllCounters(@RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(counterService.getAllCounters(branchId)));
    }

    @PostMapping("/counters")
    public ResponseEntity<ApiResponse<CounterDTO>> createCounter(@RequestBody Map<String, Object> body) {
        Counter counter = new Counter();
        counter.setName((String) body.get("name"));
        counter.setCounterNumber((Integer) body.get("counterNumber"));
        counter.setLocationInfo((String) body.get("locationInfo"));
        counter.setBranchId(Long.valueOf(body.get("branchId").toString()));
        if (body.get("status") != null) {
            counter.setStatus((String) body.get("status"));
        }

        List<Long> serviceIds = null;
        if (body.get("supportedServiceIds") instanceof List) {
            serviceIds = ((List<?>) body.get("supportedServiceIds")).stream()
                    .map(item -> Long.valueOf(item.toString())).collect(Collectors.toList());
        }

        CounterDTO created = counterService.createCounter(counter, serviceIds);
        return ResponseEntity.ok(ApiResponse.ok("Counter created successfully", created));
    }

    @PutMapping("/counters/{id}")
    public ResponseEntity<ApiResponse<CounterDTO>> updateCounter(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Counter counter = new Counter();
        counter.setName((String) body.get("name"));
        counter.setCounterNumber((Integer) body.get("counterNumber"));
        counter.setLocationInfo((String) body.get("locationInfo"));
        counter.setBranchId(Long.valueOf(body.get("branchId").toString()));
        if (body.get("status") != null) {
            counter.setStatus((String) body.get("status"));
        }

        List<Long> serviceIds = null;
        if (body.get("supportedServiceIds") instanceof List) {
            serviceIds = ((List<?>) body.get("supportedServiceIds")).stream()
                    .map(item -> Long.valueOf(item.toString())).collect(Collectors.toList());
        }

        CounterDTO updated = counterService.updateCounter(id, counter, serviceIds);
        return ResponseEntity.ok(ApiResponse.ok("Counter updated successfully", updated));
    }

    @PostMapping("/counters/{id}/assign-staff")
    public ResponseEntity<ApiResponse<CounterDTO>> assignStaff(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        Long staffId = body.get("staffId");
        CounterDTO dto = counterService.assignStaff(id, staffId);
        return ResponseEntity.ok(ApiResponse.ok("Staff assigned to counter", dto));
    }

    @DeleteMapping("/counters/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCounter(@PathVariable Long id) {
        counterService.deleteCounter(id);
        return ResponseEntity.ok(ApiResponse.ok("Counter deleted", null));
    }

    // --- Staff Management ---
    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllStaff() {
        return ResponseEntity.ok(ApiResponse.ok(authService.getAllStaff()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(authService.getAllUsers()));
    }

    // --- Appointments ---
    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointments(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (branchId != null) {
            return ResponseEntity.ok(ApiResponse.ok(appointmentService.getBranchAppointments(branchId, date)));
        }
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getAllAppointments(date)));
    }

    // --- Queue & Audit ---
    @GetMapping("/queue")
    public ResponseEntity<ApiResponse<List<QueueTokenDTO>>> getQueue(
            @RequestParam(required = false) Long branchId) {
        if (branchId != null) {
            return ResponseEntity.ok(ApiResponse.ok(queueService.getLiveQueue(branchId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(queueService.getLiveQueue(1L)));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<QueueAuditLog>>> getAllAuditLogs() {
        return ResponseEntity.ok(ApiResponse.ok(queueService.getAllAuditLogs()));
    }

    // --- Analytics Dashboard ---
    @GetMapping({"/analytics", "/analytics/summary"})
    public ResponseEntity<ApiResponse<AnalyticsSummaryDTO>> getAnalytics(
            @RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getAnalyticsSummary(branchId)));
    }

    // --- Operational Settings ---
    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<List<OperationalSetting>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.ok(settingService.getAllSettings()));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<OperationalSetting>> updateSetting(@RequestBody Map<String, String> body) {
        String key = body.get("key");
        String value = body.get("value");
        String desc = body.get("description");
        OperationalSetting s = settingService.saveOrUpdateSetting(key, value, desc);
        return ResponseEntity.ok(ApiResponse.ok("Setting updated", s));
    }
}
