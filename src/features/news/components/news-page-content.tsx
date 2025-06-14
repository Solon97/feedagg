"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useCurrentUser } from "@/src/features/auth/hooks/use-current-user";
import { useFeedContent } from "@/src/features/news/hooks/use-feed-content";
import { useSaveContent } from "@/src/features/news/hooks/use-save-content";
import { useContentSources } from "@/src/features/content-sources/hooks/use-content-sources";
import { useBookmarkManager } from "../hooks/use-bookmark-manager";
import { useNewsFilters } from "../hooks/use-news-filters";
import { useDebounce } from "../hooks/use-debounce";
import { NewsHeader } from "./news-header";
import { NewsSearchBar } from "./news-search-bar";
import { NewsFilters } from "./news-filters";
import { NewsContentGrid } from "./news-content-grid";
import { NewsContentDetail } from "./news-content-detail";
import type { ContentItemEntity } from "@/src/core/entities/content-item.entity";

export function NewsPageContent() {
  const [selectedContent, setSelectedContent] =
    useState<ContentItemEntity | null>(null);

  const { user } = useCurrentUser();
  const {
    contentItems,
    isLoading,
    error,
    updateFilters: updateHookFilters,
    refreshContent,
    hasMore,
    loadMore,
  } = useFeedContent(user?.id);

  const { contentSources } = useContentSources(user?.id || "");
  const { toggleSave, getSavedContentByItemId } = useSaveContent();

  // Ensure contentItems is always an array
  const safeContentItems = Array.isArray(contentItems) ? contentItems : [];

  // Custom hooks for state management
  const { bookmarkStates, handleBookmarkToggle } = useBookmarkManager({
    user,
    contentItems: safeContentItems,
    getSavedContentByItemId,
    toggleSave,
  });

  const {
    filters,
    showFilters,
    setShowFilters,
    filteredAndSortedContent,
    hasActiveFilters,
    availableTypes,
    availableSources,
    availableCategories,
    setFilters,
    clearFilters,
    removeFilter,
  } = useNewsFilters({
    contentSources,
    safeContentItems,
  });

  const debouncedSearchQuery = useDebounce(filters.searchQuery, 500);

  // Update feed content hook filters when our filters change
  useEffect(() => {
    updateHookFilters({
      contentTypes: filters.contentTypes,
      sources: filters.sources,
      categories: filters.categories,
      searchQuery: debouncedSearchQuery,
      sortBy: filters.sortBy,
    });
  }, [
    filters.contentTypes,
    filters.sources,
    filters.categories,
    debouncedSearchQuery,
    filters.sortBy,
    updateHookFilters,
  ]);

  // Handle content selection
  const handleContentSelect = (item: ContentItemEntity) => {
    setSelectedContent(item);
  };

  const handleBackToList = () => {
    setSelectedContent(null);
  };

  const handleFiltersChange = (updates: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  // Detail view component
  if (selectedContent) {
    return (
      <NewsContentDetail
        content={selectedContent}
        isBookmarked={bookmarkStates.get(selectedContent.id)?.isSaved || false}
        onBookmarkToggle={handleBookmarkToggle}
        onBack={handleBackToList}
      />
    );
  }

  // Main list view
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="px-4 md:px-6 py-4 md:py-8 max-w-7xl mx-auto">
        {/* Header */}
        <NewsHeader onRefresh={refreshContent} isLoading={isLoading} />

        {/* Search and Filters */}
        <div className="space-y-4 mb-6 sm:mb-8">
          <NewsSearchBar
            searchQuery={filters.searchQuery}
            sortBy={filters.sortBy}
            onSearchChange={(query) =>
              handleFiltersChange({ searchQuery: query })
            }
            onSortChange={(sortBy) => handleFiltersChange({ sortBy })}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            hasActiveFilters={Boolean(hasActiveFilters)}
            activeFilterCount={
              filters.contentTypes.length +
              filters.sources.length +
              filters.categories.length +
              (filters.searchQuery ? 1 : 0)
            }
            onRefresh={refreshContent}
            isLoading={isLoading}
          />

          {/* Filter Panel */}
          {showFilters && (
            <NewsFilters
              filters={filters}
              availableTypes={availableTypes}
              availableSources={availableSources}
              availableCategories={availableCategories}
              onFiltersChange={handleFiltersChange}
              onClearFilters={clearFilters}
              onRemoveFilter={removeFilter}
              hasActiveFilters={Boolean(hasActiveFilters)}
            />
          )}
        </div>

        {/* Content Grid */}
        <NewsContentGrid
          contentItems={filteredAndSortedContent}
          bookmarkStates={bookmarkStates}
          onBookmarkToggle={handleBookmarkToggle}
          onContentSelect={handleContentSelect}
          isLoading={isLoading}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          hasActiveFilters={Boolean(hasActiveFilters)}
          onClearFilters={clearFilters}
          onRefresh={refreshContent}
        />
      </main>
    </div>
  );
}
