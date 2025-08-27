"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { FeedFilters } from "@/hooks/use-feeds";
import type { UserFeedSubscription } from "@/types/api";
import { useTopics } from "@/hooks/use-topics";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";

const DEBOUNCE_DELAY = 1000;

interface FeedFiltersProps {
  filters: FeedFilters;
  onFiltersChange: (filters: FeedFilters) => void;
  onClearFilters: () => void;
  feeds: UserFeedSubscription[];
  feedsLoading: boolean;
  isFilterLoading?: boolean;
}

function capitalizeFirstLetter(text?: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function DashboardFilter({
  filters,
  onFiltersChange,
  onClearFilters,
  feeds,
  feedsLoading,
  isFilterLoading = false,
}: FeedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { topics, loading: topicsLoading, fetchTopics } = useTopics();
  const { t } = useLocalizedTranslations();

  useEffect(() => {
    fetchTopics(true);
  }, [fetchTopics]);

  // Handler com debounce para o campo de título
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      onFiltersChange({
        ...filters,
        title: value || undefined,
      });
    }, DEBOUNCE_DELAY);
  };

  const handleFeedChange = (value: string) => {
    onFiltersChange({
      ...filters,
      feed_id: value === "all" ? undefined : value,
    });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      feed_type: value === "all" ? undefined : (value as "blog" | "youtube"),
    });
  };

  const handleTopicChange = (value: string) => {
    onFiltersChange({
      ...filters,
      topic_id: value === "all" ? undefined : value,
    });
  };

  const handleClear = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    onClearFilters();
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  const activeFeeds = Array.isArray(feeds)
    ? feeds.filter((sub) => sub.is_active)
    : [];

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Title Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          {t("common.search")}
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            key={filters.title || "empty"}
            placeholder={t("filters.searchPlaceholder")}
            defaultValue={filters.title || ""}
            onChange={handleTitleChange}
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Feed Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          {t("filters.source")}
        </label>
        <Select
          value={filters.feed_id || "all"}
          onValueChange={handleFeedChange}
          disabled={feedsLoading || isFilterLoading}
        >
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue
              placeholder={
                feedsLoading ? t("feeds.loadingFeeds") : t("filters.allSources")
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white hover:bg-slate-700">
              {t("filters.allSources")}
            </SelectItem>
            {activeFeeds.map((subscription) => (
              <SelectItem
                key={subscription.feed.id}
                value={subscription.feed.id}
                className="text-white hover:bg-slate-700"
              >
                {subscription.feed.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Feed Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          {t("filters.filterByType")}
        </label>
        <Select
          value={filters.feed_type || "all"}
          onValueChange={handleTypeChange}
          disabled={isFilterLoading}
        >
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder={t("filters.allTypes")} />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white hover:bg-slate-700">
              {t("filters.allTypes")}
            </SelectItem>
            <SelectItem value="blog" className="text-white hover:bg-slate-700">
              Blog
            </SelectItem>
            <SelectItem
              value="youtube"
              className="text-white hover:bg-slate-700"
            >
              YouTube
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Topic Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          {t("filters.filterByTopic")}
        </label>
        <Select
          value={filters.topic_id || "all"}
          onValueChange={handleTopicChange}
          disabled={topicsLoading || isFilterLoading}
        >
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue
              placeholder={
                topicsLoading
                  ? t("filters.loadingTopics")
                  : t("filters.allTopics")
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white hover:bg-slate-700">
              {t("filters.allTopics")}
            </SelectItem>
            {topics.map((topic) => (
              <SelectItem
                key={topic.id}
                value={topic.id}
                className="text-white hover:bg-slate-700"
              >
                <div className="flex items-center gap-2">
                  {topic.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: topic.color }}
                    />
                  )}
                  {topic.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            {t("filters.activeFilters")}
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.title && (
              <Badge
                variant="secondary"
                className="bg-teal-900/30 text-teal-400 border-teal-700/50"
              >
                {t("filters.titleLabel")}: {filters.title}
              </Badge>
            )}
            {filters.feed_id && (
              <Badge
                variant="secondary"
                className="bg-blue-900/30 text-blue-400 border-blue-700/50"
              >
                {t("filters.feedLabel")}:{" "}
                {activeFeeds.find((f) => f.feed.id === filters.feed_id)?.feed
                  .name || "Unknown"}
              </Badge>
            )}
            {filters.feed_type && (
              <Badge
                variant="secondary"
                className="bg-purple-900/30 text-purple-400 border-purple-700/50"
              >
                {t("filters.typeLabel")}:{" "}
                {capitalizeFirstLetter(filters.feed_type)}
              </Badge>
            )}
            {filters.topic_id && (
              <Badge
                variant="secondary"
                className="bg-orange-900/30 text-orange-400 border-orange-700/50"
              >
                {t("filters.topicLabel")}:{" "}
                {capitalizeFirstLetter(
                  topics.find((t) => t.id === filters.topic_id)?.name
                ) || "Unknown"}
              </Badge>
            )}
          </div>
          <Button
            onClick={handleClear}
            variant="outline"
            size="sm"
            className="w-full border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
            disabled={isFilterLoading}
          >
            {isFilterLoading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                {t("filters.clearing")}
              </>
            ) : (
              t("filters.clearAll")
            )}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block bg-slate-800/50 rounded-lg p-4 border border-slate-700 min-h-[410px]">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <h3 className="font-medium text-white">{t("filters.title")}</h3>
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-teal-900/30 text-teal-400 border-teal-700/50 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
          {isFilterLoading && (
            <Loader2 className="h-3 w-3 text-teal-500 animate-spin ml-auto" />
          )}
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
              disabled={isFilterLoading}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isFilterLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("filters.filtering")}
                </>
              ) : (
                t("filters.title")
              )}
              {activeFiltersCount > 0 && !isFilterLoading && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-teal-900/30 text-teal-400 border-teal-700/50 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-slate-900 border-slate-700 w-80"
          >
            <SheetHeader>
              <SheetTitle className="text-white flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t("filters.title")}
                {isFilterLoading && (
                  <Loader2 className="h-3 w-3 text-teal-500 animate-spin" />
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
