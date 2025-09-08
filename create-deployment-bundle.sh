#!/bin/bash

echo "Creating deployment bundle for Notes Blog..."

# Create deployment directory
DEPLOY_DIR="notes-blog-deployment"
echo "Creating deployment directory: $DEPLOY_DIR"

# Remove existing deployment directory if it exists
if [ -d "$DEPLOY_DIR" ]; then
    echo "Removing existing deployment directory..."
    rm -rf "$DEPLOY_DIR"
fi

# Create new deployment directory
mkdir -p "$DEPLOY_DIR"

# Copy essential files
echo "Copying essential files..."

# Core configuration files
cp docker-compose.yml "$DEPLOY_DIR/"
cp env.example "$DEPLOY_DIR/"
cp init.sql "$DEPLOY_DIR/"
cp setup-production.sh "$DEPLOY_DIR/"
cp seed-database.sh "$DEPLOY_DIR/"

# Make scripts executable
chmod +x "$DEPLOY_DIR/setup-production.sh"
chmod +x "$DEPLOY_DIR/seed-database.sh"

# Create a README for the deployment
cat > "$DEPLOY_DIR/README.md" << 'EOF'
# Notes Blog - Deployment Bundle

This bundle contains everything needed to deploy the Notes Blog application.

## Files Included

- `docker-compose.yml` - Complete service configuration
- `env.example` - Environment variables template
- `init.sql` - Database initialization script
- `setup-production.sh` - Production setup script
- `seed-database.sh` - Database seeding script
- `README.md` - This file

## Quick Start

1. **Create environment file:**
   ```bash
   cp env.example .env
   # Edit .env with your specific values
   ```

2. **Run production setup:**
   ```bash
   chmod +x setup-production.sh
   ./setup-production.sh
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## Default Admin Credentials

- Email: `admin@notesblog.local`
- Password: `admin123`

**WARNING: IMPORTANT: Change these credentials after first login!**

## Management Commands

- Stop: `docker-compose down`
- View logs: `docker-compose logs -f`
- Restart: `docker-compose restart`

## Manual Database Seeding

If you need to seed the database manually:

```bash
./seed-database.sh
```

## Requirements

- Docker and Docker Compose installed
- Ports 3000 and 3001 available
- At least 2GB RAM available for containers
EOF

echo "Deployment bundle created successfully!"
echo ""
echo "Location: $DEPLOY_DIR/"
echo ""
echo "Files included:"
ls -la "$DEPLOY_DIR/"
echo ""
echo "To deploy:"
echo "   1. Copy the '$DEPLOY_DIR' folder to your target server"
echo "   2. cd $DEPLOY_DIR"
echo "   3. cp env.example .env"
echo "   4. ./setup-production.sh"
echo ""
echo "📖 See README.md in the deployment folder for detailed instructions"
