package com.queueless.queueless.controller;

import com.queueless.queueless.config.JwtTokenProvider;
import com.queueless.queueless.dto.*;
import com.queueless.queueless.model.QueueAuditLog;
import com.queueless.queueless.service.CounterService;
import com.queueless.queueless.service.QueueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final QueueService queueService;
    private final CounterService counterService;
    private final JwtTokenProvider tokenProvider;

    public StaffController(QueueService queueService,
                           CounterService counterService,
                           JwtTokenProvider tokenProvider) {
        this.queueService = queueService;
        this.counterService = counterService;
        this.tokenProvider = tokenProvider;
    }

    private Long getUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return tokenProvider.getUserIdFromToken(authHeader.substring(7));
    }

    @GetMapping("/queue/{branchId}")
    public ResponseEntity<ApiResponse<List<QueueTokenDTO>>> getQueue(@PathVariable Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.getBranchQueue(branchId)));
    }

    @GetMapping("/queue/{branchId}/waiting")
    public ResponseEntity<ApiResponse<List<QueueTokenDTO>>> getWaitingQueue(@PathVariable Long branchId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.getWaitingTokens(branchId)));
    }

    @PostMapping("/queue/call-next")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> callNext(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam Long branchId,
            @RequestParam Long counterId,
            @RequestParam(required = false) Long preferredServiceId) {
        Long staffId = getUserId(authHeader);
        QueueTokenDTO token = queueService.callNextToken(branchId, counterId, staffId, preferredServiceId);
        return ResponseEntity.ok(ApiResponse.ok("Next customer called: " + token.getTokenNumber(), token));
    }

    @PostMapping("/queue/call/{tokenId}")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> callToken(
            @PathVariable Long tokenId,
            @RequestParam Long counterId,
            @RequestHeader("Authorization") String authHeader) {
        Long staffId = getUserId(authHeader);
        QueueTokenDTO token = queueService.callSpecificToken(tokenId, counterId, staffId);
        return ResponseEntity.ok(ApiResponse.ok("Token called: " + token.getTokenNumber(), token));
    }

    @PostMapping("/queue/recall/{tokenId}")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> recallToken(
            @PathVariable Long tokenId,
            @RequestHeader("Authorization") String authHeader) {
        Long staffId = getUserId(authHeader);
        QueueTokenDTO token = queueService.recallToken(tokenId, staffId);
        return ResponseEntity.ok(ApiResponse.ok("Token recalled: " + token.getTokenNumber(), token));
    }

    @PostMapping("/queue/start/{tokenId}")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> startService(
            @PathVariable Long tokenId,
            @RequestHeader("Authorization") String authHeader) {
        Long staffId = getUserId(authHeader);
        QueueTokenDTO token = queueService.startService(tokenId, staffId);
        return ResponseEntity.ok(ApiResponse.ok("Service started for " + token.getTokenNumber(), token));
    }

    @PostMapping("/queue/pause/{tokenId}")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> pauseService(
            @PathVariable Long tokenId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody(required = false) Map<String, String> body) {
        Long staffId = getUserId(authHeader);
        String remarks = (body != null) ? body.get("remarks") : "Service paused by staff";
        QueueTokenDTO token = queueService.pauseService(tokenId, staffId, remarks);
        return ResponseEntity.ok(ApiResponse.ok("Service paused for " + token.getTokenNumber(), token));
    }

    @PostMapping("/queue/resume/{tokenId}")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> resumeService(
            @PathVariable Long tokenId,
            @RequestHeader("Authorization") String authHeader) {
        Long staffId = getUserId(authHeader);
        QueueTokenDTO token = queueService.resumeService(tokenId, staffId);
        return ResponseEntity.ok(ApiResponse.ok("Service resumed for " + token.getTokenNumber(), token));
    }

    @PostMapping("/queue/complete/{tokenId}")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> completeService(
            @PathVariable Long tokenId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody(required = false) Map<String, String> body) {
        Long staffId = getUserId(authHeader);
        String notes = (body != null) ? body.get("notes") : null;
        QueueTokenDTO token = queueService.completeService(tokenId, staffId, notes);
        return ResponseEntity.ok(ApiResponse.ok("Service completed for " + token.getTokenNumber(), token));
    }

    @PostMapping("/queue/skip/{tokenId}")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> skipToken(
            @PathVariable Long tokenId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody(required = false) Map<String, String> body) {
        Long staffId = getUserId(authHeader);
        String remarks = (body != null) ? body.get("remarks") : "Customer skipped";
        QueueTokenDTO token = queueService.skipToken(tokenId, staffId, remarks);
        return ResponseEntity.ok(ApiResponse.ok("Token skipped: " + token.getTokenNumber(), token));
    }

    @PostMapping("/queue/no-show/{tokenId}")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> markNoShow(
            @PathVariable Long tokenId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody(required = false) Map<String, String> body) {
        Long staffId = getUserId(authHeader);
        String remarks = (body != null) ? body.get("remarks") : "Marked No Show";
        QueueTokenDTO token = queueService.markNoShow(tokenId, staffId, remarks);
        return ResponseEntity.ok(ApiResponse.ok("Token marked as No Show: " + token.getTokenNumber(), token));
    }

    @PutMapping("/counters/{counterId}/status")
    public ResponseEntity<ApiResponse<CounterDTO>> updateCounterStatus(
            @PathVariable Long counterId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        CounterDTO counter = counterService.updateStatus(counterId, status);
        return ResponseEntity.ok(ApiResponse.ok("Counter status updated to " + status, counter));
    }

    @GetMapping("/queue/audit-logs/{tokenId}")
    public ResponseEntity<ApiResponse<List<QueueAuditLog>>> getAuditLogs(@PathVariable Long tokenId) {
        return ResponseEntity.ok(ApiResponse.ok(queueService.getAuditLogsForToken(tokenId)));
    }
}
