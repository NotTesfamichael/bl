# Database Setup Guide

This guide walks you through setting up the database after running `docker-compose up -d --build`.

## Prerequisites

- Docker and Docker Compose installed
- Application built and containers running

## Step-by-Step Database Setup

### Step 1: Check Container Status

First, verify that all containers are running properly:

```bash
docker-compose ps
```

You should see all containers with "healthy" or "running" status:

- `notes-blog-postgres` (healthy)
- `notes-blog-backend` (healthy)
- `notes-blog-frontend` (running)
- `notes-blog-redis` (healthy)

### Step 2: Generate Prisma Client

Generate the Prisma client with the latest schema:

```bash
docker-compose exec backend npx prisma generate
```

**What this does:** Creates TypeScript types for your database schema based on `prisma/schema.prisma`.

### Step 3: Create and Apply Database Migration

Create the initial migration and apply it to the database:

```bash
docker-compose exec backend npx prisma migrate dev --name init
```

**What this does:**

- Creates migration files in `prisma/migrations/`
- Applies the schema to the PostgreSQL database
- Creates all tables (User, Post, Tag, Comment, etc.)

### Step 4: Seed the Database (Optional but Recommended)

Populate the database with sample data:

```bash
docker-compose exec backend npx prisma db seed
```

**What this does:** Runs the seed script to create:

- Sample users (author@example.com, admin@example.com)
- Sample tags (Technology, Programming, etc.)
- Sample posts for testing

### Step 5: Verify Database Setup

Check if the database is properly configured:

```bash
# Test the API health endpoint
curl http://localhost:3001/api/health

# Or open Prisma Studio to view the database
docker-compose exec backend npx prisma studio
```

## Complete Command Sequence

Here's the complete sequence to run after `docker-compose up -d --build`:

```bash
# 1. Check container status
docker-compose ps

# 2. Generate Prisma client
docker-compose exec backend npx prisma generate

# 3. Create and apply migration
docker-compose exec backend npx prisma migrate dev --name init

# 4. Seed the database
docker-compose exec backend npx prisma db seed

# 5. Verify everything is working
curl http://localhost:3001/api/health
```

## Alternative: Direct Schema Push

If you prefer not to use migrations, you can push the schema directly:

```bash
# Instead of step 3, use:
docker-compose exec backend npx prisma db push
```

**Note:** This doesn't create migration files but directly syncs the schema to the database.

## Troubleshooting

### Common Issues

1. **"Table does not exist" errors**

   - Solution: Run steps 2-4 in order

2. **Prisma client not found**

   - Solution: Run `docker-compose exec backend npx prisma generate`

3. **Migration conflicts**
   - Solution: Reset the database with `docker-compose exec backend npx prisma migrate reset --force`

### Reset Everything

If you need to start fresh:

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build

# Then follow the setup steps above
```

## Verification

After completing all steps, you should be able to:

- Access the frontend at http://localhost:3000
- Access the backend API at http://localhost:3001
- Login with the seeded accounts:
  - Author: `author@example.com` / `password123`
  - Admin: `admin@example.com` / `admin123`

## Next Steps

Once the database is set up, you can:

1. Create new posts (public or private)
2. Test the visibility toggle functionality
3. Use the search feature
4. Add comments to posts
5. Manage tags

Your notes blog application is now ready to use! 🚀
