#!/bin/sh
# Simple git commit script using /bin/sh

cd /Users/sarihammad/dev/chattr

# Initialize if needed
if [ ! -d .git ]; then
  git init
fi

# Commit 1: Remove old services
echo "1. Removing old services..."
git add -f ai-service/ docker-compose.yml docker-compose.prod.yml backend/pom.xml 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/config/KafkaConfig.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/service/KafkaMessageConsumer.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/dto/ChatMessageEvent.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/dto/MatchEvent.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/model/MatchmakingMode.java 2>/dev/null
git add -f backend/src/main/resources/application.yml 2>/dev/null
git add -f backend/src/main/resources/application-prod.yml 2>/dev/null
if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "refactor: remove ai-service and Kafka infrastructure" 2>/dev/null && echo "✓ Committed"
fi

# Commit 2: New data models
echo "2. Adding new data models..."
git add -f backend/src/main/java/com/devign/chattr/model/Questionnaire*.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/model/Prompt.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/model/MatchCandidate.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/model/Match.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/model/User.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/repository/Questionnaire*.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/repository/PromptRepository.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/repository/MatchCandidateRepository.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/repository/MatchRepository.java 2>/dev/null
if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "feat: add v1 data models and repositories" 2>/dev/null && echo "✓ Committed"
fi

# Commit 3: New services
echo "3. Adding new services..."
git add -f backend/src/main/java/com/devign/chattr/service/CompatibilityScoringService.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/service/IntroductionsService.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/dto/IntroductionDTO.java 2>/dev/null
if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "feat: implement introductions service and compatibility scoring" 2>/dev/null && echo "✓ Committed"
fi

# Commit 4: New API endpoints
echo "4. Adding new API endpoints..."
git add -f backend/src/main/java/com/devign/chattr/controller/IntroductionsController.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/controller/QuestionnaireController.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/controller/PromptController.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/controller/MatchController.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/controller/UserController.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/config/WebSocketConfig.java 2>/dev/null
if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "feat: add v1 API endpoints" 2>/dev/null && echo "✓ Committed"
fi

# Commit 5: Questionnaire seeder
echo "5. Adding questionnaire seeder..."
git add -f backend/src/main/java/com/devign/chattr/config/QuestionnaireSeeder.java 2>/dev/null
if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "feat: add questionnaire seeder with 25 questions" 2>/dev/null && echo "✓ Committed"
fi

# Commit 6: Frontend rewrite
echo "6. Rewriting frontend..."
git add -f frontend/src/app/page.tsx 2>/dev/null
git add -f frontend/src/app/onboarding/ 2>/dev/null
git add -f frontend/src/app/introductions/ 2>/dev/null
git add -f frontend/src/app/matches/ 2>/dev/null
git add -f frontend/src/app/chat/ 2>/dev/null
git add -f frontend/src/app/about/ 2>/dev/null
git add -f frontend/src/app/faq/ 2>/dev/null
git add -f frontend/src/app/register/ 2>/dev/null
if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "feat: rewrite frontend for anti-swipe UX" 2>/dev/null && echo "✓ Committed"
fi

# Commit 7: Settings and API fixes
echo "7. Updating settings and API..."
git add -f frontend/src/app/settings/ 2>/dev/null
git add -f frontend/src/lib/api.ts 2>/dev/null
if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "feat: update settings and fix API utilities" 2>/dev/null && echo "✓ Committed"
fi

# Commit 8: Documentation
echo "8. Updating documentation..."
git add -f README.md V1_REFACTOR_SUMMARY.md NEXT_STEPS_COMPLETE.md .env.example 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/service/ChatService.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/service/MatchmakingService.java 2>/dev/null
git add -f backend/src/main/java/com/devign/chattr/service/ReportService.java 2>/dev/null
if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "docs: update configuration and documentation" 2>/dev/null && echo "✓ Committed"
fi

# Commit 9: Remaining changes
echo "9. Committing remaining changes..."
git add -A 2>/dev/null
if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "chore: remaining v1 refactoring changes" 2>/dev/null && echo "✓ Committed"
fi

# Show commits
echo ""
echo "Recent commits:"
git log --oneline -10 2>/dev/null

# Push
echo ""
echo "Pushing to GitHub..."
BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
if git remote get-url origin >/dev/null 2>&1; then
  git push origin $BRANCH 2>&1 || echo "Push failed - you may need to set upstream: git push -u origin $BRANCH"
else
  echo "No remote found. Add one with: git remote add origin YOUR_REPO_URL"
fi

