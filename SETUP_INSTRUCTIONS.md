# Notes Blog - Setup Instructions

## Quick Setup

For a complete fresh setup, run:

```bash
./setup.sh
```

This script will:

- Stop existing containers
- Remove old database volumes
- Build and start all services
- Run database migrations
- Seed the database with default users

## Manual Setup

If you prefer to set up manually:

### 1. Start Services

```bash
docker-compose up -d --build
```

### 2. Run Database Migrations

```bash
docker exec notes-blog-backend npx prisma migrate dev --name init
```

### 3. Seed Database

```bash
docker exec notes-blog-backend npm run db:seed
```

## Default Users

After seeding, you'll have these users available:

| Role   | Email              | Password    |
| ------ | ------------------ | ----------- |
| Author | author@example.com | password123 |
| Admin  | admin@example.com  | admin123    |

## Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access backend container
docker exec -it notes-blog-backend sh

# Access database
docker exec -it notes-blog-postgres psql -U postgres -d notes_blog
```

## Environment Configuration

The application uses a single `.env` file in the root directory with the following key variables:

- `JWT_SECRET`: Secret key for JWT tokens
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Ensure PostgreSQL container is running: `docker ps`
2. Check database logs: `docker logs notes-blog-postgres`
3. Restart database: `docker-compose restart postgres`

### Frontend API Connection Issues

If frontend can't connect to backend:

1. Check backend is running: `curl http://localhost:3001/api/health`
2. Verify environment variables: `docker exec notes-blog-frontend env | grep API`
3. Rebuild frontend: `docker-compose up -d --build frontend`

### Reset Everything

To completely reset the application:

```bash
docker-compose down
docker volume rm notes-blog_postgres_data
./setup.sh
```
