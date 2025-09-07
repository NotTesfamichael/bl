"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, Calendar, Clock, Heart } from "lucide-react";
import Link from "next/link";
import { UserDropdown } from "@/components/UserDropdown";
import { DeletePostButton } from "@/components/DeletePostButton";
import { UnpublishPostButton } from "@/components/UnpublishPostButton";

// Define the type for posts with relations
type PostWithRelations = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  authorId: string;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  views: Array<{
    id: string;
    count: number;
  }>;
  reactions: Array<{
    id: string;
    type: string;
    userId: string;
  }>;
};

export default function WriterPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated, loading, router]);

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      // Fetch user's posts (including drafts)
      const response = await apiClient.getUserPosts({ limit: 100 });
      setPosts(response.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  if (loading || loadingPosts) {
    return (
      <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F] mx-auto mb-4"></div>
          <p className="text-[#556B2F] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const publishedPosts = posts.filter(
    (post: PostWithRelations) => post.status === "PUBLISHED"
  );
  const draftPosts = posts.filter(
    (post: PostWithRelations) => post.status === "DRAFT"
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const getViewCount = (post: PostWithRelations) => {
    return post.views[0]?.count || 0;
  };

  const getLikeCount = (post: PostWithRelations) => {
    return post.reactions.filter((r) => r.type === "LIKE").length;
  };

  return (
    <div className="min-h-screen bg-[#F5F0E1]">
      {/* Header */}
      <header className="bg-[#F5F0E1] border-b border-[#D4C4A8] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-black">
                <Link
                  href="/"
                  className="hover:text-[#556B2F] transition-colors"
                >
                  kiyadur
                </Link>
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/writer/new">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">New Post</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </Link>
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Manage your posts and track your blog&apos;s performance.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">
                  {posts.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Published
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {publishedPosts.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Drafts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {draftPosts.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Published Posts */}
          {publishedPosts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">
                Published Posts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedPosts.map((post) => (
                  <Card
                    key={`published-${post.id}`}
                    className="h-full flex flex-col"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {post.title}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          Published
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col space-y-4">
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tagWrapper, index) => (
                          <Badge
                            key={`${tagWrapper.tag.slug}-${index}`}
                            variant="outline"
                            className="text-xs"
                          >
                            {tagWrapper.tag.name}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{getViewCount(post)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{getLikeCount(post)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatRelativeTime(
                              post.publishedAt || post.updatedAt
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Spacer to push buttons to bottom */}
                      <div className="flex-1"></div>

                      {/* Buttons aligned at bottom */}
                      <div className="flex gap-2 mt-auto">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/p/${post.slug}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Link href={`/writer/${post.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        <UnpublishPostButton
                          postId={post.id}
                          postTitle={post.title}
                          onUnpublish={async (postId: string) => {
                            try {
                              await apiClient.unpublishPost(postId);
                              await fetchPosts();
                              return { success: true };
                            } catch {
                              return {
                                success: false,
                                error: "Failed to unpublish post"
                              };
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Draft Posts */}
          {draftPosts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">
                Draft Posts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftPosts.map((post) => (
                  <Card
                    key={`draft-${post.id}`}
                    className="h-full flex flex-col"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {post.title}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800"
                        >
                          Draft
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col space-y-4">
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tagWrapper, index) => (
                          <Badge
                            key={`${tagWrapper.tag.slug}-${index}`}
                            variant="outline"
                            className="text-xs"
                          >
                            {tagWrapper.tag.name}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          Updated {formatRelativeTime(post.updatedAt)}
                        </span>
                      </div>

                      {/* Spacer to push buttons to bottom */}
                      <div className="flex-1"></div>

                      {/* Buttons aligned at bottom */}
                      <div className="flex gap-2 mt-auto">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/writer/${post.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        <DeletePostButton
                          postId={post.id}
                          postTitle={post.title}
                          onDelete={async (postId: string) => {
                            try {
                              await apiClient.deletePost(postId);
                              await fetchPosts();
                              return { success: true };
                            } catch {
                              return {
                                success: false,
                                error: "Failed to delete post"
                              };
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {posts.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-black mb-4">
                No posts yet
              </h2>
              <p className="text-gray-600 mb-8">
                Start writing your first post to share your thoughts with the
                world!
              </p>
              <Button asChild>
                <Link href="/writer/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first post
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
