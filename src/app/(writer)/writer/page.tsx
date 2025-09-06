import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, Calendar, Clock, Heart } from "lucide-react";
import Link from "next/link";
// // import { QuickActions } from "@/components/QuickActions";
import { PostAnalytics } from "@/components/PostAnalytics";
import { DeletePostButton } from "@/components/DeletePostButton";

async function deletePost(postId: string) {
  "use server";

  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify the post belongs to the user
    const post = await db.post.findFirst({
      where: {
        id: postId,
        authorId: session.user.id
      }
    });

    if (!post) {
      console.error("Post not found:", postId);
      return { error: "Post not found" };
    }

    // Delete the post (this will cascade delete related records)
    await db.post.delete({
      where: { id: postId }
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { error: "Failed to delete post" };
  }
}

export default async function WriterPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const posts = await db.post.findMany({
    where: {
      authorId: session.user.id
    },
    include: {
      tags: {
        include: {
          tag: true
        }
      },
      views: true,
      reactions: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  const publishedPosts = posts.filter((post) => post.status === "PUBLISHED");
  const draftPosts = posts.filter((post) => post.status === "DRAFT");

  // Calculate statistics
  const totalViews = publishedPosts.reduce(
    (sum, post) => sum + (post.views[0]?.count || 0),
    0
  );
  const totalLikes = publishedPosts.reduce(
    (sum, post) => sum + post.reactions.filter((r) => r.type === "LIKE").length,
    0
  );

  return (
    <div className="min-h-screen bg-[#F5F0E1]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Writer Dashboard</h1>
            <p className="text-black">Manage your posts and drafts</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link href="/writer/new">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Views
                  </p>
                  <p className="text-2xl font-bold">
                    {totalViews.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Likes
                  </p>
                  <p className="text-2xl font-bold">{totalLikes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold">{publishedPosts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold">{draftPosts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Temporarily disabled to fix SSR issue */}
        {/* <QuickActions
        posts={posts}
        onSearch={() => {}}
        onFilter={() => {}}
        onSort={() => {}}
      /> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Published Posts */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-black">
              Published Posts ({publishedPosts.length})
            </h2>
            <div className="space-y-4">
              {publishedPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          <Link
                            href={`/p/${post.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {post.title}
                          </Link>
                        </CardTitle>
                        <PostAnalytics post={post} />
                      </div>
                      <Badge variant="default">Published</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/writer/${post.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/p/${post.slug}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <DeletePostButton
                        postId={post.id}
                        postTitle={post.title}
                        onDelete={deletePost}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {publishedPosts.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No published posts yet.</p>
                    <Button className="mt-4" asChild>
                      <Link href="/writer/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create your first post
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Draft Posts */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-black">
              Drafts ({draftPosts.length})
            </h2>
            <div className="space-y-4">
              {draftPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          <Link
                            href={`/writer/${post.id}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {post.title || "Untitled Draft"}
                          </Link>
                        </CardTitle>
                        <PostAnalytics post={post} />
                      </div>
                      <Badge variant="secondary">Draft</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/writer/${post.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Continue Editing
                        </Link>
                      </Button>
                      <DeletePostButton
                        postId={post.id}
                        postTitle={post.title || "Untitled Draft"}
                        onDelete={deletePost}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {draftPosts.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No drafts yet.</p>
                    <Button className="mt-4" asChild>
                      <Link href="/writer/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Start a new draft
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
