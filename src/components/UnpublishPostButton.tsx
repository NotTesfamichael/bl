"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { EyeOff, AlertTriangle } from "lucide-react";
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-9 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
        >
          <EyeOff className="h-4 w-4 mr-1" />
          Unpublish
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-left">Unpublish Post</DialogTitle>
              <DialogDescription className="text-left">
                This will move the post back to drafts.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to unpublish{" "}
            <strong>&quot;{postTitle}&quot;</strong>? This will move it back to
            your drafts and it won&apos;t be visible to the public.
          </p>
        </div>
        <DialogFooter>
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
            {isUnpublishing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Unpublishing...
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Unpublish Post
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
