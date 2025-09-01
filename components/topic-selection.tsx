"use client";

import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, ArrowRight } from "lucide-react";
import type { FeedFilters } from "@/hooks/use-feeds";
import type { UserFeedSubscription } from "@/types/api";
import { AddFeedSuggestion } from "@/components/add-feed-suggestion";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";

interface TopicSelectionProps {
  onTopicSelect: (filters: FeedFilters) => void;
  onContinueWithoutFilter: () => void;
  feeds?: UserFeedSubscription[];
  topics?: any[]; // Receive topics from parent to avoid duplicate calls
  topicsLoading?: boolean;
}

export function TopicSelection({
  onTopicSelect,
  onContinueWithoutFilter,
  feeds = [],
  topics = [],
  topicsLoading = false,
}: TopicSelectionProps) {
  const { t } = useLocalizedTranslations();

  const handleTopicClick = (topicId: string) => {
    onTopicSelect({ topic_id: topicId });
  };

  // Check if user has active feeds
  const hasActiveFeeds = feeds.some((feed) => feed.is_active);

  if (topicsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500 mb-4" />
        <p className="text-gray-400">{t("topics.loadingTopics")}</p>
      </div>
    );
  }

  // Show "Add Feeds" suggestion when user has no active feeds
  if (!hasActiveFeeds) {
    return <AddFeedSuggestion feeds={feeds} />;
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 min-h-[410px]">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 p-3 bg-teal-500/10 rounded-full w-fit">
          <TrendingUp className="w-8 h-8 text-teal-500" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">
          {t("topics.chooseInterest")}
        </h3>
        <p className="text-gray-400 text-sm">
          {t("topics.chooseInterestDescription")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topics.map((topic) => (
            <Button
              key={topic.id}
              onClick={() => handleTopicClick(topic.id)}
              variant="outline"
              className="p-3 h-auto flex items-center justify-between border-slate-600 bg-slate-800/30 hover:bg-slate-700 hover:border-teal-500 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {topic.color && (
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: topic.color }}
                  />
                )}
                <span className="text-white font-medium text-left text-sm">
                  {topic.name}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-slate-800/50 px-3 text-gray-400">
              {t("common.or")}
            </span>
          </div>
        </div>

        {/* Continue without filter */}
        <div className="text-center">
          <Button
            onClick={onContinueWithoutFilter}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-slate-700 text-sm"
          >
            {t("topics.continueWithout")}
          </Button>
        </div>
      </div>
    </div>
  );
}
