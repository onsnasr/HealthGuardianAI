package com.healthguardian.config;

import com.healthguardian.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter - Validates JWT tokens on each request
 */
@Component // Déclare cette classe comme un bean Spring
@RequiredArgsConstructor // Génère un constructeur avec les champs final
public class JwtAuthenticationFilter extends OncePerRequestFilter { // Hérite de OncePerRequestFilter pour s'exécuter une seule fois par requête

    private final JwtService jwtService; // Service pour manipuler les JWT
    private final UserDetailsService userDetailsService; // Service pour charger les détails utilisateur

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request, // La requête HTTP entrante
            @NonNull HttpServletResponse response, // La réponse HTTP sortante
            @NonNull FilterChain filterChain // La chaîne de filtres à continuer
    ) throws ServletException, IOException {

        // Ligne 44: Récupère le header "Authorization" de la requête
        final String authHeader = request.getHeader("Authorization");
        final String jwt; // Contiendra le token JWT
        final String userEmail; // Contiendra l'email extrait du token

        // Lignes 48-51: Si pas de header Authorization OU s'il ne commence pas par "Bearer ",
        // on passe au filtre suivant sans authentifier
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Ligne 54: Extrait le token en enlevant "Bearer " (7 caractères)
        jwt = authHeader.substring(7);

        // Ligne 55: Extrait l'email (username) du token JWT
        userEmail = jwtService.extractUsername(jwt);

        // Lignes 57-58: Si l'email existe ET qu'aucune authentification n'est déjà présente
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Ligne 59: Charge les détails de l'utilisateur depuis la base de données
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // Ligne 61: Vérifie si le token est valide (signature + expiration + correspond à l'utilisateur)
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // Lignes 62-66: Crée un objet d'authentification Spring Security
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, // L'utilisateur authentifié
                        null, // Pas de credentials (déjà vérifié par JWT)
                        userDetails.getAuthorities() // Les rôles/permissions
                );

                // Lignes 67-69: Ajoute les détails de la requête HTTP (IP, session, etc.)
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Ligne 70: Place l'authentification dans le contexte Spring Security
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Ligne 73: Continue vers le prochain filtre de la chaîne
        filterChain.doFilter(request, response);
    }
}