import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Please log in to like posts" },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    // Check if user already liked this post
    const existingReaction = await db.reaction.findFirst({
      where: {
        postId: id,
        userId: session.user.id,
        type: "LIKE"
      }
    });

    if (existingReaction) {
      // Unlike the post
      await db.reaction.delete({
        where: { id: existingReaction.id }
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like the post
      await db.reaction.create({
        data: {
          postId: id,
          userId: session.user.id,
          type: "LIKE"
        }
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { message: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
