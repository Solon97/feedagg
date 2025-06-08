"use client";

import { useState } from "react";
import { useSavedContent } from "../hooks/use-saved-content";
import { SavedContentEntity } from "@/core/entities/saved-content.entity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExternalLink,
  Clock,
  Calendar,
  Filter,
  Search,
  CheckCircle,
  Circle,
  Heart,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface SavedContentListProps {
  userId: string;
}

interface FilterState {
  searchTerm: string;
  isRead: boolean | undefined;
  isFavorite: boolean | undefined;
  tags: string[];
  sortBy: "savedAt" | "readAt";
  sortOrder: "asc" | "desc";
}

export function SavedContentList({ userId }: SavedContentListProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    isRead: undefined,
    isFavorite: undefined,
    tags: [],
    sortBy: "savedAt",
    sortOrder: "desc",
  });

  const [showFilters, setShowFilters] = useState(false);

  const query = {
    searchTerm: filters.searchTerm || undefined,
    isRead: filters.isRead,
    isFavorite: filters.isFavorite,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    orderBy: filters.sortBy,
    orderDirection: filters.sortOrder,
    limit: 50,
  };

  const {
    savedContent,
    isLoading,
    error,
    markAsRead,
    markAsUnread,
    toggleFavorite,
    deleteSavedContent,
    refresh,
  } = useSavedContent(userId, query);

  const handleMarkAsRead = async (id: string) => {
    const result = await markAsRead(id);
    if (result.success) {
      toast.success("Marked as read");
    } else {
      toast.error(result.error || "Failed to mark as read");
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    const result = await markAsUnread(id);
    if (result.success) {
      toast.success("Marked as unread");
    } else {
      toast.error(result.error || "Failed to mark as unread");
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const result = await toggleFavorite(id);
    if (result.success) {
      toast.success(
        result.data?.isFavorite
          ? "Added to favorites"
          : "Removed from favorites"
      );
    } else {
      toast.error(result.error || "Failed to toggle favorite");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved content?")) {
      return;
    }

    const result = await deleteSavedContent(id);
    if (result.success) {
      toast.success("Content deleted");
    } else {
      toast.error(result.error || "Failed to delete content");
    }
  };

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      isRead: undefined,
      isFavorite: undefined,
      tags: [],
      sortBy: "savedAt",
      sortOrder: "desc",
    });
  };

  const activeFilterCount = [
    filters.searchTerm,
    filters.isRead !== undefined,
    filters.isFavorite !== undefined,
    filters.tags.length > 0,
  ].filter(Boolean).length;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Error Loading Content
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={refresh} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Saved Content</h1>
          <p className="text-gray-600">
            {savedContent.length} item{savedContent.length !== 1 ? "s" : ""}{" "}
            saved
          </p>
        </div>
        <Button onClick={refresh} variant="outline" disabled={isLoading}>
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search saved content..."
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Filter Options
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  disabled={activeFilterCount === 0}
                >
                  Clear All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Read Status
                  </label>
                  <Select
                    value={
                      filters.isRead === undefined
                        ? "all"
                        : filters.isRead
                        ? "read"
                        : "unread"
                    }
                    onValueChange={(value) =>
                      updateFilters({
                        isRead: value === "all" ? undefined : value === "read",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Favorites
                  </label>
                  <Select
                    value={
                      filters.isFavorite === undefined
                        ? "all"
                        : filters.isFavorite
                        ? "favorites"
                        : "non-favorites"
                    }
                    onValueChange={(value) =>
                      updateFilters({
                        isFavorite:
                          value === "all" ? undefined : value === "favorites",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="favorites">Favorites Only</SelectItem>
                      <SelectItem value="non-favorites">
                        Non-Favorites
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Sort By
                  </label>
                  <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onValueChange={(value) => {
                      const [sortBy, sortOrder] = value.split("-") as [
                        typeof filters.sortBy,
                        typeof filters.sortOrder
                      ];
                      updateFilters({ sortBy, sortOrder });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savedAt-desc">Newest First</SelectItem>
                      <SelectItem value="savedAt-asc">Oldest First</SelectItem>
                      <SelectItem value="readAt-desc">Recently Read</SelectItem>
                      <SelectItem value="readAt-asc">
                        Least Recently Read
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : savedContent.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No saved content found</h3>
          <p className="text-gray-600">
            {activeFilterCount > 0
              ? "Try adjusting your filters to see more results."
              : "Start saving content to see it here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedContent.map((item) => (
            <SavedContentCard
              key={item.id}
              item={item}
              onMarkAsRead={() => handleMarkAsRead(item.id)}
              onMarkAsUnread={() => handleMarkAsUnread(item.id)}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SavedContentCardProps {
  item: SavedContentEntity;
  onMarkAsRead: () => void;
  onMarkAsUnread: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

function SavedContentCard({
  item,
  onMarkAsRead,
  onMarkAsUnread,
  onToggleFavorite,
  onDelete,
}: SavedContentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={item.isRead ? onMarkAsUnread : onMarkAsRead}
                className="flex-shrink-0 hover:scale-110 transition-transform"
              >
                {item.isRead ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                Content Item Title {/* TODO: Get from content item */}
              </h3>

              <button
                onClick={onToggleFavorite}
                className="flex-shrink-0 hover:scale-110 transition-transform"
              >
                <Heart
                  className={`w-5 h-5 ${
                    item.isFavorite
                      ? "text-red-500 fill-current"
                      : "text-gray-400"
                  }`}
                />
              </button>
            </div>

            {item.notes && (
              <p className="text-gray-600 mb-3 line-clamp-2">{item.notes}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Saved {new Date(item.savedAt).toLocaleDateString()}
              </div>

              {item.readAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Read {new Date(item.readAt).toLocaleDateString()}
                </div>
              )}
            </div>

            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={item.isRead ? onMarkAsUnread : onMarkAsRead}
                >
                  {item.isRead ? "Mark as Unread" : "Mark as Read"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleFavorite}>
                  {item.isFavorite
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
