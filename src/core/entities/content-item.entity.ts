// Content Item Entity - Individual articles/posts
export interface ContentItemEntity {
  readonly id: string;
  readonly sourceId: string;
  readonly title: string;
  readonly content: string | null;
  readonly excerpt: string | null;
  readonly description: string | null; // For UI compatibility (alias for excerpt)
  readonly url: string;
  readonly author: string | null;
  readonly publishedAt: Date;
  readonly imageUrl: string | null;
  readonly contentHash: string;
  readonly contentType:
    | "article"
    | "video"
    | "podcast"
    | "newsletter"
    | "other";
  readonly readingTime: number | null; // In minutes
  readonly tags: string[] | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  // Saved content properties for optimization
  readonly isSaved?: boolean;
  readonly savedContentId?: string | null;
}

export interface CreateContentItemParams {
  readonly sourceId: string;
  readonly title: string;
  readonly content?: string;
  readonly excerpt?: string;
  readonly url: string;
  readonly author?: string;
  readonly publishedAt: Date;
  readonly imageUrl?: string;
  readonly contentType?:
    | "article"
    | "video"
    | "podcast"
    | "newsletter"
    | "other";
  readonly readingTime?: number; // In minutes
  readonly tags?: string[];
}

export interface UpdateContentItemParams {
  readonly title?: string;
  readonly content?: string;
  readonly excerpt?: string;
  readonly author?: string;
  readonly imageUrl?: string;
  readonly contentType?:
    | "article"
    | "video"
    | "podcast"
    | "newsletter"
    | "other";
  readonly readingTime?: number;
  readonly tags?: string[];
}

// Content Item factory with validation
export class ContentItem {
  static create(
    params: CreateContentItemParams & { id: string }
  ): ContentItemEntity {
    if (!params.title.trim()) {
      throw new Error("Title is required");
    }

    if (!this.isValidUrl(params.url)) {
      throw new Error("Invalid URL format");
    }

    const contentHash = this.generateContentHash(params.url, params.title);
    const contentType = params.contentType || this.inferContentType(params.url);
    const excerpt = params.excerpt || null;

    return {
      id: params.id,
      sourceId: params.sourceId,
      title: params.title.trim(),
      content: params.content || null,
      excerpt,
      description: excerpt, // Alias for UI compatibility
      url: params.url,
      author: params.author || null,
      publishedAt: params.publishedAt,
      imageUrl: params.imageUrl || null,
      contentHash,
      contentType,
      readingTime: params.readingTime || null,
      tags: params.tags || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static update(
    item: ContentItemEntity,
    params: UpdateContentItemParams
  ): ContentItemEntity {
    if (params.title !== undefined && !params.title.trim()) {
      throw new Error("Title cannot be empty");
    }

    const updatedExcerpt =
      params.excerpt !== undefined ? params.excerpt : item.excerpt;

    return {
      ...item,
      ...params,
      title: params.title ? params.title.trim() : item.title,
      excerpt: updatedExcerpt,
      description: updatedExcerpt, // Keep description in sync with excerpt
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

  private static inferContentType(
    url: string
  ): "article" | "video" | "podcast" | "newsletter" | "other" {
    const urlLower = url.toLowerCase();

    if (
      urlLower.includes("youtube.com") ||
      urlLower.includes("youtu.be") ||
      urlLower.includes("vimeo.com")
    ) {
      return "video";
    }

    if (
      urlLower.includes("podcast") ||
      urlLower.includes("spotify.com") ||
      urlLower.includes("soundcloud.com")
    ) {
      return "podcast";
    }

    if (urlLower.includes("newsletter") || urlLower.includes("substack.com")) {
      return "newsletter";
    }

    return "article"; // Default
  }

  private static generateContentHash(url: string, title: string): string {
    // Simple hash function for duplicate detection
    const data = `${url}:${title}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}
