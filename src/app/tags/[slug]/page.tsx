import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PostCard } from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;

  // Get the tag
  const tag = await db.tag.findUnique({
    where: { slug }
  });

  if (!tag) {
    notFound();
  }

  // Get posts with this tag
  const posts = await db.post.findMany({
    where: {
      status: "PUBLISHED",
      tags: {
        some: {
          tag: {
            slug: slug
          }
        }
      }
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      tags: {
        include: {
          tag: true
        }
      },
      views: true,
      reactions: true
    },
    orderBy: {
      publishedAt: "desc"
    }
  });

  return (
    <div className="min-h-screen bg-[#F5F0E1]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-[#556B2F]" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
              Posts tagged with &quot;{tag.name}&quot;
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Badge variant="default" className="bg-[#556B2F] text-white w-fit">
              {tag.name}
            </Badge>
            <span className="text-sm sm:text-base text-gray-600">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
          </div>
        </div>

        {/* Posts */}
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(
              (post: {
                id: string;
                title: string;
                slug: string;
                excerpt: string | null;
                publishedAt: Date | null;
                author: {
                  id: string;
                  name: string | null;
                  email: string | null;
                };
                tags: Array<{
                  tag: {
                    name: string;
                    slug: string;
                  };
                }>;
                views: Array<{
                  count: number;
                }>;
                reactions: Array<{
                  type: string;
                }>;
              }) => (
                <PostCard key={post.id} post={post} />
              )
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No posts found
            </h3>
            <p className="text-gray-500">
              There are no published posts with this tag yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;

  const tag = await db.tag.findUnique({
    where: { slug }
  });

  if (!tag) {
    return {
      title: "Tag not found"
    };
  }

  return {
    title: `Posts tagged with "${tag.name}"`,
    description: `Browse all posts tagged with ${tag.name} on our blog.`
  };
}
