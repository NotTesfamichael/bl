# Notes & Code Blog

A full-stack blog application with private and public post functionality, built with Next.js, Express.js, and PostgreSQL.

## Features

- ✍️ **Create and manage posts** with markdown support
- 🔒 **Private and Public posts** with visibility controls
- 🔍 **Search functionality** across all posts
- 🏷️ **Tag system** for organizing content
- 💬 **Comments system** for engagement
- 👤 **User authentication** with Google OAuth
- 📱 **Responsive design** for all devices

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd notes-blog
   ```

2. **Start the application**

   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

That's it! The application will automatically:

- Set up the PostgreSQL database
- Run database migrations
- Seed the database with sample data
- Start all services

## Default Accounts

The application comes with pre-created accounts:

- **Author**: `author@example.com` / `password123`
- **Admin**: `admin@example.com` / `admin123`

## Usage

### Creating Posts

1. Click "Write" or go to `/writer`
2. Choose between **Public** or **Private** visibility
3. Write your content in markdown
4. Add tags and publish

### Viewing Posts

- **All Posts**: Shows only public posts
- **Public Posts**: Shows only public posts
- **Private Posts**: Shows only your private posts

### Post URLs

- Public posts: `http://localhost:3000/p/[slug]`
- Private posts: `http://localhost:3000/p/private/[slug]`

## Development

### Running in Development Mode

```bash
# Backend only
cd backend
npm install
npm run dev

# Frontend only
cd frontend
npm install
npm run dev
```

### Database Management

```bash
# Reset database
docker-compose exec backend npx prisma migrate reset --force

# View database
docker-compose exec backend npx prisma studio
```

## Project Structure

```
notes-blog/
├── backend/           # Express.js API server
├── frontend/          # Next.js frontend application
├── docker-compose.yml # Docker configuration
└── README.md
```

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT + Google OAuth
- **Deployment**: Docker

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000 and 3001 are available
2. **Database errors**: Run `docker-compose down -v` to reset everything
3. **Build failures**: Check Docker logs with `docker-compose logs`

### Reset Everything

```bash
docker-compose down -v
docker-compose up --build -d
```

## License

MIT License - feel free to use this project for your own blog!
