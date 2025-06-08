import { ContentItemEntity } from "../entities/content-item.entity";
import {
  ContentItemRepository,
  FindContentItemsQuery,
} from "../repositories/content-item.repository";
import {
  DomainError,
  ValidationError,
  NotFoundError,
} from "../errors/domain-errors";

export class ContentItemUseCases {
  constructor(private contentItemRepository: ContentItemRepository) {}

  async getContentItemById(id: string): Promise<ContentItemEntity> {
    if (!id?.trim()) {
      throw new ValidationError("Content item ID is required");
    }

    const result = await this.contentItemRepository.findById(id);

    if (!result) {
      throw new NotFoundError("Content item not found");
    }

    return result;
  }

  async getContentItemsByUser(
    userId: string,
    query: FindContentItemsQuery = {}
  ): Promise<ContentItemEntity[]> {
    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }

    // Validate query parameters
    if (query.limit && (query.limit < 1 || query.limit > 100)) {
      throw new ValidationError("Limit must be between 1 and 100");
    }

    if (query.offset && query.offset < 0) {
      throw new ValidationError("Offset must be non-negative");
    }

    if (query.publishedAfter && query.publishedBefore) {
      if (query.publishedAfter > query.publishedBefore) {
        throw new ValidationError(
          "Published after date must be before published before date"
        );
      }
    }

    return await this.contentItemRepository.findByUserSources(userId, query);
  }

  async createContentItem(
    params: {
      sourceId: string;
      title: string;
      content?: string;
      excerpt?: string;
      url: string;
      author?: string;
      publishedAt: Date;
      imageUrl?: string;
    } & { id: string }
  ): Promise<ContentItemEntity> {
    // Validate required fields
    if (!params.title?.trim()) {
      throw new ValidationError("Content item title is required");
    }

    if (!params.url?.trim()) {
      throw new ValidationError("Content item URL is required");
    }

    if (!params.sourceId?.trim()) {
      throw new ValidationError("Content source ID is required");
    }

    return await this.contentItemRepository.create(params);
  }

  async updateContentItem(
    id: string,
    params: {
      title?: string;
      content?: string;
      excerpt?: string;
      author?: string;
      imageUrl?: string;
    }
  ): Promise<ContentItemEntity> {
    if (!id?.trim()) {
      throw new ValidationError("Content item ID is required");
    }

    // Check if content item exists
    const existing = await this.contentItemRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Content item not found");
    }

    return await this.contentItemRepository.update(id, params);
  }

  async deleteContentItem(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new ValidationError("Content item ID is required");
    }

    // Check if content item exists
    const existing = await this.contentItemRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Content item not found");
    }

    await this.contentItemRepository.delete(id);
  }

  async getContentItemsBySource(
    sourceId: string,
    limit?: number
  ): Promise<ContentItemEntity[]> {
    if (!sourceId?.trim()) {
      throw new ValidationError("Source ID is required");
    }

    if (limit && (limit < 1 || limit > 100)) {
      throw new ValidationError("Limit must be between 1 and 100");
    }

    return await this.contentItemRepository.findBySourceId(sourceId);
  }

  async getRecentContentItems(
    userId: string,
    limit: number = 20
  ): Promise<ContentItemEntity[]> {
    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }

    if (limit < 1 || limit > 100) {
      throw new ValidationError("Limit must be between 1 and 100");
    }

    return await this.contentItemRepository.findRecent(userId, limit);
  }

  async searchContentItems(
    userId: string,
    searchTerm: string,
    options?: {
      sourceIds?: string[];
      limit?: number;
    }
  ): Promise<ContentItemEntity[]> {
    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }

    if (!searchTerm?.trim()) {
      throw new ValidationError("Search term is required");
    }

    if (searchTerm.length < 2) {
      throw new ValidationError(
        "Search term must be at least 2 characters long"
      );
    }

    const query: FindContentItemsQuery = {
      searchTerm: searchTerm.trim(),
      sourceIds: options?.sourceIds,
      limit: options?.limit || 20,
      orderBy: "publishedAt",
      orderDirection: "desc",
    };

    return await this.contentItemRepository.findByUserSources(userId, query);
  }

  async getContentItemsCount(
    userId: string,
    query?: FindContentItemsQuery
  ): Promise<number> {
    if (!userId?.trim()) {
      throw new ValidationError("User ID is required");
    }

    return await this.contentItemRepository.count(query);
  }

  async getContentItemByHash(hash: string): Promise<ContentItemEntity | null> {
    if (!hash?.trim()) {
      throw new ValidationError("Content hash is required");
    }

    return await this.contentItemRepository.findByContentHash(hash);
  }
}
