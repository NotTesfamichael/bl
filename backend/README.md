# Notes Blog - Backend API

A Node.js backend API built with Express.js, TypeScript, and Prisma.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 8+
- PostgreSQL database

### Installation

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your database and JWT settings
   ```

4. **Set up the database**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Backend API will be available at http://localhost:3001

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code
- `npm run test` - Run tests

## 🛠️ Technology Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🔧 Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/notes_blog"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## 🗄️ Database Management

```bash
npx prisma studio    # Open Prisma Studio
npx prisma migrate dev  # Run migrations
npx prisma generate     # Generate Prisma client
```

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# Development (includes PostgreSQL)
docker-compose -f docker-compose.dev.yml up --build

# Production (includes PostgreSQL)
docker-compose up --build
```

See [DOCKER.md](./DOCKER.md) for detailed Docker instructions.

## 🚀 Deployment

The backend can be deployed to:

- **Docker**: Any container platform
- **Railway**: Full-stack platform
- **Heroku**: PaaS platform
- **DigitalOcean**: VPS/App Platform
- **AWS/GCP/Azure**: Cloud platforms

## 📝 API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify token
- `GET /api/posts` - Get published posts
- `GET /api/posts/my-posts` - Get user's posts
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/unpublish` - Unpublish post
