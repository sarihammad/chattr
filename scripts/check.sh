#!/usr/bin/env bash
set -euo pipefail

readonly ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
readonly FRONTEND_DIR="${ROOT_DIR}/frontend"
readonly BACKEND_DIR="${ROOT_DIR}/backend"
readonly AI_SERVICE_DIR="${ROOT_DIR}/ai-service"

function log_step() {
  printf "\n=== %s ===\n" "$1"
}

log_step "Frontend lint"
(cd "$FRONTEND_DIR" && npm run lint)

log_step "Frontend typecheck"
(cd "$FRONTEND_DIR" && npm run typecheck)

log_step "Frontend build"
(cd "$FRONTEND_DIR" && npm run build)

log_step "Backend tests"
(cd "$BACKEND_DIR" && mkdir -p .m2 && MAVEN_OPTS="-Dmaven.repo.local=$BACKEND_DIR/.m2" ./mvnw test)

log_step "AI service tests"
(cd "$AI_SERVICE_DIR" && pytest test_main.py -v)
