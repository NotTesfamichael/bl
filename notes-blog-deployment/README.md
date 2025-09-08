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

**⚠️ IMPORTANT: Change these credentials after first login!**

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
