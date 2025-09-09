import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api";
import { PostCard } from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";
import { Post } from "@/types";
import { Tag } from "lucide-react";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;

  try {
    // First, check if the tag exists by getting all tags
    const allTags = await apiClient.getTags();
    console.log(
      "TagPage: All tags:",
      allTags.map((t) => ({ name: t.name, slug: t.slug }))
    );
    console.log("TagPage: Looking for slug:", slug);

    // Try exact match first, then case-insensitive match
    let tag = allTags.find((t: { slug: string }) => t.slug === slug);
    if (!tag) {
      tag = allTags.find(
        (t: { slug: string }) => t.slug.toLowerCase() === slug.toLowerCase()
      );
    }

    console.log("TagPage: Found tag:", tag);

    if (!tag) {
      console.log("TagPage: Tag not found, calling notFound()");
      notFound();
    }

    // Then get posts with this tag
    console.log("TagPage: Fetching posts for tag:", slug);
    const response = await apiClient.getPosts({ tag: slug });
    const posts = response.posts;
    console.log("TagPage: Found posts:", posts.length);

    return (
      <div className="min-h-screen bg-[#F5F0E1]">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-[#556B2F]" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
                Posts tagged with &quot;{tag.name}&quot;
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Badge
                variant="default"
                className="bg-[#556B2F] text-white w-fit"
              >
                {tag.name}
              </Badge>
              <span className="text-sm sm:text-base text-gray-600">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </span>
            </div>
          </div>

          {/* Posts */}
          {posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No posts found
              </h3>
              <p className="text-gray-500">
                There are no published posts with this tag yet.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("TagPage: Error fetching posts for tag:", error);
    // If it's a 404 error, show empty results instead of notFound
    if (error instanceof Error && error.message.includes("404")) {
      return (
        <div className="min-h-screen bg-[#F5F0E1]">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-[#556B2F]" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
                  Posts tagged with &quot;{slug}&quot;
                </h1>
              </div>
            </div>
            <div className="text-center py-12">
              <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No posts found
              </h3>
              <p className="text-gray-500">
                There are no published posts with this tag yet.
              </p>
            </div>
          </div>
        </div>
      );
    }
    notFound();
  }
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params;

  try {
    // First, check if the tag exists by getting all tags
    const allTags = await apiClient.getTags();
    // Try exact match first, then case-insensitive match
    let tag = allTags.find((t: { slug: string }) => t.slug === slug);
    if (!tag) {
      tag = allTags.find(
        (t: { slug: string }) => t.slug.toLowerCase() === slug.toLowerCase()
      );
    }

    if (!tag) {
      return {
        title: "Tag not found"
      };
    }

    return {
      title: `Posts tagged with "${tag.name}"`,
      description: `Browse all posts tagged with ${tag.name} on our blog.`
    };
  } catch {
    return {
      title: "Tag not found"
    };
  }
}
