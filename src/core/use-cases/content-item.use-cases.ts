import { ContentItemEntity } from "../entities/content-item.entity";
import {
  ContentItemRepository,
  ContentItemQuery,
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

    if (result.isFailure()) {
      throw result.error;
    }

    if (!result.value) {
      throw new NotFoundError("Content item not found");
    }

    return result.value;
  }

  async getContentItems(
    query: ContentItemQuery = {}
  ): Promise<ContentItemEntity[]> {
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

    const result = await this.contentItemRepository.findMany(query);

    if (result.isFailure()) {
      throw result.error;
    }

    return result.value;
  }

  async createContentItem(
    contentItem: ContentItemEntity
  ): Promise<ContentItemEntity> {
    // Validate content item
    if (!contentItem.title?.trim()) {
      throw new ValidationError("Content item title is required");
    }

    if (!contentItem.url?.trim()) {
      throw new ValidationError("Content item URL is required");
    }

    if (!contentItem.sourceId?.trim()) {
      throw new ValidationError("Content source ID is required");
    }

    // Check if content item with same URL already exists
    const existingResult = await this.contentItemRepository.findByUrl(
      contentItem.url
    );

    if (existingResult.isFailure()) {
      throw existingResult.error;
    }

    if (existingResult.value) {
      throw new ValidationError("Content item with this URL already exists");
    }

    // Save the content item
    const result = await this.contentItemRepository.save(contentItem);

    if (result.isFailure()) {
      throw result.error;
    }

    return result.value;
  }

  async updateContentItem(
    contentItem: ContentItemEntity
  ): Promise<ContentItemEntity> {
    // Validate content item exists
    const existingResult = await this.contentItemRepository.findById(
      contentItem.id
    );

    if (existingResult.isFailure()) {
      throw existingResult.error;
    }

    if (!existingResult.value) {
      throw new NotFoundError("Content item not found");
    }

    // Validate required fields
    if (!contentItem.title?.trim()) {
      throw new ValidationError("Content item title is required");
    }

    if (!contentItem.url?.trim()) {
      throw new ValidationError("Content item URL is required");
    }

    // Check if URL is being changed and if new URL already exists
    if (contentItem.url !== existingResult.value.url) {
      const urlCheckResult = await this.contentItemRepository.findByUrl(
        contentItem.url
      );

      if (urlCheckResult.isFailure()) {
        throw urlCheckResult.error;
      }

      if (urlCheckResult.value && urlCheckResult.value.id !== contentItem.id) {
        throw new ValidationError(
          "Another content item with this URL already exists"
        );
      }
    }

    // Save the updated content item
    const result = await this.contentItemRepository.save(contentItem);

    if (result.isFailure()) {
      throw result.error;
    }

    return result.value;
  }

  async deleteContentItem(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new ValidationError("Content item ID is required");
    }

    // Check if content item exists
    const existingResult = await this.contentItemRepository.findById(id);

    if (existingResult.isFailure()) {
      throw existingResult.error;
    }

    if (!existingResult.value) {
      throw new NotFoundError("Content item not found");
    }

    // Delete the content item
    const result = await this.contentItemRepository.delete(id);

    if (result.isFailure()) {
      throw result.error;
    }
  }

  async getContentItemsBySource(
    sourceId: string,
    limit?: number
  ): Promise<ContentItemEntity[]> {
    if (!sourceId?.trim()) {
      throw new ValidationError("Source ID is required");
    }

    const query: ContentItemQuery = {
      sourceId,
      limit: limit || 20,
      sortBy: "published_at",
      sortOrder: "desc",
    };

    return this.getContentItems(query);
  }

  async getRecentContentItems(
    limit: number = 20
  ): Promise<ContentItemEntity[]> {
    if (limit < 1 || limit > 100) {
      throw new ValidationError("Limit must be between 1 and 100");
    }

    const result = await this.contentItemRepository.findRecent(limit);

    if (result.isFailure()) {
      throw result.error;
    }

    return result.value;
  }

  async searchContentItems(
    searchTerm: string,
    options?: {
      contentType?: string;
      tags?: string[];
      sourceId?: string;
      limit?: number;
    }
  ): Promise<ContentItemEntity[]> {
    if (!searchTerm?.trim()) {
      throw new ValidationError("Search term is required");
    }

    if (searchTerm.length < 2) {
      throw new ValidationError(
        "Search term must be at least 2 characters long"
      );
    }

    const query: ContentItemQuery = {
      searchTerm: searchTerm.trim(),
      contentType: options?.contentType,
      tags: options?.tags,
      sourceId: options?.sourceId,
      limit: options?.limit || 20,
      sortBy: "published_at",
      sortOrder: "desc",
    };

    return this.getContentItems(query);
  }

  async getContentItemsByTags(
    tags: string[],
    options?: {
      limit?: number;
      sourceId?: string;
    }
  ): Promise<ContentItemEntity[]> {
    if (!tags?.length) {
      throw new ValidationError("At least one tag is required");
    }

    // Clean and validate tags
    const cleanTags = tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    if (!cleanTags.length) {
      throw new ValidationError("Valid tags are required");
    }

    const query: ContentItemQuery = {
      tags: cleanTags,
      sourceId: options?.sourceId,
      limit: options?.limit || 20,
      sortBy: "published_at",
      sortOrder: "desc",
    };

    return this.getContentItems(query);
  }

  async getContentItemsCount(sourceId?: string): Promise<number> {
    if (sourceId) {
      if (!sourceId.trim()) {
        throw new ValidationError("Source ID cannot be empty");
      }

      const result = await this.contentItemRepository.countBySource(sourceId);

      if (result.isFailure()) {
        throw result.error;
      }

      return result.value;
    }

    // For total count, we can use findMany with no limit and count the results
    // This is not the most efficient, but works for now
    const result = await this.contentItemRepository.findMany({});

    if (result.isFailure()) {
      throw result.error;
    }

    return result.value.length;
  }

  async getContentItemByUrl(url: string): Promise<ContentItemEntity | null> {
    if (!url?.trim()) {
      throw new ValidationError("URL is required");
    }

    const result = await this.contentItemRepository.findByUrl(url);

    if (result.isFailure()) {
      throw result.error;
    }

    return result.value;
  }
}
