package com.queueless.queueless.model;

public enum PriorityCategory {
    GENERAL(1, "General"),
    SPECIAL_APPOINTMENT(2, "Special Appointment"),
    SENIOR_CITIZEN(3, "Senior Citizen"),
    ACCESSIBILITY(4, "Accessibility / Differently Abled"),
    EMERGENCY(5, "Emergency Service");

    private final int level;
    private final String displayName;

    PriorityCategory(int level, String displayName) {
        this.level = level;
        this.displayName = displayName;
    }

    public int getLevel() {
        return level;
    }

    public String getDisplayName() {
        return displayName;
    }
}
