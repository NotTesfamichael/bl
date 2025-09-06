import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all tags that are not being used by any posts
    const unusedTags = await db.tag.findMany({
      where: {
        posts: {
          none: {}
        }
      }
    });

    console.log(`Found ${unusedTags.length} unused tags to clean up`);

    // Delete unused tags
    if (unusedTags.length > 0) {
      await db.tag.deleteMany({
        where: {
          id: {
            in: unusedTags.map((tag) => tag.id)
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      deletedCount: unusedTags.length,
      deletedTags: unusedTags.map((tag) => ({ id: tag.id, name: tag.name }))
    });
  } catch (error) {
    console.error("Error cleaning up unused tags:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
