package com.healthguardian.service;

// Imports pour la manipulation des JWT (bibliothèque io.jsonwebtoken)
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service for JWT token generation and validation
 */
@Service // Déclare cette classe comme un service Spring
public class JwtService {

    // Ligne 22-23: Injecte la clé secrète depuis application.properties/yml
    @Value("${jwt.secret}")
    private String secretKey; // Ex: "mySecretKey123..."

    // Ligne 25-26: Injecte la durée d'expiration du token (en millisecondes)
    @Value("${jwt.expiration}")
    private long jwtExpiration; // Ex: 86400000 (24 heures)

    // Ligne 28-30: Extrait l'email (username) du token JWT
    public String extractUsername(String token) {
        // Le "subject" du token contient l'email de l'utilisateur
        return extractClaim(token, Claims::getSubject);
    }

    // Ligne 32-35: Méthode générique pour extraire n'importe quelle claim du token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        // 1. Extrait toutes les claims du token
        final Claims claims = extractAllClaims(token);
        // 2. Applique la fonction de résolution (ex: Claims::getSubject)
        return claimsResolver.apply(claims);
    }

    // Ligne 37-41: NOUVELLE MÉTHODE - Extrait le statut isActive (utilisateur vérifié ou non)
    public Boolean extractIsActive(String token) {
        final Claims claims = extractAllClaims(token); // Récupère toutes les claims
        // Récupère la claim "isActive" de type Boolean
        return claims.get("isActive", Boolean.class);
    }

    // Ligne 43-47: NOUVELLE MÉTHODE - Extrait l'ID de l'utilisateur
    public Long extractUserId(String token) {
        final Claims claims = extractAllClaims(token);
        // Récupère la claim "userId" de type Long
        return claims.get("userId", Long.class);
    }

    // Ligne 49-51: Génère un token JWT simple sans claims supplémentaires
    public String generateToken(UserDetails userDetails) {
        // Appelle la version surchargée avec un Map vide
        return generateToken(new HashMap<>(), userDetails);
    }

    // Ligne 53-55: Génère un token avec des claims personnalisées
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        // Construit le token avec les claims et la durée d'expiration
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    // Ligne 57-68: NOUVELLE MÉTHODE SURCHARGÉE - Génère un token depuis une entité User
    public String generateToken(com.healthguardian.entity.User user) {
        // Ligne 58: Crée un Map pour stocker les informations utilisateur
        Map<String, Object> extraClaims = new HashMap<>();

        // Lignes 59-65: Ajoute toutes les informations importantes dans le token
        extraClaims.put("userId", user.getId()); // ID de l'utilisateur
        extraClaims.put("email", user.getEmail()); // Email
        extraClaims.put("firstName", user.getFirstName()); // Prénom
        extraClaims.put("lastName", user.getLastName()); // Nom
        extraClaims.put("role", user.getRole().getName()); // Rôle (ADMIN, DOCTOR, etc.)
        extraClaims.put("isActive", user.getIsActive()); // Statut de vérification
        extraClaims.put("isProfileComplete", user.getIsProfileComplete()); // Profil complété ou non

        // Ligne 67: Construit le token avec toutes ces informations
        return buildToken(extraClaims, user, jwtExpiration);
    }

    // Ligne 70-79: Méthode privée qui construit réellement le token JWT
    private String buildToken(
            Map<String, Object> extraClaims, // Claims personnalisées
            UserDetails userDetails, // Informations utilisateur
            long expiration // Durée de validité
    ) {
        return Jwts
                .builder() // Ligne 76: Crée un builder JWT
                .claims(extraClaims) // Ligne 77: Ajoute les claims personnalisées
                .subject(userDetails.getUsername()) // Ligne 78: Définit le "subject" (email)
                .issuedAt(new Date(System.currentTimeMillis())) // Ligne 79: Date de création (maintenant)
                .expiration(new Date(System.currentTimeMillis() + expiration)) // Ligne 80: Date d'expiration
                .signWith(getSignInKey(), Jwts.SIG.HS256) // Ligne 81: Signe avec la clé secrète (algorithme HS256)
                .compact(); // Ligne 82: Génère le token final (format compact)
    }

    // Ligne 84-87: Vérifie si le token est valide
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token); // Extrait l'email du token
        // Ligne 86: Vérifie que l'email correspond ET que le token n'est pas expiré
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    // Ligne 89-91: Vérifie si le token est expiré
    private boolean isTokenExpired(String token) {
        // Compare la date d'expiration avec la date actuelle
        return extractExpiration(token).before(new Date());
    }

    // Ligne 93-95: Extrait la date d'expiration du token
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Ligne 97-104: Extrait TOUTES les claims du token
    private Claims extractAllClaims(String token) {
        return Jwts
                .parser() // Ligne 99: Crée un parser JWT
                .verifyWith(getSignInKey()) // Ligne 100: Vérifie la signature avec la clé secrète
                .build() // Ligne 101: Construit le parser
                .parseSignedClaims(token) // Ligne 102: Parse le token signé
                .getPayload(); // Ligne 103: Récupère le payload (les claims)
    }

    // Ligne 106-109: Génère la clé secrète à partir de la chaîne encodée en Base64
    private SecretKey getSignInKey() {
        // Ligne 107: Décode la clé secrète depuis Base64
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        // Ligne 108: Crée une clé HMAC-SHA à partir des bytes
        return Keys.hmacShaKeyFor(keyBytes);
    }
}