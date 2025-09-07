"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PostActions } from "@/components/PostActions";
import { CommentSection } from "@/components/CommentSection";
import { PostContent } from "@/components/PostContent";
import { BlogPostHeaderActions } from "@/components/BlogPostHeaderActions";
import { Header } from "@/components/Header";
import { Calendar, Clock, Eye, Heart, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/types";

interface PostPageClientProps {
  slug: string;
  isPrivate?: boolean;
}

export function PostPageClient({
  slug,
  isPrivate = false
}: PostPageClientProps) {
  // isPrivate parameter is used for future enhancements
  console.log("PostPageClient isPrivate:", isPrivate);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await apiClient.getPostBySlug(slug);
        setPost(postData);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F] mx-auto mb-4"></div>
          <p className="text-[#556B2F] font-medium">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    notFound();
  }

  const viewCount = post.views[0]?.count || 0;
  const likeCount = post.reactions.filter(
    (r: { type: string }) => r.type === "LIKE"
  ).length;
  const isLiked = false; // Will be handled by client-side components

  return (
    <div className="min-h-screen bg-[#F5F0E1]">
      <Header
        blogPostActions={
          <BlogPostHeaderActions postId={post.id} authorId={post.author.id} />
        }
      />
      {/* Article */}
      <article className="container mx-auto px-4 py-8 pt-16">
        <div className="max-w-4xl mx-auto">
          {/* Post Header */}
          <header className="mb-8">
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {post.tags.map(
                  (postTag: {
                    tag: { id: string; slug: string; name: string };
                  }) => (
                    <Link
                      key={postTag.tag.id}
                      href={`/tags/${postTag.tag.slug}`}
                      className="inline-block"
                    >
                      <Badge variant="secondary" className="text-xs">
                        {postTag.tag.name}
                      </Badge>
                    </Link>
                  )
                )}
                {post.visibility === "PRIVATE" && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-yellow-100 text-yellow-800 flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    Private
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight">
                {post.title}
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    {post.author.image ? (
                      <Image
                        src={post.author.image}
                        alt={post.author.name || "Author"}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-600">
                        {(post.author.name || "A").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">
                    {post.author.name || "Anonymous"}
                  </span>
                </div>
                {post.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDistanceToNow(new Date(post.publishedAt), {
                        addSuffix: true
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{viewCount} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{likeCount} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {Math.ceil((post.contentMarkdown?.length || 0) / 200)} min
                    read
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Post Content */}
          <PostContent content={post.contentHtml || post.content || ""} />

          {/* Post Footer */}
          <footer className="mt-12 pt-8 border-t">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PostActions
                  postId={post.id}
                  initialLikeCount={likeCount}
                  isLiked={isLiked}
                />
                <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                  Last updated{" "}
                  {formatDistanceToNow(new Date(post.updatedAt), {
                    addSuffix: true
                  })}
                </div>
              </div>

              {/* Comments Section */}
              <div id="comments" className="mt-6">
                <CommentSection postId={post.id} />
              </div>
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
}
