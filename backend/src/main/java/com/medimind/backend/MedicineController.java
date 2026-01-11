package com.medimind.backend;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import lombok.Data;


@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "http://localhost:5173")
public class MedicineController {

    @Autowired
    private MedicineService medicineService;

    @Autowired
    private UserService userService;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = ((UserDetails) principal).getUsername();
        return userService.findByEmail(email);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addMedicine(@RequestBody Medicine medicine) {
        try {
            User user = getCurrentUser();
            medicine.setUser(user);
            Medicine saved = medicineService.addMedicine(medicine);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

  @GetMapping("/user")
public ResponseEntity<List<Medicine>> getUserMedicines() {
    User user = getCurrentUser();
    List<Medicine> medicines = medicineService.getMedicinesByUser(user);
    return ResponseEntity.ok(medicines);
}

@PostMapping("/mark-taken/{id}")
public ResponseEntity<?> markAsTaken(@PathVariable Long id) {
    try {
        User user = getCurrentUser();
        Medicine updated = medicineService.markAsTaken(id, user); // ← Now passes user
        return ResponseEntity.ok(updated);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
}