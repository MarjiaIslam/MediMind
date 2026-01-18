package com.medimind.api.controller;

import com.medimind.api.model.Medicine;
import com.medimind.api.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medicine")
@CrossOrigin(origins = "*")
public class MedicineController {

    @Autowired private MedicineRepository medicineRepository;

    // Get all medicines for a user
    @GetMapping("/{userId}")
    public List<Medicine> getMedicines(@PathVariable Long userId) {
        return medicineRepository.findByUserId(userId);
    }

    // Get active medicines for today
    @GetMapping("/today/{userId}")
    public List<Map<String, Object>> getTodaysMedicines(@PathVariable Long userId) {
        List<Medicine> medicines = medicineRepository.findByUserIdAndActiveTrue(userId);
        LocalDate today = LocalDate.now();
        
        return medicines.stream()
                .filter(med -> {
                    if (med.getStartDate() == null) return true;
                    if (med.getEndDate() != null && today.isAfter(med.getEndDate())) return false;
                    return !today.isBefore(med.getStartDate());
                })
                .map(med -> {
                    Map<String, Object> medMap = new HashMap<>();
                    medMap.put("id", med.getId());
                    medMap.put("name", med.getName());
                    medMap.put("dosage", med.getDosage());
                    medMap.put("notes", med.getNotes());
                    
                    // Build time slots
                    List<Map<String, Object>> timeSlots = new ArrayList<>();
                    if (med.getTime1() != null && !med.getTime1().isEmpty()) {
                        timeSlots.add(Map.of("time", med.getTime1(), "taken", med.isTime1Taken(), "slot", 1));
                    }
                    if (med.getTime2() != null && !med.getTime2().isEmpty()) {
                        timeSlots.add(Map.of("time", med.getTime2(), "taken", med.isTime2Taken(), "slot", 2));
                    }
                    if (med.getTime3() != null && !med.getTime3().isEmpty()) {
                        timeSlots.add(Map.of("time", med.getTime3(), "taken", med.isTime3Taken(), "slot", 3));
                    }
                    // Fallback to legacy field
                    if (timeSlots.isEmpty() && med.getTime() != null) {
                        timeSlots.add(Map.of("time", med.getTime(), "taken", med.isTaken(), "slot", 0));
                    }
                    
                    medMap.put("timeSlots", timeSlots);
                    medMap.put("durationDays", med.getDurationDays());
                    medMap.put("startDate", med.getStartDate());
                    medMap.put("endDate", med.getEndDate());
                    
                    // Calculate days remaining
                    if (med.getEndDate() != null) {
                        long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(today, med.getEndDate());
                        medMap.put("daysRemaining", Math.max(0, daysRemaining));
                    }
                    
                    // Calculate completion status for today
                    int totalSlots = timeSlots.size();
                    int takenSlots = (int) timeSlots.stream().filter(ts -> (boolean) ts.get("taken")).count();
                    medMap.put("totalDoses", totalSlots);
                    medMap.put("takenDoses", takenSlots);
                    medMap.put("allTaken", totalSlots > 0 && takenSlots == totalSlots);
                    
                    return medMap;
                })
                .collect(Collectors.toList());
    }

    // Get medicine intake summary for today
    @GetMapping("/summary/{userId}")
    public Map<String, Object> getMedicineSummary(@PathVariable Long userId) {
        List<Medicine> medicines = medicineRepository.findByUserIdAndActiveTrue(userId);
        LocalDate today = LocalDate.now();
        
        int totalDoses = 0;
        int takenDoses = 0;
        
        for (Medicine med : medicines) {
            if (med.getStartDate() != null && today.isBefore(med.getStartDate())) continue;
            if (med.getEndDate() != null && today.isAfter(med.getEndDate())) continue;
            
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
            // Fallback
            if (med.getTime() != null && med.getTime1() == null) {
                totalDoses++;
                if (med.isTaken()) takenDoses++;
            }
        }
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalMedicines", medicines.size());
        summary.put("totalDoses", totalDoses);
        summary.put("takenDoses", takenDoses);
        summary.put("remainingDoses", totalDoses - takenDoses);
        summary.put("completionPercentage", totalDoses > 0 ? (takenDoses * 100 / totalDoses) : 0);
        
        return summary;
    }

    // Add a new medicine
    @PostMapping("/add")
    public Medicine addMedicine(@RequestBody Medicine medicine) {
        if (medicine.getStartDate() == null) {
            medicine.setStartDate(LocalDate.now());
        }
        if (medicine.getDurationDays() > 0 && medicine.getEndDate() == null) {
            medicine.setEndDate(medicine.getStartDate().plusDays(medicine.getDurationDays()));
        }
        medicine.setActive(true);
        return medicineRepository.save(medicine);
    }

