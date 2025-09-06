"use client";

import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link,
  Image,
  Code2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  if (!editor) {
    return null;
  }

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      editor
        .chain()
        .focus()
        .setImage({ src: imageUrl.trim(), alt: "Image" })
        .run();
      setImageUrl("");
      setImageDialogOpen(false);
    }
  };

  const handleSetLink = () => {
    if (linkUrl.trim()) {
      if (linkText.trim()) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${linkUrl.trim()}">${linkText.trim()}</a>`)
          .run();
      } else {
        editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
      }
      setLinkUrl("");
      setLinkText("");
      setLinkDialogOpen(false);
    }
  };

  const addCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock().run();
  };

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
      {/* Text formatting */}
      <Button
        variant={editor.isActive("bold") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive("italic") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive("underline") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive("strike") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive("code") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Headings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Heading1 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="h-4 w-4 mr-2" />
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="h-4 w-4 mr-2" />
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="h-4 w-4 mr-2" />
            Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Lists */}
      <Button
        variant={editor.isActive("bulletList") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive("orderedList") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Block elements */}
      <Button
        variant={editor.isActive("blockquote") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="sm" onClick={addCodeBlock}>
        <Code2 className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Links and media */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant={editor.isActive("link") ? "default" : "ghost"}
            size="sm"
          >
            <Link className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>
              Enter the URL and optional text for your link.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetLink()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link-text">Link Text (optional)</Label>
              <Input
                id="link-text"
                placeholder="Click here"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetLink()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetLink} disabled={!linkUrl.trim()}>
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Image className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
            <DialogDescription>
              Enter the URL of the image you want to add.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
              />
            </div>
            {imageUrl && (
              <div className="grid gap-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 flex justify-center">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-w-full h-auto max-h-48 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddImage} disabled={!imageUrl.trim()}>
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
