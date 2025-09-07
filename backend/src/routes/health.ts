import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Health check endpoint
router.get("/", async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    const health = {
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      service: "kiyadur-backend"
    };

    res.json(health);
  } catch (error) {
    console.error("Health check failed:", error);

    const health = {
      status: "unhealthy",
      database: "disconnected",
      timestamp: new Date().toISOString(),
      service: "kiyadur-backend",
      error: error instanceof Error ? error.message : "Unknown error"
    };

    res.status(503).json(health);
  }
});

export default router;
