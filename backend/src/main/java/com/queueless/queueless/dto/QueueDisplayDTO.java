package com.queueless.queueless.dto;

import java.time.LocalDateTime;
import java.util.List;

public class QueueDisplayDTO {
    private Long branchId;
    private String branchName;
    private List<ServingItem> currentlyServing;
    private List<WaitingItem> waitingTokens;
    private List<CompletedItem> recentCompleted;
    private LocalDateTime timestamp = LocalDateTime.now();

    public QueueDisplayDTO() {}

    public static class ServingItem {
        private String tokenNumber;
        private String counterName;
        private String serviceName;
        private String priority;
        private String status;

        public ServingItem() {}
        public ServingItem(String tokenNumber, String counterName, String serviceName, String priority, String status) {
            this.tokenNumber = tokenNumber;
            this.counterName = counterName;
            this.serviceName = serviceName;
            this.priority = priority;
            this.status = status;
        }

        public String getTokenNumber() { return tokenNumber; }
        public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }
        public String getCounterName() { return counterName; }
        public void setCounterName(String counterName) { this.counterName = counterName; }
        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class WaitingItem {
        private String tokenNumber;
        private String serviceName;
        private String priority;
        private int estimatedWaitMinutes;

        public WaitingItem() {}
        public WaitingItem(String tokenNumber, String serviceName, String priority, int estimatedWaitMinutes) {
            this.tokenNumber = tokenNumber;
            this.serviceName = serviceName;
            this.priority = priority;
            this.estimatedWaitMinutes = estimatedWaitMinutes;
        }

        public String getTokenNumber() { return tokenNumber; }
        public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }
        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public int getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
        public void setEstimatedWaitMinutes(int estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; }
    }

    public static class CompletedItem {
        private String tokenNumber;
        private String counterName;
        private String serviceName;

        public CompletedItem() {}
        public CompletedItem(String tokenNumber, String counterName, String serviceName) {
            this.tokenNumber = tokenNumber;
            this.counterName = counterName;
            this.serviceName = serviceName;
        }

        public String getTokenNumber() { return tokenNumber; }
        public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }
        public String getCounterName() { return counterName; }
        public void setCounterName(String counterName) { this.counterName = counterName; }
        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public List<ServingItem> getCurrentlyServing() { return currentlyServing; }
    public void setCurrentlyServing(List<ServingItem> currentlyServing) { this.currentlyServing = currentlyServing; }

    public List<WaitingItem> getWaitingTokens() { return waitingTokens; }
    public void setWaitingTokens(List<WaitingItem> waitingTokens) { this.waitingTokens = waitingTokens; }

    public List<CompletedItem> getRecentCompleted() { return recentCompleted; }
    public void setRecentCompleted(List<CompletedItem> recentCompleted) { this.recentCompleted = recentCompleted; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
