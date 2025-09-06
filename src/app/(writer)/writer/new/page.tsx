import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewPostForm } from "@/components/NewPostForm";

export default async function NewPostPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Post</h1>
          <p className="text-gray-600">Start writing your next great post</p>
        </div>

        <NewPostForm />
      </div>
    </div>
  );
}
