# 🐳 Simple Docker Setup - Separate Directories

## 🏗️ **Architecture**

```
notes-blog/
├── frontend/          # Frontend Docker setup
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
└── backend/           # Backend Docker setup
    ├── Dockerfile
    ├── docker-compose.yml
    └── docker-compose.dev.yml
```

## 🚀 **Quick Start**

### **1. Start Backend (Terminal 1)**

```bash
cd backend
cp env.example .env
# Edit .env with your database settings
docker-compose -f docker-compose.dev.yml up --build
```

**Result**: Backend running at http://localhost:3001

### **2. Start Frontend (Terminal 2)**

```bash
cd frontend
docker-compose -f docker-compose.dev.yml up --build
```

**Result**: Frontend running at http://localhost:3000

## 🔧 **Key Configuration**

### **Frontend Connection**

- **Development**: `NEXT_PUBLIC_API_URL=http://host.docker.internal:3001/api`
- **Production**: `NEXT_PUBLIC_API_URL=http://host.docker.internal:3001/api`

### **Backend Configuration**

- **Database**: Uses your existing database (no Docker PostgreSQL)
- **Port**: 3001 (exposed as localhost:3001)
- **Environment**: Set via `.env` file in backend directory

## 📝 **Environment Setup**

### **Backend (.env)**

```env
DATABASE_URL="your-database-connection-string"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### **Frontend**

No environment file needed - uses `host.docker.internal` to connect to backend.

## 🛠️ **Development vs Production**

### **Development Mode**

- **Hot reload**: Code changes reflect immediately
- **Volume mounts**: Source code mounted for live editing
- **Debug mode**: Full logging and error details

### **Production Mode**

- **Optimized builds**: Minimal image sizes
- **Health checks**: Container monitoring
- **Auto-restart**: Container restart policies

## 📊 **Service Communication**

```
Frontend (Docker) → host.docker.internal:3001 → Backend (Docker)
     ↓                        ↓                        ↓
  Next.js                 Host Network              Express.js
  (Port 3000)            (Bridge)                  (Port 3001)
```

## 🔍 **Troubleshooting**

### **Connection Issues**

If frontend can't connect to backend:

1. **Check backend is running**: `curl http://localhost:3001/api/health`
2. **Check Docker network**: Frontend uses `host.docker.internal:3001`
3. **Check ports**: Backend must be on port 3001

### **Build Issues**

If Docker build fails:

1. **Check TypeScript**: Ensure all dependencies are installed
2. **Check Dockerfile**: Verify multi-stage build process
3. **Check .dockerignore**: Ensure unnecessary files are excluded

## 📝 **Useful Commands**

### **View Logs**

```bash
# Backend logs
cd backend && docker-compose logs -f

# Frontend logs
cd frontend && docker-compose logs -f
```

### **Stop Services**

```bash
# Backend
cd backend && docker-compose down

# Frontend
cd frontend && docker-compose down
```

### **Rebuild Services**

```bash
# Backend
cd backend && docker-compose up --build

# Frontend
cd frontend && docker-compose up --build
```

## 🎯 **Benefits**

1. **Separate Projects**: Frontend and backend are completely independent
2. **Simple Setup**: No complex orchestration needed
3. **Easy Development**: Each service can be developed separately
4. **Flexible Deployment**: Deploy services independently
5. **Clear Separation**: No shared configuration between projects

## 🚀 **Next Steps**

1. **Set up backend**: Create `.env` file and start backend service
2. **Set up frontend**: Start frontend service (no config needed)
3. **Access applications**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

Your Docker setup is now simplified and ready for development! 🎉
