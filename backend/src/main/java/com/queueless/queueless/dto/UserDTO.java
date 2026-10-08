package com.queueless.queueless.dto;

import com.queueless.queueless.model.Role;
import com.queueless.queueless.model.User;

import java.time.LocalDateTime;

public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private Long assignedBranchId;
    private Long assignedCounterId;
    private LocalDateTime createdAt;

    public UserDTO() {}

    public static UserDTO fromEntity(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setAssignedBranchId(user.getAssignedBranchId());
        dto.setAssignedCounterId(user.getAssignedCounterId());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getAssignedBranchId() { return assignedBranchId; }
    public void setAssignedBranchId(Long assignedBranchId) { this.assignedBranchId = assignedBranchId; }

    public Long getAssignedCounterId() { return assignedCounterId; }
    public void setAssignedCounterId(Long assignedCounterId) { this.assignedCounterId = assignedCounterId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
