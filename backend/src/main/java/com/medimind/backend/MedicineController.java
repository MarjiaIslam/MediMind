package com.medimind.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "http://localhost:5173")
public class MedicineController {

    @Autowired
    private MedicineService medicineService;

    public static class AddMedicineRequest {
        private String name;
        private String dosage;
        private String frequency;
        private String timeOfDay;
        // getters/setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDosage() { return dosage; }
        public void setDosage(String dosage) { this.dosage = dosage; }
        public String getFrequency() { return frequency; }
        public void setFrequency(String frequency) { this.frequency = frequency; }
        public String getTimeOfDay() { return timeOfDay; }
        public void setTimeOfDay(String timeOfDay) { this.timeOfDay = timeOfDay; }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addMedicine(@RequestBody AddMedicineRequest request, @RequestParam Long userId) {
        try {
            User user = new User();
            user.setId(userId);

            Medicine medicine = new Medicine();
            medicine.setName(request.getName());
            medicine.setDosage(request.getDosage());
            medicine.setFrequency(request.getFrequency());
            medicine.setTimeOfDay(request.getTimeOfDay());
            medicine.setTakenToday(false);
            medicine.setUser(user);

            Medicine saved = medicineService.addMedicine(medicine);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Medicine>> getMedicines(@PathVariable Long userId) {
        User user = new User();
        user.setId(userId);
        List<Medicine> medicines = medicineService.getMedicinesByUser(user);
        return ResponseEntity.ok(medicines);
    }

    @PostMapping("/mark-taken/{id}")
    public ResponseEntity<?> markTaken(@PathVariable Long id) {
        try {
            Medicine med = medicineService.markAsTaken(id);
            return ResponseEntity.ok(med);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}