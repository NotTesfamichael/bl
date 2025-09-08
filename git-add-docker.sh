#!/bin/bash

echo "🐳 Adding Docker files to git..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Add Docker files
echo "📁 Adding Docker files..."
git add docker-compose.yml
git add backend/Dockerfile
git add frontend/Dockerfile
git add .gitignore
git add create-user.sh

# Show status
echo "📊 Git status:"
git status

# Commit the changes
echo "💾 Committing changes..."
git commit -m "Add Docker files and user creation script

- Add docker-compose.yml for container orchestration
- Add backend/Dockerfile for backend container
- Add frontend/Dockerfile for frontend container
- Update .gitignore to allow Docker files
- Add create-user.sh script for user management"

echo "✅ Docker files added to git successfully!"
echo ""
echo "🚀 To push to remote:"
echo "   git push origin <branch-name>"
