"use client";

import { Button } from "@/components/ui/button";
import { Plus, Rss } from "lucide-react";
import type { UserFeedSubscription } from "@/types/api";
import Link from "next/link";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";

interface AddFeedSuggestionProps {
  feeds: UserFeedSubscription[];
}

export function AddFeedSuggestion({ feeds }: AddFeedSuggestionProps) {
  const hasInactiveFeeds = feeds.length > 0;
  const { t } = useLocalizedTranslations();

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex flex-col justify-between">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 p-3 bg-teal-500/10 rounded-full w-fit">
          <Rss className="w-8 h-8 text-teal-500" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">
          {hasInactiveFeeds
            ? t("feeds.suggestion.activateTitle")
            : t("feeds.suggestion.addFirstTitle")}
        </h3>
        <p className="text-gray-400 text-sm">
          {hasInactiveFeeds
            ? t("feeds.suggestion.activateDescription")
            : t("feeds.suggestion.addFirstDescription")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Add Feed Button */}
        <Link href="/feeds">
          <Button className="w-full bg-teal-600 hover:bg-teal-700 p-3 h-auto">
            <Plus className="w-4 h-4 mr-2" />
            {hasInactiveFeeds
              ? t("feeds.suggestion.manageFeeds")
              : t("feeds.suggestion.addFeed")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
