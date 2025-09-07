"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, LogIn, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { LoginModal } from "@/components/LoginModal";
import { DeleteCommentDialog } from "@/components/DeleteCommentDialog";
import { validateCommentContent } from "@/lib/validation";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    commentId: string | null;
  }>({ isOpen: false, commentId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      setShowLoginModal(true);
      return;
    }

    // Validate comment content
    const validation = validateCommentContent(newComment);
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment("");
        toast.success("Comment added successfully!");
      } else {
        const error = await response.json();
        if (error.details && error.details.length > 0) {
          toast.error(error.details[0]);
        } else {
          toast.error(error.error || "Failed to add comment");
        }
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteDialog.commentId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${deleteDialog.commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the comment from the local state
        setComments(comments.filter(comment => comment.id !== deleteDialog.commentId));
        setDeleteDialog({ isOpen: false, commentId: null });
        toast.success("Comment deleted successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (commentId: string) => {
    setDeleteDialog({ isOpen: true, commentId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, commentId: null });
  };

  if (isLoading) {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments
        </h3>
        <p className="text-gray-500">Loading comments...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Comments ({comments.length})
      </h3>
      <div className="space-y-6">
        {/* Comment Form */}
        {session?.user ? (
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment... (minimum 5 characters)"
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              <span className={`text-xs ${newComment.trim().length >= 5 ? 'text-green-600' : 'text-gray-500'}`}>
                {newComment.length}/1000 characters
                {newComment.trim().length < 5 && (
                  <span className="ml-1 text-red-500">
                    (minimum 5 characters)
                  </span>
                )}
              </span>
              <Button
                type="submit"
                disabled={isSubmitting || newComment.trim().length < 5}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <Button onClick={() => setShowLoginModal(true)} variant="outline">
              <LogIn className="h-4 w-4 mr-2" />
              Log in to comment
            </Button>
          </div>
        )}

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 p-3 border rounded-lg"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.image || ""} />
                  <AvatarFallback>
                    {comment.author.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.author.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                    {session?.user && (session.user as { id: string }).id === comment.author.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(comment.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login Required"
        message="Please log in to add a comment"
      />

      {/* Delete Comment Dialog */}
      <DeleteCommentDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteComment}
        isDeleting={isDeleting}
      />
    </div>
  );
}
