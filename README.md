# Chattr

Chattr is a modern, real-time chat application built with Next.js, WebSocket, and Redis. It features smart matchmaking, real-time messaging, and a beautiful, responsive UI.

## Features

- Real-time messaging with WebSocket
- Smart matchmaking based on user preferences
- End-to-end encryption for messages
- Modern, responsive UI with animations
- Dark mode support
- Secure authentication with NextAuth.js
- Performance monitoring and metrics
- Highly scalable architecture

## Tech Stack

- **Frontend:**

  - Next.js 13 (App Router)
  - React 18
  - Framer Motion
  - TailwindCSS
  - TypeScript

- **Backend:**

  - Node.js
  - WebSocket (ws)
  - Redis
  - Kafka
  - PostgreSQL (with Prisma)

- **Authentication:**

  - NextAuth.js
  - Google OAuth

- **Infrastructure:**
  - AWS (ECS, DynamoDB, Lambda)
  - Docker
  - Redis
  - Kafka

## Getting Started

### Prerequisites

- Node.js 18 or later
- Redis server
- PostgreSQL database
- Docker (optional)

### Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/chattr.git
cd chattr
```

2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

4. Set up the database:

```bash
npm run prisma:generate
npm run prisma:push
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production

Build and start the production server:

```bash
npm run build
npm start
```

### Docker

Build and run with Docker:

```bash
docker build -t chattr .
docker run -p 3000:3000 -p 8080:8080 chattr
```

## Architecture

### Components

- **WebSocket Server**: Handles real-time communication
- **Redis**: Message queuing and caching
- **Kafka**: Event streaming and message processing
- **DynamoDB**: Message storage
- **PostgreSQL**: User data and chat room management

### Scalability

The application is designed to be highly scalable:

- Containerized with Docker
- Deployable on AWS ECS/Fargate
- Auto-scaling based on CPU/Memory utilization
- Load balanced with Application Load Balancer
- Message processing with AWS Lambda

### Monitoring

- Prometheus metrics for:
  - Active connections
  - Message throughput
  - Matchmaking latency
  - Queue depth
- Health check endpoints
- Error tracking and logging

## Security

- End-to-end encryption for messages
- JWT-based authentication
- Rate limiting
- Input validation
- CORS protection
- Security headers
- GDPR compliance tools

## API Documentation

### WebSocket Events

- `message`: Send/receive chat messages
- `typing`: Typing indicators
- `join`: Join chat rooms
- `leave`: Leave chat rooms

### REST Endpoints

- `POST /api/matchmaking`: Find chat partners
- `DELETE /api/matchmaking`: Leave matchmaking queue
- `GET /api/health`: Service health check

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Vercel for the deployment platform
- TailwindCSS team for the utility-first CSS framework
- Framer Motion for the beautiful animations
