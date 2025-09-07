import { db } from "./db";

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  database: "connected" | "disconnected" | "error";
  timestamp: string;
  error?: string;
}

export async function checkDatabaseHealth(): Promise<HealthStatus> {
  try {
    // Simple query to test database connection
    await db.$queryRaw`SELECT 1`;

    return {
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Database health check failed:", error);

    return {
      status: "unhealthy",
      database: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown database error"
    };
  }
}

export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error("Database operation failed:", error);

    // Check if it's a connection error
    if (
      error instanceof Error &&
      (error.message.includes("connect") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("timeout") ||
        error.message.includes("ENOTFOUND"))
    ) {
      console.error("Database connection error detected");
      throw new Error("Database connection failed");
    }

    // For other errors, return fallback or null
    return fallback || null;
  }
}
