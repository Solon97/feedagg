// Feed Source Entity - Global feed sources (one per unique URL)
export interface FeedSourceEntity {
  readonly id: string;
  readonly url: string;
  readonly sourceType: "rss" | "website" | "youtube" | "twitter" | "newsletter";
  readonly lastFetchedAt: Date | null;
  readonly fetchFrequency: number; // in seconds
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateFeedSourceParams {
  readonly url: string;
  readonly sourceType?:
    | "rss"
    | "website"
    | "youtube"
    | "twitter"
    | "newsletter";
  readonly fetchFrequency?: number;
}

export interface UpdateFeedSourceParams {
  readonly lastFetchedAt?: Date;
  readonly fetchFrequency?: number;
  readonly sourceType?:
    | "rss"
    | "website"
    | "youtube"
    | "twitter"
    | "newsletter";
}

// Feed Source factory with validation
export class FeedSource {
  static create(
    params: CreateFeedSourceParams & { id: string }
  ): FeedSourceEntity {
    if (!this.isValidUrl(params.url)) {
      throw new Error("Invalid URL format");
    }

    return {
      id: params.id,
      url: params.url.trim(),
      sourceType: params.sourceType || "rss",
      lastFetchedAt: null,
      fetchFrequency: params.fetchFrequency || 3600, // Default 1 hour
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static update(
    existing: FeedSourceEntity,
    params: UpdateFeedSourceParams
  ): FeedSourceEntity {
    return {
      ...existing,
      ...params,
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

  static detectSourceType(
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

    // Default to RSS for most cases, can be refined later
    return "rss";
  }
}
