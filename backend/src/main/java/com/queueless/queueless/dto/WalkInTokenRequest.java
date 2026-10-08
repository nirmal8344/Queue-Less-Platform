package com.queueless.queueless.dto;

import com.queueless.queueless.model.PriorityCategory;
import jakarta.validation.constraints.NotNull;

public class WalkInTokenRequest {
    @NotNull(message = "Branch is required")
    private Long branchId;

    @NotNull(message = "Service is required")
    private Long serviceId;

    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private PriorityCategory priorityCategory = PriorityCategory.GENERAL;
    private String notes;

    public WalkInTokenRequest() {}

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public PriorityCategory getPriorityCategory() { return priorityCategory; }
    public void setPriorityCategory(PriorityCategory priorityCategory) { this.priorityCategory = priorityCategory; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
