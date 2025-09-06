import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/markdown";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    const slug = generateSlug(name.trim());

    // Check if tag already exists
    const existingTag = await db.tag.findFirst({
      where: {
        OR: [{ name: name.trim() }, { slug: slug }]
      }
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "Tag already exists" },
        { status: 409 }
      );
    }

    // Create the tag
    const tag = await db.tag.create({
      data: {
        name: name.trim(),
        slug: slug
      }
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where = search
      ? {
          name: { contains: search, mode: "insensitive" as const }
        }
      : {};

    const tags = await db.tag.findMany({
      where,
      orderBy: {
        name: "asc"
      }
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("DELETE /api/tags called");

    const session = await auth();
    console.log("Session:", session?.user?.id);

    if (!session?.user) {
      console.log("No session, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("id");
    console.log("Tag ID to delete:", tagId);

    if (!tagId) {
      console.log("No tag ID provided");
      return NextResponse.json(
        { error: "Tag ID is required" },
        { status: 400 }
      );
    }

    // Check if tag is being used by any posts
    console.log("Checking if tag is being used...");
    const postsUsingTag = await db.postTag.findFirst({
      where: { tagId }
    });
    console.log("Posts using tag:", postsUsingTag);

    if (postsUsingTag) {
      console.log("Tag is being used, returning 409");
      return NextResponse.json(
        { error: "Cannot delete tag that is being used by posts" },
        { status: 409 }
      );
    }

    // Delete the tag
    console.log("Deleting tag from database...");
    await db.tag.delete({
      where: { id: tagId }
    });
    console.log("Tag deleted successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
