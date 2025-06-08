import {
  SavedContentEntity,
  CreateSavedContentParams,
  UpdateSavedContentParams,
} from "../entities/saved-content.entity";
import {
  SavedContentRepository,
  FindSavedContentQuery,
} from "../repositories/saved-content.repository";
import { ContentItemRepository } from "../repositories/content-item.repository";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../errors/domain-errors";
import { v4 as uuidv4 } from "uuid";

export class SavedContentUseCases {
  constructor(
    private savedContentRepository: SavedContentRepository,
    private contentItemRepository: ContentItemRepository
  ) {}

  async saveContent(
    userId: string,
    params: CreateSavedContentParams
  ): Promise<SavedContentEntity> {
    // Validate inputs
    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }

    if (!params.contentItemId?.trim()) {
      throw new ValidationError("Content item ID is required");
    }

    // Validate content item exists
    const contentItemResult = await this.contentItemRepository.findById(
      params.contentItemId
    );

    if (contentItemResult.isFailure()) {
      throw contentItemResult.error;
    }

    if (!contentItemResult.value) {
      throw new NotFoundError("Content item not found");
    }

    // Check if already saved
    const existingSaved =
      await this.savedContentRepository.findByUserIdAndContentItemId(
        userId,
        params.contentItemId
      );

    if (existingSaved) {
      throw new ConflictError("Content is already saved");
    }

    // Validate notes length if provided
    if (params.notes && params.notes.length > 1000) {
      throw new ValidationError("Notes cannot exceed 1000 characters");
    }

    // Validate tags if provided
    if (params.tags) {
      const invalidTags = params.tags.filter(
        (tag) => !tag.trim() || tag.length > 50
      );
      if (invalidTags.length > 0) {
        throw new ValidationError(
          "All tags must be non-empty and under 50 characters"
        );
      }

      if (params.tags.length > 10) {
        throw new ValidationError("Cannot have more than 10 tags");
      }
    }

    // Create saved content
    const savedContent = await this.savedContentRepository.create({
      id: uuidv4(),
      userId,
      ...params,
    });

