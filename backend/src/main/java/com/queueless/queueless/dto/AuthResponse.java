package com.queueless.queueless.dto;

import com.queueless.queueless.model.Role;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long id;
    private String name;
    private String email;
    private Role role;
    private Long assignedBranchId;
    private Long assignedCounterId;

    public AuthResponse() {}

    public AuthResponse(String token, Long id, String name, String email, Role role, Long assignedBranchId, Long assignedCounterId) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.assignedBranchId = assignedBranchId;
        this.assignedCounterId = assignedCounterId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getAssignedBranchId() { return assignedBranchId; }
    public void setAssignedBranchId(Long assignedBranchId) { this.assignedBranchId = assignedBranchId; }

    public Long getAssignedCounterId() { return assignedCounterId; }
    public void setAssignedCounterId(Long assignedCounterId) { this.assignedCounterId = assignedCounterId; }
}
