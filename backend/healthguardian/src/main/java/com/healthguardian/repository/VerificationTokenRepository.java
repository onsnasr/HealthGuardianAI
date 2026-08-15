package com.healthguardian.repository;

import com.healthguardian.entity.VerificationToken;
import com.healthguardian.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository // Indique que c'est un repository Spring (composant d'accès aux données)
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    // Hérite de JpaRepository<Entity, TypeID> qui fournit save(), findById(), delete(), etc.

    // Ligne 13: Recherche un token par sa valeur (ex: "abc123def456...")
    Optional<VerificationToken> findByToken(String token);
    // Spring génère automatiquement la requête SQL:
    // SELECT * FROM verification_tokens WHERE token = ?
    // Retourne Optional<VerificationToken> car le token peut ne pas exister

    // Ligne 15: Recherche un token par utilisateur ET type de token
    Optional<VerificationToken> findByUserAndTokenType(User user, VerificationToken.TokenType tokenType);
    // SQL généré:
    // SELECT * FROM verification_tokens WHERE user_id = ? AND token_type = ?
    // Utile pour trouver le token de vérification email ou de reset password d'un utilisateur

    // Ligne 17: Supprime TOUS les tokens d'un utilisateur
    void deleteByUser(User user);
    // SQL généré:
    // DELETE FROM verification_tokens WHERE user_id = ?
    // Utilisé pour nettoyer les anciens tokens après vérification
}