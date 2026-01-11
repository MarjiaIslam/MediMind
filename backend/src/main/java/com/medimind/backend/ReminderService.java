package com.medimind.backend;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalTime;

@Service
public class ReminderService {

    // Run every hour (at minute 0)
    @Scheduled(cron = "0 0 * * * ?")
    public void checkReminders() {
        LocalTime now = LocalTime.now();
        String timeSlot = "";

        // Determine time of day
        if (now.isAfter(LocalTime.of(6, 0)) && now.isBefore(LocalTime.of(10, 0))) {
            timeSlot = "morning";
        } else if (now.isAfter(LocalTime.of(12, 0)) && now.isBefore(LocalTime.of(14, 0))) {
            timeSlot = "afternoon";
        } else if (now.isAfter(LocalTime.of(18, 0)) && now.isBefore(LocalTime.of(21, 0))) {
            timeSlot = "evening";
        }

        if (!timeSlot.isEmpty()) {
            System.out.println("⏰ Reminder: It's " + timeSlot + " — time to take your medicine!");
            // Later: send email, SMS, or WebSocket notification
        }
    }
}