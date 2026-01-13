#!/bin/bash

set -e

echo "=========================================="
echo "Committing Test Fixes"
echo "=========================================="
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Stage all changes
echo "Staging all changes..."
git add -A
echo "✓ Changes staged"
echo ""

# Show what will be committed
echo "Changes to be committed:"
git status --short
echo ""

# Commit changes
echo "Committing test fixes..."
git commit -m "fix: resolve all test failures and compilation errors

Backend test fixes:
- Fix AiClientServiceTest to properly inject RestTemplate via reflection
- Fix MatchmakingServiceTest to mock ValueOperations for Redis
- Fix ChattrApplicationTests with test properties for H2 database
- Remove unnecessary stubbing in testBatchScore_ServiceError

Frontend fixes:
- Fix pricing page to pass plan object instead of plan.name string"

echo "✓ Changes committed"
echo ""

# Push to current branch
echo "Pushing to origin/$CURRENT_BRANCH..."
if git push origin "$CURRENT_BRANCH" 2>&1; then
    echo ""
    echo "=========================================="
    echo "✓ Successfully pushed to origin/$CURRENT_BRANCH"
    echo "=========================================="
    echo ""
    echo "Latest commit:"
    git log --oneline -1
else
    echo ""
    echo "Trying with upstream..."
    if git push -u origin "$CURRENT_BRANCH" 2>&1; then
        echo "✓ Successfully pushed with upstream set"
    else
        echo "✗ Push failed. Please check your git configuration."
        exit 1
    fi
fi

echo ""
echo "✓ Done! All test fixes committed and pushed."

