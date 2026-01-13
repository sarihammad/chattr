#!/bin/bash

# Chattr v1 Refactoring - Commit Script
# This script organizes commits into logical groups

set -e

echo "🚀 Starting commit process for Chattr v1 refactoring..."

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
fi

# Check for remote
if ! git remote | grep -q origin; then
    echo "⚠️  No remote 'origin' found. You'll need to add it:"
    echo "   git remote add origin <your-github-repo-url>"
fi

# Stage all changes
echo "📦 Staging all changes..."
git add .

# Create commits in logical groups
echo "📝 Creating commits..."

# Commit 1: Remove old services (ai-service, Kafka)
echo "1️⃣  Committing removal of old services..."
git commit -m "refactor: remove ai-service and Kafka infrastructure

- Delete ai-service directory (Python FastAPI)
- Remove Kafka and Zookeeper from docker-compose
- Remove Kafka dependencies from pom.xml
- Remove Kafka code from backend services
- Remove RANDOM mode (DATING only for v1)
- Update tests to remove Kafka references

Part of v1 refactoring: simplifying to monolith architecture" || echo "No changes to commit for step 1"

# Commit 2: New data models
echo "2️⃣  Committing new data models..."
git add backend/src/main/java/com/devign/chattr/model/*.java backend/src/main/java/com/devign/chattr/repository/*.java 2>/dev/null || true
git commit -m "feat: add v1 data models and repositories

- Add QuestionnaireQuestion, QuestionnaireAnswer entities
- Add Prompt entity for Hinge-style prompts
- Add MatchCandidate entity for daily introductions
- Add Match entity for mutual matches
- Update User model with orientation, seeking, matchingPaused
- Create repositories for all new entities

Part of v1: anti-swipe introductions model" || echo "No changes to commit for step 2"

# Commit 3: New services
echo "3️⃣  Committing new services..."
git add backend/src/main/java/com/devign/chattr/service/CompatibilityScoringService.java backend/src/main/java/com/devign/chattr/service/IntroductionsService.java 2>/dev/null || true
git commit -m "feat: implement introductions service and compatibility scoring

- Add CompatibilityScoringService (deterministic scoring)
- Add IntroductionsService (1-3 introductions per day)
- Implement accept/pass/match creation logic
- Add filters: blocks, existing matches, recent passes
- Generate match reasons for display

Part of v1: anti-swipe matching system" || echo "No changes to commit for step 3"

# Commit 4: New API endpoints
echo "4️⃣  Committing new API endpoints..."
git add backend/src/main/java/com/devign/chattr/controller/IntroductionsController.java backend/src/main/java/com/devign/chattr/controller/QuestionnaireController.java backend/src/main/java/com/devign/chattr/controller/PromptController.java backend/src/main/java/com/devign/chattr/controller/MatchController.java 2>/dev/null || true
git commit -m "feat: add v1 API endpoints

- Add IntroductionsController (GET, accept, pass, shown)
- Add QuestionnaireController (GET questions, POST answers)
- Add PromptController (GET, PUT prompts)
- Add MatchController (GET matches)
- Update UserController (pause, resume, delete account)

Part of v1: REST API for introductions flow" || echo "No changes to commit for step 4"

# Commit 5: Questionnaire seeder
echo "5️⃣  Committing questionnaire seeder..."
git add backend/src/main/java/com/devign/chattr/config/QuestionnaireSeeder.java 2>/dev/null || true
git commit -m "feat: add questionnaire seeder with 25 questions

- Auto-seed 25 questionnaire questions on startup
- Covers: values, communication, lifestyle, goals, interests
- Supports MULTIPLE_CHOICE, SCALE, TEXT types
- Only seeds if no questions exist

Part of v1: onboarding questionnaire" || echo "No changes to commit for step 5"

# Commit 6: Frontend rewrite
echo "6️⃣  Committing frontend rewrite..."
git add frontend/src/app/page.tsx frontend/src/app/onboarding/ frontend/src/app/introductions/ frontend/src/app/matches/ frontend/src/app/chat/ frontend/src/app/about/ frontend/src/app/faq/ 2>/dev/null || true
git commit -m "feat: rewrite frontend for anti-swipe UX

- Rewrite landing page with anti-swipe messaging
- Add onboarding flow (4 steps: profile, questionnaire, prompts)
- Add introductions page (1 card at a time, Accept/Pass)
- Add matches page (active matches list)
- Add chat page (1:1 messaging)
- Update about and FAQ pages with new copy

Part of v1: calm, premium, intentional design" || echo "No changes to commit for step 6"

# Commit 7: Copywriting and settings
echo "7️⃣  Committing copywriting and settings updates..."
git add frontend/src/app/settings/ frontend/src/app/register/ 2>/dev/null || true
git commit -m "feat: update settings and copywriting

- Add pause/resume matching in settings
- Add delete account functionality
- Update register to redirect to onboarding
- Rewrite all copy to be calm, premium, anti-swipe
- Replace 'AI-powered' with 'Compatibility', 'Values-based'

Part of v1: premium aesthetic and intentional copy" || echo "No changes to commit for step 7"

# Commit 8: Configuration and documentation
echo "8️⃣  Committing configuration and docs..."
git add docker-compose.yml backend/src/main/resources/application.yml backend/src/main/resources/application-prod.yml frontend/src/lib/api.ts README.md V1_REFACTOR_SUMMARY.md NEXT_STEPS_COMPLETE.md .env.example 2>/dev/null || true
git commit -m "docs: update configuration and documentation

- Update docker-compose (remove ai-service, kafka, zookeeper)
- Update application configs (remove Kafka, AI service)
- Fix API utility (getApiUrl)
- Update README with v1 architecture
- Add refactoring summary documents
- Add .env.example

Part of v1: documentation and setup" || echo "No changes to commit for step 8"

# Show status
echo ""
echo "✅ Commit process complete!"
echo ""
echo "📊 Current status:"
git status --short

echo ""
echo "📝 Recent commits:"
git log --oneline -10

echo ""
echo "🌐 To push to GitHub:"
echo "   git push origin main"
echo "   (or 'git push origin master' if your default branch is master)"

