package com.healthguardian.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for sending emails
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Send verification email to user
     */
    public void sendVerificationEmail(String toEmail, String verificationToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("HealthGuardian AI - Verify Your Email");

            String verificationUrl = frontendUrl + "/verify-email?token=" + verificationToken + "&email=" + toEmail;

            String emailBody = "Welcome to HealthGuardian AI!\n\n" +
                    "Please click the link below to verify your email address:\n\n" +
                    verificationUrl + "\n\n" +
                    "This link will expire in 24 hours.\n\n" +
                    "If you didn't create an account, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "HealthGuardian AI Team";

            message.setText(emailBody);
            mailSender.send(message);

            log.info("Verification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Error sending verification email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send verification email");
        }
    }

    /**
     * Send password reset email
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("HealthGuardian AI - Reset Your Password");

            String resetUrl = frontendUrl + "/reset-password?token=" + resetToken + "&email=" + toEmail;

            String emailBody = "Hello,\n\n" +
                    "You requested to reset your password.\n\n" +
                    "Please click the link below to reset your password:\n\n" +
                    resetUrl + "\n\n" +
                    "This link will expire in 1 hour.\n\n" +
                    "If you didn't request this, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "HealthGuardian AI Team";

            message.setText(emailBody);
            mailSender.send(message);

            log.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Error sending password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email");
        }
    }
}