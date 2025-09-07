# Docker Compose Setup

This project now includes a unified `docker-compose.yml` file that orchestrates all services: frontend, backend, PostgreSQL, and Redis.

## Services

- **Frontend**: Next.js application on port 3000
- **Backend**: Node.js API on port 3001
- **PostgreSQL**: Database on port 5432
- **Redis**: Cache on port 6379

## Quick Start

1. **Create environment file** (copy from backend/env.example):

   ```bash
   cp backend/env.example .env
   ```

2. **Start all services**:

   ```bash
   docker-compose up -d
   ```

3. **View logs**:

   ```bash
   docker-compose logs -f
   ```

4. **Stop all services**:
   ```bash
   docker-compose down
   ```

## Individual Service Management

You can also run services individually if needed:

### Start only database services:

```bash
docker-compose up -d postgres redis
```

### Start only backend:

```bash
docker-compose up -d backend
```

### Start only frontend:

```bash
docker-compose up -d frontend
```

## Environment Variables

Create a `.env` file in the root directory with:

```env
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Frontend Configuration
FRONTEND_URL="http://localhost:3000"

# Database Configuration (for external connections)
DATABASE_URL="postgresql://postgres:password@localhost:5432/notes_blog"

# Redis Configuration (for external connections)
REDIS_URL="redis://localhost:6379"
```

## Database Setup

The PostgreSQL service will automatically create the `notes_blog` database. You may need to run Prisma migrations:

```bash
# Access the backend container
docker-compose exec backend sh

# Run migrations
npx prisma migrate deploy
```

## Health Checks

All services include health checks:

- PostgreSQL: Checks if database is ready
- Redis: Pings Redis server
- Backend: Checks `/api/health` endpoint
- Frontend: Checks if the app is responding

## Data Persistence

- PostgreSQL data is persisted in the `postgres_data` volume
- Redis data is persisted in the `redis_data` volume

## Network

All services communicate through the `notes-blog-network` bridge network, allowing them to reach each other by service name.

## Development vs Production

This setup is configured for production. For development with hot reloading, you can:

1. Use the individual `docker-compose.dev.yml` files in each service directory
2. Or modify the root docker-compose.yml to use development configurations

## Troubleshooting

### Check service status:

```bash
docker-compose ps
```

### View specific service logs:

```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs redis
```

### Restart a specific service:

```bash
docker-compose restart backend
```

### Rebuild and restart:

```bash
docker-compose up -d --build
```
