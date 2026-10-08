package com.queueless.queueless.dto;

import com.queueless.queueless.model.Counter;
import java.util.List;

public class CounterDTO {
    private Long id;
    private Long branchId;
    private String branchName;
    private String name;
    private int counterNumber;
    private String locationInfo;
    private String status;
    private Long assignedStaffId;
    private String assignedStaffName;
    private Long currentTokenId;
    private String currentTokenNumber;
    private List<Long> supportedServiceIds;
    private List<String> supportedServiceNames;

    public CounterDTO() {}

    public static CounterDTO fromEntity(Counter c, String branchName, String staffName, String currentTokenNumber, List<Long> serviceIds, List<String> serviceNames) {
        if (c == null) return null;
        CounterDTO dto = new CounterDTO();
        dto.setId(c.getId());
        dto.setBranchId(c.getBranchId());
        dto.setBranchName(branchName);
        dto.setName(c.getName());
        dto.setCounterNumber(c.getCounterNumber());
        dto.setLocationInfo(c.getLocationInfo());
        dto.setStatus(c.getStatus());
        dto.setAssignedStaffId(c.getAssignedStaffId());
        dto.setAssignedStaffName(staffName);
        dto.setCurrentTokenId(c.getCurrentTokenId());
        dto.setCurrentTokenNumber(currentTokenNumber);
        dto.setSupportedServiceIds(serviceIds);
        dto.setSupportedServiceNames(serviceNames);
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getCounterNumber() { return counterNumber; }
    public void setCounterNumber(int counterNumber) { this.counterNumber = counterNumber; }

    public String getLocationInfo() { return locationInfo; }
    public void setLocationInfo(String locationInfo) { this.locationInfo = locationInfo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getAssignedStaffId() { return assignedStaffId; }
    public void setAssignedStaffId(Long assignedStaffId) { this.assignedStaffId = assignedStaffId; }

    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }

    public Long getCurrentTokenId() { return currentTokenId; }
    public void setCurrentTokenId(Long currentTokenId) { this.currentTokenId = currentTokenId; }

    public String getCurrentTokenNumber() { return currentTokenNumber; }
    public void setCurrentTokenNumber(String currentTokenNumber) { this.currentTokenNumber = currentTokenNumber; }

    public List<Long> getSupportedServiceIds() { return supportedServiceIds; }
    public void setSupportedServiceIds(List<Long> supportedServiceIds) { this.supportedServiceIds = supportedServiceIds; }

    public List<String> getSupportedServiceNames() { return supportedServiceNames; }
    public void setSupportedServiceNames(List<String> supportedServiceNames) { this.supportedServiceNames = supportedServiceNames; }
}
