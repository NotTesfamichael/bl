import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { NewPostForm } from "@/components/NewPostForm";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get the post to edit
  const post = await db.post.findFirst({
    where: {
      id: id,
      authorId: session.user.id // Ensure user can only edit their own posts
    },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });

  if (!post) {
    redirect("/writer");
  }

  // Get all available tags
  const allTags = await db.tag.findMany({
    orderBy: {
      name: "asc"
    }
  });

  return (
    <div className="min-h-screen bg-[#f5f0e1]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Edit Post</h1>
            <p className="text-black">Update your post content and settings</p>
          </div>

          <NewPostForm post={post} allTags={allTags} isEditing={true} />
        </div>
      </div>
    </div>
  );
}
