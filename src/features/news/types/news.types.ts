// Types for News feature
import { ContentItemEntity } from "@/src/core/entities/content-item.entity";

export interface SimpleFilters {
  searchQuery: string;
  contentTypes: string[];
  sources: string[];
  categories: string[];
  minReadTime?: number;
  maxReadTime?: number | null;
  sortBy: "newest" | "oldest" | "popular";
}

export interface QuickFilter {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  filter: Partial<SimpleFilters>;
  description: string;
}

export interface ReadingTimeRange {
  id: string;
  label: string;
  minTime: number;
  maxTime: number | null;
  description: string;
}

export interface BookmarkState {
  contentItemId: string;
  savedContentId: string | null;
  isSaved: boolean;
}

export interface NewsContentCardProps {
  item: ContentItemEntity;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
  onContentSelect: (item: ContentItemEntity) => void;
}

export interface NewsFiltersProps {
  filters: SimpleFilters;
  availableTypes: string[];
  availableSources: string[];
  availableCategories: string[];
  onFiltersChange: (updates: Partial<SimpleFilters>) => void;
  onClearFilters: () => void;
  onRemoveFilter: (
    type: "contentType" | "source" | "category" | "search",
    value?: string
  ) => void;
  hasActiveFilters: boolean;
}

export interface NewsHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export interface NewsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SimpleFilters["sortBy"];
  onSortChange: (sortBy: SimpleFilters["sortBy"]) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onRefresh: () => void;
  isLoading: boolean;
}
