"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { LoginModal } from "@/components/LoginModal";
import { ShareDropdown } from "@/components/ShareDropdown";

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
  const { data: session } = useSession();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [isLiking, setIsLiking] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLike = async () => {
    if (!session?.user) {
      setShowLoginModal(true);
      return;
    }

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
        const error = await response.json();
        toast.error(error.error || "Failed to like post");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = () => {
    if (!session?.user) {
      setShowLoginModal(true);
      return;
    }

    // Scroll to comments section (if it exists)
    const commentsSection = document.getElementById("comments");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" });
    } else {
      toast.info("Comments section not found");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      {session?.user ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className={`flex-1 sm:flex-none ${
            isLikedState ? "text-red-600 border-red-600" : ""
          }`}
        >
          <Heart
            className={`h-4 w-4 mr-1 ${isLikedState ? "fill-current" : ""}`}
          />
          <span className="hidden sm:inline">
            {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </span>
          <span className="sm:hidden">{likeCount}</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLoginModal(true)}
          className="flex-1 sm:flex-none"
        >
          <Heart className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">
            {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </span>
          <span className="sm:hidden">{likeCount}</span>
        </Button>
      )}

      {session?.user ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleComment}
          className="flex-1 sm:flex-none"
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Comment</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLoginModal(true)}
          className="flex-1 sm:flex-none"
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Comment</span>
        </Button>
      )}

      <ShareDropdown />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login Required"
        message="Please log in to like posts and comment"
      />
    </div>
  );
}
