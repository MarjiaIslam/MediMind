package com.medimind.api.service;

import com.medimind.api.model.Medicine;
import com.medimind.api.model.User;
import com.medimind.api.repository.MedicineRepository;
import com.medimind.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.logging.Logger;

/**
 * Background Task Service demonstrating Java threading concepts:
 * 1. @Scheduled - Cron-based background tasks running on separate threads
 * 2. @Async - Asynchronous method execution with CompletableFuture
 * 3. ExecutorService - Thread pool for concurrent processing
 * 4. ConcurrentHashMap - Thread-safe data structure for notifications
 */
@Service
public class BackgroundTaskService {

    private static final Logger logger = Logger.getLogger(BackgroundTaskService.class.getName());

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private UserRepository userRepository;

    // Thread-safe storage for pending notifications
    private final ConcurrentHashMap<Long, String> pendingNotifications = new ConcurrentHashMap<>();

    // Thread pool for concurrent medicine checking (demonstrates ExecutorService)
    private final ExecutorService medicineCheckerPool = Executors.newFixedThreadPool(4);

    /**
     * Scheduled Task 1: Check for upcoming medicine doses every minute
     * Runs on a background thread managed by Spring's TaskScheduler
     * Cron: Every minute
     */
    @Scheduled(cron = "0 * * * * *")
    public void checkUpcomingMedicines() {
        logger.info("[Thread: " + Thread.currentThread().getName() + "] Checking upcoming medicines...");

        LocalTime now = LocalTime.now();
        LocalDate today = LocalDate.now();
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        List<Medicine> activeMedicines = medicineRepository.findAll().stream()
                .filter(m -> m.isActive())
                .filter(m -> m.getStartDate() == null || !today.isBefore(m.getStartDate()))
                .filter(m -> m.getEndDate() == null || !today.isAfter(m.getEndDate()))
                .toList();

        // Use ExecutorService to check each medicine in parallel threads
        for (Medicine medicine : activeMedicines) {
            medicineCheckerPool.submit(() -> checkMedicineTime(medicine, now, timeFormatter));
        }

        logger.info("[Thread: " + Thread.currentThread().getName() + "] Scheduled " + activeMedicines.size() + " medicine checks");
    }

    /**
     * Helper method executed by thread pool workers
     * Checks if a medicine is due and queues notification
     */
    private void checkMedicineTime(Medicine medicine, LocalTime now, DateTimeFormatter formatter) {
        String threadName = Thread.currentThread().getName();

        // Check each time slot
        checkTimeSlot(medicine, medicine.getTime1(), medicine.isTime1Taken(), now, formatter, threadName);
        checkTimeSlot(medicine, medicine.getTime2(), medicine.isTime2Taken(), now, formatter, threadName);
        checkTimeSlot(medicine, medicine.getTime3(), medicine.isTime3Taken(), now, formatter, threadName);
    }

    private void checkTimeSlot(Medicine medicine, String timeSlot, boolean taken, LocalTime now, DateTimeFormatter formatter, String threadName) {
        if (timeSlot != null && !timeSlot.isEmpty() && !taken) {
            try {
                LocalTime medicineTime = LocalTime.parse(timeSlot, formatter);
                // If medicine is due within 5 minutes
                if (now.isAfter(medicineTime.minusMinutes(5)) && now.isBefore(medicineTime.plusMinutes(5))) {
                    String notification = "Time to take " + medicine.getName() + " (" + medicine.getDosage() + ")";
                    pendingNotifications.put(medicine.getId(), notification);
                    logger.info("[Thread: " + threadName + "] Queued notification: " + notification);
                }
            } catch (Exception e) {
                // Invalid time format, skip
            }
        }
    }

