package com.medimind.api.controller;

import com.medimind.api.model.JournalEntry;
import com.medimind.api.repository.JournalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/journal")
@CrossOrigin(origins = "*")
public class JournalController {

    @Autowired
    private JournalRepository journalRepository;

    // Get all journal entries for a user
    @GetMapping("/{userId}")
    public List<JournalEntry> getEntries(@PathVariable Long userId) {
        return journalRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Create a new journal entry
    @PostMapping("/add")
    public JournalEntry addEntry(@RequestBody JournalEntry entry) {
        entry.setCreatedAt(LocalDateTime.now());
        entry.setUpdatedAt(LocalDateTime.now());
        return journalRepository.save(entry);
    }

    // Update a journal entry
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEntry(@PathVariable Long id, @RequestBody JournalEntry updatedEntry) {
        return journalRepository.findById(id)
                .map(entry -> {
                    entry.setContent(updatedEntry.getContent());
                    entry.setTitle(updatedEntry.getTitle());
                    entry.setMood(updatedEntry.getMood());
                    entry.setTags(updatedEntry.getTags());
                    entry.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(journalRepository.save(entry));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a journal entry
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEntry(@PathVariable Long id) {
        if (journalRepository.existsById(id)) {
            journalRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Search entries by keyword
    @GetMapping("/search/{userId}")
    public List<JournalEntry> searchEntries(@PathVariable Long userId, @RequestParam String keyword) {
        return journalRepository.searchByKeyword(userId, keyword);
    }

    // Search entries by date
    @GetMapping("/date/{userId}")
    public List<JournalEntry> getEntriesByDate(@PathVariable Long userId, @RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        LocalDateTime startOfDay = localDate.atStartOfDay();
        LocalDateTime endOfDay = localDate.atTime(LocalTime.MAX);
        return journalRepository.findByDateRange(userId, startOfDay, endOfDay);
    }
}
