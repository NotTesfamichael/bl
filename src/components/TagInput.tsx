"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { X, Plus, Tag } from "lucide-react";
import { toast } from "sonner";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  availableTags: Tag[];
  onAvailableTagsChange: (tags: Tag[]) => void;
}

export function TagInput({
  selectedTags,
  onTagsChange,
  availableTags,
  onAvailableTagsChange
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter available tags based on input and exclude already selected
  const filteredTags = availableTags.filter(
    (tag) =>
      !selectedTags.some((selected) => selected.id === tag.id) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        handleCreateTag();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setInputValue("");
    }
  };

  const handleCreateTag = async () => {
    const tagName = inputValue.trim();
    if (!tagName) return;

    // Check if tag already exists in available tags
    const existingTag = availableTags.find(
      (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
    );

    if (existingTag) {
      handleSelectTag(existingTag);
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tagName })
      });

      if (response.ok) {
        const newTag = await response.json();
        onAvailableTagsChange([...availableTags, newTag]);
        onTagsChange([...selectedTags, newTag]);
        setInputValue("");
        setShowSuggestions(false);
        toast.success(`Tag "${newTag.name}" created successfully!`);
      } else if (response.status === 409) {
        // Tag already exists, try to find it and add it
        toast.info(`Tag "${tagName}" already exists, adding it to your post`);
        // Refresh available tags to get the existing tag
        try {
          const tagsResponse = await fetch("/api/tags");
          if (tagsResponse.ok) {
            const allTags = await tagsResponse.json();
            const existingTag = allTags.find(
              (tag: Tag) => tag.name.toLowerCase() === tagName.toLowerCase()
            );
            if (existingTag) {
              onAvailableTagsChange(allTags);
              onTagsChange([...selectedTags, existingTag]);
              setInputValue("");
              setShowSuggestions(false);
            }
          }
        } catch (error) {
          console.error("Error fetching tags:", error);
          toast.error("Failed to add existing tag");
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create tag");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectTag = (tag: Tag) => {
    onTagsChange([...selectedTags, tag]);
    setInputValue("");
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tagId: string, event?: React.MouseEvent) => {
    console.log("Removing tag from post:", tagId);
    console.log("Event:", event);

    // Prevent event bubbling
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Remove from selected tags immediately for better UX
    const updatedTags = selectedTags.filter((tag) => tag.id !== tagId);
    console.log("Updated tags:", updatedTags);
    onTagsChange(updatedTags);

    // Don't remove from available tags - keep it available for reuse
    // The tag will be cleaned up from the database later if it's truly unused

    toast.success("Tag removed from post!");
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Tags</label>

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-200 rounded-md">
        {selectedTags.map((tag: Tag) => (
          <div
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-[#556B2F] hover:bg-[#4a5a2a] text-white rounded-full text-sm group cursor-pointer"
            onClick={(e) => handleRemoveTag(tag.id, e)}
            title="Click to remove tag"
          >
            <span>{tag.name}</span>
            <X className="h-3 w-3 hover:text-red-200 transition-colors" />
          </div>
        ))}

        {/* Input Field */}
        <div className="relative flex-1 min-w-[120px]">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Type to create or search tags..."
            className="border-0 focus:ring-0 p-0 h-8"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions &&
            (filteredTags.length > 0 || inputValue.trim()) && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredTags.map((tag: Tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => handleSelectTag(tag)}
                  >
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{tag.name}</span>
                  </button>
                ))}

                {inputValue.trim() &&
                  !filteredTags.some(
                    (tag) => tag.name.toLowerCase() === inputValue.toLowerCase()
                  ) && (
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 border-t border-gray-100"
                      onClick={handleCreateTag}
                      disabled={isCreating}
                    >
                      <Plus className="h-4 w-4 text-[#556B2F]" />
                      <span className="text-sm text-[#556B2F]">
                        {isCreating ? "Creating..." : `Create "${inputValue}"`}
                      </span>
                    </button>
                  )}
              </div>
            )}
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Press Enter to create a new tag, click on existing tags to add them, or
        click the X to remove tags
      </p>
    </div>
  );
}
