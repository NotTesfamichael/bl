import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { compileMarkdownToHtml, generateExcerpt } from "@/lib/markdown";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { title, slug, contentMarkdown, excerpt, status, tagIds } = body;

    console.log("Received tagIds:", tagIds);
    console.log("TagIds type:", typeof tagIds, Array.isArray(tagIds));

    // Validate required fields
    if (!title || !slug || !contentMarkdown) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, or content" },
        { status: 400 }
      );
    }

    // Verify the post exists and belongs to the user
    const existingPost = await db.post.findFirst({
      where: {
        id: id,
        authorId: session.user.id
      }
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Compile markdown to HTML
    const contentHtml = await compileMarkdownToHtml(contentMarkdown);
    const finalExcerpt = excerpt || generateExcerpt(contentHtml);

    // Update the post
    const updatedPost = await db.post.update({
      where: { id: id },
      data: {
        title,
        slug,
        contentMarkdown,
        contentHtml,
        excerpt: finalExcerpt,
        status,
        publishedAt:
          status === "PUBLISHED" ? new Date() : existingPost.publishedAt,
        updatedAt: new Date()
      }
    });

    // Update tags
    if (tagIds && Array.isArray(tagIds)) {
      // Remove existing tags
      await db.postTag.deleteMany({
        where: { postId: id }
      });

      // Add new tags - validate that all tag IDs exist first
      if (tagIds.length > 0) {
        // Verify all tag IDs exist in the database
        const existingTags = await db.tag.findMany({
          where: { id: { in: tagIds } },
          select: { id: true }
        });

        const existingTagIds = existingTags.map((tag) => tag.id);
        const invalidTagIds = tagIds.filter(
          (tagId) => !existingTagIds.includes(tagId)
        );

        if (invalidTagIds.length > 0) {
          console.error("Invalid tag IDs provided:", invalidTagIds);
          console.log("Available tags in database:", existingTagIds);

          // If no valid tags exist, just skip tag creation instead of failing
          if (existingTagIds.length === 0) {
            console.log("No valid tags found, skipping tag creation");
            // Don't return early, just skip the tag creation part
          } else {
            // Only create relationships for valid tags
            await db.postTag.createMany({
              data: existingTagIds.map((tagId: string) => ({
                postId: id,
                tagId: tagId
              }))
            });
          }

          // If we have some valid tags, return success with a warning
          if (existingTagIds.length > 0) {
            return NextResponse.json(updatedPost);
          }

          // If no valid tags exist, return success but log the issue
          console.log("Skipping tag creation due to invalid tag IDs");
          return NextResponse.json(updatedPost);
        } else {
          // All tag IDs are valid, create the relationships
          if (existingTagIds.length > 0) {
            await db.postTag.createMany({
              data: existingTagIds.map((tagId: string) => ({
                postId: id,
                tagId: tagId
              }))
            });
          }
        }
      }
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      postId: id
    });
    return NextResponse.json(
      {
        error: "Failed to update post",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
