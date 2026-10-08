package com.queueless.queueless.dto;

import com.queueless.queueless.model.ServiceEntity;

public class ServiceDTO {
    private Long id;
    private Long branchId;
    private String branchName;
    private String name;
    private String code;
    private String description;
    private int estimatedDurationMinutes;
    private int maxDailyTokens;
    private boolean active;
    private boolean allowPriority;

    public ServiceDTO() {}

    public static ServiceDTO fromEntity(ServiceEntity s, String branchName) {
        if (s == null) return null;
        ServiceDTO dto = new ServiceDTO();
        dto.setId(s.getId());
        dto.setBranchId(s.getBranchId());
        dto.setBranchName(branchName);
        dto.setName(s.getName());
        dto.setCode(s.getCode());
        dto.setDescription(s.getDescription());
        dto.setEstimatedDurationMinutes(s.getEstimatedDurationMinutes());
        dto.setMaxDailyTokens(s.getMaxDailyTokens());
        dto.setActive(s.isActive());
        dto.setAllowPriority(s.isAllowPriority());
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

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getEstimatedDurationMinutes() { return estimatedDurationMinutes; }
    public void setEstimatedDurationMinutes(int estimatedDurationMinutes) { this.estimatedDurationMinutes = estimatedDurationMinutes; }

    public int getMaxDailyTokens() { return maxDailyTokens; }
    public void setMaxDailyTokens(int maxDailyTokens) { this.maxDailyTokens = maxDailyTokens; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isAllowPriority() { return allowPriority; }
    public void setAllowPriority(boolean allowPriority) { this.allowPriority = allowPriority; }
}
