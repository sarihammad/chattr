# Git Branch Fix and Push Instructions

## Quick Fix

Run the automated script:

```bash
./fix-and-push.sh
```

## Manual Steps (if script doesn't work)

### 1. Check current status
```bash
git status
git branch --show-current
```

### 2. Ensure you're on the main branch
```bash
# If you're on a different branch, switch to main
git checkout main

# Or create main if it doesn't exist
git checkout -b main
```

### 3. Stage all changes
```bash
git add -A
```

### 4. Commit changes
```bash
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
```

### 5. Push to remote
```bash
# Try main first
git push -u origin main

# If main doesn't exist on remote, try master
git push -u origin master

# Or create main on remote
git push -u origin main:main
```

## Troubleshooting

### If push fails with "no upstream branch"
```bash
git push --set-upstream origin main
```

### If you need to force push (use with caution!)
```bash
git push -u origin main --force
```

### Check remote branches
```bash
git ls-remote --heads origin
```

### Check local branches
```bash
git branch -a
```

