package com.queueless.queueless.dto;

import com.queueless.queueless.model.Appointment;
import com.queueless.queueless.model.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AppointmentDTO {
    private Long id;
    private String referenceCode;
    private Long customerId;
    private Long branchId;
    private String branchName;
    private Long serviceId;
    private String serviceName;
    private int estimatedDurationMinutes;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private LocalTime slotEndTime;
    private AppointmentStatus status;
    private String notes;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private LocalDateTime checkInTime;
    private LocalDateTime createdAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;

    public AppointmentDTO() {}

    public static AppointmentDTO fromEntity(Appointment a, String branchName, String serviceName, int duration) {
        if (a == null) return null;
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(a.getId());
        dto.setReferenceCode(a.getReferenceCode());
        dto.setCustomerId(a.getCustomerId());
        dto.setBranchId(a.getBranchId());
        dto.setBranchName(branchName);
        dto.setServiceId(a.getServiceId());
        dto.setServiceName(serviceName);
        dto.setEstimatedDurationMinutes(duration);
        dto.setAppointmentDate(a.getAppointmentDate());
        dto.setAppointmentTime(a.getAppointmentTime());
        dto.setSlotEndTime(a.getSlotEndTime());
        dto.setStatus(a.getStatus());
        dto.setNotes(a.getNotes());
        dto.setCustomerName(a.getCustomerName());
        dto.setCustomerEmail(a.getCustomerEmail());
        dto.setCustomerPhone(a.getCustomerPhone());
        dto.setCheckInTime(a.getCheckInTime());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setCancelledAt(a.getCancelledAt());
        dto.setCancellationReason(a.getCancellationReason());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReferenceCode() { return referenceCode; }
    public void setReferenceCode(String referenceCode) { this.referenceCode = referenceCode; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public int getEstimatedDurationMinutes() { return estimatedDurationMinutes; }
    public void setEstimatedDurationMinutes(int estimatedDurationMinutes) { this.estimatedDurationMinutes = estimatedDurationMinutes; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalTime appointmentTime) { this.appointmentTime = appointmentTime; }

    public LocalTime getSlotEndTime() { return slotEndTime; }
    public void setSlotEndTime(LocalTime slotEndTime) { this.slotEndTime = slotEndTime; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
}
