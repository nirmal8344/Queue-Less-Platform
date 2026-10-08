package com.queueless.queueless.dto;

import com.queueless.queueless.model.PriorityCategory;
import com.queueless.queueless.model.QueueStatus;
import com.queueless.queueless.model.QueueToken;

import java.time.LocalDateTime;

public class QueueTokenDTO {
    private Long id;
    private String tokenNumber;
    private Long branchId;
    private String branchName;
    private Long serviceId;
    private String serviceName;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private Long appointmentId;
    private Long counterId;
    private String counterName;
    private Long staffId;
    private String staffName;
    private PriorityCategory priorityCategory;
    private String priorityDisplayName;
    private QueueStatus status;
    private LocalDateTime issueTime;
    private LocalDateTime calledTime;
    private LocalDateTime serviceStartTime;
    private LocalDateTime serviceEndTime;
    private int estimatedWaitMinutes;
    private long peopleAhead;
    private String notes;

    public QueueTokenDTO() {}

    public static QueueTokenDTO fromEntity(QueueToken q, String branchName, String serviceName, long peopleAhead) {
        if (q == null) return null;
        QueueTokenDTO dto = new QueueTokenDTO();
        dto.setId(q.getId());
        dto.setTokenNumber(q.getTokenNumber());
        dto.setBranchId(q.getBranchId());
        dto.setBranchName(branchName);
        dto.setServiceId(q.getServiceId());
        dto.setServiceName(serviceName);
        dto.setCustomerId(q.getCustomerId());
        dto.setCustomerName(q.getCustomerName());
        dto.setCustomerPhone(q.getCustomerPhone());
        dto.setCustomerEmail(q.getCustomerEmail());
        dto.setAppointmentId(q.getAppointmentId());
        dto.setCounterId(q.getCounterId());
        dto.setCounterName(q.getCounterName());
        dto.setStaffId(q.getStaffId());
        dto.setStaffName(q.getStaffName());
        dto.setPriorityCategory(q.getPriorityCategory());
        dto.setPriorityDisplayName(q.getPriorityCategory() != null ? q.getPriorityCategory().getDisplayName() : "General");
        dto.setStatus(q.getStatus());
        dto.setIssueTime(q.getIssueTime());
        dto.setCalledTime(q.getCalledTime());
        dto.setServiceStartTime(q.getServiceStartTime());
        dto.setServiceEndTime(q.getServiceEndTime());
        dto.setEstimatedWaitMinutes(q.getEstimatedWaitMinutes());
        dto.setPeopleAhead(peopleAhead);
        dto.setNotes(q.getNotes());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public Long getCounterId() { return counterId; }
    public void setCounterId(Long counterId) { this.counterId = counterId; }

    public String getCounterName() { return counterName; }
    public void setCounterName(String counterName) { this.counterName = counterName; }

    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }

    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }

    public PriorityCategory getPriorityCategory() { return priorityCategory; }
    public void setPriorityCategory(PriorityCategory priorityCategory) { this.priorityCategory = priorityCategory; }

    public String getPriorityDisplayName() { return priorityDisplayName; }
    public void setPriorityDisplayName(String priorityDisplayName) { this.priorityDisplayName = priorityDisplayName; }

    public QueueStatus getStatus() { return status; }
    public void setStatus(QueueStatus status) { this.status = status; }

    public LocalDateTime getIssueTime() { return issueTime; }
    public void setIssueTime(LocalDateTime issueTime) { this.issueTime = issueTime; }

    public LocalDateTime getCalledTime() { return calledTime; }
    public void setCalledTime(LocalDateTime calledTime) { this.calledTime = calledTime; }

    public LocalDateTime getServiceStartTime() { return serviceStartTime; }
    public void setServiceStartTime(LocalDateTime serviceStartTime) { this.serviceStartTime = serviceStartTime; }

    public LocalDateTime getServiceEndTime() { return serviceEndTime; }
    public void setServiceEndTime(LocalDateTime serviceEndTime) { this.serviceEndTime = serviceEndTime; }

    public int getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
    public void setEstimatedWaitMinutes(int estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; }

    public long getPeopleAhead() { return peopleAhead; }
    public void setPeopleAhead(long peopleAhead) { this.peopleAhead = peopleAhead; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
