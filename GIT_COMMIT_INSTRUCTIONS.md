# Git Commit Instructions

Due to shell configuration issues, please run these commands manually in your terminal.

## Quick Commit (All Changes in One Commit)

```bash
cd /Users/sarihammad/dev/chattr

# Check status
git status

# Add all changes
git add .

# Create comprehensive commit
git commit -m "refactor: complete v1 refactoring - anti-swipe matchmaking

Major changes:
- Remove ai-service and Kafka infrastructure
- Add new data models (Questionnaire, MatchCandidate, Match, Prompt)
- Implement IntroductionsService (1-3 per day, anti-swipe)
- Implement CompatibilityScoringService (deterministic scoring)
- Add new API endpoints (introductions, questionnaire, prompts, matches)
- Rewrite frontend for anti-swipe UX (onboarding, introductions, matches, chat)
- Update all copywriting (calm, premium, intentional)
- Add questionnaire seeder (25 questions)
- Update configuration and documentation

Architecture: Monolith (Spring Boot only), no Kafka, introductions-based matching
Matching: 1-3 introductions per day, stored in PostgreSQL
UI: Anti-swipe, 1 card at a time, calm premium design"

# Push to GitHub
git push origin main
# (or 'git push origin master' if your default branch is master)
```

## Organized Commits (Recommended)

If you prefer organized commits, run the script:

```bash
chmod +x commit-changes.sh
./commit-changes.sh
```

Or manually create commits:

```bash
# 1. Remove old services
git add ai-service/ docker-compose.yml backend/pom.xml backend/src/main/java/com/devign/chattr/config/KafkaConfig.java backend/src/main/java/com/devign/chattr/service/KafkaMessageConsumer.java
git commit -m "refactor: remove ai-service and Kafka infrastructure"

# 2. New data models
git add backend/src/main/java/com/devign/chattr/model/Questionnaire*.java backend/src/main/java/com/devign/chattr/model/Prompt.java backend/src/main/java/com/devign/chattr/model/Match*.java backend/src/main/java/com/devign/chattr/repository/*.java
git commit -m "feat: add v1 data models and repositories"

# 3. New services
git add backend/src/main/java/com/devign/chattr/service/CompatibilityScoringService.java backend/src/main/java/com/devign/chattr/service/IntroductionsService.java
git commit -m "feat: implement introductions service and compatibility scoring"

# 4. New API endpoints
git add backend/src/main/java/com/devign/chattr/controller/IntroductionsController.java backend/src/main/java/com/devign/chattr/controller/QuestionnaireController.java backend/src/main/java/com/devign/chattr/controller/PromptController.java backend/src/main/java/com/devign/chattr/controller/MatchController.java
git commit -m "feat: add v1 API endpoints"

# 5. Questionnaire seeder
git add backend/src/main/java/com/devign/chattr/config/QuestionnaireSeeder.java
git commit -m "feat: add questionnaire seeder with 25 questions"

# 6. Frontend rewrite
git add frontend/src/app/page.tsx frontend/src/app/onboarding/ frontend/src/app/introductions/ frontend/src/app/matches/ frontend/src/app/chat/ frontend/src/app/about/ frontend/src/app/faq/
git commit -m "feat: rewrite frontend for anti-swipe UX"

# 7. Settings and copywriting
git add frontend/src/app/settings/ frontend/src/app/register/
git commit -m "feat: update settings and copywriting"

# 8. Configuration and docs
git add docker-compose.yml backend/src/main/resources/ README.md V1_REFACTOR_SUMMARY.md NEXT_STEPS_COMPLETE.md frontend/src/lib/api.ts
git commit -m "docs: update configuration and documentation"

# Push all commits
git push origin main
```

## Check Remote

If you need to set up the remote:

```bash
# Check if remote exists
git remote -v

# If no remote, add it:
git remote add origin https://github.com/YOUR_USERNAME/chattr.git

# Or if using SSH:
git remote add origin git@github.com:YOUR_USERNAME/chattr.git
```

## Verify Before Pushing

```bash
# See what will be pushed
git log origin/main..HEAD

# See file changes
git diff --stat origin/main..HEAD
```

