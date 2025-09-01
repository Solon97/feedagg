"use client";

import { DashboardFilter } from "@/components/dashboard-filter";
import { FeedItemCard } from "@/components/feed-item-card";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { TopicSelection } from "@/components/topic-selection";
import { Button } from "@/components/ui/button";
import { DashboardProvider, useDashboard } from "@/contexts/dashboard-context";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";
import { Loader2, RefreshCw } from "lucide-react";

function DashboardContent() {
  const { t } = useLocalizedTranslations();

  // Use the dashboard context
  const {
    feeds,
    topics,
    feedItems: items,
    loading,
    feedItemsLoading,
    filterLoading,
    refreshing,
    error,
    feedItemsError,
    hasMore,
    total,
    filters,
    refresh,
    loadMore,
    applyFilters,
    clearFilters,
    fetchAllItems,
    hasActiveFilters,
    isAnyLoading,
  } = useDashboard();

  const handleLoadMore = () => {
    if (!isAnyLoading && hasMore) {
      loadMore();
    }
  };

  // Calculate the correct total to display
  const displayTotal = Math.max(total, items.length);
  const displayCount = items.length;

  if (error || feedItemsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              {t("errors.generic")}
            </h1>
            <p className="text-gray-400 mb-6">{error || feedItemsError}</p>
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-2 py-3 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2"></h1>
          <Button
            onClick={refresh}
            disabled={isAnyLoading}
            className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto disabled:opacity-50 text-base sm:text-sm py-2 sm:py-1"
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

        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 mb-4 lg:mb-0">
            <DashboardFilter
              filters={filters}
              onFiltersChange={applyFilters}
              onClearFilters={clearFilters}
              feeds={feeds}
              feedsLoading={loading}
              isFilterLoading={filterLoading}
              topics={topics}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filter Loading Indicator */}
            {filterLoading && (
              <div className="mb-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                <span className="text-sm text-gray-300">
                  {t("feedItems.loadingItems")}
                </span>
              </div>
            )}

            {/* Refresh Loading Indicator */}
            {refreshing && (
              <div className="mb-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                <span className="text-sm text-gray-300">
                  {t("feedItems.refreshing")}
                </span>
              </div>
            )}

            {/* Show topic selection when no filters are active */}
            {!hasActiveFilters() && items.length === 0 && !isAnyLoading ? (
              <TopicSelection
                onTopicSelect={applyFilters}
                onContinueWithoutFilter={fetchAllItems}
                feeds={feeds}
                topics={topics}
                topicsLoading={loading}
              />
            ) : (loading || feedItemsLoading) && items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                <span className="text-base text-gray-400">
                  {t("feedItems.loadingItems")}
                </span>
              </div>
            ) : items.length === 0 && !isAnyLoading ? (
              <div className="text-center py-12">
                <h2 className="text-lg font-semibold text-gray-300 mb-2">
                  {hasActiveFilters()
                    ? t("feedItems.noItems")
                    : t("feedItems.noItems")}
                </h2>
                <p className="text-gray-500 mb-6 text-sm">
                  {hasActiveFilters()
                    ? t("feedItems.noItemsDescription")
                    : t("feeds.noFeedsDescription")}
                </p>
                {hasActiveFilters() && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent text-sm px-4 py-2"
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
                  <div className="mb-3 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-xs sm:text-sm text-gray-400">
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
                <div className="flex flex-col gap-4 sm:gap-6">
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
                      className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent text-base px-6 py-2"
                    >
                      {t("common.loadMore")}
                    </Button>
                  </div>
                )}

                {/* Loading More Indicator */}
                {(loading || feedItemsLoading) && items.length > 0 && (
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
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </ProtectedRoute>
  );
}
