package com.medimind.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // Enables @Scheduled background tasks
@EnableAsync       // Enables @Async for concurrent processing
public class MediMindApplication {
    public static void main(String[] args) {
        SpringApplication.run(MediMindApplication.class, args);
    }
}
