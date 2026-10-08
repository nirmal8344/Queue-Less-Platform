package com.queueless.queueless.controller;

import com.queueless.queueless.config.JwtTokenProvider;
import com.queueless.queueless.dto.*;
import com.queueless.queueless.model.Notification;
import com.queueless.queueless.service.AppointmentService;
import com.queueless.queueless.service.NotificationService;
import com.queueless.queueless.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final AppointmentService appointmentService;
    private final QueueService queueService;
    private final NotificationService notificationService;
    private final JwtTokenProvider tokenProvider;

    public CustomerController(AppointmentService appointmentService,
                              QueueService queueService,
                              NotificationService notificationService,
                              JwtTokenProvider tokenProvider) {
        this.appointmentService = appointmentService;
        this.queueService = queueService;
        this.notificationService = notificationService;
        this.tokenProvider = tokenProvider;
    }

    private Long getUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return tokenProvider.getUserIdFromToken(authHeader.substring(7));
    }

    @PostMapping("/appointments")
    public ResponseEntity<ApiResponse<AppointmentDTO>> bookAppointment(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody AppointmentRequest request) {
        Long customerId = getUserId(authHeader);
        AppointmentDTO dto = appointmentService.bookAppointment(customerId, request);
        return ResponseEntity.ok(ApiResponse.ok("Appointment booked successfully", dto));
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getMyAppointments(@RequestHeader("Authorization") String authHeader) {
        Long customerId = getUserId(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getCustomerAppointments(customerId)));
    }

    @PutMapping("/appointments/{id}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentDTO>> rescheduleAppointment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody AppointmentRescheduleRequest request) {
        Long customerId = getUserId(authHeader);
        AppointmentDTO dto = appointmentService.rescheduleAppointment(id, customerId, request);
        return ResponseEntity.ok(ApiResponse.ok("Appointment rescheduled successfully", dto));
    }

    @PostMapping("/appointments/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDTO>> cancelAppointment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody(required = false) Map<String, String> body) {
        Long customerId = getUserId(authHeader);
        String reason = (body != null) ? body.get("reason") : "Cancelled by customer";
        AppointmentDTO dto = appointmentService.cancelAppointment(id, customerId, reason);
        return ResponseEntity.ok(ApiResponse.ok("Appointment cancelled", dto));
    }

    @PostMapping("/appointments/{id}/checkin")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> checkInAppointment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        Long customerId = getUserId(authHeader);
        QueueTokenDTO token = queueService.checkInAppointment(id, customerId);
        return ResponseEntity.ok(ApiResponse.ok("Checked in successfully! Token generated.", token));
    }

    @PostMapping("/tokens/walkin")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> takeWalkInToken(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody WalkInTokenRequest request) {
        Long customerId = getUserId(authHeader);
        QueueTokenDTO token = queueService.generateWalkInToken(customerId, request);
        return ResponseEntity.ok(ApiResponse.ok("Queue token generated successfully", token));
    }

    @GetMapping("/tokens")
    public ResponseEntity<ApiResponse<List<QueueTokenDTO>>> getMyTokens(@RequestHeader("Authorization") String authHeader) {
        Long customerId = getUserId(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(queueService.getCustomerTokens(customerId)));
    }

    @GetMapping("/active-token")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> getActiveToken(@RequestHeader("Authorization") String authHeader) {
        Long customerId = getUserId(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(queueService.getActiveCustomerToken(customerId).orElse(null)));
    }

    @PostMapping("/tokens/{id}/cancel")
    public ResponseEntity<ApiResponse<QueueTokenDTO>> cancelToken(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody(required = false) Map<String, String> body) {
        Long customerId = getUserId(authHeader);
        String remarks = (body != null) ? body.get("remarks") : "Cancelled by customer";
        QueueTokenDTO dto = queueService.cancelToken(id, customerId, remarks);
        return ResponseEntity.ok(ApiResponse.ok("Token cancelled", dto));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(@RequestHeader("Authorization") String authHeader) {
        Long customerId = getUserId(authHeader);
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUserNotifications(customerId)));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markNotificationAsRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        Long customerId = getUserId(authHeader);
        notificationService.markAsRead(id, customerId);
        return ResponseEntity.ok(ApiResponse.ok("Marked as read", null));
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllNotificationsAsRead(@RequestHeader("Authorization") String authHeader) {
        Long customerId = getUserId(authHeader);
        notificationService.markAllAsRead(customerId);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }
}
