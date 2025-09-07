# Redis Caching Implementation

This document describes the Redis caching implementation for the Kiyadur blog platform.

## Overview

Redis is now integrated into the backend to provide intelligent caching for improved performance and reduced database load. The implementation includes:

- **Automatic caching** for GET requests
- **Cache invalidation** for write operations
- **Health monitoring** for Redis connection
- **Configurable TTL** (Time To Live) for different endpoints

## Architecture

### Components

1. **Redis Client** (`src/config/redis.ts`)

   - Singleton Redis client with connection management
   - Automatic reconnection with exponential backoff
   - Health status monitoring
   - Graceful error handling

2. **Cache Middleware** (`src/utils/cache.ts`)

   - Express middleware for automatic caching
   - Configurable TTL and key generation
   - Cache invalidation utilities
   - Manual cache management functions

3. **Cache Integration**
   - Posts API with 5-minute cache for listings, 10-minute for individual posts
   - Tags API with 10-minute cache
   - Comments API with 5-minute cache
   - User-specific endpoints with 1-minute cache

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Redis Configuration
REDIS_URL="redis://localhost:6379"
```

### Docker Compose

Redis is already configured in `docker-compose.yml`:

```yaml
redis:
  image: redis:7-alpine
  container_name: notes-blog-redis
  restart: unless-stopped
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5
```

## Caching Strategy

### Cache Keys

The system uses structured cache keys:

- `posts:page:limit:search` - Post listings
- `post:slug` - Individual posts by slug
- `post:id` - Individual posts by ID
- `comments:postId` - Comments for a post
- `tags` - All tags
- `user:id` - User data
- `search:query:page` - Search results

### TTL Configuration

| Endpoint         | TTL        | Reason                                         |
| ---------------- | ---------- | ---------------------------------------------- |
| Post listings    | 5 minutes  | Frequently accessed, moderate update frequency |
| Individual posts | 10 minutes | Less frequently updated                        |
| Comments         | 5 minutes  | Moderate update frequency                      |
| Tags             | 10 minutes | Rarely updated                                 |
| User posts       | 1 minute   | User-specific, more dynamic                    |
| Search results   | 5 minutes  | Query-dependent                                |

### Cache Invalidation

Automatic cache invalidation occurs on:

- **Post creation/update/deletion** → Invalidates post caches and search results
- **Comment creation/deletion** → Invalidates post and comment caches
- **Tag creation/deletion** → Invalidates tag caches and post listings
- **Like/unlike** → Invalidates post caches to update reaction counts

## Usage

### Automatic Caching

Most GET endpoints are automatically cached using the middleware:

```typescript
// 5-minute cache
router.get("/", cache({ ttl: 300 }), async (req, res) => {
  // Your route logic
});

// 10-minute cache with custom key generator
router.get(
  "/slug/:slug",
  cache({
    ttl: 600,
    keyGenerator: (req) => `post:${req.params.slug}`
  }),
  async (req, res) => {
    // Your route logic
  }
);
```

### Manual Cache Management

```typescript
import { cacheUtils, cacheInvalidation } from "../utils/cache";

// Set cache manually
await cacheUtils.set("custom:key", data, 300);

// Get from cache
const data = await cacheUtils.get("custom:key");

// Delete specific key
await cacheUtils.del("custom:key");

// Delete by pattern
await cacheUtils.delPattern("posts:*");

// Invalidate post-related caches
await cacheInvalidation.invalidatePost("post-id");
```

### Health Monitoring

Redis health is included in the health check endpoints:

```bash
# Check overall health
curl http://localhost:3001/health

# Response includes Redis status
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Kiyadur-backend"
}
```

## Testing

### Test Redis Connection

```bash
# Install dependencies first
npm install

# Test Redis functionality
npm run test:redis
```

### Manual Testing

1. **Start Redis** (if using Docker):

   ```bash
   docker-compose up -d redis
   ```

2. **Start the backend**:

   ```bash
   npm run dev
   ```

3. **Test caching**:

   ```bash
   # First request (cache miss)
   curl http://localhost:3001/api/posts

   # Second request (cache hit)
   curl http://localhost:3001/api/posts
   ```

4. **Check cache logs** in the backend console for cache hit/miss information.

## Performance Benefits

### Expected Improvements

- **Response Time**: 50-80% reduction for cached endpoints
- **Database Load**: 60-90% reduction in database queries
- **Scalability**: Better handling of concurrent requests
- **User Experience**: Faster page loads and interactions

### Monitoring

Monitor cache performance through:

1. **Backend logs** - Cache hit/miss ratios
2. **Redis CLI** - Memory usage and key statistics
3. **Health endpoints** - Redis connection status

```bash
# Connect to Redis CLI
docker exec -it notes-blog-redis redis-cli

# Check memory usage
INFO memory

# List all keys
KEYS *

# Get key statistics
INFO keyspace
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**

   - Check if Redis is running: `docker-compose ps`
   - Verify Redis URL in environment variables
   - Check network connectivity

2. **Cache Not Working**

   - Verify Redis health in `/health` endpoint
   - Check backend logs for Redis errors
   - Ensure cache middleware is properly applied

3. **Memory Issues**
   - Monitor Redis memory usage
   - Adjust TTL values if needed
   - Consider Redis memory policies

### Debug Commands

```bash
# Check Redis status
docker-compose logs redis

# Monitor Redis in real-time
docker exec -it notes-blog-redis redis-cli monitor

# Clear all caches
docker exec -it notes-blog-redis redis-cli FLUSHALL
```

## Future Enhancements

### Potential Improvements

1. **Cache Warming** - Pre-populate frequently accessed data
2. **Distributed Caching** - Redis Cluster for high availability
3. **Cache Analytics** - Detailed performance metrics
4. **Smart Invalidation** - More granular cache invalidation
5. **Cache Compression** - Reduce memory usage for large objects

### Configuration Options

Consider adding these environment variables:

```env
# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_MAX_RETRIES=10
REDIS_RETRY_DELAY=100
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000
```

## Security Considerations

1. **Redis Security** - Configure Redis authentication in production
2. **Cache Keys** - Avoid exposing sensitive data in cache keys
3. **TTL Management** - Set appropriate expiration times
4. **Memory Limits** - Configure Redis memory limits to prevent OOM

## Production Deployment

### Redis Configuration for Production

```yaml
redis:
  image: redis:7-alpine
  restart: unless-stopped
  command: redis-server --appendonly yes --requirepass your-redis-password
  environment:
    - REDIS_PASSWORD=your-redis-password
  volumes:
    - redis_data:/data
  deploy:
    resources:
      limits:
        memory: 512M
```

### Environment Variables

```env
REDIS_URL="redis://:your-redis-password@redis:6379"
```

This implementation provides a robust, scalable caching solution that significantly improves the performance of your blog platform while maintaining data consistency through intelligent cache invalidation.
