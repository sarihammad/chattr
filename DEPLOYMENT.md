# Deployment Guide

This guide covers deploying Chattr to production environments.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL 15+
- Redis 7+
- Kafka (Confluent Platform or Apache Kafka)
- Domain name (optional, for production)
- SSL certificates (for HTTPS in production)

## Quick Start with Docker Compose

### Development

```bash
# Start all services
docker-compose up

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Production

1. **Set environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Update docker-compose.yml for production:**

   - Use environment variables from `.env`
   - Configure proper network settings
   - Set up volumes for data persistence
   - Configure health checks

3. **Start services:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## Manual Deployment

### Backend (Spring Boot)

1. **Build:**

   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ```

2. **Run:**

   ```bash
   java -jar target/chattr-0.0.1-SNAPSHOT.jar
   ```

3. **Environment variables:**
   - `SPRING_DATASOURCE_URL`
   - `SPRING_REDIS_HOST`
   - `SPRING_KAFKA_BOOTSTRAP_SERVERS`
   - `AI_SERVICE_URL`
   - `JWT_SECRET`

### Frontend (Next.js)

1. **Build:**

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Run:**

   ```bash
   npm start
   ```

3. **Environment variables:**
   - `NEXT_PUBLIC_API_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`

### AI Service (FastAPI)

1. **Install dependencies:**

   ```bash
   cd ai-service
   pip install -r requirements.txt
   ```

2. **Run:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## Production Checklist

### Security

- [ ] Change all default passwords
- [ ] Use strong JWT secret (minimum 256 bits)
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure CORS properly for your domain
- [ ] Set up firewall rules
- [ ] Enable rate limiting (already configured)
- [ ] Review and update security headers

### Database

- [ ] Set up PostgreSQL with proper backups
- [ ] Configure connection pooling
- [ ] Set up database migrations/versioning
- [ ] Configure database replication (for high availability)

### Redis

- [ ] Configure Redis persistence (AOF or RDB)
- [ ] Set up Redis Sentinel or Cluster for HA
- [ ] Configure memory limits and eviction policies

### Kafka

- [ ] Configure proper retention policies
- [ ] Set up Kafka cluster (multiple brokers)
- [ ] Configure replication factor
- [ ] Set up monitoring and alerting

### Monitoring

- [ ] Set up application monitoring (e.g., Prometheus, Grafana)
- [ ] Configure log aggregation (e.g., ELK stack)
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure health check endpoints
- [ ] Set up uptime monitoring

### Scalability

- [ ] Use load balancer for frontend (e.g., Nginx, Traefik)
- [ ] Scale backend horizontally (multiple instances)
- [ ] Configure session persistence if needed
- [ ] Set up auto-scaling policies

## Cloud Deployment Options

### AWS

1. **ECS/EKS** for container orchestration
2. **RDS** for PostgreSQL
3. **ElastiCache** for Redis
4. **MSK** for Kafka
5. **ECR** for Docker images
6. **CloudFront** for CDN
7. **ALB** for load balancing

### Google Cloud Platform

1. **Cloud Run** or **GKE** for containers
2. **Cloud SQL** for PostgreSQL
3. **Memorystore** for Redis
4. **Pub/Sub** (alternative to Kafka)
5. **Container Registry** for images
6. **Cloud Load Balancing**

### Azure

1. **Container Instances** or **AKS**
2. **Azure Database for PostgreSQL**
3. **Azure Cache for Redis**
4. **Event Hubs** (alternative to Kafka)
5. **Container Registry**
6. **Application Gateway**

## CI/CD with GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

- Runs backend tests with Testcontainers
- Runs frontend linting and E2E tests
- Runs AI service tests
- Builds Docker images
- Tests Docker Compose setup

### Setting up GitHub Actions

1. Push code to GitHub
2. Ensure secrets are configured (if needed)
3. Workflow runs automatically on push/PR

## Health Checks

### Backend

```bash
curl http://localhost:8080/actuator/health
```

### Frontend

```bash
curl http://localhost:3000
```

### AI Service

```bash
curl http://localhost:8000/health
```

## Troubleshooting

### Services won't start

1. Check ports are available: `lsof -i :3000,8080,8000,5432,6379,9092`
2. Check Docker is running: `docker ps`
3. Check logs: `docker-compose logs [service-name]`

### Database connection issues

1. Verify PostgreSQL is running: `docker-compose ps postgres`
2. Check connection string in environment variables
3. Verify network connectivity between services

### WebSocket connection issues

1. Check WebSocket endpoint is accessible
2. Verify JWT token is valid
3. Check CORS configuration allows WebSocket connections
4. Verify STOMP/SockJS libraries are loaded

### Performance issues

1. Check database query performance
2. Monitor Redis cache hit rates
3. Check Kafka consumer lag
4. Review application logs for slow operations

## Environment-Specific Configurations

### Development

- Use `docker-compose.yml` as-is
- Local databases and services
- Hot reload enabled

### Staging

- Use production-like environment
- Separate database instance
- Enable monitoring and logging

### Production

- Use production-grade infrastructure
- Database backups enabled
- Monitoring and alerting configured
- CDN for static assets
- Load balancing configured

## Backup and Recovery

### Database Backups

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres chattr > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres chattr < backup.sql
```

### Redis Backups

Redis persistence should be configured in `docker-compose.yml` with volumes.

### Application Data

- User uploads: Backed up to S3 (if configured)
- Kafka topics: Configure retention policies
- Logs: Aggregate to log storage service

## Scaling

### Horizontal Scaling

1. **Frontend**: Use load balancer, scale Next.js instances
2. **Backend**: Scale Spring Boot instances behind load balancer
3. **AI Service**: Scale FastAPI instances (stateless)

### Vertical Scaling

1. Increase container resources (CPU, memory)
2. Optimize database queries
3. Increase Redis memory limits

## Support

For deployment issues, check:

- Application logs
- Docker logs
- System resource usage
- Network connectivity
- Environment variables
