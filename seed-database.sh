#!/bin/bash

# Database Seeder Script for Notes Blog
# This script seeds the database with initial data after the containers are running

echo "Starting database seeding process..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found. Please copy env.example to .env and configure it first."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if required environment variables are set
if [ -z "$SEED_ADMIN_EMAIL" ] || [ -z "$SEED_ADMIN_PASSWORD" ]; then
    echo "WARNING: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD not set in .env"
    echo "  Skipping user creation. You can create users manually through the application."
    echo "  To enable seeding, add these to your .env file:"
    echo "  SEED_ADMIN_EMAIL=admin@yourdomain.com"
    echo "  SEED_ADMIN_PASSWORD=secure_password_123"
    echo ""
    echo "Running Prisma migrations and basic seeding..."
else
    echo "Found admin credentials, will create admin user"
fi

# Wait for database to be ready
echo "Waiting for database to be ready..."
until docker exec notes-blog-postgres pg_isready -U postgres -d notes_blog; do
    echo "  Database not ready, waiting 2 seconds..."
    sleep 2
done
echo "Database is ready!"

# Run Prisma migrations
echo "Running Prisma migrations..."
docker exec notes-blog-backend npx prisma migrate deploy

# Run Prisma seeding
echo "Running Prisma seed..."
docker exec notes-blog-backend npx prisma db seed

echo "Database seeding completed!"
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:3000 to access the application"
echo "2. If you set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD, you can log in with those credentials"
echo "3. If not, you can create a new account through the registration process"
echo ""
echo "To run this script again: ./seed-database.sh"
