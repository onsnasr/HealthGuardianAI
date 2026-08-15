package com.healthguardian.config;

import com.healthguardian.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class EmailVerificationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getServletPath();

        // ✅ Vérifier si la route doit être exclue du filtrage
        if (shouldNotFilter(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        // ✅ Récupérer l'authentification
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        // Si pas d'authentification, passer au filtre suivant
        if (authentication == null || !authentication.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        // ✅ Vérifier si la route nécessite une vérification d'email
        if (requiresEmailVerification(path)) {
            String jwt = extractJwtFromRequest(request);
            if (jwt != null) {
                try {
                    Boolean isActive = jwtService.extractIsActive(jwt);
                    if (isActive != null && !isActive) {
                        // Utilisateur non vérifié
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write(
                                "{\"error\": \"EMAIL_NOT_VERIFIED\", " +
                                        "\"message\": \"Please verify your email before accessing this resource\"}"
                        );
                        return;
                    }
                } catch (Exception e) {
                    // En cas d'erreur avec le JWT, passer au filtre suivant
                    logger.warn("Error extracting JWT claims: " + e.getMessage());
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();

        // ✅ Routes publiques
        if (path.startsWith("/api/auth/")) return true;
        if (path.startsWith("/api/public/")) return true;
        if (path.equals("/health")) return true;
        if (path.startsWith("/actuator/health")) return true;
        if (path.startsWith("/v3/api-docs")) return true;
        if (path.startsWith("/swagger-ui")) return true;
        if (path.startsWith("/error")) return true;

        // ✅ Routes d'appointments accessibles sans vérification d'email
        if (path.startsWith("/api/appointments/search-doctors") && "GET".equals(method)) return true;
        if (path.startsWith("/api/appointments/available-slots/") && "GET".equals(method)) return true;

        return false;
    }

    private boolean requiresEmailVerification(String path) {
        // ✅ Routes qui nécessitent une vérification d'email
        if (path.startsWith("/api/dashboard")) return true;
        if (path.startsWith("/api/profile")) return true;
        if (path.startsWith("/api/users/me")) return true;
        if (path.startsWith("/api/nutrition")) return true;
        if (path.startsWith("/api/exercise")) return true;
        if (path.startsWith("/api/tracking")) return true;
        if (path.startsWith("/api/chat")) return true;
        if (path.startsWith("/api/recommendations")) return true;

        // ✅ Routes d'appointments protégées
        if (path.startsWith("/api/appointments/my-appointments")) return true;
        if (path.startsWith("/api/appointments/doctor/")) return true;
        if (path.equals("/api/appointments")) return true;
        if (path.matches("/api/appointments/\\d+/cancel")) return true;
        if (path.matches("/api/appointments/\\d+/confirm")) return true;
        if (path.matches("/api/appointments/\\d+/reject")) return true;
        if (path.matches("/api/appointments/\\d+/complete")) return true;

        return false;
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}