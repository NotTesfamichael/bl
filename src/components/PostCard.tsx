import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: Date | null;
    author: {
      name: string | null;
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
  };
}

export function PostCard({ post }: PostCardProps) {
  const viewCount = post.views[0]?.count || 0;
  const likeCount = post.reactions.filter((r) => r.type === "LIKE").length;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer hover:scale-[1.02] transition-transform group">
      <Link href={`/p/${post.slug}`} className="block h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold line-clamp-2 text-black group-hover:text-[#556b2f] transition-colors">
              {post.title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
              <Eye className="h-4 w-4" />
              <span>{viewCount}</span>
              <Heart className="h-4 w-4" />
              <span>{likeCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>By {post.author.name}</span>
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
          </div>
        </CardHeader>

        <CardContent>
          {post.excerpt && (
            <p className="text-black mb-4 line-clamp-3">{post.excerpt}</p>
          )}
        </CardContent>
      </Link>

      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {post.tags.map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className="inline-block"
            >
              <Badge
                variant="secondary"
                className="hover:bg-[#556b2f] hover:text-white"
              >
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
