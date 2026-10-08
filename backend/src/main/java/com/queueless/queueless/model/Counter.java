package com.queueless.queueless.model;

import jakarta.persistence.*;

@Entity
@Table(name = "counters")
public class Counter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long branchId;

    @Column(nullable = false)
    private String name; // e.g. "Counter 1"

    private int counterNumber = 1;
    private String locationInfo; // e.g. "Ground Floor, Window A"

    // Counter status: OPEN, CLOSED, PAUSED
    private String status = "CLOSED";

    private Long assignedStaffId;

    private Long currentTokenId;

    public Counter() {}

    public Counter(Long branchId, String name, int counterNumber, String locationInfo) {
        this.branchId = branchId;
        this.name = name;
        this.counterNumber = counterNumber;
        this.locationInfo = locationInfo;
        this.status = "CLOSED";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

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

    public Long getCurrentTokenId() { return currentTokenId; }
    public void setCurrentTokenId(Long currentTokenId) { this.currentTokenId = currentTokenId; }
}
