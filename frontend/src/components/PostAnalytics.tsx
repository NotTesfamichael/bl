"use client";

import { Badge } from "@/components/ui/badge";
import { Eye, Heart, MessageCircle, TrendingUp, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostAnalyticsProps {
  post: {
    id: string;
    title: string;
    status: string;
    publishedAt?: Date | null;
    updatedAt: Date;
    views: { count: number }[];
    reactions: { type: string }[];
    _count?: {
      reactions: number;
    };
  };
}

export function PostAnalytics({ post }: PostAnalyticsProps) {
  const viewCount = post.views[0]?.count || 0;
  const likeCount = post.reactions.filter(
    (r: { type: string }) => r.type === "LIKE"
  ).length;
  const commentCount = post.reactions.filter(
    (r: { type: string }) => r.type === "COMMENT"
  ).length;

  return (
    <div className="space-y-2">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
          {post.status}
        </Badge>
        {post.status === "PUBLISHED" && post.publishedAt && (
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(post.publishedAt), {
              addSuffix: true
            })}
          </span>
        )}
      </div>

      {/* Analytics */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>{viewCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3" />
          <span>{likeCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          <span>{commentCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Performance Indicator */}
      {post.status === "PUBLISHED" && (
        <div className="mt-2">
          {viewCount > 100 ? (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <TrendingUp className="h-3 w-3" />
              <span>High engagement</span>
            </div>
          ) : viewCount > 50 ? (
            <div className="flex items-center gap-1 text-yellow-600 text-xs">
              <TrendingUp className="h-3 w-3" />
              <span>Good engagement</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <TrendingUp className="h-3 w-3" />
              <span>Building audience</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
