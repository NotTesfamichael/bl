import { Header } from "@/components/Header";
import { HomePageClient } from "@/components/HomePageClient";
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
    // Don't log SSR errors as they might be expected (private posts, etc.)
    // Just return empty state for graceful fallback
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
      <HomePageClient initialPosts={posts} initialPagination={pagination} />
    </div>
  );
}
