# 🐳 Docker Setup Guide

## 📋 Overview

Both frontend and backend projects now have optimized Docker configurations with minimal image sizes and production-ready setups.

## 🏗️ Project Structure

```
notes-blog/
├── frontend/
│   ├── Dockerfile              # Multi-stage optimized build
│   ├── docker-compose.yml      # Production setup
│   ├── docker-compose.dev.yml  # Development setup
│   ├── .dockerignore           # Optimized ignore rules
│   └── DOCKER.md               # Frontend Docker docs
├── backend/
│   ├── Dockerfile              # Multi-stage optimized build
│   ├── docker-compose.yml      # Production setup (includes PostgreSQL)
│   ├── docker-compose.dev.yml  # Development setup
│   ├── .dockerignore           # Optimized ignore rules
│   └── DOCKER.md               # Backend Docker docs
└── README.md                   # Main documentation
```

## 🚀 Quick Start

### 1. Backend (with PostgreSQL)

```bash
cd backend
cp env.example .env
# Edit .env with your settings
docker-compose -f docker-compose.dev.yml up --build
```

**Result**: http://localhost:3001

### 2. Frontend

```bash
cd frontend
# Create .env.local with NEXT_PUBLIC_API_URL="http://localhost:3001/api"
docker-compose -f docker-compose.dev.yml up --build
```

**Result**: http://localhost:3000

## 📊 Image Optimization Features

### Frontend Dockerfile

- **Multi-stage build**: Separate build and runtime stages
- **Alpine Linux**: Minimal base image (~5MB)
- **Standalone output**: Next.js optimized build
- **Non-root user**: Security best practice
- **Layer caching**: Faster rebuilds
- **Final size**: ~50MB

### Backend Dockerfile

- **Multi-stage build**: Separate build and runtime stages
- **Alpine Linux**: Minimal base image (~5MB)
- **Production dependencies only**: Smaller node_modules
- **Non-root user**: Security best practice
- **Health checks**: Container monitoring
- **Final size**: ~80MB

## 🔧 Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/notes_blog"
POSTGRES_DB="notes_blog"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="password"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

## 🛠️ Development vs Production

### Development

- **Hot reload**: Code changes reflect immediately
- **Volume mounts**: Source code mounted for live editing
- **Debug mode**: Full logging and error details
- **Database**: PostgreSQL included in backend compose

### Production

- **Optimized builds**: Minimal image sizes
- **Health checks**: Container monitoring
- **Auto-restart**: Container restart policies
- **Security**: Non-root users, minimal attack surface

## 📝 Commands Reference

### Development

```bash
# Backend
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.dev.yml down

# Frontend
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.dev.yml down
```

### Production

```bash
# Backend
docker-compose up --build
docker-compose down

# Frontend
docker-compose up --build
docker-compose down
```

### Manual Docker

```bash
# Build images
docker build -t notes-blog-frontend ./frontend
docker build -t notes-blog-backend ./backend

# Run containers
docker run -p 3000:3000 notes-blog-frontend
docker run -p 3001:3001 notes-blog-backend
```

## 🗑️ Cleanup

### Remove unnecessary files (completed):

- ✅ Old Docker files
- ✅ Monorepo configuration
- ✅ Build artifacts
- ✅ Development scripts
- ✅ Duplicate documentation

### Optimized .dockerignore files:

- ✅ Exclude node_modules
- ✅ Exclude build artifacts
- ✅ Exclude development files
- ✅ Exclude documentation
- ✅ Exclude IDE files

## 🎯 Benefits

1. **Minimal Images**: Frontend ~50MB, Backend ~80MB
2. **Fast Builds**: Multi-stage builds with layer caching
3. **Security**: Non-root users, minimal attack surface
4. **Production Ready**: Health checks, restart policies
5. **Development Friendly**: Hot reload, volume mounts
6. **Independent**: Each project can be deployed separately
7. **Scalable**: Easy to add more services or scale

## 📖 Documentation

- [Frontend Docker Guide](./frontend/DOCKER.md)
- [Backend Docker Guide](./backend/DOCKER.md)
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
