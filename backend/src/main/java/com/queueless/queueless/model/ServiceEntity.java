package com.queueless.queueless.model;

import jakarta.persistence.*;

@Entity
@Table(name = "services")
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long branchId; // null if universal or specific to branch

    @Column(nullable = false)
    private String name;

    private String code; // e.g., "GEN", "DOC", "ACC"
    private String description;

    @Column(nullable = false)
    private int estimatedDurationMinutes = 15;

    private int maxDailyTokens = 100;

    private boolean active = true;

    private boolean allowPriority = true;

    public ServiceEntity() {}

    public ServiceEntity(Long branchId, String name, String code, String description, int estimatedDurationMinutes) {
        this.branchId = branchId;
        this.name = name;
        this.code = code;
        this.description = description;
        this.estimatedDurationMinutes = estimatedDurationMinutes;
        this.active = true;
        this.allowPriority = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

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
