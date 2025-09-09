import { Request, Response, NextFunction } from "express";
import redisClient from "../config/redis";

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
  skipCache?: (req: Request) => boolean;
}

// Default cache key generator
const defaultKeyGenerator = (req: Request): string => {
  const baseKey = `${req.method}:${req.originalUrl}`;
  const queryString = req.query ? JSON.stringify(req.query) : "";
  const authHeader = req.headers.authorization
    ? `:auth:${req.headers.authorization}`
    : "";
  return queryString
    ? `${baseKey}:${queryString}${authHeader}`
    : `${baseKey}${authHeader}`;
};

// Cache middleware factory
export const cache = (options: CacheOptions = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = defaultKeyGenerator,
    skipCache = () => false
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for certain conditions
    if (skipCache(req)) {
      return next();
    }

    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = keyGenerator(req);

    try {
      // Try to get from cache
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`Cache MISS: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function (data: any) {
        // Cache the response
        redisClient
          .set(cacheKey, JSON.stringify(data), ttl)
          .then((success) => {
            if (success) {
              console.log(`Cached: ${cacheKey} (TTL: ${ttl}s)`);
            }
          })
          .catch((error) => {
            console.error("Failed to cache response:", error);
          });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

// Utility functions for manual cache management
export const cacheUtils = {
  // Set cache manually
  async set(key: string, data: any, ttl?: number): Promise<boolean> {
    return await redisClient.set(key, JSON.stringify(data), ttl);
  },

  // Get cache manually
  async get(key: string): Promise<any> {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  },

  // Delete cache manually
  async del(key: string): Promise<boolean> {
    return await redisClient.del(key);
  },

  // Delete cache by pattern
  async delPattern(pattern: string): Promise<boolean> {
    return await redisClient.delPattern(pattern);
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    return await redisClient.exists(key);
  },

  // Generate cache keys for different resources
  keys: {
    post: (id: string) => `post:${id}`,
    posts: (page?: number, limit?: number, search?: string) => {
      const base = "posts";
      const params = [page, limit, search].filter(Boolean).join(":");
      return params ? `${base}:${params}` : base;
    },
    user: (id: string) => `user:${id}`,
    comments: (postId: string) => `comments:${postId}`,
    tags: () => "tags",
    tag: (slug: string) => `tag:${slug}`,
    search: (query: string, page?: number) => {
      const base = `search:${query}`;
      return page ? `${base}:${page}` : base;
    }
  }
};

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate post-related caches
  async invalidatePost(postId: string): Promise<void> {
    const patterns = [
      `*posts*`, // Match all posts-related cache keys
      `*comments*${postId}*`,
      `*search*`
    ];

    for (const pattern of patterns) {
      await redisClient.delPattern(pattern);
    }
    console.log(`Invalidated caches for post: ${postId}`);
  },

  // Invalidate all caches
  async invalidateAll(): Promise<void> {
    await redisClient.flushAll();
    console.log("All caches invalidated");
  },

  // Invalidate user-related caches
  async invalidateUser(userId: string): Promise<void> {
    const patterns = [
      `*user*${userId}*`,
      `*posts*` // User posts might be cached
    ];

    for (const pattern of patterns) {
      await redisClient.delPattern(pattern);
    }
    console.log(`Invalidated caches for user: ${userId}`);
  },

  // Invalidate tag-related caches
  async invalidateTags(): Promise<void> {
    const patterns = [
      "*GET:/api/tags*", // Match the actual cache key for tags endpoint
      "*posts*", // Posts might be filtered by tags
      "*search*" // Search might include tags
    ];

    for (const pattern of patterns) {
      await redisClient.delPattern(pattern);
    }
    console.log("Invalidated tag-related caches");
  }
};