    /**
     * Scheduled Task 2: Reset daily medicine tracking at midnight
     * Cron: 0 0 0 * * * = At 00:00:00 every day
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void resetDailyMedicineTracking() {
        logger.info("[Thread: " + Thread.currentThread().getName() + "] Midnight reset - Resetting daily medicine tracking...");

        List<Medicine> allMedicines = medicineRepository.findAll();
        int resetCount = 0;

        for (Medicine medicine : allMedicines) {
            if (medicine.isActive()) {
                medicine.setTime1Taken(false);
                medicine.setTime2Taken(false);
                medicine.setTime3Taken(false);
                medicine.setTaken(false);
                medicineRepository.save(medicine);
                resetCount++;
            }
        }

        logger.info("[Thread: " + Thread.currentThread().getName() + "] Reset " + resetCount + " medicines for new day");
    }

    /**
     * Scheduled Task 3: Daily health summary calculation (runs at 6 AM)
     * Demonstrates scheduled analytics processing
     */
    @Scheduled(cron = "0 0 6 * * *")
    public void calculateDailyHealthSummaries() {
        logger.info("[Thread: " + Thread.currentThread().getName() + "] Calculating daily health summaries...");

        List<User> users = userRepository.findAll();

        // Process each user's health summary concurrently
        users.forEach(user -> medicineCheckerPool.submit(() -> {
            String threadName = Thread.currentThread().getName();
            logger.info("[Thread: " + threadName + "] Processing health summary for user: " + user.getUsername());

            // Calculate BMI category for logging
            double bmi = user.getBmi();
            String category = user.getBmiCategory();
            int recommendedCalories = user.getRecommendedCalories();

            logger.info("[Thread: " + threadName + "] User " + user.getUsername() + 
                    " - BMI: " + String.format("%.1f", bmi) + 
                    " (" + category + "), Recommended: " + recommendedCalories + " cal");
        }));
    }

    /**
     * Async Method: Calculate medicine adherence percentage asynchronously
     * Returns CompletableFuture for non-blocking execution
     */
    @Async
    public CompletableFuture<Double> calculateAdherenceAsync(Long userId) {
        logger.info("[Thread: " + Thread.currentThread().getName() + "] Async adherence calculation for user: " + userId);

        List<Medicine> medicines = medicineRepository.findByUserId(userId);
        if (medicines.isEmpty()) {
            return CompletableFuture.completedFuture(100.0);
        }

        long totalDoses = 0;
        long takenDoses = 0;

        for (Medicine med : medicines) {
            if (med.isActive()) {
                if (med.getTime1() != null && !med.getTime1().isEmpty()) {
                    totalDoses++;
                    if (med.isTime1Taken()) takenDoses++;
                }
                if (med.getTime2() != null && !med.getTime2().isEmpty()) {
                    totalDoses++;
                    if (med.isTime2Taken()) takenDoses++;
                }
                if (med.getTime3() != null && !med.getTime3().isEmpty()) {
                    totalDoses++;
                    if (med.isTime3Taken()) takenDoses++;
                }
            }
        }

        double adherence = totalDoses > 0 ? (takenDoses * 100.0 / totalDoses) : 100.0;
        logger.info("[Thread: " + Thread.currentThread().getName() + "] Adherence for user " + userId + ": " + adherence + "%");

        return CompletableFuture.completedFuture(adherence);
    }

    /**
     * Async Method: Process meal suggestions in background
     * Demonstrates async processing with CompletableFuture
     */
    @Async
    public CompletableFuture<String> processMealSuggestionsAsync(Long userId, List<String> ingredients) {
        logger.info("[Thread: " + Thread.currentThread().getName() + "] Async meal processing for user: " + userId);

        // Simulate processing time for complex meal matching
        try {
            Thread.sleep(100); // Simulate computation
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String result = "Processed " + ingredients.size() + " ingredients for user " + userId;
        logger.info("[Thread: " + Thread.currentThread().getName() + "] " + result);

        return CompletableFuture.completedFuture(result);
    }

    /**
     * Get pending notifications (thread-safe access)
     */
    public ConcurrentHashMap<Long, String> getPendingNotifications() {
        return pendingNotifications;
    }

    /**
     * Clear notification after delivery (thread-safe)
     */
    public void clearNotification(Long medicineId) {
        pendingNotifications.remove(medicineId);
    }
}
