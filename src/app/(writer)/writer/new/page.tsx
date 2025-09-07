"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { NewPostForm } from "@/components/NewPostForm";
import { apiClient } from "@/lib/api";

export default function NewPostPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [allTags, setAllTags] = useState<any[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      fetchTags();
    }
  }, [isAuthenticated, loading, router]);

  const fetchTags = async () => {
    try {
      setLoadingTags(true);
      const tags = await apiClient.getTags();
      setAllTags(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoadingTags(false);
    }
  };

  if (loading || loadingTags) {
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

  return (
    <div className="min-h-screen bg-[#f5f0e1]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black">Create New Post</h1>
            <p className="text-black">Start writing your next great post</p>
          </div>

          <NewPostForm allTags={allTags} />
        </div>
      </div>
    </div>
  );
}
