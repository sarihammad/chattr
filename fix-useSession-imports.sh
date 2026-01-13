#!/bin/bash

set -e

echo "=========================================="
echo "Fixing useSession Imports"
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
echo "Committing fixes..."
git commit -m "fix: replace NextAuth useSession with Spring Boot JWT auth hook

- Create useAuth hook to replace NextAuth useSession
- Update all components to use new auth hook from @/hooks/useAuth
- Fix requireAuth middleware to work without NextAuth
- Disable SocialAuth component (can be re-enabled with Spring Boot OAuth later)
- Fix Navbar to use new auth hook
- All pages now use Spring Boot JWT authentication instead of NextAuth"

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
echo "✓ Done! All fixes committed and pushed."

