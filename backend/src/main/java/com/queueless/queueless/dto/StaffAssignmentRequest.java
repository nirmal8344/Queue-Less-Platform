package com.queueless.queueless.dto;

public class StaffAssignmentRequest {
    private Long staffId;
    private Long branchId;
    private Long counterId;

    public StaffAssignmentRequest() {}

    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public Long getCounterId() { return counterId; }
    public void setCounterId(Long counterId) { this.counterId = counterId; }
}
