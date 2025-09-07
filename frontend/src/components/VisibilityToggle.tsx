"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Globe, Lock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface VisibilityToggleProps {
  currentView: "all" | "public" | "private";
  onViewChange: (view: "all" | "public" | "private") => void;
  className?: string;
  isAuthenticated?: boolean;
}

export function VisibilityToggle({
  currentView,
  onViewChange,
  className,
  isAuthenticated = false
}: VisibilityToggleProps) {
  const views = [
    {
      key: "all" as const,
      label: "All Posts",
      icon: Eye,
      description: "Show all posts"
    },
    {
      key: "public" as const,
      label: "Public",
      icon: Globe,
      description: "Show only public posts"
    },
    // Only show private option if user is authenticated
    ...(isAuthenticated ? [{
      key: "private" as const,
      label: "Private",
      icon: Lock,
      description: "Show only private posts"
    }] : [])
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 bg-gray-100 rounded-lg",
        className
      )}
    >
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.key;

        return (
          <Button
            key={view.key}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange(view.key)}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              isActive
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
            title={view.description}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
