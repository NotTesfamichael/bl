"use client";

import { useState } from "react";
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
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [pagination, setPagination] = useState(
    initialPagination || { total: 0, pages: 0 }
  );
  const [currentView, setCurrentView] = useState<"all" | "public" | "private">(
    "all"
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPosts = async (
    view: "all" | "public" | "private",
    search?: string
  ) => {
    setLoading(true);
    try {
      const params: {
        status: string;
        limit: number;
        visibility?: "PUBLIC" | "PRIVATE";
        search?: string;
      } = {
        status: "PUBLISHED",
        limit: 10
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
      setPosts(response.posts);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (view: "all" | "public" | "private") => {
    // Don't allow private view if not authenticated
    if (view === "private" && !isAuthenticated) {
      return;
    }
    setCurrentView(view);
    fetchPosts(view, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchPosts(currentView, query);
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

      {/* Load More */}
      {!loading && pagination.pages > 1 && (
        <div className="text-center mt-12">
          <Button variant="outline">Load More Posts</Button>
        </div>
      )}
    </main>
  );
}
