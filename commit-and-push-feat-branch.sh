#!/bin/bash

set -e

echo "=========================================="
echo "Committing CI Fixes to feat/chat-and-matchmaking"
echo "=========================================="
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "feat/chat-and-matchmaking" ]; then
    echo "Warning: Not on feat/chat-and-matchmaking branch"
    echo "Switching to feat/chat-and-matchmaking..."
    git checkout feat/chat-and-matchmaking
    echo "✓ Switched to feat/chat-and-matchmaking"
    echo ""
fi

# Check git status
echo "Current git status:"
git status --short
echo ""

# Stage all changes
echo "Staging all changes..."
git add -A
echo "✓ Changes staged"
echo ""

# Check if there are changes to commit
if git diff --staged --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    echo "No changes to commit. Repository is clean."
    echo "Checking if we need to push..."
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
    if [ -n "$REMOTE" ] && [ "$LOCAL" = "$REMOTE" ]; then
        echo "Local and remote are in sync. Nothing to push."
        exit 0
    fi
else
    # Show what will be committed
    echo "Changes to be committed:"
    git status --short
    echo ""

    # Commit changes
    echo "Committing CI fixes..."
    git commit -m "fix: resolve CI compilation and linting errors

- Fix Java type conversion error (MIN_SCORE_THRESHOLD double to int)
- Fix frontend linting errors:
  - Remove unused session variables
  - Fix useEffect dependencies with useCallback
  - Replace img tags with Next.js Image component
  - Remove unused QuestionnaireAnswer interface
  - Fix any type with proper Question interface
- Update CI workflows to remove ai-service and Kafka references
- Remove duplicate fetchMessages function in chat page"
    echo "✓ Changes committed"
    echo ""
fi

# Push to remote
echo "Pushing to origin/feat/chat-and-matchmaking..."
if git push -u origin feat/chat-and-matchmaking 2>&1; then
    echo ""
    echo "=========================================="
    echo "✓ Successfully pushed to origin/feat/chat-and-matchmaking"
    echo "=========================================="
    echo ""
    echo "Latest commit:"
    git log --oneline -1
    echo ""
    echo "CI checks should now pass. You can merge this branch to main."
else
    echo ""
    echo "=========================================="
    echo "✗ Push failed"
    echo "=========================================="
    echo ""
    echo "Trying to set upstream..."
    if git push --set-upstream origin feat/chat-and-matchmaking 2>&1; then
        echo "✓ Successfully pushed with upstream set"
    else
        echo "✗ Push still failed. Please check:"
        echo "  1. Your SSH keys are set up correctly"
        echo "  2. You have write access to the repository"
        exit 1
    fi
fi

