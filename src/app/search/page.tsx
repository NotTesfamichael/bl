import { Suspense } from "react";
import { PostCard } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function getSearchResults(query: string) {
  const response = await fetch(
    `${
      process.env.NEXTAUTH_URL
    }/api/posts?status=PUBLISHED&search=${encodeURIComponent(query)}&limit=20`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    return { posts: [], pagination: { total: 0, pages: 0 } };
  }

  return response.json();
}

async function SearchResults({ query }: { query: string }) {
  const { posts } = await getSearchResults(query);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post: any) => (
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">
                <Link
                  href="/"
                  className="hover:text-[#556B2F] transition-colors"
                >
                  Notes & Code Blog
                </Link>
              </h1>
              <p className="text-black">Search results for "{query}"</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Link href="/writer">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Write
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
