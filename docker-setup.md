# Docker Setup for Notes & Code Blog

## Quick Start with Docker

### 1. Start the Database

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Check if containers are running
docker-compose ps
```

### 2. Set up Environment Variables

```bash
# Copy the example environment file
cp env.example .env.local

# Edit .env.local with your preferred settings
# The default values should work with the Docker setup
```

### 3. Initialize the Database

```bash
# Generate Prisma client
npm run db:generate

# Push the schema to the database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Start the Application

```bash
# Start the Next.js development server
npm run dev
```

## Access Points

- **Application**: http://localhost:3000
- **pgAdmin**: http://localhost:5050
  - Email: admin@notesblog.com
  - Password: admin123

## Database Connection Details

- **Host**: localhost
- **Port**: 5432
- **Database**: notes_blog
- **Username**: notes_user
- **Password**: notes_password

## Useful Docker Commands

```bash
# View logs
docker-compose logs postgres
docker-compose logs pgadmin

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Restart services
docker-compose restart

# Access PostgreSQL shell
docker-compose exec postgres psql -U notes_user -d notes_blog
```

## Troubleshooting

### Port Already in Use

If port 5432 is already in use:

```bash
# Change the port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 instead of 5432
```

### Database Connection Issues

1. Make sure the container is running: `docker-compose ps`
2. Check the logs: `docker-compose logs postgres`
3. Verify the connection string in `.env.local`

### Reset Everything

```bash
# Stop and remove everything
docker-compose down -v

# Remove any existing containers
docker system prune -f

# Start fresh
docker-compose up -d
```
