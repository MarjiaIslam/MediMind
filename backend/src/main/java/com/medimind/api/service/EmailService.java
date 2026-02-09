package com.medimind.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

import java.util.Random;
import java.util.logging.Logger;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

/**
 * Professional Email Service for MediMind
 * Sends beautiful HTML emails like Instagram/Facebook
 */
@Service
public class EmailService {

    private static final Logger logger = Logger.getLogger(EmailService.class.getName());

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;
    
    @Value("${spring.mail.password:}")
    private String mailPassword;

    /**
     * Generate a 6-digit verification code
     */
    public String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
    
    /**
     * Check if email service is properly configured
     */
    public boolean isEmailConfigured() {
        return mailSender != null && fromEmail != null && !fromEmail.isEmpty() 
               && mailPassword != null && !mailPassword.isEmpty();
    }

    /**
     * Send professional HTML verification email
     * Returns true if email was sent successfully
     */
    public boolean sendVerificationEmail(String toEmail, String verificationCode, String userName) {
        logger.info("Sending verification email to: " + toEmail);

        if (!isEmailConfigured()) {
            logger.warning("EMAIL NOT CONFIGURED - Set MAIL_USERNAME and MAIL_PASSWORD");
            logger.warning("Verification code for " + toEmail + ": " + verificationCode);
            return false;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "MediMind");
            helper.setTo(toEmail);
            helper.setSubject("Your MediMind verification code: " + verificationCode);
            helper.setText(buildHtmlEmail(userName, verificationCode, "verify"), true);

            mailSender.send(message);
            logger.info("Verification email sent successfully to: " + toEmail);
            return true;
        } catch (Exception e) {
            logger.severe("Failed to send email to " + toEmail + ": " + e.getMessage());
            return false;
        }
    }

    /**
     * Send password reset email
     */
    public boolean sendPasswordResetEmail(String toEmail, String resetCode, String userName) {
        logger.info("Sending password reset email to: " + toEmail);

        if (!isEmailConfigured()) {
            logger.warning("Email not configured - Reset code for " + toEmail + ": " + resetCode);
            return false;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "MediMind");
            helper.setTo(toEmail);
            helper.setSubject("Reset your MediMind password");
            helper.setText(buildHtmlEmail(userName, resetCode, "reset"), true);

            mailSender.send(message);
            logger.info("Password reset email sent to: " + toEmail);
            return true;
        } catch (Exception e) {
            logger.severe("Failed to send password reset email: " + e.getMessage());
            return false;
        }
    }

    /**
     * Build professional HTML email like Instagram/Facebook
     */
    private String buildHtmlEmail(String userName, String code, String type) {
        String title = type.equals("verify") ? "Verify your email address" : "Reset your password";
        String subtitle = type.equals("verify") 
            ? "Thanks for signing up for MediMind! Please confirm your email address by entering the code below."
            : "We received a request to reset your password. Enter the code below to continue.";
        
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                                        <div style="display: inline-block; background: linear-gradient(135deg, #68a676 0%%, #9b8ec4 100%%); padding: 12px 20px; border-radius: 8px;">
                                            <span style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">MediMind</span>
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 32px 40px;">
                                        <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #1a1a1a; text-align: center;">
                                            %s
                                        </h1>
                                        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #666666; text-align: center;">
                                            Hi %s, %s
                                        </p>
                                        
                                        <!-- Code Box -->
                                        <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                                            <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">
                                                Your verification code
                                            </p>
                                            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a; font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;">
                                                %s
                                            </div>
                                        </div>
                                        
                                        <p style="margin: 0; font-size: 13px; color: #999999; text-align: center;">
                                            This code expires in <strong>10 minutes</strong>
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 24px 40px 32px; border-top: 1px solid #f0f0f0;">
                                        <p style="margin: 0 0 8px; font-size: 13px; color: #999999; text-align: center;">
                                            If you didn't request this, you can safely ignore this email.
                                        </p>
                                        <p style="margin: 0; font-size: 12px; color: #cccccc; text-align: center;">
                                            MediMind - Your Digital Health Companion
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(title, userName, subtitle, code);
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