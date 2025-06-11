import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, X } from "lucide-react";

interface NewsLoadingStateProps {
  itemCount?: number;
}

export function NewsLoadingState({ itemCount = 8 }: NewsLoadingStateProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: itemCount }).map((_, i) => (
        <Card
          key={i}
          className="animate-pulse border-gray-200 dark:border-gray-700"
        >
          <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-t-lg"></div>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface NewsErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function NewsErrorState({ error, onRetry }: NewsErrorStateProps) {
  return (
    <Card className="p-6 text-center mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
      <div className="text-red-600 dark:text-red-400">
        <X className="h-12 w-12 mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Error Loading Content</h3>
        <p className="text-sm mb-4">{error}</p>
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </Card>
  );
}

interface NewsEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function NewsEmptyState({
  hasActiveFilters,
  onClearFilters,
}: NewsEmptyStateProps) {
  return (
    <Card className="p-12 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="text-gray-500 dark:text-gray-400">
        <Search className="h-16 w-16 mx-auto mb-6 text-gray-300 dark:text-gray-600" />
        <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">
          No content found
        </h3>
        {hasActiveFilters ? (
          <div className="space-y-3">
            <p className="text-gray-600 dark:text-gray-400">
              No content matches your current filters. Try adjusting your search
              criteria.
            </p>
            <Button onClick={onClearFilters} variant="outline" className="mt-4">
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Check back later for new content from your feeds.
          </p>
        )}
      </div>
    </Card>
  );
}
