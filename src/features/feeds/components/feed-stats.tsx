"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Rss, CheckCircle2, Settings } from "lucide-react";

interface FeedStatsData {
  totalFeeds: number;
  activeFeeds: number;
  totalItems: number;
}

interface FeedStatsProps {
  totalFeeds: number;
  activeFeeds: number;
  totalItems: number;
}

export function FeedStats({
  totalFeeds,
  activeFeeds,
  totalItems,
}: FeedStatsProps) {
  const stats = { totalFeeds, activeFeeds, totalItems };
  return (
    <div className="flex flex-col md:flex-row gap-4 mt-4 w-full">
      <Card className="flex-1">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Rss className="h-7 w-7 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-8" style={{ marginLeft: "1rem" }}>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Feeds
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalFeeds}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="h-7 w-7 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-8" style={{ marginLeft: "1rem" }}>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Feeds
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeFeeds}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Settings className="h-7 w-7 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-8" style={{ marginLeft: "1rem" }}>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Items
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalItems}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
