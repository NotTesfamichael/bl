import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { PostActions } from "@/components/PostActions";
import { CommentSection } from "@/components/CommentSection";
import { PostContent } from "@/components/PostContent";
import { BlogPostHeaderActions } from "@/components/BlogPostHeaderActions";
import { Header } from "@/components/Header";
import { Calendar, Clock, Eye, Heart } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Force dynamic rendering to ensure posts are always up-to-date
export const dynamic = "force-dynamic";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  try {
    const post = await apiClient.getPostBySlug(slug);

    if (!post) {
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
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
                  {post.title}
                </h1>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <span>By {post.author.name}</span>
                </div>
                {post.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>
                      {formatDistanceToNow(new Date(post.publishedAt), {
                        addSuffix: true
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>5 min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{viewCount} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{likeCount} likes</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {post.tags.map(
                  ({ tag }: { tag: { name: string; slug: string } }) => (
                    <Link key={tag.slug} href={`/tags/${tag.slug}`}>
                      <Badge variant="secondary" className="hover:bg-blue-100">
                        {tag.name}
                      </Badge>
                    </Link>
                  )
                )}
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
  } catch (error) {
    console.error("Error fetching post:", error);
    notFound();
  }
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;

  try {
    const post = await apiClient.getPostBySlug(slug);

    if (!post) {
      return {
        title: "Post Not Found"
      };
    }

    return {
      title: post.title,
      description: post.excerpt,
      authors: [{ name: post.author.name }],
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article"
      }
    };
  } catch (error) {
    console.error("Error fetching post metadata:", error);
    return {
      title: "Post Not Found"
    };
  }
}
