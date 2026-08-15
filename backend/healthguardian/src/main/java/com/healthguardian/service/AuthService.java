package com.healthguardian.service;

import com.healthguardian.dto.AuthResponse;
import com.healthguardian.dto.SignInRequest;
import com.healthguardian.dto.SignUpRequest;
import com.healthguardian.entity.Role;
import com.healthguardian.entity.SimpleUser;
import com.healthguardian.entity.User;
import com.healthguardian.entity.VerificationToken;
import com.healthguardian.exception.EmailAlreadyExistsException;
import com.healthguardian.exception.InvalidCredentialsException;
import com.healthguardian.repository.UserRepository;
import com.healthguardian.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Transactional
    public AuthResponse signUp(SignUpRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        // Get SIMPLE_USER role
        Role simpleUserRole = roleService.getRoleByName("SIMPLE_USER");

        // Create new SimpleUser
        SimpleUser user = new SimpleUser();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(simpleUserRole);
        user.setIsActive(false); // Account inactive until email verified
        user.setIsProfileComplete(false);

        user = (SimpleUser) userRepository.save(user);

        // Create verification token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setTokenType(VerificationToken.TokenType.EMAIL_VERIFICATION);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        verificationToken.setIsUsed(false);
        verificationTokenRepository.save(verificationToken);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), token);

        // Generate JWT token (user can login but features are limited until verified)
        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().getName())
                .isProfileComplete(user.getIsProfileComplete())
                .message("Account created! Please check your email to verify your account.")
                .build();
    }

    @Transactional
    public String verifyEmail(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));

        if (verificationToken.isExpired()) {
            throw new RuntimeException("Verification token has expired");
        }

        if (verificationToken.getIsUsed()) {
            throw new RuntimeException("Verification token has already been used");
        }

        User user = verificationToken.getUser();
        user.setIsActive(true);
        userRepository.save(user);

        verificationToken.setIsUsed(true);
        verificationTokenRepository.save(verificationToken);

        return "Email verified successfully!";
    }

    @Transactional
    public String resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getIsActive()) {
            throw new RuntimeException("Email already verified");
        }

        // Delete old tokens
        verificationTokenRepository.deleteByUser(user);

        // Create new token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setTokenType(VerificationToken.TokenType.EMAIL_VERIFICATION);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        verificationToken.setIsUsed(false);
        verificationTokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(user.getEmail(), token);

        return "Verification email sent!";
    }

    @Transactional
    public String requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete old reset tokens
        verificationTokenRepository.deleteByUser(user);

        // Create reset token
        String token = UUID.randomUUID().toString();
        VerificationToken resetToken = new VerificationToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setTokenType(VerificationToken.TokenType.PASSWORD_RESET);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        resetToken.setIsUsed(false);
        verificationTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), token);

        return "Password reset email sent!";
    }

    @Transactional
    public String resetPassword(String token, String newPassword) {
        VerificationToken resetToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (resetToken.isExpired()) {
            throw new RuntimeException("Reset token has expired");
        }

        if (resetToken.getIsUsed()) {
            throw new RuntimeException("Reset token has already been used");
        }

        if (resetToken.getTokenType() != VerificationToken.TokenType.PASSWORD_RESET) {
            throw new RuntimeException("Invalid token type");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setIsUsed(true);
        verificationTokenRepository.save(resetToken);

        return "Password reset successfully!";
    }

    @Transactional
    public AuthResponse signIn(SignInRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        // 🆕 IMPORTANT : Vérifier si l'email est vérifié
        if (!user.getIsActive()) {
            throw new InvalidCredentialsException("Please verify your email before signing in.");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().getName())
                .isProfileComplete(user.getIsProfileComplete())
                .isActive(user.getIsActive()) // ← IMPORTANT : inclure isActive
                .message("Login successful")
                .build();
    }
}