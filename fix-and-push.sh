#!/bin/bash

set -e

echo "=========================================="
echo "Git Branch Fix and Push Script"
echo "=========================================="
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "Current branch: $CURRENT_BRANCH"

# Check remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
    echo "Error: No remote 'origin' configured"
    exit 1
fi
echo "Remote: $REMOTE_URL"
echo ""

# Check what remote branches exist
echo "Checking remote branches..."
if git ls-remote --heads origin main 2>/dev/null | grep -q "refs/heads/main"; then
    REMOTE_MAIN_EXISTS=true
    echo "✓ Remote 'main' branch exists"
else
    REMOTE_MAIN_EXISTS=false
    echo "✗ Remote 'main' branch does not exist"
fi

if git ls-remote --heads origin master 2>/dev/null | grep -q "refs/heads/master"; then
    REMOTE_MASTER_EXISTS=true
    echo "✓ Remote 'master' branch exists"
else
    REMOTE_MASTER_EXISTS=false
    echo "✗ Remote 'master' branch does not exist"
fi
echo ""

# Determine target branch
if [ "$REMOTE_MAIN_EXISTS" = true ]; then
    TARGET_BRANCH="main"
elif [ "$REMOTE_MASTER_EXISTS" = true ]; then
    TARGET_BRANCH="master"
else
    TARGET_BRANCH="main"
    echo "No main or master found. Will create 'main' branch."
fi

echo "Target branch: $TARGET_BRANCH"
echo ""

# Switch to target branch if needed
if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
    echo "Switching from '$CURRENT_BRANCH' to '$TARGET_BRANCH'..."
    if git show-ref --verify --quiet refs/heads/"$TARGET_BRANCH"; then
        git checkout "$TARGET_BRANCH"
    else
        git checkout -b "$TARGET_BRANCH"
    fi
    echo "✓ Switched to $TARGET_BRANCH"
    echo ""
fi

# Stage all changes
echo "Staging all changes..."
git add -A
echo "✓ Changes staged"
echo ""

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "No changes to commit. Checking for untracked files..."
    if [ -z "$(git ls-files --others --exclude-standard)" ]; then
        echo "No changes to commit. Repository is clean."
        exit 0
    else
        echo "Found untracked files. Staging them..."
        git add -A
    fi
fi

# Show what will be committed
echo "Changes to be committed:"
git status --short
echo ""

# Commit changes
echo "Committing changes..."
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

# Push to remote
echo "Pushing to origin/$TARGET_BRANCH..."
if git push -u origin "$TARGET_BRANCH" 2>&1; then
    echo ""
    echo "=========================================="
    echo "✓ Successfully pushed to origin/$TARGET_BRANCH"
    echo "=========================================="
    echo ""
    echo "Latest commit:"
    git log --oneline -1
else
    echo ""
    echo "=========================================="
    echo "✗ Push failed"
    echo "=========================================="
    echo ""
    echo "Trying to set upstream..."
    if git push --set-upstream origin "$TARGET_BRANCH" 2>&1; then
        echo "✓ Successfully pushed with upstream set"
    else
        echo "✗ Push still failed. Please check:"
        echo "  1. Your SSH keys are set up correctly"
        echo "  2. You have write access to the repository"
        echo "  3. The remote branch exists or can be created"
        exit 1
    fi
fi

