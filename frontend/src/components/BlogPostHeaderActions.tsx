"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";

interface BlogPostHeaderActionsProps {
  postId: string;
  authorId: string;
}

export function BlogPostHeaderActions({
  postId,
  authorId
}: BlogPostHeaderActionsProps) {
  const { user, isAuthenticated } = useAuth();

  // Only show edit button if user is the author
  if (!isAuthenticated || user?.id !== authorId) {
    return null;
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link href={`/writer/${postId}`}>
        <Edit className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Edit Post</span>
        <span className="sm:hidden">Edit</span>
      </Link>
    </Button>
  );
}
