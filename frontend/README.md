# Notes Blog - Frontend

A modern blog frontend built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 8+

### Installation

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

Frontend will be available at http://localhost:3000

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code
- `npm run test` - Run tests

## 🛠️ Technology Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Prisma Client** - Database ORM

## 🔧 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose up --build
```

See [DOCKER.md](./DOCKER.md) for detailed Docker instructions.

## 🚀 Deployment

The frontend can be deployed to:

- **Docker**: Any container platform
- **Vercel**: Recommended for Next.js
- **Netlify**: Static hosting
- **Railway**: Full-stack platform

## 📝 Features

- ✅ User authentication
- ✅ Create, edit, and delete blog posts
- ✅ Draft and published post states
- ✅ Tag system
- ✅ Comment system
- ✅ Search functionality
- ✅ Responsive design
- ✅ Markdown support
