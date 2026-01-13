#!/bin/bash

# Fix CI compilation and linting errors
git add -A

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

git push origin main 2>&1 || git push origin master 2>&1 || echo "Push failed - check remote"

