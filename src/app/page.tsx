import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { Header } from "@/components/Header";
import { Plus } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

// Force dynamic rendering to ensure posts are always up-to-date
export const dynamic = "force-dynamic";

async function getPosts() {
  try {
    const response = await apiClient.getPosts({
      status: "PUBLISHED",
      limit: 10
    });
    return response;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], pagination: { total: 0, pages: 0 } };
  }
}

export default async function HomePage() {
  const { posts, pagination } = await getPosts();

  return (
    <div className="min-h-screen bg-[#F5F0E1]">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* eslint-disable @typescript-eslint/no-explicit-any */}
          {posts.map((post: any) => (
            <PostCard key={(post as any).id} post={post as any} />
          ))}
          {/* eslint-enable @typescript-eslint/no-explicit-any */}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-black mb-4">
              No posts yet
            </h2>
            <p className="text-black mb-8">
              Be the first to share your thoughts!
            </p>
            <Link href="/writer">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Write your first post
              </Button>
            </Link>
          </div>
        )}

        {/* Load More */}
        {pagination.pages > 1 && (
          <div className="text-center mt-12">
            <Button variant="outline">Load More Posts</Button>
          </div>
        )}
      </main>
    </div>
  );
}
