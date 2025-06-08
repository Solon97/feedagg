import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X, Search, ChevronDown, RefreshCw } from "lucide-react";

interface FeedContentFilters {
  contentTypes: string[];
  sources: string[];
  searchQuery: string;
  sortBy: "newest" | "oldest" | "popular";
}

interface ContentFiltersProps {
  filters: FeedContentFilters;
  onFiltersChange: (filters: Partial<FeedContentFilters>) => void;
  availableTypes: string[];
  availableSources: string[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function ContentFilters({
  filters,
  onFiltersChange,
  availableTypes,
  availableSources,
  onRefresh,
  isLoading = false,
}: ContentFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.contentTypes.includes(type)
      ? filters.contentTypes.filter((t) => t !== type)
      : [...filters.contentTypes, type];

    onFiltersChange({ contentTypes: newTypes });
  };

  const handleSourceToggle = (source: string) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter((s) => s !== source)
      : [...filters.sources, source];

    onFiltersChange({ sources: newSources });
  };

  const handleSearchChange = (searchQuery: string) => {
    onFiltersChange({ searchQuery });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ sortBy: sortBy as "newest" | "oldest" | "popular" });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      contentTypes: [],
      sources: [],
      searchQuery: "",
      sortBy: "newest",
    });
  };

  const hasActiveFilters =
    filters.contentTypes.length > 0 ||
    filters.sources.length > 0 ||
    filters.searchQuery.length > 0;

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search content..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2 flex-shrink-0"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1">
                {filters.contentTypes.length + filters.sources.length}
              </Badge>
            )}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </Button>

          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex-shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          )}

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="gap-1 flex-shrink-0"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Content Types */}
            {availableTypes.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Content Types</h4>
                <div className="flex flex-wrap gap-2">
                  {availableTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={
                        filters.contentTypes.includes(type)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer capitalize"
                      onClick={() => handleTypeToggle(type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            {availableSources.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Sources</h4>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {availableSources.map((source) => (
                    <Badge
                      key={source}
                      variant={
                        filters.sources.includes(source) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => handleSourceToggle(source)}
                    >
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.contentTypes.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleTypeToggle(type)}
              />
            </Badge>
          ))}
          {filters.sources.map((source) => (
            <Badge key={source} variant="secondary" className="gap-1">
              {source}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleSourceToggle(source)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
