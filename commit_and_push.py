#!/usr/bin/env python3
"""
Git commit and push script for Chattr v1 refactoring
Organizes changes into logical commits
"""

import subprocess
import sys
import os

def run_cmd(cmd, check=True):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=check)
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except subprocess.CalledProcessError as e:
        return e.stdout.strip(), e.stderr.strip(), e.returncode

def main():
    print("🚀 Starting organized git commits for Chattr v1 refactoring...\n")
    
    # Check if git is initialized
    stdout, stderr, code = run_cmd("git rev-parse --git-dir", check=False)
    if code != 0:
        print("📦 Initializing git repository...")
        run_cmd("git init")
        print("✅ Git initialized\n")
    
    # Check current branch
    stdout, _, _ = run_cmd("git branch --show-current", check=False)
    branch = stdout if stdout else "main"
    print(f"📍 Current branch: {branch}\n")
    
    # Commit 1: Remove old services
    print("1️⃣  Committing removal of old services (ai-service, Kafka)...")
    run_cmd("git add -A ai-service/ docker-compose.yml docker-compose.prod.yml backend/pom.xml", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/config/KafkaConfig.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/service/KafkaMessageConsumer.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/dto/ChatMessageEvent.java backend/src/main/java/com/devign/chattr/dto/MatchEvent.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/model/MatchmakingMode.java", check=False)
    run_cmd("git add backend/src/main/resources/application.yml backend/src/main/resources/application-prod.yml", check=False)
    run_cmd("git add backend/src/test/java/com/devign/chattr/integration/KafkaIntegrationTest.java", check=False)
    
    stdout, _, code = run_cmd("git diff --cached --quiet", check=False)
    if code != 0:
        run_cmd('git commit -m "refactor: remove ai-service and Kafka infrastructure\n\n- Delete ai-service directory (Python FastAPI)\n- Remove Kafka and Zookeeper from docker-compose\n- Remove Kafka dependencies from pom.xml\n- Remove Kafka code from backend services\n- Remove RANDOM mode (DATING only for v1)\n- Update application configs\n\nPart of v1 refactoring: simplifying to monolith architecture"')
        print("✅ Committed\n")
    else:
        print("⏭️  No changes for this commit\n")
    
    # Commit 2: New data models
    print("2️⃣  Committing new data models and repositories...")
    run_cmd("git add backend/src/main/java/com/devign/chattr/model/QuestionnaireQuestion.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/model/QuestionnaireAnswer.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/model/Prompt.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/model/MatchCandidate.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/model/Match.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/model/User.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/repository/QuestionnaireQuestionRepository.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/repository/QuestionnaireAnswerRepository.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/repository/PromptRepository.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/repository/MatchCandidateRepository.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/repository/MatchRepository.java", check=False)
    
    stdout, _, code = run_cmd("git diff --cached --quiet", check=False)
    if code != 0:
        run_cmd('git commit -m "feat: add v1 data models and repositories\n\n- Add QuestionnaireQuestion, QuestionnaireAnswer entities\n- Add Prompt entity for Hinge-style prompts\n- Add MatchCandidate entity for daily introductions\n- Add Match entity for mutual matches\n- Update User model with orientation, seeking, matchingPaused\n- Create repositories for all new entities\n\nPart of v1: anti-swipe introductions model"')
        print("✅ Committed\n")
    else:
        print("⏭️  No changes for this commit\n")
    
    # Commit 3: New services
    print("3️⃣  Committing new services...")
    run_cmd("git add backend/src/main/java/com/devign/chattr/service/CompatibilityScoringService.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/service/IntroductionsService.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/dto/IntroductionDTO.java", check=False)
    
    stdout, _, code = run_cmd("git diff --cached --quiet", check=False)
    if code != 0:
        run_cmd('git commit -m "feat: implement introductions service and compatibility scoring\n\n- Add CompatibilityScoringService (deterministic scoring)\n- Add IntroductionsService (1-3 introductions per day)\n- Implement accept/pass/match creation logic\n- Add filters: blocks, existing matches, recent passes\n- Generate match reasons for display\n\nPart of v1: anti-swipe matching system"')
        print("✅ Committed\n")
    else:
        print("⏭️  No changes for this commit\n")
    
    # Commit 4: New API endpoints
    print("4️⃣  Committing new API endpoints...")
    run_cmd("git add backend/src/main/java/com/devign/chattr/controller/IntroductionsController.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/controller/QuestionnaireController.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/controller/PromptController.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/controller/MatchController.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/controller/UserController.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/config/WebSocketConfig.java", check=False)
    
    stdout, _, code = run_cmd("git diff --cached --quiet", check=False)
    if code != 0:
        run_cmd('git commit -m "feat: add v1 API endpoints\n\n- Add IntroductionsController (GET, accept, pass, shown)\n- Add QuestionnaireController (GET questions, POST answers)\n- Add PromptController (GET, PUT prompts)\n- Add MatchController (GET matches)\n- Update UserController (pause, resume, delete account)\n- Fix WebSocketConfig JwtUtil injection\n\nPart of v1: REST API for introductions flow"')
        print("✅ Committed\n")
    else:
        print("⏭️  No changes for this commit\n")
    
    # Commit 5: Questionnaire seeder
    print("5️⃣  Committing questionnaire seeder...")
    run_cmd("git add backend/src/main/java/com/devign/chattr/config/QuestionnaireSeeder.java", check=False)
    
    stdout, _, code = run_cmd("git diff --cached --quiet", check=False)
    if code != 0:
        run_cmd('git commit -m "feat: add questionnaire seeder with 25 questions\n\n- Auto-seed 25 questionnaire questions on startup\n- Covers: values, communication, lifestyle, goals, interests\n- Supports MULTIPLE_CHOICE, SCALE, TEXT types\n- Only seeds if no questions exist\n\nPart of v1: onboarding questionnaire"')
        print("✅ Committed\n")
    else:
        print("⏭️  No changes for this commit\n")
    
    # Commit 6: Frontend rewrite
    print("6️⃣  Committing frontend rewrite...")
    run_cmd("git add frontend/src/app/page.tsx", check=False)
    run_cmd("git add frontend/src/app/onboarding/", check=False)
    run_cmd("git add frontend/src/app/introductions/", check=False)
    run_cmd("git add frontend/src/app/matches/", check=False)
    run_cmd("git add frontend/src/app/chat/", check=False)
    run_cmd("git add frontend/src/app/about/", check=False)
    run_cmd("git add frontend/src/app/faq/", check=False)
    run_cmd("git add frontend/src/app/register/", check=False)
    
    stdout, _, code = run_cmd("git diff --cached --quiet", check=False)
    if code != 0:
        run_cmd('git commit -m "feat: rewrite frontend for anti-swipe UX\n\n- Rewrite landing page with anti-swipe messaging\n- Add onboarding flow (4 steps: profile, questionnaire, prompts)\n- Add introductions page (1 card at a time, Accept/Pass)\n- Add matches page (active matches list)\n- Add chat page (1:1 messaging)\n- Update about and FAQ pages with new copy\n- Update register to redirect to onboarding\n\nPart of v1: calm, premium, intentional design"')
        print("✅ Committed\n")
    else:
        print("⏭️  No changes for this commit\n")
    
    # Commit 7: Settings and API fixes
    print("7️⃣  Committing settings and API fixes...")
    run_cmd("git add frontend/src/app/settings/", check=False)
    run_cmd("git add frontend/src/lib/api.ts", check=False)
    
    stdout, _, code = run_cmd("git diff --cached --quiet", check=False)
    if code != 0:
        run_cmd('git commit -m "feat: update settings and fix API utilities\n\n- Add pause/resume matching in settings\n- Add delete account functionality\n- Fix getApiUrl() to return base URL only\n- Update all API calls to use new format\n\nPart of v1: premium aesthetic and API consistency"')
        print("✅ Committed\n")
    else:
        print("⏭️  No changes for this commit\n")
    
    # Commit 8: Documentation and config
    print("8️⃣  Committing documentation and configuration...")
    run_cmd("git add README.md", check=False)
    run_cmd("git add V1_REFACTOR_SUMMARY.md", check=False)
    run_cmd("git add NEXT_STEPS_COMPLETE.md", check=False)
    run_cmd("git add .env.example", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/service/ChatService.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/service/MatchmakingService.java", check=False)
    run_cmd("git add backend/src/main/java/com/devign/chattr/service/ReportService.java", check=False)
    run_cmd("git add backend/src/test/java/com/devign/chattr/service/MatchmakingServiceTest.java", check=False)
    
    stdout, _, code = run_cmd("git diff --cached --quiet", check=False)
    if code != 0:
        run_cmd('git commit -m "docs: update configuration and documentation\n\n- Update README with v1 architecture\n- Add refactoring summary documents\n- Add .env.example\n- Remove Kafka code from services\n- Update tests\n\nPart of v1: documentation and cleanup"')
        print("✅ Committed\n")
    else:
        print("⏭️  No changes for this commit\n")
    
    # Commit 9: Remaining changes
    print("9️⃣  Committing any remaining changes...")
    run_cmd("git add -A", check=False)
    
    stdout, _, code = run_cmd("git diff --cached --quiet", check=False)
    if code != 0:
        run_cmd('git commit -m "chore: remaining v1 refactoring changes\n\n- Additional cleanup and fixes\n- Helper scripts and documentation"')
        print("✅ Committed\n")
    else:
        print("⏭️  No remaining changes\n")
    
    # Show commit log
    print("\n📊 Recent commits:")
    stdout, _, _ = run_cmd("git log --oneline -10")
    print(stdout)
    
    # Check for remote and push
    print("\n🌐 Checking remote...")
    stdout, _, code = run_cmd("git remote get-url origin", check=False)
    if code == 0:
        print(f"✅ Remote 'origin' found: {stdout}\n")
        print("⬆️  Pushing to GitHub...")
        stdout, stderr, code = run_cmd(f"git push origin {branch}", check=False)
        if code == 0:
            print("✅ Successfully pushed to GitHub!")
        else:
            print(f"⚠️  Push attempt returned: {stderr}")
            print("   You may need to set upstream:")
            print(f"   git push -u origin {branch}")
    else:
        print("⚠️  No remote 'origin' found.")
        print("   To add a remote, run:")
        print("   git remote add origin https://github.com/YOUR_USERNAME/chattr.git")
        print(f"   Then run: git push -u origin {branch}")
    
    print("\n✅ Done!")

if __name__ == "__main__":
    main()