    // Toggle specific time slot
    @PutMapping("/toggle/{id}/{slot}")
    public ResponseEntity<?> toggleTimeSlot(@PathVariable Long id, @PathVariable int slot) {
        return medicineRepository.findById(id)
                .map(med -> {
                    switch (slot) {
                        case 1:
                            med.setTime1Taken(!med.isTime1Taken());
                            break;
                        case 2:
                            med.setTime2Taken(!med.isTime2Taken());
                            break;
                        case 3:
                            med.setTime3Taken(!med.isTime3Taken());
                            break;
                        default:
                            med.setTaken(!med.isTaken());
                    }
                    med.setLastTakenAt(LocalDateTime.now());
                    return ResponseEntity.ok(medicineRepository.save(med));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Legacy toggle (for backward compatibility)
    @PutMapping("/toggle/{id}")
    public Medicine toggleTaken(@PathVariable Long id) {
        Medicine med = medicineRepository.findById(id).orElseThrow();
        med.setTaken(!med.isTaken());
        med.setLastTakenAt(LocalDateTime.now());
        return medicineRepository.save(med);
    }

    // Update medicine
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMedicine(@PathVariable Long id, @RequestBody Medicine updated) {
        return medicineRepository.findById(id)
                .map(med -> {
                    med.setName(updated.getName());
                    med.setDosage(updated.getDosage());
                    med.setTime1(updated.getTime1());
                    med.setTime2(updated.getTime2());
                    med.setTime3(updated.getTime3());
                    med.setDurationDays(updated.getDurationDays());
                    med.setNotes(updated.getNotes());
                    if (updated.getStartDate() != null) med.setStartDate(updated.getStartDate());
                    if (updated.getEndDate() != null) med.setEndDate(updated.getEndDate());
                    return ResponseEntity.ok(medicineRepository.save(med));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete medicine
    @DeleteMapping("/{id}")
    public void deleteMedicine(@PathVariable Long id) {
        medicineRepository.deleteById(id);
    }

    // Reset all medicine taken status (for daily reset)
    @PutMapping("/reset/{userId}")
    public ResponseEntity<?> resetDailyStatus(@PathVariable Long userId) {
        List<Medicine> medicines = medicineRepository.findByUserId(userId);
        for (Medicine med : medicines) {
            med.setTime1Taken(false);
            med.setTime2Taken(false);
            med.setTime3Taken(false);
            med.setTaken(false);
            medicineRepository.save(med);
        }
        return ResponseEntity.ok(Map.of("message", "Daily status reset for all medicines"));
    }

    // Get upcoming reminders
    @GetMapping("/reminders/{userId}")
    public List<Map<String, Object>> getUpcomingReminders(@PathVariable Long userId) {
        List<Medicine> medicines = medicineRepository.findByUserIdAndActiveTrue(userId);
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> reminders = new ArrayList<>();
        
        for (Medicine med : medicines) {
            if (med.getStartDate() != null && today.isBefore(med.getStartDate())) continue;
            if (med.getEndDate() != null && today.isAfter(med.getEndDate())) continue;
            
            if (med.getTime1() != null && !med.getTime1().isEmpty() && !med.isTime1Taken()) {
                reminders.add(Map.of(
                    "medicineId", med.getId(),
                    "name", med.getName(),
                    "dosage", med.getDosage() != null ? med.getDosage() : "",
                    "time", med.getTime1(),
                    "slot", 1
                ));
            }
            if (med.getTime2() != null && !med.getTime2().isEmpty() && !med.isTime2Taken()) {
                reminders.add(Map.of(
                    "medicineId", med.getId(),
                    "name", med.getName(),
                    "dosage", med.getDosage() != null ? med.getDosage() : "",
                    "time", med.getTime2(),
                    "slot", 2
                ));
            }
            if (med.getTime3() != null && !med.getTime3().isEmpty() && !med.isTime3Taken()) {
                reminders.add(Map.of(
                    "medicineId", med.getId(),
                    "name", med.getName(),
                    "dosage", med.getDosage() != null ? med.getDosage() : "",
                    "time", med.getTime3(),
                    "slot", 3
                ));
            }
        }
        
        // Sort by time
        reminders.sort((a, b) -> ((String) a.get("time")).compareTo((String) b.get("time")));
        
        return reminders;
    }
}