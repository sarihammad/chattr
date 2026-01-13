#!/bin/bash
# Copy and paste these commands into your terminal
# They create organized commits and push to GitHub

cd /Users/sarihammad/dev/chattr

# Initialize git if needed
[ ! -d .git ] && git init

# ============================================
# COMMIT 1: Remove old services
# ============================================
echo "📦 Commit 1: Removing old services..."
git add -A ai-service/ docker-compose.yml docker-compose.prod.yml backend/pom.xml
git add backend/src/main/java/com/devign/chattr/config/KafkaConfig.java
git add backend/src/main/java/com/devign/chattr/service/KafkaMessageConsumer.java
git add backend/src/main/java/com/devign/chattr/dto/ChatMessageEvent.java
git add backend/src/main/java/com/devign/chattr/dto/MatchEvent.java
git add backend/src/main/java/com/devign/chattr/model/MatchmakingMode.java
git add backend/src/main/resources/application.yml
git add backend/src/main/resources/application-prod.yml
git add backend/src/test/java/com/devign/chattr/integration/KafkaIntegrationTest.java
git commit -m "refactor: remove ai-service and Kafka infrastructure

- Delete ai-service directory (Python FastAPI)
- Remove Kafka and Zookeeper from docker-compose
- Remove Kafka dependencies from pom.xml
- Remove Kafka code from backend services
- Remove RANDOM mode (DATING only for v1)
- Update application configs
- Remove Kafka integration tests

Part of v1 refactoring: simplifying to monolith architecture"

# ============================================
# COMMIT 2: New data models
# ============================================
echo "📦 Commit 2: Adding new data models..."
git add backend/src/main/java/com/devign/chattr/model/QuestionnaireQuestion.java
git add backend/src/main/java/com/devign/chattr/model/QuestionnaireAnswer.java
git add backend/src/main/java/com/devign/chattr/model/Prompt.java
git add backend/src/main/java/com/devign/chattr/model/MatchCandidate.java
git add backend/src/main/java/com/devign/chattr/model/Match.java
git add backend/src/main/java/com/devign/chattr/model/User.java
git add backend/src/main/java/com/devign/chattr/repository/QuestionnaireQuestionRepository.java
git add backend/src/main/java/com/devign/chattr/repository/QuestionnaireAnswerRepository.java
git add backend/src/main/java/com/devign/chattr/repository/PromptRepository.java
git add backend/src/main/java/com/devign/chattr/repository/MatchCandidateRepository.java
git add backend/src/main/java/com/devign/chattr/repository/MatchRepository.java
git commit -m "feat: add v1 data models and repositories

- Add QuestionnaireQuestion, QuestionnaireAnswer entities
- Add Prompt entity for Hinge-style prompts
- Add MatchCandidate entity for daily introductions
- Add Match entity for mutual matches
- Update User model with orientation, seeking, matchingPaused
- Create repositories for all new entities

Part of v1: anti-swipe introductions model"

# ============================================
# COMMIT 3: New services
# ============================================
echo "📦 Commit 3: Adding new services..."
git add backend/src/main/java/com/devign/chattr/service/CompatibilityScoringService.java
git add backend/src/main/java/com/devign/chattr/service/IntroductionsService.java
git add backend/src/main/java/com/devign/chattr/dto/IntroductionDTO.java
git commit -m "feat: implement introductions service and compatibility scoring

- Add CompatibilityScoringService (deterministic scoring)
- Add IntroductionsService (1-3 introductions per day)
- Implement accept/pass/match creation logic
- Add filters: blocks, existing matches, recent passes
- Generate match reasons for display

Part of v1: anti-swipe matching system"

# ============================================
# COMMIT 4: New API endpoints
# ============================================
echo "📦 Commit 4: Adding new API endpoints..."
git add backend/src/main/java/com/devign/chattr/controller/IntroductionsController.java
git add backend/src/main/java/com/devign/chattr/controller/QuestionnaireController.java
git add backend/src/main/java/com/devign/chattr/controller/PromptController.java
git add backend/src/main/java/com/devign/chattr/controller/MatchController.java
git add backend/src/main/java/com/devign/chattr/controller/UserController.java
git add backend/src/main/java/com/devign/chattr/config/WebSocketConfig.java
git commit -m "feat: add v1 API endpoints

