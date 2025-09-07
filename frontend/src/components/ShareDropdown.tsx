"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Twitter, Facebook, Linkedin, Mail } from "lucide-react";
import { toast } from "sonner";

export function ShareDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);

      // Fallback: try to use execCommand for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Link copied to clipboard!");
        setIsOpen(false);
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
        toast.error("Failed to copy link");
      }
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      const url = window.location.href;
      const title = document.title;
      try {
        await navigator.share({
          title: title,
          url: url
        });
        setIsOpen(false);
      } catch {
        // User cancelled sharing
      }
    }
  };

  const handleTwitterShare = () => {
    const url = window.location.href;
    const title = document.title;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
    setIsOpen(false);
  };

  const handleFacebookShare = () => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
    setIsOpen(false);
  };

  const handleLinkedinShare = () => {
    const url = window.location.href;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`;
    window.open(linkedinUrl, "_blank", "width=600,height=400");
    setIsOpen(false);
  };

  const handleEmailShare = () => {
    const url = window.location.href;
    const title = document.title;
    const subject = encodeURIComponent(`Check out this post: ${title}`);
    const body = encodeURIComponent(
      `I thought you might be interested in this post:\n\n${title}\n${url}`
    );
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = emailUrl;
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex-1 sm:flex-none"
      >
        <Share2 className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              <button
                onClick={handleCopyLink}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Copy className="h-4 w-4 mr-3" />
                Copy Link
              </button>

              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Share2 className="h-4 w-4 mr-3" />
                  Share...
                </button>
              )}

              <button
                onClick={handleTwitterShare}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Twitter className="h-4 w-4 mr-3" />
                Twitter
              </button>

              <button
                onClick={handleFacebookShare}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Facebook className="h-4 w-4 mr-3" />
                Facebook
              </button>

              <button
                onClick={handleLinkedinShare}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Linkedin className="h-4 w-4 mr-3" />
                LinkedIn
              </button>

              <button
                onClick={handleEmailShare}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Mail className="h-4 w-4 mr-3" />
                Email
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
