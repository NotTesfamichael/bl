"use client";

import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();

  // Only show edit button if user is the author
  if (!session?.user || session.user.id !== authorId) {
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
