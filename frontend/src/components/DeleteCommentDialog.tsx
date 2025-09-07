"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, X } from "lucide-react";

interface DeleteCommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteCommentDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false
}: DeleteCommentDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-200">
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8 p-0"
            disabled={isDeleting}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl text-red-600 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete Comment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this comment? This action cannot be undone.
          </p>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Comment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
