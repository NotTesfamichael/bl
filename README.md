# Notes Blog - Separate Frontend & Backend Projects

This repository contains two separate, independent projects:

- **Frontend**: Next.js blog application
- **Backend**: Node.js API server

## 🏗️ Project Structure

```
notes-blog/
├── frontend/          # Next.js frontend application (independent)
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   ├── package.json  # Frontend dependencies
│   ├── README.md     # Frontend documentation
│   └── ...
├── backend/          # Node.js backend API (independent)
│   ├── src/          # Source code
│   ├── prisma/       # Database schema
│   ├── package.json  # Backend dependencies
│   ├── README.md     # Backend documentation
│   └── ...
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 8+
- PostgreSQL database

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd notes-blog
   ```

2. **Set up the Backend**

   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your database and JWT settings
   npx prisma migrate dev
   npx prisma generate
   npm run dev
   ```

   Backend will be available at http://localhost:3001

3. **Set up the Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your API URL
   npm run dev
   ```
   Frontend will be available at http://localhost:3000

## 🐳 Docker Quick Start

### Backend (Terminal 1)

```bash
cd backend
cp env.example .env
# Edit .env with your database settings
docker-compose -f docker-compose.dev.yml up --build
```

**Result**: http://localhost:3001

### Frontend (Terminal 2)

```bash
cd frontend
docker-compose -f docker-compose.dev.yml up --build
```

**Result**: http://localhost:3000

### Production Mode

```bash
# Backend
cd backend && docker-compose up --build

# Frontend
cd frontend && docker-compose up --build
```

## 📜 Development

### Running the Projects

**Backend (Terminal 1):**

```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**

```bash
cd frontend
npm run dev
```

### Building for Production

**Backend:**

```bash
cd backend
npm run build
npm run start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run start
```

## 🛠️ Technology Stack

### Frontend

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Database

- **PostgreSQL** - Primary database
- **Prisma** - Database toolkit and ORM

## 🔧 Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/notes_blog"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

## 🚀 Deployment

### Frontend Deployment

The frontend can be deployed to:

- Vercel (recommended for Next.js)
- Netlify
- Any static hosting service

### Backend Deployment

The backend can be deployed to:

- Railway
- Heroku
- DigitalOcean
- Any Node.js hosting service

## 📝 Features

- ✅ User authentication and authorization
- ✅ Create, edit, and delete blog posts
- ✅ Draft and published post states
- ✅ Tag system for posts
- ✅ Comment system
- ✅ Search functionality
- ✅ Responsive design
- ✅ Markdown support

## 📖 Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