- Add IntroductionsController (GET, accept, pass, shown)
- Add QuestionnaireController (GET questions, POST answers)
- Add PromptController (GET, PUT prompts)
- Add MatchController (GET matches)
- Update UserController (pause, resume, delete account)
- Fix WebSocketConfig JwtUtil injection

Part of v1: REST API for introductions flow"

# ============================================
# COMMIT 5: Questionnaire seeder
# ============================================
echo "📦 Commit 5: Adding questionnaire seeder..."
git add backend/src/main/java/com/devign/chattr/config/QuestionnaireSeeder.java
git commit -m "feat: add questionnaire seeder with 25 questions

- Auto-seed 25 questionnaire questions on startup
- Covers: values, communication, lifestyle, goals, interests
- Supports MULTIPLE_CHOICE, SCALE, TEXT types
- Only seeds if no questions exist

Part of v1: onboarding questionnaire"

# ============================================
# COMMIT 6: Frontend rewrite
# ============================================
echo "📦 Commit 6: Rewriting frontend..."
git add frontend/src/app/page.tsx
git add frontend/src/app/onboarding/
git add frontend/src/app/introductions/
git add frontend/src/app/matches/
git add frontend/src/app/chat/
git add frontend/src/app/about/
git add frontend/src/app/faq/
git add frontend/src/app/register/
git commit -m "feat: rewrite frontend for anti-swipe UX

- Rewrite landing page with anti-swipe messaging
- Add onboarding flow (4 steps: profile, questionnaire, prompts)
- Add introductions page (1 card at a time, Accept/Pass)
- Add matches page (active matches list)
- Add chat page (1:1 messaging)
- Update about and FAQ pages with new copy
- Update register to redirect to onboarding

Part of v1: calm, premium, intentional design"

# ============================================
# COMMIT 7: Settings and API fixes
# ============================================
echo "📦 Commit 7: Updating settings and API..."
git add frontend/src/app/settings/
git add frontend/src/lib/api.ts
git commit -m "feat: update settings and fix API utilities

- Add pause/resume matching in settings
- Add delete account functionality
- Fix getApiUrl() to return base URL only
- Update all API calls to use new format

Part of v1: premium aesthetic and API consistency"

# ============================================
# COMMIT 8: Documentation and cleanup
# ============================================
echo "📦 Commit 8: Updating documentation..."
git add README.md
git add V1_REFACTOR_SUMMARY.md
git add NEXT_STEPS_COMPLETE.md
git add .env.example
git add backend/src/main/java/com/devign/chattr/service/ChatService.java
git add backend/src/main/java/com/devign/chattr/service/MatchmakingService.java
git add backend/src/main/java/com/devign/chattr/service/ReportService.java
git add backend/src/test/java/com/devign/chattr/service/MatchmakingServiceTest.java
git commit -m "docs: update configuration and documentation

- Update README with v1 architecture
- Add refactoring summary documents
- Add .env.example
- Remove Kafka code from services
- Update tests

Part of v1: documentation and cleanup"

# ============================================
# COMMIT 9: Remaining changes
# ============================================
echo "📦 Commit 9: Committing remaining changes..."
git add -A
git commit -m "chore: remaining v1 refactoring changes

- Helper scripts and documentation
- Additional cleanup and fixes"

# ============================================
# Show commits and push
# ============================================
echo ""
echo "📊 Recent commits:"
git log --oneline -10

echo ""
echo "🌐 Pushing to GitHub..."
BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

if git remote get-url origin >/dev/null 2>&1; then
  git push -u origin $BRANCH 2>&1 || git push origin $BRANCH
  echo "✅ Pushed to GitHub!"
else
  echo "⚠️  No remote 'origin' found."
  echo "   Add remote with: git remote add origin YOUR_REPO_URL"
  echo "   Then run: git push -u origin $BRANCH"
fi

