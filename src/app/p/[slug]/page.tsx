import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Eye, Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await db.post.findUnique({
    where: {
      slug,
      status: "PUBLISHED"
    },
    include: {
      author: {
        select: {
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

  return (
    <div className="min-h-screen bg-[#F5F0E1]">
      {/* Header */}
      <header className="border-b border-[#D4C4A8]">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Post Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">{post.title}</h1>

            <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <span>By {post.author.name}</span>
              </div>
              {post.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(post.publishedAt), {
                      addSuffix: true
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>5 min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{viewCount} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  Like
                </Button>
                <Button variant="outline" size="sm">
                  Share
                </Button>
              </div>
              <div className="text-sm text-gray-500">
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
