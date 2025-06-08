import { createClient } from "@supabase/supabase-js";
import { ContentItem } from "../../core/entities/content-item.entity";
import {
  ContentItemRepository,
  ContentItemQuery,
} from "../../core/repositories/content-item.repository";
import {
  Result,
  ResultFactory,
  RepositoryError,
  NotFoundError,
} from "../../core/errors/domain-errors";

interface SupabaseContentItem {
  id: string;
  source_id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  author: string | null;
  published_at: string;
  content_type: "article" | "video" | "podcast" | "other";
  reading_time: number | null;
  tags: string[];
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export class ContentItemRepositoryImpl implements ContentItemRepository {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  async findById(
    id: string
  ): Promise<Result<ContentItem | null, RepositoryError>> {
    try {
      const { data, error } = await this.supabase
        .from("content_items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return ResultFactory.success(null);
        }
        return ResultFactory.failure(
          new RepositoryError(`Failed to find content item: ${error.message}`)
        );
      }

      const contentItem = this.mapToEntity(data);
      return ResultFactory.success(contentItem);
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  async findMany(
    query: ContentItemQuery
  ): Promise<Result<ContentItem[], RepositoryError>> {
    try {
      let supabaseQuery = this.supabase.from("content_items").select("*");

      // Apply filters
      if (query.sourceId) {
        supabaseQuery = supabaseQuery.eq("source_id", query.sourceId);
      }

      if (query.contentType) {
        supabaseQuery = supabaseQuery.eq("content_type", query.contentType);
      }

      if (query.tags && query.tags.length > 0) {
        supabaseQuery = supabaseQuery.overlaps("tags", query.tags);
      }

      if (query.publishedAfter) {
        supabaseQuery = supabaseQuery.gte(
          "published_at",
          query.publishedAfter.toISOString()
        );
      }

      if (query.publishedBefore) {
        supabaseQuery = supabaseQuery.lte(
          "published_at",
          query.publishedBefore.toISOString()
        );
      }

      if (query.searchTerm) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query.searchTerm}%,description.ilike.%${query.searchTerm}%,author.ilike.%${query.searchTerm}%`
        );
      }

      // Apply sorting
      const sortColumn = query.sortBy || "published_at";
      const sortOrder = query.sortOrder || "desc";
      supabaseQuery = supabaseQuery.order(sortColumn, {
        ascending: sortOrder === "asc",
      });

      // Apply pagination
      if (query.limit) {
        supabaseQuery = supabaseQuery.limit(query.limit);
      }

      if (query.offset) {
        supabaseQuery = supabaseQuery.range(
          query.offset,
          query.offset + (query.limit || 50) - 1
        );
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        return ResultFactory.failure(
          new RepositoryError(`Failed to find content items: ${error.message}`)
        );
      }

      const contentItems = data.map((item) => this.mapToEntity(item));
      return ResultFactory.success(contentItems);
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  async save(
    contentItem: ContentItem
  ): Promise<Result<ContentItem, RepositoryError>> {
    try {
      const data = this.mapToSupabase(contentItem);

      const { data: savedData, error } = await this.supabase
        .from("content_items")
        .upsert(data)
        .select()
        .single();

      if (error) {
        return ResultFactory.failure(
          new RepositoryError(`Failed to save content item: ${error.message}`)
        );
      }

      const savedContentItem = this.mapToEntity(savedData);
      return ResultFactory.success(savedContentItem);
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  async delete(id: string): Promise<Result<void, RepositoryError>> {
    try {
      const { error } = await this.supabase
        .from("content_items")
        .delete()
        .eq("id", id);

      if (error) {
        return ResultFactory.failure(
          new RepositoryError(`Failed to delete content item: ${error.message}`)
        );
      }

      return ResultFactory.success(undefined);
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  async countBySource(
    sourceId: string
  ): Promise<Result<number, RepositoryError>> {
    try {
      const { count, error } = await this.supabase
        .from("content_items")
        .select("*", { count: "exact", head: true })
        .eq("source_id", sourceId);

      if (error) {
        return ResultFactory.failure(
          new RepositoryError(`Failed to count content items: ${error.message}`)
        );
      }

      return ResultFactory.success(count || 0);
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  async findByUrl(
    url: string
  ): Promise<Result<ContentItem | null, RepositoryError>> {
    try {
      const { data, error } = await this.supabase
        .from("content_items")
        .select("*")
        .eq("url", url)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return ResultFactory.success(null);
        }
        return ResultFactory.failure(
          new RepositoryError(
            `Failed to find content item by URL: ${error.message}`
          )
        );
      }

      const contentItem = this.mapToEntity(data);
      return ResultFactory.success(contentItem);
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  async findRecent(
    limit: number = 20
  ): Promise<Result<ContentItem[], RepositoryError>> {
    try {
      const { data, error } = await this.supabase
        .from("content_items")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) {
        return ResultFactory.failure(
          new RepositoryError(
            `Failed to find recent content items: ${error.message}`
          )
        );
      }

      const contentItems = data.map((item) => this.mapToEntity(item));
      return ResultFactory.success(contentItems);
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  private mapToEntity(data: SupabaseContentItem): ContentItem {
    const result = ContentItem.create({
      id: data.id,
      sourceId: data.source_id,
      title: data.title,
      description: data.description,
      url: data.url,
      imageUrl: data.image_url,
      author: data.author,
      publishedAt: new Date(data.published_at),
      contentType: data.content_type,
      readingTime: data.reading_time,
      tags: data.tags,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });

    if (result.isFailure()) {
      throw new Error(`Invalid content item data: ${result.error.message}`);
    }

    return result.value;
  }

  private mapToSupabase(
    contentItem: ContentItem
  ): Omit<SupabaseContentItem, "created_at" | "updated_at"> {
    return {
      id: contentItem.id,
      source_id: contentItem.sourceId,
      title: contentItem.title,
      description: contentItem.description,
      url: contentItem.url,
      image_url: contentItem.imageUrl,
      author: contentItem.author,
      published_at: contentItem.publishedAt.toISOString(),
      content_type: contentItem.contentType,
      reading_time: contentItem.readingTime,
      tags: contentItem.tags,
      metadata: contentItem.metadata,
    };
  }
}
