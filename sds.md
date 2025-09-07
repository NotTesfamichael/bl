# 1. Build and start containers

docker-compose up -d --build

# 2. Wait for containers to be healthy

docker-compose ps

# 3. Generate Prisma client

docker-compose exec backend npx prisma generate

# 4. Create and apply migration

docker-compose exec backend npx prisma migrate dev --name init

# 5. Seed the database

docker-compose exec backend npx prisma db seed