    return savedContent;
  }

  async getSavedContent(
    userId: string,
    query?: FindSavedContentQuery
  ): Promise<SavedContentEntity[]> {
    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }

    // Validate query parameters
    if (query?.limit && (query.limit < 1 || query.limit > 100)) {
      throw new ValidationError("Limit must be between 1 and 100");
    }

    if (query?.offset && query.offset < 0) {
      throw new ValidationError("Offset must be non-negative");
    }

    if (query?.savedAfter && query?.savedBefore) {
      if (query.savedAfter > query.savedBefore) {
        throw new ValidationError(
          "Saved after date must be before saved before date"
        );
      }
    }

    return this.savedContentRepository.findByUserId(userId, query);
  }

  async getSavedContentById(
    id: string,
    userId: string
  ): Promise<SavedContentEntity> {
    if (!id?.trim()) {
      throw new ValidationError("Saved content ID is required");
    }

    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }

    const savedContent = await this.savedContentRepository.findById(id);

    if (!savedContent) {
      throw new NotFoundError("Saved content not found");
    }

    // Ensure user owns this saved content
    if (savedContent.userId !== userId) {
      throw new NotFoundError("Saved content not found");
    }

    return savedContent;
  }

  async updateSavedContent(
    id: string,
    userId: string,
    params: UpdateSavedContentParams
  ): Promise<SavedContentEntity> {
    if (!id?.trim()) {
      throw new ValidationError("Saved content ID is required");
    }

    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }

    // Get existing saved content and verify ownership
    const existingSaved = await this.getSavedContentById(id, userId);

    // Validate notes length if provided
    if (
      params.notes !== undefined &&
      params.notes !== null &&
      params.notes.length > 1000
    ) {
      throw new ValidationError("Notes cannot exceed 1000 characters");
    }

    // Validate tags if provided
    if (params.tags) {
      const invalidTags = params.tags.filter(
        (tag) => !tag.trim() || tag.length > 50
      );
      if (invalidTags.length > 0) {
        throw new ValidationError(
          "All tags must be non-empty and under 50 characters"
        );
      }

      if (params.tags.length > 10) {
        throw new ValidationError("Cannot have more than 10 tags");
      }
    }

    return this.savedContentRepository.update(id, params);
  }

  async deleteSavedContent(id: string, userId: string): Promise<void> {
    if (!id?.trim()) {
      throw new ValidationError("Saved content ID is required");
    }

    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }

    // Verify ownership
    await this.getSavedContentById(id, userId);

    await this.savedContentRepository.delete(id);
  }

  async markAsRead(id: string, userId: string): Promise<SavedContentEntity> {
    if (!id?.trim()) {
      throw new ValidationError("Saved content ID is required");
    }

    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }

    // Verify ownership
    await this.getSavedContentById(id, userId);

    return this.savedContentRepository.markAsRead(id);
  }

  async markAsUnread(id: string, userId: string): Promise<SavedContentEntity> {
    return this.updateSavedContent(id, userId, { isRead: false });
  }

  async toggleFavorite(
    id: string,
    userId: string
  ): Promise<SavedContentEntity> {
    if (!id?.trim()) {
      throw new ValidationError("Saved content ID is required");
    }

    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }

    // Verify ownership
    await this.getSavedContentById(id, userId);

    return this.savedContentRepository.toggleFavorite(id);
  }

  async addNotes(
    id: string,
    userId: string,
    notes: string
  ): Promise<SavedContentEntity> {
    if (!notes?.trim()) {
      throw new ValidationError("Notes cannot be empty");
    }

    return this.updateSavedContent(id, userId, { notes: notes.trim() });
  }

  async removeNotes(id: string, userId: string): Promise<SavedContentEntity> {
    return this.updateSavedContent(id, userId, { notes: null });
  }

  async addTags(
    id: string,
    userId: string,
    tags: string[]
  ): Promise<SavedContentEntity> {
    if (!tags?.length) {
      throw new ValidationError("At least one tag is required");
    }

    // Get current saved content to merge tags
    const current = await this.getSavedContentById(id, userId);
    const currentTags = Array.from(current.tags);

    // Merge and deduplicate tags
    const newTags = [...new Set([...currentTags, ...tags])];

    return this.updateSavedContent(id, userId, { tags: newTags });
  }

  async removeTags(
    id: string,
    userId: string,
    tagsToRemove: string[]
  ): Promise<SavedContentEntity> {
    if (!tagsToRemove?.length) {
      throw new ValidationError("At least one tag to remove is required");
    }

    // Get current saved content
    const current = await this.getSavedContentById(id, userId);
    const currentTags = Array.from(current.tags);

    // Remove specified tags
    const newTags = currentTags.filter((tag) => !tagsToRemove.includes(tag));

    return this.updateSavedContent(id, userId, { tags: newTags });
  }

  async getFavorites(
    userId: string,
    limit?: number
  ): Promise<SavedContentEntity[]> {
    return this.getSavedContent(userId, {
      isFavorite: true,
      limit: limit || 20,
      orderBy: "savedAt",
      orderDirection: "desc",
    });
  }

  async getUnreadContent(
    userId: string,
    limit?: number
  ): Promise<SavedContentEntity[]> {
    return this.getSavedContent(userId, {
      isRead: false,
      limit: limit || 20,
      orderBy: "savedAt",
      orderDirection: "desc",
    });
  }

  async getRecentlyRead(
    userId: string,
    limit?: number
  ): Promise<SavedContentEntity[]> {
    return this.getSavedContent(userId, {
      isRead: true,
      limit: limit || 20,
      orderBy: "readAt",
      orderDirection: "desc",
    });
  }

  async searchSavedContent(
    userId: string,
    searchTerm: string,
    options?: {
      isRead?: boolean;
      isFavorite?: boolean;
      tags?: string[];
      limit?: number;
    }
  ): Promise<SavedContentEntity[]> {
    if (!searchTerm?.trim()) {
      throw new ValidationError("Search term is required");
    }

    if (searchTerm.length < 2) {
      throw new ValidationError(
        "Search term must be at least 2 characters long"
      );
    }

    const query: FindSavedContentQuery = {
      searchTerm: searchTerm.trim(),
      isRead: options?.isRead,
      isFavorite: options?.isFavorite,
      tags: options?.tags,
      limit: options?.limit || 20,
      orderBy: "savedAt",
      orderDirection: "desc",
    };

    return this.getSavedContent(userId, query);
  }

  async getSavedContentByTags(
    userId: string,
    tags: string[],
    options?: {
      isRead?: boolean;
      isFavorite?: boolean;
      limit?: number;
    }
  ): Promise<SavedContentEntity[]> {
    if (!tags?.length) {
      throw new ValidationError("At least one tag is required");
    }

    // Clean tags
    const cleanTags = tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    if (!cleanTags.length) {
      throw new ValidationError("Valid tags are required");
    }

    const query: FindSavedContentQuery = {
      tags: cleanTags,
      isRead: options?.isRead,
      isFavorite: options?.isFavorite,
      limit: options?.limit || 20,
      orderBy: "savedAt",
      orderDirection: "desc",
    };

    return this.getSavedContent(userId, query);
  }

  async getSavedContentStats(userId: string): Promise<{
    total: number;
    unread: number;
    favorites: number;
    readToday: number;
  }> {
    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, unread, favorites, readToday] = await Promise.all([
      this.savedContentRepository.count(userId),
      this.savedContentRepository.count(userId, { isRead: false }),
      this.savedContentRepository.count(userId, { isFavorite: true }),
      this.savedContentRepository.count(userId, {
        isRead: true,
        savedAfter: today,
      }),
    ]);

    return {
      total,
      unread,
      favorites,
      readToday,
    };
  }

  async isContentSaved(
    userId: string,
    contentItemId: string
  ): Promise<boolean> {
    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }

    if (!contentItemId?.trim()) {
      throw new ValidationError("Content item ID is required");
    }

    return this.savedContentRepository.exists(userId, contentItemId);
  }
}
