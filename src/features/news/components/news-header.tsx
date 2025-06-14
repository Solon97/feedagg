import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { NewsHeaderProps } from "../types/news.types";

export function NewsHeader({ onRefresh, isLoading }: NewsHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">News</h1>
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        Stay updated with the latest content from your subscribed feeds
      </p>
    </div>
  );
}
