"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";

interface PostActionsProps {
  postId: string;
  initialLikeCount: number;
  isLiked?: boolean;
}

export function PostActions({
  postId,
  initialLikeCount,
  isLiked = false
}: PostActionsProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const newLikeCount = isLikedState ? likeCount - 1 : likeCount + 1;
        setLikeCount(newLikeCount);
        setIsLikedState(!isLikedState);
        toast.success(isLikedState ? "Removed like" : "Liked post!");
      } else {
        toast.error("Failed to like post");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: url
        });
        toast.success("Post shared!");
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        toast.error("Failed to copy link");
      }
    }
  };

  const handleComment = () => {
    // Scroll to comments section (if it exists) or show a message
    const commentsSection = document.getElementById("comments");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" });
    } else {
      toast.info("Comments feature coming soon!");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handleLike}
        disabled={isLiking}
        className={isLikedState ? "text-red-600 border-red-600" : ""}
      >
        <Heart
          className={`h-4 w-4 mr-1 ${isLikedState ? "fill-current" : ""}`}
        />
        {likeCount} {likeCount === 1 ? "Like" : "Likes"}
      </Button>

      <Button variant="outline" size="sm" onClick={handleComment}>
        <MessageCircle className="h-4 w-4 mr-1" />
        Comment
      </Button>

      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-1" />
        Share
      </Button>
    </div>
  );
}
