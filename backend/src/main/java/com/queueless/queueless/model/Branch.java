package com.queueless.queueless.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "branches")
public class Branch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long organizationId;

    @Column(nullable = false)
    private String name;

    private String code;
    private String address;
    private String city;
    private String phone;
    private String email;

    private LocalTime openingTime = LocalTime.of(9, 0);
    private LocalTime closingTime = LocalTime.of(17, 0);

    // Comma-separated days, e.g. "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY"
    private String workingDays = "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY";

    private boolean active = true;

    public Branch() {}

    public Branch(Long organizationId, String name, String code, String address, String city, String phone, String email) {
        this.organizationId = organizationId;
        this.name = name;
        this.code = code;
        this.address = address;
        this.city = city;
        this.phone = phone;
        this.email = email;
        this.active = true;
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
