import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { compileMarkdownToHtml, generateExcerpt } from "@/lib/markdown";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, slug, contentMarkdown, excerpt, status, tagIds } = body;

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

      // Add new tags
      if (tagIds.length > 0) {
        await db.postTag.createMany({
          data: tagIds.map((tagId: string) => ({
            postId: id,
            tagId: tagId
          }))
        });
      }
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}
