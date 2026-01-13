#!/bin/bash

set -e

echo "=========================================="
echo "Fixing Linting Error"
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
echo "Committing lint fix..."
git commit -m "fix: remove unused NextResponse import from auth middleware"

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
echo "✓ Done! Lint fix committed and pushed."

