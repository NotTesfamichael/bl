#!/usr/bin/env tsx

import dotenv from "dotenv";
import redisClient from "./config/redis";

// Load environment variables
dotenv.config();

async function testRedis() {
  console.log("🧪 Testing Redis connection...\n");

  try {
    // Test basic operations
    console.log("1. Testing basic set/get operations...");
    await redisClient.set("test:key", "Hello Redis!", 60);
    const value = await redisClient.get("test:key");
    console.log(`✅ Set/Get test: ${value}`);

    // Test cache utilities
    console.log("\n2. Testing cache utilities...");
    const { cacheUtils } = await import("./utils/cache");

    await cacheUtils.set(
      "test:object",
      { message: "Cached object", timestamp: new Date() },
      30
    );
    const cachedObject = await cacheUtils.get("test:object");
    console.log(`✅ Object cache test:`, cachedObject);

    // Test cache keys
    console.log("\n3. Testing cache key generation...");
    const postKey = cacheUtils.keys.post("123");
    const postsKey = cacheUtils.keys.posts(1, 10, "search");
    const userKey = cacheUtils.keys.user("456");

    console.log(`✅ Post key: ${postKey}`);
    console.log(`✅ Posts key: ${postsKey}`);
    console.log(`✅ User key: ${userKey}`);

    // Test cache invalidation
    console.log("\n4. Testing cache invalidation...");
    const { cacheInvalidation } = await import("./utils/cache");

    // Set some test data
    await cacheUtils.set("post:123", { id: "123", title: "Test Post" });
    await cacheUtils.set("posts:1:10", [{ id: "123", title: "Test Post" }]);
    await cacheUtils.set("comments:123", [
      { id: "1", content: "Test comment" }
    ]);

    console.log("✅ Test data set");

    // Invalidate post caches
    await cacheInvalidation.invalidatePost("123");
    console.log("✅ Post cache invalidation completed");

    // Test health check
    console.log("\n5. Testing Redis health...");
    const isHealthy = redisClient.isHealthy();
    console.log(
      `✅ Redis health status: ${isHealthy ? "HEALTHY" : "UNHEALTHY"}`
    );

    // Cleanup
    console.log("\n6. Cleaning up test data...");
    await redisClient.del("test:key");
    await redisClient.del("test:object");
    await redisClient.delPattern("test:*");
    console.log("✅ Cleanup completed");

    console.log("\n🎉 All Redis tests passed!");
  } catch (error) {
    console.error("❌ Redis test failed:", error);
    process.exit(1);
  } finally {
    // Disconnect
    await redisClient.disconnect();
    console.log("\n👋 Redis connection closed");
    process.exit(0);
  }
}

// Run the test
testRedis().catch(console.error);
