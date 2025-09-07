# Notes Blog - Production Setup

A full-stack blog application with Next.js frontend, Node.js backend, PostgreSQL database, and Redis caching.

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd notes-blog
```

### 2. Configure Environment

```bash
cp env.example .env
```

Edit `.env` file with your production values:

- Change `JWT_SECRET` to a secure random string
- Update `FRONTEND_URL` and `BACKEND_URL` to your domain
- Configure OAuth credentials (Google, GitHub)
- Update database credentials if needed

### 3. Run Production Setup

```bash
chmod +x setup-production.sh
./setup-production.sh
```

This script will:

- Build and start all services (PostgreSQL, Redis, Backend, Frontend)
- Run database migrations
- Create initial admin user
- Clean up sensitive files

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## Management Commands

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Database Operations

```bash
# Push schema changes (for schema-first approach)
docker exec notes-blog-backend npx prisma db push

# Generate Prisma client (if schema changed)
docker exec notes-blog-backend npx prisma generate

# Reset database (WARNING: deletes all data)
docker-compose down
docker volume rm notes-blog_postgres_data
docker-compose up -d
```

## Production Notes

- All services run in Docker containers
- Database data persists in Docker volumes
- Services restart automatically on failure
- Health checks ensure services are running properly
- Credentials are not stored in files after setup
- Database uses schema-first approach (no migration files needed)
- "No migration found" message is normal and expected
- Only creates one admin user (no hardcoded credentials)

## Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Restart all services
docker-compose restart
```

### Database connection issues

```bash
# Check database status
docker exec notes-blog-postgres pg_isready -U postgres

# View database logs
docker-compose logs postgres
```

### Frontend not loading

```bash
# Check if backend is healthy
curl http://localhost:3001/api/health

# Check frontend logs
docker-compose logs frontend
```
