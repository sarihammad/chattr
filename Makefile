.PHONY: help build up down logs test clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-ai: ## View AI service logs
	docker-compose logs -f ai-service

test-backend: ## Run backend tests
	cd backend && ./mvnw test

test-frontend: ## Run frontend E2E tests
	cd frontend && npm run test:e2e

test-ai: ## Run AI service tests
	cd ai-service && pytest test_main.py -v

test-all: ## Run all tests
	make test-backend
	make test-ai
	make test-frontend

clean: ## Remove containers, volumes, and images
	docker-compose down -v
	docker system prune -f

restart: ## Restart all services
	docker-compose restart

ps: ## Show running containers
	docker-compose ps

shell-backend: ## Open shell in backend container
	docker-compose exec backend sh

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

shell-postgres: ## Open PostgreSQL CLI
	docker-compose exec postgres psql -U postgres -d chattr

shell-redis: ## Open Redis CLI
	docker-compose exec redis redis-cli

db-backup: ## Backup PostgreSQL database
	docker-compose exec postgres pg_dump -U postgres chattr > backup_$(shell date +%Y%m%d_%H%M%S).sql

db-restore: ## Restore PostgreSQL database (usage: make db-restore FILE=backup.sql)
	docker-compose exec -T postgres psql -U postgres chattr < $(FILE)

dev-backend: ## Run backend in development mode
	cd backend && ./mvnw spring-boot:run

dev-frontend: ## Run frontend in development mode
	cd frontend && npm run dev

dev-ai: ## Run AI service in development mode
	cd ai-service && uvicorn main:app --reload --host 0.0.0.0 --port 8000

