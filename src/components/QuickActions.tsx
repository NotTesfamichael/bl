"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, SortAsc, SortDesc } from "lucide-react";
import { Post } from "@prisma/client";

interface QuickActionsProps {
  posts: Post[];
  onSearch: (query: string) => void;
  onFilter: (status: string) => void;
  onSort: (field: string, direction: "asc" | "desc") => void;
}

export function QuickActions({
  posts,
  onSearch,
  onFilter,
  onSort
}: QuickActionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortField, setSortField] = useState("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilter = (status: string) => {
    setSelectedStatus(status);
    onFilter(status);
  };

  const handleSort = (field: string) => {
    const newDirection =
      field === sortField && sortDirection === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortDirection(newDirection);
    onSort(field, newDirection);
  };

  const statusCounts = {
    all: posts.length,
    published: posts.filter((p) => p.status === "PUBLISHED").length,
    draft: posts.filter((p) => p.status === "DRAFT").length
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Filter:
          </span>
          {[
            { key: "all", label: "All", count: statusCounts.all },
            {
              key: "published",
              label: "Published",
              count: statusCounts.published
            },
            { key: "draft", label: "Drafts", count: statusCounts.draft }
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={selectedStatus === key ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilter(key)}
              className="h-8"
            >
              {label} ({count})
            </Button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Sort by:
          </span>
          {[
            { key: "title", label: "Title" },
            { key: "updatedAt", label: "Updated" },
            { key: "publishedAt", label: "Published" }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={sortField === key ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort(key)}
              className="h-8"
            >
              {label}
              {sortField === key &&
                (sortDirection === "asc" ? (
                  <SortAsc className="h-3 w-3 ml-1" />
                ) : (
                  <SortDesc className="h-3 w-3 ml-1" />
                ))}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
