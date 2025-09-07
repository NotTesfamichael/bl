import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api";
import { PostPageClient } from "../../[slug]/PostPageClient";

// Force dynamic rendering to ensure posts are always up-to-date
export const dynamic = "force-dynamic";

interface PrivatePostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PrivatePostPage({
  params
}: PrivatePostPageProps) {
  const { slug } = await params;

  try {
    const post = await apiClient.getPostBySlug(slug);

    if (!post) {
      notFound();
    }

    // Ensure this is a private post
    if (post.visibility !== "PRIVATE") {
      notFound();
    }

    // For private posts, use client-side rendering to handle authentication
    return <PostPageClient slug={slug} isPrivate={true} />;
  } catch (error) {
    console.error("Error fetching private post:", error);
    // If server-side fetch fails, try client-side (might be authentication issue)
    return <PostPageClient slug={slug} isPrivate={true} />;
  }
}

export async function generateMetadata({ params }: PrivatePostPageProps) {
  const { slug } = await params;

  try {
    const post = await apiClient.getPostBySlug(slug);

    if (!post || post.visibility !== "PRIVATE") {
      return {
        title: "Private Post Not Found"
      };
    }

    return {
      title: `Private: ${post.title}`,
      description: "This is a private post",
      robots: "noindex, nofollow" // Prevent search engine indexing
    };
  } catch (error) {
    console.error("Error fetching private post metadata:", error);
    return {
      title: "Private Post Not Found"
    };
  }
}
