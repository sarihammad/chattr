# Chattr

**Anti-swipe matchmaking for people who want something real.**

Chattr matches based on values, lifestyle, and compatibility—not just looks. You receive 1–3 carefully selected introductions per day, so you can focus on quality connections.

**Tagline:** "Fewer matches. Better matches."

## 🎯 Product Vision

Chattr is built on these principles:

1. **Anti-swipe**: No infinite browsing, no "hot-or-not", no dopamine UI
2. **Slower matches**: Limited daily opportunities (1–3 per day), intentional pacing
3. **Fewer chats**: Cap active conversations to reduce overwhelm
4. **Deeper compatibility**: Structured signals and explained match reasons
5. **Trust & safety**: Minimal but real (report, block, basic moderation)
6. **Premium aesthetic**: Calm typography, whitespace, soft edges
7. **Clear onboarding**: The user understands the value instantly

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│   Port: 3000    │
└────────┬────────┘
         │
         │ REST API + WebSocket
         │
┌────────▼────────┐
│   Backend       │
│   (Spring Boot) │
│   Port: 8080    │
└────────┬────────┘
         │
         ├──► PostgreSQL (Persistent data)
         └──► Redis (Rate limiting, presence)
```

### Components

1. **Frontend (Next.js App Router)**
   - Landing page: `/` - Anti-swipe messaging
   - Onboarding: `/onboarding` - Multi-step profile setup
   - Introductions: `/introductions` - Daily introductions (1–3 per day)
   - Matches: `/matches` - Active matches and conversations
   - Chat: `/chat/:roomId` - 1:1 messaging
   - Settings: `/settings` - Pause matching, delete account

2. **Backend (Spring Boot Monolith)**
   - Package domains: `auth`, `user`, `chat`, `introductions`, `questionnaire`, `prompts`, `matches`
   - REST endpoints under `/api/v1/...`
   - WebSocket endpoint: `/ws` with STOMP + SockJS
   - JWT authentication

3. **Infrastructure**
   - **PostgreSQL**: Persistent data (users, questionnaire, introductions, matches, chat)
   - **Redis**: Rate limiting, presence tracking (optional)

## 🚀 Tech Stack

### Backend
- **Framework**: Spring Boot (Java 21)
- **Database**: PostgreSQL
- **Cache**: Redis (for rate limiting and presence)
- **Real-time**: WebSockets (STOMP over SockJS)
- **Auth**: JWT
- **Rate Limiting**: Bucket4j + Redis

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: NextAuth
- **WebSocket**: SockJS + STOMP.js

## 📊 Data Model

### Core Entities
- **User**: id, username, email, password, gender, orientation, seeking, age, city, country, bio, matchingPaused
- **QuestionnaireQuestion**: id, text, type, options, weight, displayOrder
- **QuestionnaireAnswer**: user_id, question_id, answerValue
- **Prompt**: user_id, promptKey, text (3 prompts per user)
- **MatchCandidate**: user_id, candidate_user_id, score, reasonsJson, matchDate, status (PENDING/SHOWN/ACCEPTED/PASSED)
- **Match**: user_a, user_b, matchedAt, isActive
- **ChatRoom**: user1, user2, roomId, createdAt, isActive
- **ChatMessage**: room, sender, receiver, content, timestamp, isRead
- **Block**: blocker_id, blocked_id
- **Report**: reporter_id, reported_id, reason

## 🔑 Key Features

### Introductions System
- **Daily limit**: 1–3 introductions per day
- **On-demand generation**: Introductions generated when user requests them
- **Compatibility scoring**: Based on questionnaire answers and shared values
- **Match reasons**: Each introduction includes explanations of why it's a good match
- **Accept/Pass**: User can accept or pass on each introduction
- **Mutual acceptance**: Match created when both users accept

### Compatibility Scoring
- Deterministic scoring based on questionnaire answer similarity
- Supports MULTIPLE_CHOICE, SCALE, and TEXT question types
- Generates match reasons (top 3 signals, human-readable explanations)
- Can be extended with embeddings later

### Chat
- 1:1 messaging only
- Real-time via WebSockets
- Typing indicators and read receipts
- Conversation cap (e.g., 3 active conversations)

## 🔐 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token
- `POST /logout` - Logout
- `GET /me` - Get current user

### Introductions (`/api/v1/introductions`)
- `GET /` - Get today's introductions (1–3)
- `POST /{candidateId}/accept` - Accept introduction
- `POST /{candidateId}/pass` - Pass introduction
- `POST /{candidateId}/shown` - Mark as shown

### Questionnaire (`/api/v1/questionnaire`)
- `GET /` - Get all questions
- `POST /answers` - Submit answers

### Prompts (`/api/v1/prompts`)
- `GET /` - Get user's prompts
- `PUT /` - Update prompts

### Matches (`/api/v1/matches`)
- `GET /` - Get active matches
- `GET /{matchId}` - Get specific match

### User (`/api/v1/user`)
- `GET /me` - Get current user profile
- `PUT /me` - Update profile
- `POST /me/pause` - Pause matching
- `POST /me/resume` - Resume matching
- `DELETE /me` - Delete account
- `POST /block` - Block user
- `POST /report` - Report user

### Chat (`/api/v1/chat`)
- `GET /rooms` - Get chat rooms
- `GET /room/{roomId}/messages` - Get messages
- WebSocket: `/ws` - Real-time messaging

## 🛠️ Getting Started

### Prerequisites
- Docker and Docker Compose
- Java 21 (for local backend development)
- Node.js 18+ (for local frontend development)

### Running with Docker Compose

```bash
# Start all services
docker-compose up

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8080
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### Local Development

#### Backend
```bash
cd backend
./mvnw spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📝 Environment Variables

See `.env.example` for required environment variables.

### Backend
- `SPRING_DATASOURCE_URL` - PostgreSQL connection string
- `SPRING_REDIS_HOST` - Redis host
- `JWT_SECRET` - JWT signing secret

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8080)

## 🎨 Design Principles

- **Calm, premium aesthetic**: Big typography, lots of whitespace, soft borders
- **Neutral palette**: No gradient spam, no "gamer UI"
- **Intentional copy**: Human, calm, confident tone
- **Anti-swipe messaging**: "No swiping. No noise. Just a few great introductions."

## 🚧 Future Extensions

When scaling beyond v1:
- Extract matching logic to separate service
- Add embeddings for better compatibility scoring
- Re-introduce Kafka for analytics (separate from real-time)
- Add media uploads (photos)
- Add multiple modes back (if needed)

## 📄 License

MIT

## 👤 Author

**Sari Hammad**

This project showcases:
- Anti-swipe matchmaking design
- Values-based compatibility scoring
- Intentional, premium UX
- Production-ready practices (error handling, rate limiting, DTOs)
- Modern full-stack development (Spring Boot, Next.js)
