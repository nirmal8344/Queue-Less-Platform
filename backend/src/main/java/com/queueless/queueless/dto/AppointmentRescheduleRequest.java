package com.queueless.queueless.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentRescheduleRequest {
    @NotNull(message = "New appointment date is required")
    private LocalDate newDate;

    @NotNull(message = "New appointment time is required")
    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime newTime;

    private String reason;

    public AppointmentRescheduleRequest() {}

    public LocalDate getNewDate() { return newDate; }
    public void setNewDate(LocalDate newDate) { this.newDate = newDate; }

    public LocalTime getNewTime() { return newTime; }
    public void setNewTime(LocalTime newTime) { this.newTime = newTime; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
