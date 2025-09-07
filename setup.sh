#!/bin/bash

echo "🚀 Setting up Notes Blog Application..."

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Remove old volumes to start fresh
echo "🗑️  Removing old database volumes..."
docker volume rm notes-blog_postgres_data 2>/dev/null || true

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 15

# Run database migrations
echo "🗄️  Running database migrations..."
docker exec notes-blog-backend npx prisma migrate dev --name init

# Seed the database
echo "🌱 Seeding database with default users..."
docker exec notes-blog-backend npm run db:seed

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001/api"
echo "   Health Check: http://localhost:3001/api/health"
echo ""
echo "👥 Default Users:"
echo "   👤 Author: author@example.com / password123"
echo "   👑 Admin: admin@example.com / admin123"
echo ""
echo "📝 To stop the application: docker-compose down"
echo "📝 To view logs: docker-compose logs -f"
echo "📝 To restart: docker-compose restart"
