#!/bin/bash

echo "🚀 Setting up Notes Blog Application for Production..."

# Default admin credentials
DEFAULT_ADMIN_EMAIL="admin@notesblog.local"
DEFAULT_ADMIN_PASSWORD="admin123"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on env.example"
    exit 1
fi

# Function to prompt for admin credentials
prompt_admin_credentials() {
    echo ""
    echo "🔐 Admin user setup:"
    echo "   Default email: ${DEFAULT_ADMIN_EMAIL}"
    echo "   Default password: ${DEFAULT_ADMIN_PASSWORD}"
    echo ""
    echo "⚠️  IMPORTANT: Change these credentials after first login!"
    echo ""
    
    read -p "Use default credentials? (y/n): " USE_DEFAULT
    if [[ $USE_DEFAULT =~ ^[Yy]$ ]]; then
        ADMIN_EMAIL="${DEFAULT_ADMIN_EMAIL}"
        ADMIN_PASSWORD="${DEFAULT_ADMIN_PASSWORD}"
        echo "✅ Using default credentials"
    else
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
    fi
    
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

    # Start only database and redis first
    echo "🔨 Starting database and cache services..."
    docker-compose up -d postgres redis

    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    until docker exec notes-blog-postgres pg_isready -U postgres -d notes_blog; do
        echo "   Database not ready, waiting 2 seconds..."
        sleep 2
    done
    echo "✅ Database is ready!"

    # Start backend service
    echo "🔨 Starting backend service..."
    docker-compose up -d backend

    # Wait for backend to be ready
    echo "⏳ Waiting for backend to be ready..."
    sleep 10

    # Push database schema
    echo "🗄️  Pushing database schema..."
    docker exec notes-blog-backend npx prisma db push

    # Start frontend service
    echo "🔨 Starting frontend service..."
    docker-compose up -d frontend

    # Seed the database with admin credentials
    echo "🌱 Seeding database with admin credentials..."
    docker exec -e SEED_ADMIN_EMAIL="${ADMIN_EMAIL}" \
                -e SEED_ADMIN_PASSWORD="${ADMIN_PASSWORD}" \
                notes-blog-backend npx prisma db seed

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
    echo "👥 Admin User Created:"
    echo "   👑 Email: ${ADMIN_EMAIL}"
    echo "   🔑 Password: ${ADMIN_PASSWORD}"
    echo ""
    echo "🔒 IMPORTANT Security Steps:"
    echo "   1. Log in to http://localhost:3000"
    echo "   2. Go to your profile/settings"
    echo "   3. Change the email and password immediately"
    echo "   4. Update any other security settings"
    echo ""
    echo "📝 Management Commands:"
    echo "   Stop: docker-compose down"
    echo "   View logs: docker-compose logs -f"
    echo "   Restart: docker-compose restart"
}

# Run main function
main
