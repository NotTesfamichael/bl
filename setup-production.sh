#!/bin/bash

echo "🚀 Setting up Notes Blog Application for Production..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on env.example"
    exit 1
fi

# Function to prompt for credentials
prompt_credentials() {
    echo ""
    echo "🔐 Please provide credentials for the default users:"
    echo ""
    
    # Author credentials
    read -p "Author email (default: author@example.com): " AUTHOR_EMAIL
    AUTHOR_EMAIL=${AUTHOR_EMAIL:-author@example.com}
    
    read -s -p "Author password (default: password123): " AUTHOR_PASSWORD
    AUTHOR_PASSWORD=${AUTHOR_PASSWORD:-password123}
    echo ""
    
    # Admin credentials
    read -p "Admin email (default: admin@example.com): " ADMIN_EMAIL
    ADMIN_EMAIL=${ADMIN_EMAIL:-admin@example.com}
    
    read -s -p "Admin password (default: admin123): " ADMIN_PASSWORD
    ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
    echo ""
    
    echo "✅ Credentials collected"
}

# Function to create secure .env file
create_secure_env() {
    echo "🔒 Creating secure environment configuration..."
    
    # Create a temporary .env file with seed credentials
    cat > .env.seed << EOF
# Seed credentials (temporary - will be removed after seeding)
SEED_AUTHOR_EMAIL=${AUTHOR_EMAIL}
SEED_AUTHOR_PASSWORD=${AUTHOR_PASSWORD}
SEED_ADMIN_EMAIL=${ADMIN_EMAIL}
SEED_ADMIN_PASSWORD=${ADMIN_PASSWORD}
EOF
    
    echo "✅ Secure environment file created"
}

# Function to cleanup sensitive files
cleanup() {
    echo "🧹 Cleaning up sensitive files..."
    rm -f .env.seed
    echo "✅ Cleanup completed"
}

# Main setup process
main() {
    # Stop any existing containers
    echo "📦 Stopping existing containers..."
    docker-compose down

    # Remove old volumes to start fresh
    echo "🗑️  Removing old database volumes..."
    docker volume rm notes-blog_postgres_data 2>/dev/null || true

    # Prompt for credentials
    prompt_credentials

    # Create secure environment
    create_secure_env

    # Build and start services
    echo "🔨 Building and starting services..."
    docker-compose --env-file .env.seed up -d --build

    # Wait for services to be healthy
    echo "⏳ Waiting for services to be ready..."
    sleep 15

    # Run database migrations
    echo "🗄️  Running database migrations..."
    docker exec notes-blog-backend npx prisma migrate dev --name init

    # Seed the database with secure credentials
    echo "🌱 Seeding database with provided credentials..."
    docker exec -e SEED_AUTHOR_EMAIL="${AUTHOR_EMAIL}" \
                -e SEED_AUTHOR_PASSWORD="${AUTHOR_PASSWORD}" \
                -e SEED_ADMIN_EMAIL="${ADMIN_EMAIL}" \
                -e SEED_ADMIN_PASSWORD="${ADMIN_PASSWORD}" \
                notes-blog-backend npm run db:seed

    # Cleanup sensitive files
    cleanup

    echo ""
    echo "✅ Production setup completed successfully!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:3001/api"
    echo "   Health Check: http://localhost:3001/api/health"
    echo ""
    echo "👥 Users Created:"
    echo "   👤 Author: ${AUTHOR_EMAIL}"
    echo "   👑 Admin: ${ADMIN_EMAIL}"
    echo ""
    echo "🔒 Security Notes:"
    echo "   - Credentials are not stored in any files"
    echo "   - Use strong passwords in production"
    echo "   - Consider changing default credentials"
    echo ""
    echo "📝 To stop: docker-compose down"
    echo "📝 To view logs: docker-compose logs -f"
}

# Run main function
main
