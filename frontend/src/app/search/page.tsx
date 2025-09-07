import { Suspense } from "react";
import { PostCard } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

interface SearchPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  publishedAt: string | null;
  author: {
    name: string;
    email: string;
  };
  tags: {
    tag: {
      name: string;
      slug: string;
    };
  }[];
  views?: { count: number }[] | undefined;
  reactions?: { type: string }[] | undefined;
}

async function getSearchResults(query: string) {
  try {
    const { apiClient } = await import("@/lib/api");
    const response = await apiClient.getPosts({
      status: "PUBLISHED",
      search: query,
      limit: 20
    });
    return response;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return { posts: [], pagination: { total: 0, pages: 0 } };
  }
}

async function SearchResults({ query }: { query: string }) {
  const { posts } = await getSearchResults(query);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post: SearchPost) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || "";

  return (
    <div className="min-h-screen bg-[#F5F0E1]">
      {/* Header */}
      <header className="bg-[#F5F0E1] border-b border-[#D4C4A8]">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black">
                <Link
                  href="/"
                  className="hover:text-[#556B2F] transition-colors"
                >
                  Notes & Code Blog
                </Link>
              </h1>
              <p className="text-black text-sm sm:text-base">
                Search results for &quot;{query}&quot;
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
              <Link href="/writer" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Write</span>
                  <span className="sm:hidden">Write</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Search Results */}
        {query ? (
          <Suspense fallback={<div>Searching...</div>}>
            <SearchResults query={query} />
          </Suspense>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Enter a search term
            </h2>
            <p className="text-black mb-8">
              Use the search bar above to find posts
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
