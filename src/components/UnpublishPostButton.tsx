"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeOff, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UnpublishPostButtonProps {
  postId: string;
  postTitle: string;
  onUnpublish: (
    postId: string
  ) => Promise<{ success?: boolean; error?: string }>;
}

export function UnpublishPostButton({
  postId,
  postTitle,
  onUnpublish
}: UnpublishPostButtonProps) {
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleUnpublish = async () => {
    setIsUnpublishing(true);
    try {
      const result = await onUnpublish(postId);
      if (result?.success) {
        toast.success(`"${postTitle}" unpublished successfully!`);
        setIsOpen(false);
        router.refresh(); // Refresh the page to show updated list
      } else {
        toast.error(result?.error || "Failed to unpublish post.");
      }
    } catch (error) {
      console.error("Error unpublishing post:", error);
      toast.error("An unexpected error occurred while unpublishing the post.");
    } finally {
      setIsUnpublishing(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-full h-9 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
      >
        <EyeOff className="h-4 w-4 mr-1" />
        Unpublish
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
                disabled={isUnpublishing}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl text-orange-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Unpublish Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to unpublish{" "}
                <strong>&quot;{postTitle}&quot;</strong>? This will move it back to
                your drafts and it won&apos;t be visible to the public.
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isUnpublishing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleUnpublish}
                  disabled={isUnpublishing}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isUnpublishing ? "Unpublishing..." : "Unpublish Post"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
