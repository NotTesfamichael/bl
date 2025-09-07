# Kiyadur Backend API

A RESTful API backend for the Kiyadur blog platform built with Express.js, TypeScript, and Prisma.

## Features

- **Authentication**: JWT-based authentication with login/register
- **Posts**: CRUD operations for blog posts with markdown support
- **Comments**: Comment system for posts
- **Tags**: Tag management for posts
- **Likes**: Like/unlike functionality for posts
- **Views**: Post view tracking
- **Security**: Input validation, sanitization, rate limiting, CORS
- **Database**: PostgreSQL with Prisma ORM

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify JWT token

### Posts

- `GET /api/posts` - Get all posts (with pagination, search, filtering)
- `GET /api/posts/slug/:slug` - Get post by slug
- `POST /api/posts` - Create new post (authenticated)
- `PUT /api/posts/:id` - Update post (authenticated, author only)
- `DELETE /api/posts/:id` - Delete post (authenticated, author only)
- `POST /api/posts/:id/like` - Like/unlike post (authenticated)

### Comments

- `GET /api/comments/posts/:postId` - Get comments for a post
- `POST /api/comments/posts/:postId` - Create comment (authenticated)
- `DELETE /api/comments/:commentId` - Delete comment (authenticated, author only)

### Tags

- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create tag (authenticated, admin only)
- `DELETE /api/tags/:id` - Delete tag (authenticated, admin only)
- `POST /api/tags/cleanup` - Cleanup unused tags (authenticated, admin only)

### Health

- `GET /api/health` - Health check endpoint

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Environment variables**:
   Copy `env.example` to `.env` and configure:

   ```bash
   cp env.example .env
   ```

3. **Database setup**:

   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/kiyadur_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server
PORT=3001
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## CORS

The API is configured to accept requests from the frontend URL specified in `FRONTEND_URL` environment variable.

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Applied to all routes

## Security Features

- Helmet.js for security headers
- Input validation and sanitization
- SQL injection protection via Prisma
- XSS protection via DOMPurify
- CORS configuration
- Rate limiting
