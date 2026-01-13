# Chattr v1 Refactoring Summary

## Completed ✅

### Phase 0: Repository Cleanup
- ✅ Deleted `ai-service/` directory (Python FastAPI service)
- ✅ Removed Kafka and Zookeeper from docker-compose.yml
- ✅ Removed Kafka dependencies from pom.xml
- ✅ Removed Kafka code from backend (KafkaConfig, KafkaMessageConsumer, event DTOs)
- ✅ Removed Kafka publishing from ChatService, MatchmakingService, ReportService
- ✅ Removed RANDOM mode from MatchmakingMode enum (now only DATING)
- ✅ Updated tests to remove Kafka references

### Phase 1: New Data Models
- ✅ Created `QuestionnaireQuestion` entity (id, text, type, options, weight, displayOrder)
- ✅ Created `QuestionnaireAnswer` entity (user_id, question_id, answerValue)
- ✅ Created `Prompt` entity (user_id, promptKey, text) for Hinge-style prompts
- ✅ Created `MatchCandidate` entity (user_id, candidate_user_id, score, reasonsJson, matchDate, status)
- ✅ Created `Match` entity (user_a, user_b, matchedAt, isActive)
- ✅ Updated `User` model to add `orientation` and `seeking` fields
- ✅ Added `matchingPaused` field to User model

### Phase 1: Repositories
- ✅ Created `QuestionnaireQuestionRepository`
- ✅ Created `QuestionnaireAnswerRepository`
- ✅ Created `PromptRepository`
- ✅ Created `MatchCandidateRepository`
- ✅ Created `MatchRepository`

### Phase 2: Services
- ✅ Created `CompatibilityScoringService` - Deterministic scoring based on questionnaire answers
  - Computes compatibility score (0.0-1.0) from questionnaire answers
  - Generates match reasons (top 3 signals, human-readable reasons)
  - Supports MULTIPLE_CHOICE, SCALE, and TEXT question types
- ✅ Created `IntroductionsService` - Anti-swipe introductions model
  - Generates 1-3 introductions per day
  - Enforces daily limits
  - Handles accept/pass logic
  - Creates matches when both users accept
  - Filters by blocks, existing matches, recent passes (7-day cooldown)
  - Applies preference filters (gender/orientation/seeking)

### Phase 3: API Endpoints
- ✅ Created `IntroductionsController`:
  - `GET /api/v1/introductions` - Get today's introductions
  - `POST /api/v1/introductions/{candidateId}/accept` - Accept introduction
  - `POST /api/v1/introductions/{candidateId}/pass` - Pass introduction
  - `POST /api/v1/introductions/{candidateId}/shown` - Mark as shown
- ✅ Created `QuestionnaireController`:
  - `GET /api/v1/questionnaire` - Get all questions
  - `POST /api/v1/questionnaire/answers` - Submit answers
- ✅ Created `PromptController`:
  - `GET /api/v1/prompts` - Get user's prompts
  - `PUT /api/v1/prompts` - Update prompts
- ✅ Created `MatchController`:
  - `GET /api/v1/matches` - Get active matches
  - `GET /api/v1/matches/{matchId}` - Get specific match
- ✅ Updated `UserController`:
  - `POST /api/v1/user/me/pause` - Pause matching
  - `POST /api/v1/user/me/resume` - Resume matching
  - `DELETE /api/v1/user/me` - Delete account
- ✅ Kept existing endpoints:
  - `/api/v1/auth/*` - Authentication
  - `/api/v1/user/me` - Get current user
  - `/api/v1/user/block` - Block user
  - `/api/v1/user/report` - Report user
  - `/api/v1/chat/*` - Chat endpoints
  - `/ws` - WebSocket for real-time chat

### Phase 3: Configuration
- ✅ Updated `docker-compose.yml` - Removed ai-service, kafka, zookeeper
- ✅ Updated `application.yml` - Removed Kafka and AI service configs
- ✅ Fixed `WebSocketConfig` - Injected JwtUtil properly

## Remaining Work 🔄

### Phase 5: Frontend Rewrite
- [ ] Rewrite landing page with anti-swipe messaging
- [ ] Create onboarding flow (multi-step):
  - Step 1: Account (email/password)
  - Step 2: Profile basics (name, age, gender, orientation, seeking, location)
  - Step 3: Values questionnaire (15-25 questions)
  - Step 4: Prompts (3 Hinge-style prompts)
- [ ] Create Introductions screen (anti-swipe):
  - Show 1 card at a time (no infinite scroll)
  - Display: photo, name, age, city, 3 match signals, reasons
  - Actions: Accept / Pass buttons
- [ ] Update Matches + Chat screen:
  - List of active matches (capped to 3)
  - Minimal chat UI
  - Quality cues ("Try a thoughtful opener")
- [ ] Update Settings page:
  - Pause matching toggle
  - Delete account
- [ ] Remove old matchmaking UI (queue-based, swipe)

### Phase 6: Copywriting
- [ ] Update all copy to be calm, premium, intentional
- [ ] Replace "AI-powered" with "Compatibility", "Values-based matching"
- [ ] Add anti-swipe messaging throughout
- [ ] Update landing page: "Fewer matches. Better matches."
- [ ] Update onboarding copy
- [ ] Update introduction cards copy

### Phase 7: Testing & Polish
- [ ] Seed questionnaire questions (15-25 questions)
- [ ] Test introductions flow end-to-end
- [ ] Verify daily limits work
- [ ] Test accept/pass/match creation
- [ ] Update README.md with v1 architecture
- [ ] Create .env.example
- [ ] Test docker-compose startup

## Architecture Changes

### Before (Old)
- Microservices: Backend (Spring Boot) + AI Service (Python)
- Event streaming: Kafka
- Queue-based matching: Redis queues
- Multiple modes: FRIENDS, DATING, RANDOM, NETWORKING
- Swipe-style matching

### After (v1)
- Monolith: Single Spring Boot backend
- No Kafka (removed)
- Introductions-based matching (1-3 per day, stored in PostgreSQL)
- Single mode: DATING only
- Anti-swipe: Limited, intentional introductions

## Database Schema

### New Tables
- `questionnaire_questions` - Questions with weights
- `questionnaire_answers` - User answers
- `prompts` - User prompts (3 per user)
- `match_candidates` - Daily introductions (1-3 per user per day)
- `matches` - Active matches (when both users accept)

### Modified Tables
- `users` - Added `orientation`, `seeking`, `matchingPaused`

## Key Services

### IntroductionsService
- Generates 1-3 introductions per day
- On-demand generation when user requests
- Filters: blocks, existing matches, recent passes, preferences
- Compatibility scoring via CompatibilityScoringService
- Creates Match + ChatRoom when both users accept

### CompatibilityScoringService
- Deterministic scoring (no ML initially)
- Based on questionnaire answer similarity
- Generates match reasons for display
- Can be extended with embeddings later

## Next Steps

1. **Seed Data**: Create 15-25 questionnaire questions
2. **Frontend**: Rewrite UI for anti-swipe UX
3. **Copywriting**: Update all product copy
4. **Testing**: End-to-end testing of introductions flow
5. **Documentation**: Update README and setup instructions

## Migration Path (Future Scale)

When scaling beyond v1, consider:
- Extract matching logic to separate service
- Add embeddings for better compatibility scoring
- Re-introduce Kafka for analytics (separate from real-time)
- Add multiple modes back (if needed)
- Add media service for photos

