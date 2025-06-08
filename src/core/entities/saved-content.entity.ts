// Saved Content Entity - User bookmarks
export interface SavedContentEntity {
  readonly id: string;
  readonly userId: string;
  readonly contentItemId: string;
  readonly isRead: boolean;
  readonly isFavorite: boolean;
  readonly notes: string | null;
  readonly tags: readonly string[];
  readonly savedAt: Date;
  readonly readAt: Date | null;
}

export interface CreateSavedContentParams {
  readonly contentItemId: string;
  readonly notes?: string;
  readonly tags?: string[];
}

export interface UpdateSavedContentParams {
  readonly isRead?: boolean;
  readonly isFavorite?: boolean;
  readonly notes?: string;
  readonly tags?: string[];
}

// Saved Content factory with validation
export class SavedContent {
  static create(
    params: CreateSavedContentParams & { id: string; userId: string }
  ): SavedContentEntity {
    const cleanTags = params.tags ? this.cleanTags(params.tags) : [];

    return {
      id: params.id,
      userId: params.userId,
      contentItemId: params.contentItemId,
      isRead: false,
      isFavorite: false,
      notes: params.notes || null,
      tags: cleanTags,
      savedAt: new Date(),
      readAt: null,
    };
  }

  static update(
    savedContent: SavedContentEntity,
    params: UpdateSavedContentParams
  ): SavedContentEntity {
    const cleanTags = params.tags
      ? this.cleanTags(params.tags)
      : savedContent.tags;

    return {
      ...savedContent,
      ...params,
      tags: cleanTags,
      readAt:
        params.isRead === true && !savedContent.isRead
          ? new Date()
          : savedContent.readAt,
    };
  }

  static markAsRead(savedContent: SavedContentEntity): SavedContentEntity {
    if (savedContent.isRead) return savedContent;

    return {
      ...savedContent,
      isRead: true,
      readAt: new Date(),
    };
  }

  static toggleFavorite(savedContent: SavedContentEntity): SavedContentEntity {
    return {
      ...savedContent,
      isFavorite: !savedContent.isFavorite,
    };
  }

  private static cleanTags(tags: string[]): readonly string[] {
    return tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
  }
}
