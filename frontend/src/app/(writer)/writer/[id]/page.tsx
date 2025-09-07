"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { NewPostForm } from "@/components/NewPostForm";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentMarkdown: string;
  status: "DRAFT" | "PUBLISHED";
  visibility: "PUBLIC" | "PRIVATE";
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;

      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        // Fetch post and tags in parallel
        const [postData, tagsData] = await Promise.all([
          apiClient.getPostById(id),
          apiClient.getTags()
        ]);

        setPost(postData);
        setAllTags(tagsData);
      } catch (error: unknown) {
        console.error("Error fetching post for editing:", error);
        if (error instanceof Error) {
          if (
            error.message.includes("404") ||
            error.message.includes("not found")
          ) {
            setError("Post not found");
          } else if (
            error.message.includes("401") ||
            error.message.includes("Unauthorized")
          ) {
            setError("You don't have permission to edit this post");
          } else {
            setError("Failed to load post");
          }
        } else {
          setError("Failed to load post");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f0e1] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push("/writer")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Writer
          </Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f5f0e1] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">
            The post you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push("/writer")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Writer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e1]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/writer")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Writer
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Edit Post</h1>
            <p className="text-black">Update your post content and settings</p>
          </div>

          <NewPostForm post={post} allTags={allTags} isEditing={true} />
        </div>
      </div>
    </div>
  );
}
