import { useState, useCallback, useMemo } from "react";
import type { SimpleFilters, QuickFilter } from "../types/news.types";
import { DEFAULT_FILTERS, QUICK_FILTERS } from "../constants/news.constants";

interface UseNewsFiltersProps {
  contentSources: any[];
  safeContentItems: any[];
}

export function useNewsFilters({
  contentSources,
  safeContentItems,
}: UseNewsFiltersProps) {
  const [filters, setFilters] = useState<SimpleFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique types, sources and categories for filters
  const { availableTypes, availableSources, availableCategories } =
    useMemo(() => {
      // Always show Articles and Videos options
      const types = ["article", "video"];

      // Use active feed sources and actual authors from content items
      const activeSources = Array.from(
        new Set(
          contentSources
            .filter((source) => source.isActive)
            .map((source) => source.name)
        )
      );

      // Get unique authors from actual content items (now properly populated)
      const authorsFromItems = Array.from(
        new Set(safeContentItems.map((item) => item.author).filter(Boolean))
      );

      // Combine both sources for complete list
      const allSources = Array.from(
        new Set([...activeSources, ...authorsFromItems])
      );

      // Get real categories from user's feed subscriptions
      const categories = Array.from(
        new Set(contentSources.map((source) => source.category).filter(Boolean))
      ) as string[];

      return {
        availableTypes: types,
        availableSources: allSources,
        availableCategories: categories,
      };
    }, [safeContentItems, contentSources]);

  // Check if filters are active
  const hasActiveFilters = useMemo(
    () =>
      filters.contentTypes.length > 0 ||
      filters.sources.length > 0 ||
      filters.categories.length > 0 ||
      filters.searchQuery.length > 0,
    [filters]
  );

  // Filter and sort content
  const filteredAndSortedContent = useMemo(() => {
    let filtered = [...safeContentItems];

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.excerpt?.toLowerCase().includes(query) ||
          item.author?.toLowerCase().includes(query)
      );
    }

    if (filters.contentTypes.length > 0) {
      filtered = filtered.filter((item) =>
        filters.contentTypes.includes(item.contentType)
      );
    }

    // Sources filter - simplified to use author field primarily
    if (filters.sources.length > 0) {
      filtered = filtered.filter((item) => {
        // Check if item author matches any selected source
        if (item.author && filters.sources.includes(item.author)) {
          return true;
        }
        return false;
      });
    }

    // Categories filter - this should work with the API now
    if (filters.categories.length > 0) {
      filtered = filtered.filter((item) => {
        const itemSource = contentSources.find(
          (source) => source.id === item.sourceId || source.name === item.author
        );
        return (
          itemSource &&
          itemSource.category &&
          filters.categories.includes(itemSource.category)
        );
      });
    }

    // Sort content
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "oldest":
          return (
            new Date(a.publishedAt).getTime() -
            new Date(b.publishedAt).getTime()
          );
        case "popular":
          return (b.readingTime || 0) - (a.readingTime || 0);
        case "newest":
        default:
          return (
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
          );
      }
    });

    return filtered;
  }, [safeContentItems, filters, contentSources]);

  // Quick Filter Logic Functions
  const applyQuickFilter = useCallback((quickFilter: QuickFilter) => {
    setFilters((prev) => {
      // Handle special cases
      if (quickFilter.id === "saved") {
        // For saved filter, toggle sort by newest
        return {
          ...prev,
          sortBy: prev.sortBy === "newest" ? "popular" : "newest",
        };
      }

      if (quickFilter.id === "popular") {
        // Toggle between popular and newest
        return {
          ...prev,
          sortBy: prev.sortBy === "popular" ? "newest" : "popular",
        };
      }

      // Handle content type filters with toggle behavior
      if (quickFilter.filter.contentTypes) {
        const targetType = quickFilter.filter.contentTypes[0];
        const isCurrentlyActive = prev.contentTypes.includes(targetType);

        if (isCurrentlyActive) {
          // Remove the type if it's currently active
          return {
            ...prev,
            contentTypes: prev.contentTypes.filter(
              (type) => type !== targetType
            ),
          };
        } else {
          // Add the type if it's not currently active
          return {
            ...prev,
            contentTypes: [...prev.contentTypes, targetType],
          };
        }
      }

      // Apply the filter configuration for other cases
      return {
        ...prev,
        ...quickFilter.filter,
      };
    });
  }, []);

  const isQuickFilterActive = useCallback(
    (quickFilter: QuickFilter): boolean => {
      if (quickFilter.id === "saved") {
        // Special handling for saved filter - check if we're showing saved content
        return filters.sortBy === "newest";
      }

      if (quickFilter.id === "popular") {
        return filters.sortBy === "popular";
      }

      // Check if the filter matches current filters
      if (quickFilter.filter.contentTypes) {
        return quickFilter.filter.contentTypes.every((type) =>
          filters.contentTypes.includes(type)
        );
      }

      if (quickFilter.filter.sortBy) {
        return filters.sortBy === quickFilter.filter.sortBy;
      }

      return false;
    },
    [filters]
  );

  const removeFilter = useCallback(
    (
      type: "contentType" | "source" | "category" | "search",
      value?: string
    ) => {
      setFilters((prev) => {
        switch (type) {
          case "contentType":
            return {
              ...prev,
              contentTypes: prev.contentTypes.filter((t) => t !== value),
            };
          case "source":
            return {
              ...prev,
              sources: prev.sources.filter((s) => s !== value),
            };
          case "category":
            return {
              ...prev,
              categories: prev.categories.filter((c) => c !== value),
            };
          case "search":
            return { ...prev, searchQuery: "" };
          default:
            return prev;
        }
      });
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setShowFilters(false);
  }, []);

  return {
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    filteredAndSortedContent,
    availableTypes,
    availableSources,
    availableCategories,
    hasActiveFilters,
    quickFilters: QUICK_FILTERS,
    applyQuickFilter,
    isQuickFilterActive,
    removeFilter,
    clearFilters,
  };
}
