import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter, FileText, Video } from "lucide-react";
import type { NewsFiltersProps } from "../types/news.types";

export function NewsFilters({
  filters,
  availableTypes,
  availableSources,
  availableCategories,
  onFiltersChange,
  onClearFilters,
  onRemoveFilter,
  hasActiveFilters,
}: NewsFiltersProps) {
  const handleContentTypeToggle = (type: string) => {
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

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ categories: newCategories });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content Types */}
        {availableTypes.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map((type) => (
                <Badge
                  key={type}
                  variant={
                    filters.contentTypes.includes(type) ? "default" : "outline"
                  }
                  className={`cursor-pointer capitalize ${
                    filters.contentTypes.includes(type)
                      ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
                      : "hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400"
                  }`}
                  onClick={() => handleContentTypeToggle(type)}
                >
                  {type === "article" ? (
                    <FileText className="h-3 w-3 mr-1" />
                  ) : (
                    <Video className="h-3 w-3 mr-1" />
                  )}
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {availableSources.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sources
            </h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableSources.map((source) => (
                <Badge
                  key={source}
                  variant={
                    filters.sources.includes(source) ? "default" : "outline"
                  }
                  className={`cursor-pointer ${
                    filters.sources.includes(source)
                      ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
                      : "hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400"
                  }`}
                  onClick={() => handleSourceToggle(source)}
                >
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {availableCategories.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categories
            </h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableCategories.map((category) => (
                <Badge
                  key={category}
                  variant={
                    filters.categories.includes(category)
                      ? "default"
                      : "outline"
                  }
                  className={`cursor-pointer ${
                    filters.categories.includes(category)
                      ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
                      : "hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400"
                  }`}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Active Filters
            </h4>
            <div className="flex flex-wrap gap-2">
              {filters.contentTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1">
                  {type === "article" ? (
                    <FileText className="h-3 w-3" />
                  ) : (
                    <Video className="h-3 w-3" />
                  )}
                  {type}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleContentTypeToggle(type)}
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
              {filters.categories.map((category) => (
                <Badge key={category} variant="secondary" className="gap-1">
                  {category}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleCategoryToggle(category)}
                  />
                </Badge>
              ))}
              {filters.searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {filters.searchQuery}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onRemoveFilter("search")}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
