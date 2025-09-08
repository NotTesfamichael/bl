# Notes & Code Blog

A full-stack blog application with private and public post functionality, built with Next.js, Express.js, and PostgreSQL.

## Features

- **Create and manage posts** with markdown support
- **Private and Public posts** with visibility controls
- **Search functionality** across all posts
- **Tag system** for organizing content
- **Comments system** for engagement
- **User authentication** with Google OAuth
- **Responsive design** for all devices

## Prerequisites

- Docker and Docker Compose
- Git

## Quick Start

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd notes-blog
   ```

2. **Run development setup**

   ```bash
   chmod +x setup-dev.sh
   ./setup-dev.sh
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Health Check: http://localhost:3001/api/health

### Production Setup

1. **Configure environment**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your production values:

   - Change `JWT_SECRET` to a secure random string
   - Update `FRONTEND_URL` and `BACKEND_URL` to your domain
   - Configure OAuth credentials (Google, GitHub)
   - Update database credentials if needed

2. **Run production setup**

   ```bash
   chmod +x setup-production.sh
   ./setup-production.sh
   ```

## Default Accounts

The application comes with pre-created accounts:

- **Author**: `author@example.com` / `password123`
- **Admin**: `admin@example.com` / `admin123`

## Usage

### Creating Posts

1. Click "Write" or go to `/writer`
2. Choose between **Public** or **Private** visibility
3. Write your content in markdown
4. Add tags and publish

### Viewing Posts

- **All Posts**: Shows only public posts
- **Public Posts**: Shows only public posts
- **Private Posts**: Shows only your private posts

### Post URLs

- Public posts: `http://localhost:3000/p/[slug]`
- Private posts: `http://localhost:3000/p/private/[slug]`

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

# View database
docker-compose exec backend npx prisma studio
```

## Development

### Running Individual Services

```bash
# Backend only
cd backend
npm install
npm run dev

# Frontend only
cd frontend
npm install
npm run dev
```

### Additional Scripts

- **`seed-database.sh`** - Seed database with initial data
- **`create-user.sh`** - Create new users
- **`create-deployment-bundle.sh`** - Create production deployment bundle

## Project Structure

```
notes-blog/
├── backend/           # Express.js API server
├── frontend/          # Next.js frontend application
├── docker-compose.yml # Docker configuration
├── setup-dev.sh       # Development setup script
├── setup-production.sh # Production setup script
└── README.md
```

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT + Google OAuth
- **Deployment**: Docker

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

### Common Issues

1. **Port conflicts**: Make sure ports 3000 and 3001 are available
2. **Database errors**: Run `docker-compose down -v` to reset everything
3. **Build failures**: Check Docker logs with `docker-compose logs`

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

### Reset Everything

```bash
docker-compose down -v
docker-compose up --build -d
```

## License

MIT License - feel free to use this project for your own blog!
