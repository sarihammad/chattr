#!/bin/bash

# Fix CI checks for feat/chat-and-matchmaking branch

echo "=== Fixing CI checks for feat/chat-and-matchmaking ==="
echo ""

# Ensure we're on the right branch
CURRENT=$(git branch --show-current)
if [ "$CURRENT" != "feat/chat-and-matchmaking" ]; then
    echo "Switching to feat/chat-and-matchmaking..."
    git checkout feat/chat-and-matchmaking
fi

echo "Current branch: $(git branch --show-current)"
echo ""

# Stage all changes
echo "Staging changes..."
git add -A

# Commit
echo "Committing CI fixes..."
git commit -m "fix: resolve CI compilation and linting errors

- Fix Java type conversion error (MIN_SCORE_THRESHOLD double to int)
- Fix frontend linting errors (unused vars, useEffect deps, img tags, types)
- Update CI workflows to remove ai-service and Kafka references"

# Push
echo "Pushing to origin..."
git push origin feat/chat-and-matchmaking || git push -u origin feat/chat-and-matchmaking

echo ""
echo "✓ Done! CI checks should now pass."

