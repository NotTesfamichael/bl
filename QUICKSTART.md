# 🚀 Quick Start Guide

Get your Notes & Code Blog running in under 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- Git

## One-Command Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd notes-blog

# 2. Copy environment variables
cp docker.env.example .env

# 3. Start everything
docker-compose -f docker-compose-dev.yml up --build
```

## Access Your App

- **Application**: http://localhost:3000
- **Database**: localhost:5432
- **Redis**: localhost:6379

## Default Login

- **Email**: author@example.com
- **Password**: password123

## What's Included

✅ **Next.js 14** with App Router  
✅ **PostgreSQL** database with Prisma  
✅ **Redis** for caching  
✅ **NextAuth** authentication  
✅ **TipTap** rich text editor  
✅ **Tailwind CSS** + shadcn/ui  
✅ **Hot reload** in development

## Common Commands

```bash
# View logs
docker-compose -f docker-compose-dev.yml logs -f

# Stop everything
docker-compose -f docker-compose-dev.yml down

# Restart with fresh build
docker-compose -f docker-compose-dev.yml up --build --force-recreate

# Access database
docker exec -it notes-blog-postgres-dev psql -U postgres -d notes_blog_dev

# Run Prisma commands
docker exec -it notes-blog-app-dev npx prisma studio
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart the database
docker-compose -f docker-compose-dev.yml restart postgres
```

### Build Issues

```bash
# Clean build
docker-compose -f docker-compose-dev.yml down -v
docker system prune -a
docker-compose -f docker-compose-dev.yml up --build
```

## Next Steps

1. **Customize**: Edit `.env` file with your settings
2. **Deploy**: Use `docker-compose.yml` for production
3. **Develop**: Start coding in the `src/` directory
4. **Database**: Use Prisma Studio to manage data

Happy coding! 🎉
