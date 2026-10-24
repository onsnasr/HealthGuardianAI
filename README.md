# HealthGuardian AI

AI-powered health platform connecting **patients, doctors and pharmacies**: medication search, pharmacy stock management and nearest-pharmacy locator, doctor appointments, health tracking, risk prediction and an NLP chatbot.

Built as a team project; I worked as Scrum Master and full-stack developer.

## Features
- **Pharmacy module**: medication search, stock management, nearest-pharmacy locator
- **Appointments**: doctor availability, booking, status updates, doctor–patient management
- **Health tracking**: habits, nutrition, exercise and personalised recommendations
- **AI**: health risk prediction and an NLP chatbot
- **Security**: JWT authentication, email verification, role-based access (admin, doctor, patient, pharmacy)
- **API docs** with Swagger / OpenAPI and a Postman test collection

## Tech stack
| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3, Spring Security, JPA, MySQL, JJWT, Spring Mail, springdoc-openapi |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| DevOps | Docker, Docker Compose, Nginx, GitLab CI, JaCoCo test coverage |

## Project structure
```
backend/healthguardian/   Spring Boot REST API
frontend/                 React + TypeScript app (served by Nginx in Docker)
deploy/                   docker-compose for the full stack
```

## Run locally
```bash
# full stack with Docker
cd deploy
docker compose up --build
```
Or separately:
```bash
cd backend/healthguardian && ./mvnw spring-boot:run   # API + Swagger UI at /swagger-ui.html
cd frontend && npm install && npm run dev
```
Configure the database, JWT secret and mail credentials through environment variables (see `application.properties`).

## Author
**Ons Nasr** — [GitHub](https://github.com/onsnasr)
