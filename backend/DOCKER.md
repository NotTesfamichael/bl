# Backend Docker Setup

## 🐳 Docker Commands

### Development

```bash
# Build and run in development mode
docker-compose -f docker-compose.dev.yml up --build

# Run in background
docker-compose -f docker-compose.dev.yml up -d --build

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Production

```bash
# Build and run in production mode
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down
```

### Manual Docker Commands

```bash
# Build image
docker build -t notes-blog-backend .

# Run container with database
docker run -p 3001:3001 -e DATABASE_URL="postgresql://user:pass@host:5432/db" notes-blog-backend
```

## 🔧 Environment Variables

Create a `.env` file:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/notes_blog"
POSTGRES_DB="notes_blog"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="password"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## 🗄️ Database Setup

The docker-compose includes PostgreSQL. For production:

1. **Run migrations**:

   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

2. **Generate Prisma client**:

   ```bash
   docker-compose exec backend npx prisma generate
   ```

3. **Open Prisma Studio**:
   ```bash
   docker-compose exec backend npx prisma studio
   ```

## 📊 Image Optimization

- **Multi-stage build**: Reduces final image size
- **Alpine Linux**: Minimal base image (~5MB)
- **Production dependencies only**: Smaller node_modules
- **Non-root user**: Security best practice
- **Health checks**: Container monitoring
- **Layer caching**: Faster rebuilds

## 🚀 Production Deployment

The production image is optimized for:

- Minimal size (~80MB)
- Fast startup time
- Security (non-root user)
- Health checks
- Automatic restarts
- Database integration
