import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostActions } from "@/components/PostActions";
import { Calendar, Clock, Eye, Heart, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  // Get current user session
  const { auth } = await import("@/lib/auth");
  const session = await auth();

  const post = await db.post.findUnique({
    where: {
      slug,
      status: "PUBLISHED"
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      tags: {
        include: {
          tag: true
        }
      },
      views: true,
      reactions: true
    }
  });

  if (!post) {
    notFound();
  }

  const viewCount = post.views[0]?.count || 0;
  const likeCount = post.reactions.filter((r) => r.type === "LIKE").length;
  const isLiked = session?.user
    ? post.reactions.some(
        (r) => r.userId === session.user.id && r.type === "LIKE"
      )
    : false;

  return (
    <div className="min-h-screen bg-[#F5F0E1]">
      {/* Header */}
      <header className="border-b border-[#D4C4A8]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            {session?.user && session.user.id === post.author.id && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Link href={`/writer/${post.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Edit Post</span>
                  <span className="sm:hidden">Edit</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Post Header */}
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black flex-1">
                {post.title}
              </h1>
              {session?.user && session.user.id === post.author.id && (
                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/writer/${post.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Edit Post</span>
                    <span className="sm:hidden">Edit</span>
                  </Link>
                </Button>
              )}
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
              {post.tags.map(({ tag }) => (
                <Link key={tag.slug} href={`/tags/${tag.slug}`}>
                  <Badge variant="secondary" className="hover:bg-blue-100">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </header>

          {/* Post Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* Post Footer */}
          <footer className="mt-12 pt-8 border-t">
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
          </footer>
        </div>
      </article>
    </div>
  );
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await db.post.findUnique({
    where: {
      slug,
      status: "PUBLISHED"
    },
    select: {
      title: true,
      excerpt: true,
      author: {
        select: {
          name: true
        }
      }
    }
  });

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
}
