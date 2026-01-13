#!/bin/bash
set -e

echo "🚀 Starting git operations..."

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
    echo "✅ Git initialized"
fi

# Check current branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
echo " branch: $BRANCH"

# Stage all changes
echo "📦 Staging all changes..."
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "✅ No changes to commit. Everything is up to date."
    exit 0
fi

# Commit changes
echo "📝 Committing changes..."
if [ -f COMMIT_MESSAGE.txt ]; then
    git commit -F COMMIT_MESSAGE.txt
else
    git commit -m "refactor: complete v1 refactoring - anti-swipe matchmaking

- Remove ai-service and Kafka infrastructure
- Add new data models (Questionnaire, MatchCandidate, Match, Prompt)
- Implement IntroductionsService (1-3 per day, anti-swipe)
- Implement CompatibilityScoringService (deterministic scoring)
- Add new API endpoints (introductions, questionnaire, prompts, matches)
- Rewrite frontend for anti-swipe UX
- Update all copywriting (calm, premium, intentional)
- Add questionnaire seeder (25 questions)
- Update configuration and documentation"
fi

echo "✅ Changes committed!"

# Check for remote
if git remote | grep -q origin; then
    REMOTE_URL=$(git remote get-url origin)
    echo "🌐 Remote 'origin' found: $REMOTE_URL"
    
    # Push to remote
    echo "⬆️  Pushing to GitHub..."
    if git push origin $BRANCH; then
        echo "✅ Successfully pushed to GitHub!"
    else
        echo "⚠️  Push failed. You may need to:"
        echo "   - Set upstream: git push -u origin $BRANCH"
        echo "   - Or check your remote: git remote -v"
    fi
else
    echo "⚠️  No remote 'origin' found."
    echo "   To add a remote, run:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/chattr.git"
    echo "   Then run this script again."
fi

echo ""
echo "📊 Final status:"
git status --short

