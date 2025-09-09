"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { VisibilityToggle } from "@/components/VisibilityToggle";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Post } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface HomePageClientProps {
  initialPosts: Post[];
  initialPagination: {
    total: number;
    pages: number;
  };
}

export function HomePageClient({
  initialPosts,
  initialPagination
}: HomePageClientProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [pagination, setPagination] = useState(
    initialPagination || { total: 0, pages: 0 }
  );
  const [currentView, setCurrentView] = useState<"all" | "public" | "private">(
    "all"
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize state from URL parameters
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const view =
      (searchParams.get("view") as "all" | "public" | "private") || "all";

    setCurrentPage(page);
    setSearchQuery(search);
    setCurrentView(view);

    // Always fetch posts on initial load or when parameters change
    fetchPosts(view, search, page, false);
  }, [searchParams]);

  // Fetch posts on initial mount if no initial posts provided
  useEffect(() => {
    if (initialPosts.length === 0) {
      fetchPosts("all", "", 1, false);
    }
  }, []);

  const fetchPosts = async (
    view: "all" | "public" | "private",
    search?: string,
    page: number = 1,
    append: boolean = false
  ) => {
    setLoading(true);
    try {
      const params: {
        status: string;
        limit: number;
        page?: number;
        visibility?: "PUBLIC" | "PRIVATE";
        search?: string;
      } = {
        status: "PUBLISHED",
        limit: 12,
        page: page
      };

      // Add visibility filter based on view
      if (view === "public") {
        params.visibility = "PUBLIC";
      } else if (view === "private") {
        params.visibility = "PRIVATE";
      }
      // For "all", we don't set visibility - API will show all public posts

      if (search) {
        params.search = search;
      }

      const response = await apiClient.getPosts(params);

      if (append) {
        setPosts((prev) => [...prev, ...response.posts]);
      } else {
        setPosts(response.posts);
      }
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (page: number, search: string, view: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (search) params.set("search", search);
    if (view !== "all") params.set("view", view);

    const newURL = params.toString() ? `/?${params.toString()}` : "/";
    router.push(newURL, { scroll: false });
  };

  const handleViewChange = (view: "all" | "public" | "private") => {
    // Don't allow private view if not authenticated
    if (view === "private" && !isAuthenticated) {
      return;
    }
    setCurrentView(view);
    setCurrentPage(1);
    updateURL(1, searchQuery, view);
    fetchPosts(view, searchQuery, 1, false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL(1, query, currentView);
    fetchPosts(currentView, query, 1, false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL(page, searchQuery, currentView);
    fetchPosts(currentView, searchQuery, page, false);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    if (nextPage <= pagination.pages) {
      setCurrentPage(nextPage);
      updateURL(nextPage, searchQuery, currentView);
      fetchPosts(currentView, searchQuery, nextPage, true);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Search and Toggle */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
          <VisibilityToggle
            currentView={currentView}
            onViewChange={handleViewChange}
            className="w-full sm:w-auto"
            isAuthenticated={isAuthenticated}
          />
        </div>

        {/* View Description */}
        <div className="text-sm text-gray-600">
          {currentView === "all" && "Showing all public posts from everyone"}
          {currentView === "public" && "Showing only your public posts"}
          {currentView === "private" && "Showing only your private posts"}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#556B2F]" />
        </div>
      )}

      {/* Posts Grid */}
      {!loading && posts && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && (!posts || posts.length === 0) && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-black mb-4">
            {currentView === "private"
              ? "No private posts yet"
              : currentView === "public"
              ? "No public posts yet"
              : "No public posts yet"}
          </h2>
          <p className="text-black mb-8">
            {currentView === "private"
              ? "Create your first private post to get started!"
              : currentView === "public"
              ? "Create your first public post to get started!"
              : "No public posts have been published yet!"}
          </p>
          <Link href="/writer">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Write your first post
            </Button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="mt-12">
          {/* Page Numbers */}
          <div className="flex justify-center items-center gap-2 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={
                    currentPage === pageNum ? "bg-[#556B2F] text-white" : ""
                  }
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.pages)}
              disabled={currentPage === pagination.pages}
            >
              Last
            </Button>
          </div>

          {/* Page Info */}
          <div className="text-center text-sm text-gray-600 mb-4">
            Page {currentPage} of {pagination.pages} ({pagination.total} total
            posts)
          </div>

          {/* Load More Button */}
          {currentPage < pagination.pages && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Posts"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
