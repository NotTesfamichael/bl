#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Push database schema
echo "Pushing database schema..."
prisma db push --accept-data-loss --skip-generate

# Seed the database
echo "Seeding database..."
tsx prisma/seed.ts

# Start the application
echo "Starting application..."
exec node server.js
