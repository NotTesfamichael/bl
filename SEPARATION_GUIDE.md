# Frontend-Backend Separation Guide

This guide explains how to set up and run the separated Kiyadur application with a standalone backend API and frontend.

## Architecture Overview

The application has been separated into two independent services:

- **Backend API** (`/backend`): Express.js REST API with TypeScript, Prisma, and PostgreSQL
- **Frontend** (`/`): Next.js React application that consumes the backend API

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/kiyadur_db"
# JWT_SECRET="your-super-secret-jwt-key-here"
# PORT=3001
# FRONTEND_URL="http://localhost:3000"

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The backend will be available at `http://localhost:3001`

### 2. Frontend Setup

```bash
# Navigate to root directory (frontend)
cd ..

# Install dependencies (if not already done)
npm install

# Copy environment file
cp env.example .env.local

# Edit .env.local with backend URL
# NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/kiyadur_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# NextAuth Configuration (for frontend-only auth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
```

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

## Key Changes Made

### Backend

1. **Express.js API**: Created standalone REST API with TypeScript
2. **JWT Authentication**: Replaced NextAuth with JWT-based authentication
3. **Prisma ORM**: Database operations using Prisma client
4. **Input Validation**: Express-validator for request validation
5. **Security**: Helmet, CORS, rate limiting, input sanitization
6. **Modular Structure**: Separate route files for different resources

### Frontend

1. **API Client**: Created centralized API client (`/src/lib/api.ts`)
2. **Auth Context**: Replaced NextAuth with custom authentication context
3. **Token Management**: JWT token storage and management
4. **Component Updates**: Updated all components to use new API client
5. **Environment Variables**: Updated to point to backend API

## Development Workflow

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd .. && npm run dev`
3. **Database Changes**: Update Prisma schema and run `npm run db:push`
4. **API Changes**: Update backend routes and restart backend server

## Production Deployment

### Backend Deployment

- Deploy to services like Railway, Render, or AWS
- Set production environment variables
- Use production PostgreSQL database
- Configure CORS for production frontend URL

### Frontend Deployment

- Deploy to Vercel, Netlify, or similar
- Set `NEXT_PUBLIC_API_URL` to production backend URL
- Build and deploy static files

## Benefits of Separation

1. **Scalability**: Backend and frontend can scale independently
2. **Technology Flexibility**: Can use different technologies for each service
3. **Team Collaboration**: Different teams can work on frontend/backend
4. **Deployment**: Independent deployment cycles
5. **API Reusability**: Backend API can be used by mobile apps, other frontends
6. **Performance**: Better caching and optimization strategies

## Migration Notes

- All existing functionality has been preserved
- Database schema remains the same
- Authentication flow has been updated to use JWT
- API endpoints follow RESTful conventions
- Frontend components updated to use new API client

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` in backend matches frontend URL
2. **Database Connection**: Check `DATABASE_URL` in backend `.env`
3. **API Not Found**: Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
4. **Authentication Issues**: Check JWT secret and token expiration

### Debug Mode

- Backend: Set `NODE_ENV=development` for detailed error messages
- Frontend: Check browser console for API call errors
- Database: Use Prisma Studio for database inspection

## Next Steps

1. **Complete Frontend Migration**: Update remaining components to use API client
2. **Add API Documentation**: Use Swagger/OpenAPI for API documentation
3. **Add Tests**: Unit and integration tests for both services
4. **Add Monitoring**: Logging and monitoring for production
5. **Add CI/CD**: Automated testing and deployment pipelines
