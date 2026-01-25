package com.medimind.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.logging.Logger;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

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
     * Validate if email domain exists by checking DNS MX records
     * MX records indicate the domain can receive emails
     * This catches fake domains like "fake@notreal123.com"
     */
    public boolean isValidEmailDomain(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }

        String domain = email.substring(email.indexOf("@") + 1).toLowerCase();
        
        // Reject obviously fake/test domains
        String[] blockedDomains = {
            "test.com", "example.com", "fake.com", "temp.com", 
            "mailinator.com", "guerrillamail.com", "10minutemail.com",
            "throwaway.com", "tempmail.com", "fakeinbox.com"
        };
        
        for (String blocked : blockedDomains) {
            if (domain.equals(blocked)) {
                logger.warning("Blocked disposable email domain: " + domain);
                return false;
            }
        }

        // Quick pass for well-known email providers
        String[] trustedDomains = {
            "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", 
            "icloud.com", "mail.com", "protonmail.com", "aol.com",
            "live.com", "msn.com", "ymail.com", "zoho.com",
            "yahoo.co.uk", "hotmail.co.uk", "outlook.co.uk",
            "googlemail.com", "me.com", "mac.com"
        };
        
        for (String trusted : trustedDomains) {
            if (domain.equals(trusted)) {
                return true;
            }
        }
        
        // For educational/corporate domains, check MX records
        try {
            // Check if domain has MX (Mail Exchange) records
            // MX records mean the domain has mail servers and can receive email
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            env.put("com.sun.jndi.dns.timeout.initial", "3000");
            env.put("com.sun.jndi.dns.timeout.retries", "1");
            
            DirContext ctx = new InitialDirContext(env);
            Attributes attrs = ctx.getAttributes(domain, new String[]{"MX"});
            ctx.close();
            
            // If MX records exist, the domain can receive emails
            if (attrs.get("MX") != null && attrs.get("MX").size() > 0) {
                logger.info("Valid email domain (has MX records): " + domain);
                return true;
            }
            
            // Some domains use A records instead of MX (fallback)
            attrs = ctx.getAttributes(domain, new String[]{"A"});
            if (attrs.get("A") != null) {
                logger.info("Valid email domain (has A record): " + domain);
                return true;
            }
            
            logger.warning("Email domain has no mail servers: " + domain);
            return false;
            
        } catch (javax.naming.NameNotFoundException e) {
            logger.warning("Email domain does not exist: " + domain);
            return false;
        } catch (Exception e) {
            logger.warning("Could not verify email domain: " + domain + " - " + e.getMessage());
            // Be lenient on network errors - allow the email
            return true;
        }
    }}