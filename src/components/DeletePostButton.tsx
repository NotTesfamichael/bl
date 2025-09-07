"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
  onDelete: (postId: string) => Promise<{ success?: boolean; error?: string }>;
}

export function DeletePostButton({
  postId,
  postTitle,
  onDelete
}: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await onDelete(postId);
      if (result.success) {
        setIsOpen(false);
        // Refresh the page to show updated list
        window.location.reload();
      } else {
        alert(result.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-full h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-200">
          <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 h-8 w-8 p-0"
                disabled={isDeleting}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Delete Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete{" "}
                <strong>&quot;{postTitle}&quot;</strong>? This will permanently
                remove the post and all its data. This action cannot be undone.
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Post"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
