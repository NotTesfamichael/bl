import { Header } from "@/components/Header";
import { HomePageClient } from "@/components/HomePageClient";
import { apiClient } from "@/lib/api";

// Force dynamic rendering to ensure posts are always up-to-date
export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: {
    page?: string;
    search?: string;
    view?: string;
  };
}

async function getPosts(page: number = 1, search?: string, view?: string) {
  try {
    const params: {
      status: string;
      limit: number;
      page: number;
      search?: string;
      visibility?: "PUBLIC" | "PRIVATE";
    } = {
      status: "PUBLISHED",
      limit: 12,
      page: page
    };

    if (search) {
      params.search = search;
    }

    if (view === "public") {
      params.visibility = "PUBLIC";
    } else if (view === "private") {
      params.visibility = "PRIVATE";
    }

    const response = await apiClient.getPosts(params);
    return response;
  } catch {
    // Don't log SSR errors as they might be expected (private posts, etc.)
    // Just return empty state for graceful fallback
    return { posts: [], pagination: { total: 0, pages: 0 } };
  }
}

export default function HomePage({ searchParams }: HomePageProps) {
  // Temporarily disable SSR to fix the connection issue
  // The HomePageClient will fetch data on the client side
  return (
    <div className="min-h-screen bg-[#F5F0E1]">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <HomePageClient
        initialPosts={[]}
        initialPagination={{ total: 0, pages: 0 }}
      />
    </div>
  );
}
