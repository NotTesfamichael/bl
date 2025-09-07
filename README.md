# Notes & Code Blog

A Medium-like blog platform built with Next.js 14, featuring a rich text editor, code syntax highlighting, and a complete publishing workflow.

## Features

- **Rich Text Editor**: TipTap editor with markdown support, code blocks, and syntax highlighting
- **Authentication**: NextAuth with email/password and Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Publishing Workflow**: Draft → Preview → Publish with autosave
- **SEO**: Meta tags, RSS feed, and sitemap generation
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Code Highlighting**: Syntax highlighting for code blocks using Shiki
- **Docker Support**: Complete Docker setup for development and production

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Editor**: TipTap with Markdown support
- **Database**: PostgreSQL + Prisma
- **Authentication**: NextAuth.js
- **Code Highlighting**: Shiki via rehype-pretty-code
- **Containerization**: Docker + Docker Compose

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose
- Git

### 🚀 One-Command Setup

```bash
# Clone the repository
git clone <repository-url>
cd notes-blog

# Copy environment variables
cp docker.env.example .env

# Start the entire stack
docker-compose -f docker-compose-dev.yml up --build
```

That's it! The application will be available at [http://localhost:3000](http://localhost:3000)

### Default Credentials

- **Email**: author@example.com
- **Password**: password123

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd notes-blog
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/notes_blog?schema=public"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Credentials

The seed script creates a demo user:

- **Email**: author@example.com
- **Password**: password123

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public pages
│   │   ├── p/[slug]/      # Post detail pages
│   │   └── page.tsx       # Home page
│   ├── (writer)/          # Writer pages (protected)
│   │   └── writer/        # Writer dashboard and editor
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth configuration
│   │   ├── posts/         # Post CRUD operations
│   │   └── tags/          # Tag management
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── Editor.tsx         # TipTap editor component
│   ├── PostCard.tsx       # Post card component
│   └── ...
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   └── markdown.ts        # Markdown utilities
└── types/
    └── next-auth.d.ts     # NextAuth type definitions
```

## Docker Commands

### Development Environment

```bash
# Start development environment
docker-compose -f docker-compose-dev.yml up --build

# Start in background
docker-compose -f docker-compose-dev.yml up -d --build

# View logs
docker-compose -f docker-compose-dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose-dev.yml down

# Rebuild and restart
docker-compose -f docker-compose-dev.yml up --build --force-recreate
```

### Production Environment

```bash
# Start production environment
docker-compose up --build

# Start in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop production environment
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v
```

### Database Management

```bash
# Access PostgreSQL database
docker exec -it notes-blog-postgres-dev psql -U postgres -d notes_blog_dev

# Run Prisma migrations
docker exec -it notes-blog-app-dev npx prisma migrate deploy

# Generate Prisma client
docker exec -it notes-blog-app-dev npx prisma generate

# Seed the database
docker exec -it notes-blog-app-dev npm run db:seed

# Open Prisma Studio
docker exec -it notes-blog-app-dev npx prisma studio
```

### Container Management

```bash
# List running containers
docker ps

# View container logs
docker logs notes-blog-app-dev

# Execute commands in container
docker exec -it notes-blog-app-dev sh

# Remove all containers and volumes
docker-compose down -v --remove-orphans

# Clean up unused Docker resources
docker system prune -a
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Key Features

### Writer Dashboard

- View all drafts and published posts
- Quick actions: Edit, Preview, Publish, Delete
- Post statistics (views, likes, etc.)

### Rich Text Editor

- TipTap editor with full formatting toolbar
- Code blocks with syntax highlighting
- Image support (paste/drag-drop)
- Autosave every 3 seconds
- Live preview mode

### Publishing Workflow

1. Create new draft
2. Write content with rich editor
3. Add metadata (title, slug, excerpt, tags)
4. Preview before publishing
5. Publish to make post live
6. Edit published posts or unpublish

### Public Blog

- Responsive post grid
- Post detail pages with syntax highlighting
- Tag filtering
- Search functionality
- SEO optimized

## Docker Configuration

### Files Overview

- **`Dockerfile`**: Production-ready multi-stage build
- **`Dockerfile.dev`**: Development environment with hot reload
- **`docker-compose.yml`**: Production environment setup
- **`docker-compose-dev.yml`**: Development environment setup
- **`docker.env.example`**: Environment variables template

### Environment Variables

Copy `docker.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/notes_blog_dev"
POSTGRES_DB="notes_blog"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Redis (Optional)
REDIS_URL="redis://redis:6379"
```

### Ports

- **3000**: Next.js application
- **5432**: PostgreSQL database
- **6379**: Redis cache

### Volumes

- **postgres_data**: PostgreSQL data persistence
- **redis_data**: Redis data persistence
- **node_modules**: Node.js dependencies (development)
- **.next**: Next.js build cache (development)

## Database Schema

The app uses the following main entities:

- **User**: Authentication and author information
- **Post**: Blog posts with markdown content and HTML rendering
- **Tag**: Categorization system
- **PostTag**: Many-to-many relationship between posts and tags
- **Reaction**: User reactions (likes, bookmarks, etc.)
- **View**: Post view tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
