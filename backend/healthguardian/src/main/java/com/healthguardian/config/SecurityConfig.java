package com.healthguardian.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration // Indique que cette classe contient des beans de configuration
@EnableWebSecurity // Active la sécurité web Spring Security
@EnableMethodSecurity // Active la sécurité au niveau des méthodes (@PreAuthorize, @Secured, etc.)
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthFilter,
            EmailVerificationFilter emailVerificationFilter
    ) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .authorizeHttpRequests(auth -> auth
                        // ✅ Routes publiques
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/health", "/actuator/health").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // ✅ IMPORTANT : Routes pour la recherche de docteurs (publiques)
                        .requestMatchers("/api/appointments/search-doctors").permitAll()
                        .requestMatchers("/api/appointments/available-slots/**").permitAll()

                        // ✅ Routes protégées par rôle - CORRECTION DES RÔLES
                        .requestMatchers("/api/appointments/my-appointments/**").hasAnyRole("SIMPLE_USER", "ADMIN")
                        .requestMatchers("/api/appointments").hasAnyRole("SIMPLE_USER", "ADMIN")
                        .requestMatchers("/api/appointments/{id}/cancel").hasAnyRole("SIMPLE_USER", "ADMIN")

                        // ✅ Routes pour docteurs
                        .requestMatchers("/api/appointments/doctor/**").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers("/api/appointments/{id}/confirm", "/api/appointments/{id}/reject", "/api/appointments/{id}/complete")
                        .hasAnyRole("DOCTOR", "ADMIN")

                        // ✅ Route pour voir un rendez-vous spécifique
                        .requestMatchers("/api/appointments/{id}").authenticated()

                        .anyRequest().authenticated() // Toutes les autres routes nécessitent une authentification
                )

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider(null, null))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // ⚠️ IMPORTANT : Exclure certaines routes du filtre email
                .addFilterAfter(emailVerificationFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService, // Service pour charger les utilisateurs
            PasswordEncoder passwordEncoder // Encodeur de mots de passe
    ) {
        // Ligne 84: Crée un provider d'authentification basé sur la base de données
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        // Ligne 85: Définit le service qui charge les utilisateurs
        authProvider.setUserDetailsService(userDetailsService);

        // Ligne 86: Définit l'encodeur de mots de passe
        authProvider.setPasswordEncoder(passwordEncoder);

        // Ligne 87: Retourne le provider configuré
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        // Ligne 92: Retourne le gestionnaire d'authentification Spring Security
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Ligne 97: Utilise BCrypt pour hacher les mots de passe (algorithme sécurisé)
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Ligne 102: Crée la configuration CORS
        CorsConfiguration configuration = new CorsConfiguration();

        // Ligne 103: Autorise les requêtes depuis localhost:3000 (React) et localhost:5173 (Vite)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173", "http://localhost:8081" , "http://localhost:4174","http://localhost:4173"));

        // Ligne 104: Autorise toutes les méthodes HTTP (GET, POST, PUT, DELETE, etc.)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Ligne 105: Autorise tous les headers HTTP
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Ligne 106: Expose le header Authorization au frontend
        configuration.setExposedHeaders(List.of("Authorization"));

        // Ligne 107: Autorise l'envoi de cookies/credentials
        configuration.setAllowCredentials(true);

        // Lignes 109-111: Applique cette configuration à toutes les routes
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}