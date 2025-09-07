import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/health";

export async function GET() {
  try {
    const health = await checkDatabaseHealth();

    if (health.status === "healthy") {
      return NextResponse.json(health, { status: 200 });
    } else {
      return NextResponse.json(health, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 503 }
    );
  }
}
