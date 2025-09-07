"use client";

import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { CodeCopyButton } from "./CodeCopyButton";

interface PostContentProps {
  content: string;
  className?: string;
}

export function PostContent({ content, className = "" }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Find all pre elements (code blocks)
    const codeBlocks = contentRef.current.querySelectorAll("pre");
    
    codeBlocks.forEach((preElement) => {
      // Skip if already processed
      if (preElement.querySelector(".copy-button-container")) return;

      // Make the pre element relative positioned for absolute positioning of button
      preElement.style.position = "relative";
      preElement.classList.add("group");

      // Get the code content
      const codeElement = preElement.querySelector("code");
      if (!codeElement) return;

      const codeText = codeElement.textContent || "";

      // Create a container for the copy button
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "copy-button-container";

      // Create a React root and render the copy button
      const root = createRoot(buttonContainer);
      root.render(<CodeCopyButton code={codeText} />);

      // Append the button container to the pre element
      preElement.appendChild(buttonContainer);
    });

    // Cleanup function
    return () => {
      codeBlocks.forEach((preElement) => {
        const buttonContainer = preElement.querySelector(".copy-button-container");
        if (buttonContainer) {
          buttonContainer.remove();
        }
      });
    };
  }, [content]);

  return (
    <div
      ref={contentRef}
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
