# Étape 1 : Construction de l'application
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# On package l'application sans lancer les tests (déjà faits dans le pipeline CI)
RUN mvn clean package -DskipTests

# Étape 2 : Création de l'image d'exécution
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# On copie le JAR généré depuis l'étape de build
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
