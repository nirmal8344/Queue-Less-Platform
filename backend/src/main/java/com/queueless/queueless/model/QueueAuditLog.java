package com.queueless.queueless.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "queue_audit_logs")
public class QueueAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long tokenId;

    @Enumerated(EnumType.STRING)
    private QueueStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QueueStatus newStatus;

    private Long changedByUserId;
    private String changedByName;
    private String changedByRole;

    private String remarks;

    private LocalDateTime timestamp = LocalDateTime.now();

    public QueueAuditLog() {}

    public QueueAuditLog(Long tokenId, QueueStatus previousStatus, QueueStatus newStatus, Long changedByUserId, String changedByName, String changedByRole, String remarks) {
        this.tokenId = tokenId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedByUserId = changedByUserId;
        this.changedByName = changedByName;
        this.changedByRole = changedByRole;
        this.remarks = remarks;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTokenId() { return tokenId; }
    public void setTokenId(Long tokenId) { this.tokenId = tokenId; }

    public QueueStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(QueueStatus previousStatus) { this.previousStatus = previousStatus; }

    public QueueStatus getNewStatus() { return newStatus; }
    public void setNewStatus(QueueStatus newStatus) { this.newStatus = newStatus; }

    public Long getChangedByUserId() { return changedByUserId; }
    public void setChangedByUserId(Long changedByUserId) { this.changedByUserId = changedByUserId; }

    public String getChangedByName() { return changedByName; }
    public void setChangedByName(String changedByName) { this.changedByName = changedByName; }

    public String getChangedByRole() { return changedByRole; }
    public void setChangedByRole(String changedByRole) { this.changedByRole = changedByRole; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
