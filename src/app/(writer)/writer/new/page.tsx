import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewPostForm } from "@/components/NewPostForm";
import { db } from "@/lib/db";

export default async function NewPostPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
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
            <h1 className="text-3xl font-bold text-black">Create New Post</h1>
            <p className="text-black">Start writing your next great post</p>
          </div>

          <NewPostForm allTags={allTags} />
        </div>
      </div>
    </div>
  );
}
