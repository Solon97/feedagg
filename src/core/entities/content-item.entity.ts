// Content Item Entity - Individual articles/posts
export interface ContentItemEntity {
  readonly id: string;
  readonly sourceId: string;
  readonly title: string;
  readonly content: string | null;
  readonly excerpt: string | null;
  readonly url: string;
  readonly author: string | null;
  readonly publishedAt: Date;
  readonly imageUrl: string | null;
  readonly contentHash: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
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
}

export interface UpdateContentItemParams {
  readonly title?: string;
  readonly content?: string;
  readonly excerpt?: string;
  readonly author?: string;
  readonly imageUrl?: string;
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

    return {
      id: params.id,
      sourceId: params.sourceId,
      title: params.title.trim(),
      content: params.content || null,
      excerpt: params.excerpt || null,
      url: params.url,
      author: params.author || null,
      publishedAt: params.publishedAt,
      imageUrl: params.imageUrl || null,
      contentHash,
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

    return {
      ...item,
      ...params,
      title: params.title ? params.title.trim() : item.title,
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
