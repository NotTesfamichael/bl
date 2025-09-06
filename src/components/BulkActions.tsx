"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Eye, EyeOff, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface BulkActionsProps {
  selectedPosts: string[];
  onSelectionChange: (postIds: string[]) => void;
  onBulkAction: (action: string, postIds: string[]) => void;
}

export function BulkActions({
  selectedPosts,
  onSelectionChange,
  onBulkAction
}: BulkActionsProps) {
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      // This would need to be passed from parent with all post IDs
      onSelectionChange([]);
    } else {
      onSelectionChange([]);
    }
  };

  const handleBulkAction = (action: string) => {
    onBulkAction(action, selectedPosts);
    setSelectAll(false);
    onSelectionChange([]);
  };

  if (selectedPosts.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
              <span className="text-sm font-medium">
                {selectedPosts.length} post
                {selectedPosts.length !== 1 ? "s" : ""} selected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("publish")}
              disabled={selectedPosts.length === 0}
            >
              <Eye className="h-4 w-4 mr-1" />
              Publish
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("unpublish")}
              disabled={selectedPosts.length === 0}
            >
              <EyeOff className="h-4 w-4 mr-1" />
              Unpublish
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("delete")}
              disabled={selectedPosts.length === 0}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction("export")}>
                  Export Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("duplicate")}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("archive")}>
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
