package com.queueless.queueless.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsSummaryDTO {
    private long totalCustomersToday;
    private long appointmentsToday;
    private long walkInsToday;
    private long waitingCount;
    private long currentlyServingCount;
    private long completedCount;
    private long noShowCount;
    private long cancelledCount;
    private double noShowPercentage;

    private double averageWaitTimeMinutes;
    private double averageServiceTimeMinutes;

    private Map<String, Long> customersPerService;
    private Map<String, Long> peakHoursDistribution;
    private List<DailyVolumeItem> dailyVolumeTrend;
    private List<BranchPerformanceItem> branchPerformance;

    public AnalyticsSummaryDTO() {}

    public static class DailyVolumeItem {
        private String date;
        private long appointments;
        private long walkIns;
        private long completed;

        public DailyVolumeItem() {}
        public DailyVolumeItem(String date, long appointments, long walkIns, long completed) {
            this.date = date;
            this.appointments = appointments;
            this.walkIns = walkIns;
            this.completed = completed;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public long getAppointments() { return appointments; }
        public void setAppointments(long appointments) { this.appointments = appointments; }
        public long getWalkIns() { return walkIns; }
        public void setWalkIns(long walkIns) { this.walkIns = walkIns; }
        public long getCompleted() { return completed; }
        public void setCompleted(long completed) { this.completed = completed; }
    }

    public static class BranchPerformanceItem {
        private String branchName;
        private long totalServed;
        private double avgWaitMinutes;
        private double avgServiceMinutes;
        private double satisfactionRate;

        public BranchPerformanceItem() {}
        public BranchPerformanceItem(String branchName, long totalServed, double avgWaitMinutes, double avgServiceMinutes, double satisfactionRate) {
            this.branchName = branchName;
            this.totalServed = totalServed;
            this.avgWaitMinutes = avgWaitMinutes;
            this.avgServiceMinutes = avgServiceMinutes;
            this.satisfactionRate = satisfactionRate;
        }

        public String getBranchName() { return branchName; }
        public void setBranchName(String branchName) { this.branchName = branchName; }
        public long getTotalServed() { return totalServed; }
        public void setTotalServed(long totalServed) { this.totalServed = totalServed; }
        public double getAvgWaitMinutes() { return avgWaitMinutes; }
        public void setAvgWaitMinutes(double avgWaitMinutes) { this.avgWaitMinutes = avgWaitMinutes; }
        public double getAvgServiceMinutes() { return avgServiceMinutes; }
        public void setAvgServiceMinutes(double avgServiceMinutes) { this.avgServiceMinutes = avgServiceMinutes; }
        public double getSatisfactionRate() { return satisfactionRate; }
        public void setSatisfactionRate(double satisfactionRate) { this.satisfactionRate = satisfactionRate; }
    }

    public long getTotalCustomersToday() { return totalCustomersToday; }
    public void setTotalCustomersToday(long totalCustomersToday) { this.totalCustomersToday = totalCustomersToday; }

    public long getAppointmentsToday() { return appointmentsToday; }
    public void setAppointmentsToday(long appointmentsToday) { this.appointmentsToday = appointmentsToday; }

    public long getWalkInsToday() { return walkInsToday; }
    public void setWalkInsToday(long walkInsToday) { this.walkInsToday = walkInsToday; }

    public long getWaitingCount() { return waitingCount; }
    public void setWaitingCount(long waitingCount) { this.waitingCount = waitingCount; }

    public long getCurrentlyServingCount() { return currentlyServingCount; }
    public void setCurrentlyServingCount(long currentlyServingCount) { this.currentlyServingCount = currentlyServingCount; }

    public long getCompletedCount() { return completedCount; }
    public void setCompletedCount(long completedCount) { this.completedCount = completedCount; }

    public long getNoShowCount() { return noShowCount; }
    public void setNoShowCount(long noShowCount) { this.noShowCount = noShowCount; }

    public long getCancelledCount() { return cancelledCount; }
    public void setCancelledCount(long cancelledCount) { this.cancelledCount = cancelledCount; }

    public double getNoShowPercentage() { return noShowPercentage; }
    public void setNoShowPercentage(double noShowPercentage) { this.noShowPercentage = noShowPercentage; }

    public double getAverageWaitTimeMinutes() { return averageWaitTimeMinutes; }
    public void setAverageWaitTimeMinutes(double averageWaitTimeMinutes) { this.averageWaitTimeMinutes = averageWaitTimeMinutes; }

    public double getAverageServiceTimeMinutes() { return averageServiceTimeMinutes; }
    public void setAverageServiceTimeMinutes(double averageServiceTimeMinutes) { this.averageServiceTimeMinutes = averageServiceTimeMinutes; }

    public Map<String, Long> getCustomersPerService() { return customersPerService; }
    public void setCustomersPerService(Map<String, Long> customersPerService) { this.customersPerService = customersPerService; }

    public Map<String, Long> getPeakHoursDistribution() { return peakHoursDistribution; }
    public void setPeakHoursDistribution(Map<String, Long> peakHoursDistribution) { this.peakHoursDistribution = peakHoursDistribution; }

    public List<DailyVolumeItem> getDailyVolumeTrend() { return dailyVolumeTrend; }
    public void setDailyVolumeTrend(List<DailyVolumeItem> dailyVolumeTrend) { this.dailyVolumeTrend = dailyVolumeTrend; }

    public List<BranchPerformanceItem> getBranchPerformance() { return branchPerformance; }
    public void setBranchPerformance(List<BranchPerformanceItem> branchPerformance) { this.branchPerformance = branchPerformance; }
}
