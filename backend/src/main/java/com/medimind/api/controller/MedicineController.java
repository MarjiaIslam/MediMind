package com.medimind.api.controller;

import com.medimind.api.model.Medicine;
import com.medimind.api.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

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
        List<Map<String, Object>> todayList = new ArrayList<>();
        
        for (Medicine med : medicines) {
            if (med.getStartDate() != null && today.isBefore(med.getStartDate())) continue;
            if (med.getEndDate() != null && today.isAfter(med.getEndDate())) continue;
            
            // Calculate days remaining
            long daysRemaining = 0;
            if (med.getEndDate() != null) {
                daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(today, med.getEndDate());
            }
            
            // Add time slots as separate entries
            if (med.getTime1() != null && !med.getTime1().isEmpty()) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("medicineId", med.getId());
                entry.put("medicineName", med.getName());
                entry.put("dosage", med.getDosage() != null ? med.getDosage() : "");
                entry.put("slot", 1);
                entry.put("time", med.getTime1());
                entry.put("taken", med.isTime1Taken());
                entry.put("daysRemaining", Math.max(0, daysRemaining));
                entry.put("takenAt", med.isTime1Taken() && med.getLastTakenAt() != null ? med.getLastTakenAt().toString() : null);
                todayList.add(entry);
            }
            if (med.getTime2() != null && !med.getTime2().isEmpty()) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("medicineId", med.getId());
                entry.put("medicineName", med.getName());
                entry.put("dosage", med.getDosage() != null ? med.getDosage() : "");
                entry.put("slot", 2);
                entry.put("time", med.getTime2());
                entry.put("taken", med.isTime2Taken());
                entry.put("daysRemaining", Math.max(0, daysRemaining));
                entry.put("takenAt", med.isTime2Taken() && med.getLastTakenAt() != null ? med.getLastTakenAt().toString() : null);
                todayList.add(entry);
            }
            if (med.getTime3() != null && !med.getTime3().isEmpty()) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("medicineId", med.getId());
                entry.put("medicineName", med.getName());
                entry.put("dosage", med.getDosage() != null ? med.getDosage() : "");
                entry.put("slot", 3);
                entry.put("time", med.getTime3());
                entry.put("taken", med.isTime3Taken());
                entry.put("daysRemaining", Math.max(0, daysRemaining));
                entry.put("takenAt", med.isTime3Taken() && med.getLastTakenAt() != null ? med.getLastTakenAt().toString() : null);
                todayList.add(entry);
            }
        }
        
        // Sort by time
        todayList.sort((a, b) -> ((String) a.get("time")).compareTo((String) b.get("time")));
        
        return todayList;
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
        summary.put("adherencePercentage", totalDoses > 0 ? (takenDoses * 100 / totalDoses) : 0);
        
        return summary;
    }

    // Add a new medicine
    @PostMapping("/add")
    public ResponseEntity<?> addMedicine(@Valid @RequestBody Medicine medicine, BindingResult bindingResult) {
        // Validate at least one time slot is provided
        boolean hasAtLeastOneTime = (medicine.getTime1() != null && !medicine.getTime1().trim().isEmpty()) ||
                                    (medicine.getTime2() != null && !medicine.getTime2().trim().isEmpty()) ||
                                    (medicine.getTime3() != null && !medicine.getTime3().trim().isEmpty());
        if (!hasAtLeastOneTime) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "At least one time slot must be provided"));
        }
        
        if (bindingResult.hasErrors()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", bindingResult.getAllErrors().get(0).getDefaultMessage()));
        }
        
        if (medicine.getStartDate() == null) {
            medicine.setStartDate(LocalDate.now());
        }
        if (medicine.getDurationDays() > 0 && medicine.getEndDate() == null) {
            medicine.setEndDate(medicine.getStartDate().plusDays(medicine.getDurationDays()));
        }
        medicine.setActive(true);
        return ResponseEntity.ok(medicineRepository.save(medicine));
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