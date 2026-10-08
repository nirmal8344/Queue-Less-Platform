package com.queueless.queueless.dto;

import com.queueless.queueless.model.Branch;
import java.time.LocalTime;

public class BranchDTO {
    private Long id;
    private Long organizationId;
    private String name;
    private String code;
    private String address;
    private String city;
    private String phone;
    private String email;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private String workingDays;
    private boolean active;

    public BranchDTO() {}

    public static BranchDTO fromEntity(Branch b) {
        if (b == null) return null;
        BranchDTO dto = new BranchDTO();
        dto.setId(b.getId());
        dto.setOrganizationId(b.getOrganizationId());
        dto.setName(b.getName());
        dto.setCode(b.getCode());
        dto.setAddress(b.getAddress());
        dto.setCity(b.getCity());
        dto.setPhone(b.getPhone());
        dto.setEmail(b.getEmail());
        dto.setOpeningTime(b.getOpeningTime());
        dto.setClosingTime(b.getClosingTime());
        dto.setWorkingDays(b.getWorkingDays());
        dto.setActive(b.isActive());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalTime getOpeningTime() { return openingTime; }
    public void setOpeningTime(LocalTime openingTime) { this.openingTime = openingTime; }

    public LocalTime getClosingTime() { return closingTime; }
    public void setClosingTime(LocalTime closingTime) { this.closingTime = closingTime; }

    public String getWorkingDays() { return workingDays; }
    public void setWorkingDays(String workingDays) { this.workingDays = workingDays; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
