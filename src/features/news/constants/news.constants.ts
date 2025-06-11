import { Video, FileText, Star, TrendingUp } from "lucide-react";
import type { QuickFilter, ReadingTimeRange } from "../types/news.types";

// Quick filters configuration
export const QUICK_FILTERS: QuickFilter[] = [
  {
    id: "videos",
    label: "Videos",
    icon: Video,
    filter: { contentTypes: ["video"] },
    description: "Show only video content",
  },
  {
    id: "articles",
    label: "Articles",
    icon: FileText,
    filter: { contentTypes: ["article"] },
    description: "Show only article content",
  },
  {
    id: "saved",
    label: "Saved",
    icon: Star,
    filter: { sortBy: "newest" }, // Will be handled specially in logic
    description: "Show saved content first",
  },
  {
    id: "popular",
    label: "Popular",
    icon: TrendingUp,
    filter: { sortBy: "popular" },
    description: "Show popular content",
  },
];

// Reading time ranges configuration
export const READING_TIME_RANGES: ReadingTimeRange[] = [
  {
    id: "short",
    label: "Short",
    minTime: 0,
    maxTime: 5,
    description: "0-5 minutes",
  },
  {
    id: "medium",
    label: "Medium",
    minTime: 5,
    maxTime: 15,
    description: "5-15 minutes",
  },
  {
    id: "long",
    label: "Long",
    minTime: 15,
    maxTime: null,
    description: "15+ minutes",
  },
];

// Default filter state
export const DEFAULT_FILTERS = {
  searchQuery: "",
  contentTypes: [],
  sources: [],
  categories: [],
  sortBy: "newest" as const,
};

// YouTube URL conversion utility
export const convertYouTubeUrl = (url: string): string => {
  if (!url) return "";

  if (url.includes("youtube.com/watch")) {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get("v");
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  return url;
};
