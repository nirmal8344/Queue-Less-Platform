package com.queueless.queueless.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "holidays")
public class Holiday {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long branchId; // null if global across all branches

    @Column(nullable = false)
    private LocalDate holidayDate;

    @Column(nullable = false)
    private String description;

    public Holiday() {}

    public Holiday(Long branchId, LocalDate holidayDate, String description) {
        this.branchId = branchId;
        this.holidayDate = holidayDate;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public LocalDate getHolidayDate() { return holidayDate; }
    public void setHolidayDate(LocalDate holidayDate) { this.holidayDate = holidayDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
