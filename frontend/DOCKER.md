# Frontend Docker Setup

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
docker build -t notes-blog-frontend .

# Run container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:3001/api notes-blog-frontend
```

## 🔧 Environment Variables

Create a `.env` file:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

## 📊 Image Optimization

- **Multi-stage build**: Reduces final image size
- **Alpine Linux**: Minimal base image (~5MB)
- **Standalone output**: Next.js optimized build
- **Non-root user**: Security best practice
- **Layer caching**: Faster rebuilds

## 🚀 Production Deployment

The production image is optimized for:

- Minimal size (~50MB)
- Fast startup time
- Security (non-root user)
- Health checks
- Automatic restarts
