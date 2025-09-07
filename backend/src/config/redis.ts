import { createClient, RedisClientType } from "redis";

class RedisClient {
  private client: RedisClientType | null = null;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error("Redis: Max reconnection attempts reached");
              return new Error("Max reconnection attempts reached");
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        console.log("Redis: Connected successfully");
        this.isConnected = true;
      });

      this.client.on("disconnect", () => {
        console.log("Redis: Disconnected");
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error("Redis: Failed to connect:", error);
      this.isConnected = false;
    }
  }

  public async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      console.warn("Redis: Client not connected, skipping get operation");
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      console.error("Redis: Error getting key:", error);
      return null;
    }
  }

  public async set(
    key: string,
    value: string,
    ttlSeconds?: number
  ): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      console.warn("Redis: Client not connected, skipping set operation");
      return false;
    }

    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error("Redis: Error setting key:", error);
      return false;
    }
  }

  public async del(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      console.warn("Redis: Client not connected, skipping delete operation");
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error("Redis: Error deleting key:", error);
      return false;
    }
  }

  public async delPattern(pattern: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      console.warn(
        "Redis: Client not connected, skipping pattern delete operation"
      );
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error("Redis: Error deleting pattern:", error);
      return false;
    }
  }

  public async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Redis: Error checking key existence:", error);
      return false;
    }
  }

  public async flushAll(): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      console.warn("Redis: Client not connected, skipping flush operation");
      return false;
    }

    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error("Redis: Error flushing all keys:", error);
      return false;
    }
  }

  public isHealthy(): boolean {
    return this.isConnected && this.client !== null;
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
    }
  }

  // Getter for the Redis client (for session store)
  public getClient() {
    return this.client;
  }
}

// Export singleton instance
export const redisClient = new RedisClient();
export default redisClient;
