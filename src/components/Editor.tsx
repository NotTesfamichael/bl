"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { createLowlight } from "lowlight";
import { EditorToolbar } from "./EditorToolbar";
import { useEffect } from "react";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function Editor({
  content,
  onChange,
  placeholder = "Start writing...",
  editable = true
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: "text-blue-600 hover:text-blue-800 underline"
          }
        }
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(),
        defaultLanguage: "javascript"
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto"
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    editable,
    immediatelyRender: false, // Fix SSR hydration issue
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4"
      }
    }
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
