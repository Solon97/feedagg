// Content Source Entity - BACKWARD COMPATIBILITY LAYER
// This is now an alias for CombinedFeedEntity to maintain existing API compatibility
// while using the new optimized architecture under the hood

import type {
  CombinedFeedEntity,
  CreateCombinedFeedParams,
  UpdateCombinedFeedParams,
} from "./combined-feed.entity";

// Alias for backward compatibility
export type ContentSourceEntity = CombinedFeedEntity & {
  // Map the field names for compatibility
  readonly type: "rss" | "website" | "youtube" | "twitter" | "newsletter"; // alias for sourceType
};

export interface CreateContentSourceParams extends CreateCombinedFeedParams {
  readonly fetchFrequency?: number;
}

export interface UpdateContentSourceParams extends UpdateCombinedFeedParams {
  readonly url?: string; // Note: URL changes are not supported in new architecture
  readonly fetchFrequency?: number; // Note: This is managed globally now
}

// Content Source factory - compatibility layer over new architecture
export class ContentSource {
  static create(
    params: CreateContentSourceParams & { id: string; userId: string }
  ): ContentSourceEntity {
    if (!this.isValidUrl(params.url)) {
      throw new Error("Invalid URL format");
    }

    if (!params.name.trim()) {
      throw new Error("Name is required");
    }

    // This will be handled by the repository layer which creates both entities
    const sourceType = this.detectSourceType(params.url);

    return {
      id: params.id,
      userId: params.userId,
      feedSourceId: "", // Will be set by repository
      name: params.name.trim(),
      type: sourceType, // For backward compatibility
      sourceType, // New field
      url: params.url,
      description: params.description || null,
      category: params.category || null,
      isActive: params.isActive ?? true,
      lastFetchedAt: null,
      fetchFrequency: params.fetchFrequency || 3600, // 1 hour default
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static update(
    source: ContentSourceEntity,
    params: UpdateContentSourceParams
  ): ContentSourceEntity {
    if (params.url && !this.isValidUrl(params.url)) {
      throw new Error("Invalid URL format");
    }

    if (params.name !== undefined && !params.name.trim()) {
      throw new Error("Name cannot be empty");
    }

    // Note: URL and fetchFrequency changes are ignored in new architecture
    const { url, fetchFrequency, ...allowedParams } = params;

    if (url && url !== source.url) {
      console.warn(
        "URL changes are not supported in the new architecture. URL change ignored."
      );
    }

    if (fetchFrequency && fetchFrequency !== source.fetchFrequency) {
      console.warn(
        "Fetch frequency is managed globally in the new architecture. Change ignored."
      );
    }

    return {
      ...source,
      ...allowedParams,
      name: params.name ? params.name.trim() : source.name,
      type: source.type, // Keep compatibility field
      updatedAt: new Date(),
    };
  }

  static markAsFetched(source: ContentSourceEntity): ContentSourceEntity {
    return {
      ...source,
      lastFetchedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static detectSourceType(
    url: string
  ): "rss" | "website" | "youtube" | "twitter" | "newsletter" {
    const urlLower = url.toLowerCase();

    if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
      return "youtube";
    }

    if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
      return "twitter";
    }

    if (
      urlLower.includes("/feed") ||
      urlLower.includes("/rss") ||
      urlLower.includes(".xml")
    ) {
      return "rss";
    }

    // Default to RSS for most cases
    return "rss";
  }
}
