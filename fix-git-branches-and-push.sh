#!/bin/bash

set -e

echo "=== Checking git status ==="
git status

echo ""
echo "=== Checking current branch ==="
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

echo ""
echo "=== Checking remote branches ==="
git remote -v

echo ""
echo "=== Staging all changes ==="
git add -A

echo ""
echo "=== Checking what will be committed ==="
git status --short

echo ""
echo "=== Committing changes ==="
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

echo ""
echo "=== Determining remote branch ==="
# Try to push to main first, then master
if git ls-remote --heads origin main | grep -q main; then
    REMOTE_BRANCH="main"
    echo "Remote has 'main' branch"
elif git ls-remote --heads origin master | grep -q master; then
    REMOTE_BRANCH="master"
    echo "Remote has 'master' branch"
else
    echo "No main or master branch found on remote. Creating main..."
    REMOTE_BRANCH="main"
fi

echo ""
echo "=== Ensuring local branch matches remote ==="
if [ "$CURRENT_BRANCH" != "$REMOTE_BRANCH" ]; then
    echo "Current branch ($CURRENT_BRANCH) doesn't match remote branch ($REMOTE_BRANCH)"
    echo "Checking out/creating $REMOTE_BRANCH branch..."
    git checkout -b "$REMOTE_BRANCH" 2>/dev/null || git checkout "$REMOTE_BRANCH"
fi

echo ""
echo "=== Pushing to origin $REMOTE_BRANCH ==="
git push -u origin "$REMOTE_BRANCH" || {
    echo "Push failed. Trying to set upstream..."
    git push --set-upstream origin "$REMOTE_BRANCH" || {
        echo "Push still failed. Please check your git remote configuration."
        exit 1
    }
}

echo ""
echo "=== Success! Changes pushed to origin/$REMOTE_BRANCH ==="
git log --oneline -1

