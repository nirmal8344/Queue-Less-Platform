package com.queueless.queueless.dto;

public class TokenActionRequest {
    private Long counterId;
    private String remarks;

    public TokenActionRequest() {}

    public TokenActionRequest(Long counterId, String remarks) {
        this.counterId = counterId;
        this.remarks = remarks;
    }

    public Long getCounterId() { return counterId; }
    public void setCounterId(Long counterId) { this.counterId = counterId; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
