# Chattr

Distributed messaging platform for casual conversation, friendship, or dating.


## Core Features

- JWT-based user authentication
- Real-time 1-on-1 and group chat
- Presence tracking
- Random user matching

---

## Microservices Architecture

| Service | Responsibilities |
|--------|------------------|
| `auth-service` | User authentication (JWT, OAuth2), token issuing |
| `user-service` | User profiles, preferences, updates |
| `chat-service` | Messaging engine, message persistence, WebSocket support |
| `matchmaking-service` | User matching logic (random pairing based on preferences) |
---

## Directory Structure

```bash
chattr/
├── auth-service/         # Handles login/signup, JWT
│   ├── src/main/java/com/chattr/auth/
│   ├── src/main/resources/
│   ├── Dockerfile
│   └── pom.xml
│
├── user-service/         # Handles user profiles and preferences
│   ├── src/main/java/com/chattr/user/
│   ├── src/main/resources/
│   ├── Dockerfile
│   └── pom.xml
│
├── matchmaking-service/  # Handles matching logic
│   ├── src/main/java/com/chattr/matchmaking/
│   ├── src/main/resources/
│   ├── Dockerfile
│   └── pom.xml
│
├── chat-service/         # Handles WebSocket chat and message persistence
│   ├── src/main/java/com/chattr/chat/
│   ├── src/main/resources/
│   ├── Dockerfile
│   └── pom.xml
│
├── docker-compose.yml    # Run all services + RabbitMQ + Postgres together
├── README.md             # (Write a tiny doc about how to run it)
└── .gitignore            # (Ignore target/, *.log, etc.)
```
