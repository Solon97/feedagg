"use client";

import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedItemCard } from "@/components/feed-item-card";
import { FeedFiltersComponent } from "@/components/feed-filters";
import { TopicSelection } from "@/components/topic-selection";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { useFeedItems, useFeeds } from "@/hooks/use-feeds";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";

export default function Dashboard() {
  const { t } = useLocalizedTranslations();
  // Use the hooks with stable references
  const feedItemsHook = useFeedItems();
  const feedsHook = useFeeds();

  const {
    items,
    loading,
    filterLoading,
    refreshing,
    error,
    hasMore,
    total,
    filters,
    refresh,
    loadMore,
    applyFilters,
    clearFilters,
    fetchAllItems,
    hasActiveFilters,
  } = feedItemsHook;

  const { feeds, loading: feedsLoading } = feedsHook;

  const handleLoadMore = () => {
    if (!loading && !filterLoading && !refreshing && hasMore) {
      loadMore();
    }
  };

  // Calculate the correct total to display
  const displayTotal = Math.max(total, items.length);
  const displayCount = items.length;

  // Check if any loading state is active
  const isAnyLoading = loading || filterLoading || refreshing;

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navbar />
          <div className="max-w-4xl mx-auto p-4">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-red-400 mb-4">
                {t("errors.generic")}
              </h1>
              <p className="text-gray-400 mb-6">{error}</p>
              <Button
                onClick={refresh}
                className="bg-teal-600 hover:bg-teal-700"
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("feedItems.refreshing")}
                  </>
                ) : (
                  t("common.retry")
                )}
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {t("navigation.dashboard")}
              </h1>
            </div>
            <Button
              onClick={refresh}
              disabled={isAnyLoading}
              className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto disabled:opacity-50"
            >
              {refreshing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("feedItems.refreshing")}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("common.refresh")}
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <FeedFiltersComponent
                filters={filters}
                onFiltersChange={applyFilters}
                onClearFilters={clearFilters}
                feeds={feeds}
                feedsLoading={feedsLoading}
                isFilterLoading={filterLoading}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Filter Loading Indicator */}
              {filterLoading && (
                <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                    <span className="text-sm text-gray-300">
                      {t("feedItems.loadingItems")}
                    </span>
                  </div>
                </div>
              )}

              {/* Refresh Loading Indicator */}
              {refreshing && (
                <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                    <span className="text-sm text-gray-300">
                      {t("feedItems.refreshing")}
                    </span>
                  </div>
                </div>
              )}

              {/* Show topic selection when no filters are active */}
              {!hasActiveFilters() && items.length === 0 && !isAnyLoading ? (
                <TopicSelection
                  onTopicSelect={applyFilters}
                  onContinueWithoutFilter={fetchAllItems}
                  feeds={feeds}
                />
              ) : loading && items.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                  <span className="ml-2 text-gray-400">
                    {t("feedItems.loadingItems")}
                  </span>
                </div>
              ) : items.length === 0 && !isAnyLoading ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-300 mb-2">
                    {hasActiveFilters()
                      ? t("feedItems.noItems")
                      : t("feedItems.noItems")}
                  </h2>
                  <p className="text-gray-500 mb-6">
                    {hasActiveFilters()
                      ? t("feedItems.noItemsDescription")
                      : t("feeds.noFeedsDescription")}
                  </p>
                  {hasActiveFilters() && (
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
                      disabled={isAnyLoading}
                    >
                      {t("filters.clearFilters")}
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Results Summary */}
                  {displayCount > 0 && !isAnyLoading && (
                    <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                          {t("feedItems.showingItems", {
                            count: displayCount,
                            total: displayTotal,
                          })}
                        </p>
                        {hasActiveFilters() && (
                          <Button
                            onClick={clearFilters}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-400 hover:text-white h-auto p-1"
                            disabled={isAnyLoading}
                          >
                            {t("filters.clearFilters")}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Feed Items Grid */}
                  <div className="grid gap-4 sm:gap-6">
                    {items.map((item) => (
                      <FeedItemCard key={item.id} item={item} />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && !isAnyLoading && (
                    <div className="flex justify-center mt-8">
                      <Button
                        onClick={handleLoadMore}
                        disabled={isAnyLoading}
                        variant="outline"
                        className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
                      >
                        {t("common.loadMore")}
                      </Button>
                    </div>
                  )}

                  {/* Loading More Indicator */}
                  {loading && items.length > 0 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">
                          {t("feedItems.loadingItems")}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
