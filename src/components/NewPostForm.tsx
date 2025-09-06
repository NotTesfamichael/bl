"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "./Editor";
import { TagInput } from "./TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Eye, Globe } from "lucide-react";
import { toast } from "sonner";
import { generateSlug } from "@/lib/markdown";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentMarkdown: string;
  status: "DRAFT" | "PUBLISHED";
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface NewPostFormProps {
  post?: Post;
  allTags?: Tag[];
  isEditing?: boolean;
}

export function NewPostForm({
  post,
  allTags = [],
  isEditing = false
}: NewPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.contentMarkdown || "");
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    post?.tags?.map(({ tag }) => tag) || []
  );
  const [availableTags, setAvailableTags] = useState<Tag[]>(allTags);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, slug]);

  const saveDraft = useCallback(async () => {
    if (!title || !content) return;

    try {
      const url = isEditing ? `/api/posts/${post?.id}` : "/api/posts";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || generateSlug(title),
          contentMarkdown: content,
          excerpt,
          status: "DRAFT",
          tagIds: selectedTags.map((tag) => tag.id)
        })
      });

      if (response.ok) {
        const postData = await response.json();
        toast.success(isEditing ? "Post updated successfully!" : "Draft saved");

        // Clean up unused tags after saving
        try {
          await fetch("/api/tags/cleanup", { method: "POST" });
        } catch (error) {
          console.error("Failed to cleanup unused tags:", error);
        }

        if (!isEditing) {
          router.push("/writer");
        }
        return postData;
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save draft");
    }
  }, [
    title,
    content,
    slug,
    excerpt,
    selectedTags,
    isEditing,
    post?.id,
    router
  ]);

  // Load available tags
  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setAvailableTags(data))
      .catch(console.error);
  }, []);

  // Autosave every 3 seconds
  useEffect(() => {
    if (!content || !title) return;

    const timer = setTimeout(() => {
      saveDraft();
    }, 3000);

    return () => clearTimeout(timer);
  }, [content, title, saveDraft]);

  const handlePublish = async () => {
    if (!title || !content) {
      toast.error("Title and content are required");
      return;
    }

    setIsPublishing(true);
    try {
      const url = isEditing ? `/api/posts/${post?.id}` : "/api/posts";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || generateSlug(title),
          contentMarkdown: content,
          excerpt,
          tagIds: selectedTags.map((tag) => tag.id),
          status: "PUBLISHED"
        })
      });

      if (response.ok) {
        const postData = await response.json();
        toast.success(
          isEditing
            ? "Post updated and published!"
            : "Post published successfully!"
        );

        // Clean up unused tags after publishing
        try {
          await fetch("/api/tags/cleanup", { method: "POST" });
        } catch (error) {
          console.error("Failed to cleanup unused tags:", error);
        }

        router.push(`/p/${postData.slug}`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to publish post");
      }
    } catch (error) {
      console.error("Failed to publish post:", error);
      toast.error("Failed to publish post");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDraft();
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagsChange = (tags: Tag[]) => {
    setSelectedTags(tags);
  };

  const handleAvailableTagsChange = (tags: Tag[]) => {
    setAvailableTags(tags);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 lg:gap-6">
      {/* Main Editor */}
      <div className="lg:col-span-4">
        <Card className="h-full">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Content</CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreview(!isPreview)}
                  className="w-full sm:w-auto"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {isPreview ? "Edit" : "Preview"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || !title || !content}
                  className="w-full sm:w-auto"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {isPublishing ? "Publishing..." : "Publish"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {isPreview ? (
              <div
                className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto min-h-[500px] p-4 sm:p-6"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <Editor
                content={content}
                onChange={setContent}
                placeholder="Start writing your post..."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-2 space-y-6">
        {/* Post Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Post Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="post-slug"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL: /p/{slug || generateSlug(title)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Excerpt</label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description of your post"
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <TagInput
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
              availableTags={availableTags}
              onAvailableTagsChange={handleAvailableTagsChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
