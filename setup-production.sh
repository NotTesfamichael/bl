#!/bin/bash

echo "🚀 Setting up Notes Blog Application for Production..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on env.example"
    exit 1
fi

# Function to prompt for admin credentials
prompt_admin_credentials() {
    echo ""
    echo "🔐 Please provide credentials for the admin user:"
    echo ""
    
    # Admin credentials
    read -p "Admin email: " ADMIN_EMAIL
    while [ -z "$ADMIN_EMAIL" ]; do
        echo "❌ Admin email is required"
        read -p "Admin email: " ADMIN_EMAIL
    done
    
    read -s -p "Admin password: " ADMIN_PASSWORD
    while [ -z "$ADMIN_PASSWORD" ]; do
        echo ""
        echo "❌ Admin password is required"
        read -s -p "Admin password: " ADMIN_PASSWORD
    done
    echo ""
    
    echo "✅ Admin credentials collected"
}

# Function to create secure .env file
create_secure_env() {
    echo "🔒 Creating secure environment configuration..."
    
    # Create a temporary .env file with seed credentials
    cat > .env.seed << EOF
# Seed credentials (temporary - will be removed after seeding)
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

    # Prompt for admin credentials
    prompt_admin_credentials

    # Create secure environment
    create_secure_env

    # Build and start services
    echo "🔨 Building and starting services..."
    docker-compose --env-file .env --env-file .env.seed up -d --build

    # Wait for services to be healthy
    echo "⏳ Waiting for services to be ready..."
    sleep 15

    # Push database schema
    echo "🗄️  Pushing database schema..."
    docker exec notes-blog-backend npx prisma db push

    # Seed the database with secure credentials
    echo "🌱 Seeding database with provided credentials..."
    docker exec -e SEED_ADMIN_EMAIL="${ADMIN_EMAIL}" \
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
