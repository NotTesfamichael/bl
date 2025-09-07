"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "./Editor";
import { TagInput } from "./TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Save, Eye, Globe, Lock, Users } from "lucide-react";
import { toast } from "sonner";
import { generateSlug } from "@/lib/markdown";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PostContent } from "@/components/PostContent";
import {
  validatePostTitle,
  validatePostContent,
  validatePostSlug
} from "@/lib/validation";

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
  visibility: "PUBLIC" | "PRIVATE";
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
  onPostSaved?: () => void; // Callback to refresh posts list
}

export function NewPostForm({
  post,
  allTags = [],
  isEditing = false,
  onPostSaved
}: NewPostFormProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.contentMarkdown || "");
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    post?.tags?.map(({ tag }: { tag: Tag }) => tag) || []
  );
  const [availableTags, setAvailableTags] = useState<Tag[]>(allTags);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(
    post?.visibility || "PUBLIC"
  );

  // Validation state
  const titleValidation = validatePostTitle(title);
  const contentValidation = validatePostContent(content);
  const slugValidation = validatePostSlug(slug);
  const isFormValid =
    titleValidation.isValid &&
    contentValidation.isValid &&
    slugValidation.isValid;

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, slug]);

  const saveDraft = useCallback(async () => {
    if (!title || !content) return;

    if (!isAuthenticated) {
      toast.error("Please log in to save your draft");
      router.push("/login");
      return;
    }

    try {
      const postData = {
        title,
        slug: slug || generateSlug(title),
        contentMarkdown: content,
        excerpt,
        status: "DRAFT" as const,
        visibility,
        tagIds: selectedTags.map((tag: Tag) => tag.id)
      };

      console.log("Saving draft with data:", postData);

      let response;
      if (isEditing && post?.id) {
        response = await apiClient.updatePost(post.id, postData);
      } else {
        response = await apiClient.createPost(postData);
      }

      toast.success(isEditing ? "Post updated successfully!" : "Draft saved");

      // Note: Tag cleanup is handled by admin users separately

      // Call the callback to refresh posts list
      if (onPostSaved) {
        onPostSaved();
      }

      if (!isEditing) {
        router.push("/writer");
      }
      return response;
    } catch (error) {
      console.error("Failed to save draft:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save draft";

      // Check if it's an authentication error
      if (errorMessage.includes("401") || errorMessage.includes("403")) {
        toast.error("Please log in again to save your draft");
      } else if (errorMessage.includes("Validation failed")) {
        toast.error("Please check your post content and try again");
      } else {
        toast.error("Failed to save draft");
      }
    }
  }, [
    title,
    content,
    slug,
    excerpt,
    visibility,
    selectedTags,
    isEditing,
    post?.id,
    router,
    isAuthenticated,
    onPostSaved
  ]);

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await apiClient.getTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error("Error loading tags:", error);
      }
    };

    loadTags();
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

    if (!isAuthenticated) {
      toast.error("Please log in to publish your post");
      router.push("/login");
      return;
    }

    setIsPublishing(true);
    try {
      const postData = {
        title,
        slug: slug || generateSlug(title),
        contentMarkdown: content,
        excerpt,
        tagIds: selectedTags.map((tag: Tag) => tag.id),
        status: "PUBLISHED" as const,
        visibility
      };

      let response;
      if (isEditing && post?.id) {
        response = await apiClient.updatePost(post.id, postData);
      } else {
        response = await apiClient.createPost(postData);
      }
      toast.success(
        isEditing
          ? "Post updated and published!"
          : "Post published successfully!"
      );

      // Note: Tag cleanup is handled by admin users separately

      // Call the callback to refresh posts list
      if (onPostSaved) {
        onPostSaved();
      }

      router.push(`/p/${response.slug}`);
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
                  disabled={isSaving || !isFormValid}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || !isFormValid}
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
              <PostContent
                content={content}
                className="prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto min-h-[500px] p-4 sm:p-6"
              />
            ) : (
              <div>
                <Editor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your post..."
                />
                {content && !contentValidation.isValid && (
                  <div className="mt-2 text-xs text-red-500">
                    {contentValidation.errors[0]}
                  </div>
                )}
                {content && contentValidation.isValid && (
                  <div className="mt-2 text-xs text-green-600">
                    Content looks good!
                  </div>
                )}
              </div>
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
                placeholder="Write a compelling title for your post..."
                className={`mt-1 ${
                  !titleValidation.isValid && title ? "border-red-500" : ""
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-gray-500">
                  {titleValidation.errors.length > 0 ? (
                    <span className="text-red-500">
                      {titleValidation.errors[0]}
                    </span>
                  ) : (
                    <span className="text-green-600">Title looks good!</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {title.length}/200 characters
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-awesome-post-slug"
                className={`mt-1 ${
                  !slugValidation.isValid && slug ? "border-red-500" : ""
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-gray-500">
                  {slugValidation.errors.length > 0 ? (
                    <span className="text-red-500">
                      {slugValidation.errors[0]}
                    </span>
                  ) : slug ? (
                    <span className="text-green-600">Slug looks good!</span>
                  ) : (
                    <span>Auto-generated from title</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {slug.length}/100 characters
                </div>
              </div>
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

            <div>
              <label className="text-sm font-medium">Visibility</label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="public"
                    name="visibility"
                    value="PUBLIC"
                    checked={visibility === "PUBLIC"}
                    onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="public" className="flex items-center space-x-2 cursor-pointer">
                    <Users className="h-4 w-4" />
                    <span>Public - Everyone can see this post</span>
                  </Label>
                </div>
                {isAuthenticated && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="private"
                      name="visibility"
                      value="PRIVATE"
                      checked={visibility === "PRIVATE"}
                      onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <Label htmlFor="private" className="flex items-center space-x-2 cursor-pointer">
                      <Lock className="h-4 w-4" />
                      <span>Private - Only you can see this post</span>
                    </Label>
                  </div>
                )}
              </div>
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
