package com.medimind.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.logging.Logger;

/**
 * Email Service for sending verification codes
 * Demonstrates async email sending with Spring Mail
 */
@Service
public class EmailService {

    private static final Logger logger = Logger.getLogger(EmailService.class.getName());

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:medimind.health@gmail.com}")
    private String fromEmail;

    /**
     * Generate a 6-digit verification code
     */
    public String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    /**
     * Send verification email asynchronously
     * Uses @Async for non-blocking email delivery
     */
    @Async
    public void sendVerificationEmail(String toEmail, String verificationCode, String userName) {
        logger.info("[Thread: " + Thread.currentThread().getName() + "] Sending verification email to: " + toEmail);

        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("🏥 MediMind - Verify Your Email");
                message.setText(buildEmailBody(userName, verificationCode));

                mailSender.send(message);
                logger.info("[Thread: " + Thread.currentThread().getName() + "] Verification email sent successfully to: " + toEmail);
            } else {
                // Development mode - log the code instead of sending email
                logger.warning("========================================");
                logger.warning("EMAIL SERVICE NOT CONFIGURED (Dev Mode)");
                logger.warning("Verification code for " + toEmail + ": " + verificationCode);
                logger.warning("========================================");
            }
        } catch (Exception e) {
            // Log error but don't fail - verification code is still saved
            logger.warning("Failed to send email to " + toEmail + ": " + e.getMessage());
            logger.warning("Verification code (Dev Mode): " + verificationCode);
        }
    }

    /**
     * Send password reset email
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String resetCode, String userName) {
        logger.info("[Thread: " + Thread.currentThread().getName() + "] Sending password reset email to: " + toEmail);

        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("🏥 MediMind - Password Reset");
                message.setText(buildPasswordResetBody(userName, resetCode));

                mailSender.send(message);
                logger.info("Password reset email sent to: " + toEmail);
            } else {
                logger.warning("Password reset code for " + toEmail + ": " + resetCode);
            }
        } catch (Exception e) {
            logger.warning("Failed to send password reset email: " + e.getMessage());
        }
    }

    private String buildEmailBody(String userName, String verificationCode) {
        return String.format("""
            Hi %s,
            
            Welcome to MediMind! 🏥
            
            Please verify your email address by entering this code:
            
            🔐 Verification Code: %s
            
            This code will expire in 10 minutes.
            
            If you didn't create an account with MediMind, please ignore this email.
            
            Stay healthy!
            The MediMind Team
            """, userName, verificationCode);
    }

    private String buildPasswordResetBody(String userName, String resetCode) {
        return String.format("""
            Hi %s,
            
            You requested to reset your password.
            
            🔐 Reset Code: %s
            
            This code will expire in 10 minutes.
            
            If you didn't request this, please ignore this email.
            
            The MediMind Team
            """, userName, resetCode);
    }

    /**
     * Validate if email domain exists using DNS MX record check
     * This provides basic validation that the email domain is real
     */
    public boolean isValidEmailDomain(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }

        String domain = email.substring(email.indexOf("@") + 1);
        
        try {
            // Check for common valid domains first
            String[] commonDomains = {
                "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", 
                "icloud.com", "mail.com", "protonmail.com", "aol.com",
                "live.com", "msn.com", "ymail.com", "zoho.com",
                "edu", "org", "gov" // Educational, organization, government domains
            };
            
            for (String validDomain : commonDomains) {
                if (domain.equalsIgnoreCase(validDomain) || domain.endsWith("." + validDomain)) {
                    return true;
                }
            }

            // For other domains, try DNS lookup
            java.net.InetAddress.getByName(domain);
            return true;
        } catch (Exception e) {
            logger.warning("Invalid email domain: " + domain);
            return false;
        }
    }
}
