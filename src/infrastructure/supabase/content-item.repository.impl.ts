import { createClient } from "@supabase/supabase-js";
import {
  ContentItemEntity,
  CreateContentItemParams,
  UpdateContentItemParams,
  ContentItem,
} from "../../core/entities/content-item.entity";
import {
  ContentItemRepository,
  FindContentItemsQuery,
} from "../../core/repositories/content-item.repository";
import { ErrorFactory } from "../../core/errors/domain-errors";

interface SupabaseContentItem {
  id: string;
  feed_source_id: string; // NOT NULL after migration
  title: string;
  content: string | null;
  summary: string | null;
  author: string | null;
  url: string;
  published_at: string | null;
  thumbnail_url: string | null;
  read_time_minutes: number | null;
  content_hash: string | null;
  created_at: string;
  updated_at: string;
}

export class ContentItemRepositoryImpl implements ContentItemRepository {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  async findById(id: string): Promise<ContentItemEntity | null> {
    try {
      const { data, error } = await this.supabase
        .from("content_items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw ErrorFactory.database("findById", error.message);
      }

      return this.mapToEntity(data as unknown as SupabaseContentItem);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("findById", "Unknown error");
    }
  }

  async findBySourceId(sourceId: string): Promise<ContentItemEntity[]> {
    try {
      const { data, error } = await this.supabase
        .from("content_items")
        .select("*")
        .eq("feed_source_id", sourceId)
        .order("published_at", { ascending: false });

      if (error) {
        throw ErrorFactory.database("findBySourceId", error.message);
      }

      return data.map((item) =>
        this.mapToEntity(item as unknown as SupabaseContentItem)
      );
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("findBySourceId", "Unknown error");
    }
  }

  async findByUserSources(
    userId: string,
    query?: FindContentItemsQuery
  ): Promise<ContentItemEntity[]> {
    try {
      // First get user's feed source IDs
      const { data: userSources, error: sourcesError } = await this.supabase
        .from("user_feed_subscriptions")
        .select("feed_source_id")
        .eq("user_id", userId);

      if (sourcesError) {
        throw ErrorFactory.database("findByUserSources", sourcesError.message);
      }

      const sourceIds = userSources
        .map((s) => s.feed_source_id)
        .filter(Boolean);

      if (sourceIds.length === 0) {
        return [];
      }

      let supabaseQuery = this.supabase
        .from("content_items")
        .select("*")
        .in("feed_source_id", sourceIds);

      // Apply filters
      if (query?.sourceIds && query.sourceIds.length > 0) {
        supabaseQuery = supabaseQuery.in("feed_source_id", query.sourceIds);
      }

      if (query?.author) {
        supabaseQuery = supabaseQuery.eq("author", query.author);
      }

      if (query?.publishedAfter) {
        supabaseQuery = supabaseQuery.gte(
          "published_at",
          query.publishedAfter.toISOString()
        );
      }

      if (query?.publishedBefore) {
        supabaseQuery = supabaseQuery.lte(
          "published_at",
          query.publishedBefore.toISOString()
        );
      }

      if (query?.searchTerm) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query.searchTerm}%,summary.ilike.%${query.searchTerm}%,author.ilike.%${query.searchTerm}%`
        );
      }

      // Apply sorting
      const sortColumn =
        query?.orderBy === "createdAt"
          ? "created_at"
          : query?.orderBy === "title"
          ? "title"
          : "published_at";
      const sortOrder = query?.orderDirection || "desc";
      supabaseQuery = supabaseQuery.order(sortColumn, {
        ascending: sortOrder === "asc",
      });

      // Apply pagination
      if (query?.limit) {
        supabaseQuery = supabaseQuery.limit(query.limit);
      }

      if (query?.offset) {
        supabaseQuery = supabaseQuery.range(
          query.offset,
          query.offset + (query.limit || 50) - 1
        );
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        throw ErrorFactory.database("findByUserSources", error.message);
      }

      return data.map((item) =>
        this.mapToEntity(item as unknown as SupabaseContentItem)
      );
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("findByUserSources", "Unknown error");
    }
  }

  async create(
    params: CreateContentItemParams & { id: string }
  ): Promise<ContentItemEntity> {
    try {
      const entity = ContentItem.create(params);
      const data = this.mapToSupabase(entity);

      const { data: savedData, error } = await this.supabase
        .from("content_items")
        .insert(data)
        .select()
        .single();

      if (error) {
        throw ErrorFactory.database("create", error.message);
      }

      return this.mapToEntity(savedData as unknown as SupabaseContentItem);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("create", "Unknown error");
    }
  }

  async update(
    id: string,
    params: UpdateContentItemParams
  ): Promise<ContentItemEntity> {
    try {
      const current = await this.findById(id);
      if (!current) {
        throw ErrorFactory.notFound("Content item", id);
      }

      const updated = ContentItem.update(current, params);
      const data = this.mapToSupabase(updated);

      const { data: savedData, error } = await this.supabase
        .from("content_items")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw ErrorFactory.database("update", error.message);
      }

      return this.mapToEntity(savedData as unknown as SupabaseContentItem);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("update", "Unknown error");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("content_items")
        .delete()
        .eq("id", id);

      if (error) {
        throw ErrorFactory.database("delete", error.message);
      }
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("delete", "Unknown error");
    }
  }

  async findByContentHash(hash: string): Promise<ContentItemEntity | null> {
    try {
      const { data, error } = await this.supabase
        .from("content_items")
        .select("*")
        .eq("content_hash", hash)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw ErrorFactory.database("findByContentHash", error.message);
      }

      return this.mapToEntity(data as unknown as SupabaseContentItem);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("findByContentHash", "Unknown error");
    }
  }

  async findRecent(
    userId: string,
    limit: number = 20
  ): Promise<ContentItemEntity[]> {
    try {
      // First get user's feed source IDs
      const { data: userSources, error: sourcesError } = await this.supabase
        .from("user_feed_subscriptions")
        .select("feed_source_id")
        .eq("user_id", userId);

      if (sourcesError) {
        throw ErrorFactory.database("findRecent", sourcesError.message);
      }

      const sourceIds = userSources
        .map((s) => s.feed_source_id)
        .filter(Boolean);

      if (sourceIds.length === 0) {
        return [];
      }

      const { data, error } = await this.supabase
        .from("content_items")
        .select("*")
        .in("feed_source_id", sourceIds)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw ErrorFactory.database("findRecent", error.message);
      }

      return data.map((item) =>
        this.mapToEntity(item as unknown as SupabaseContentItem)
      );
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("findRecent", "Unknown error");
    }
  }

  async count(query?: FindContentItemsQuery): Promise<number> {
    try {
      let supabaseQuery = this.supabase
        .from("content_items")
        .select("*", { count: "exact", head: true });

      // Apply same filters as findByUserSources
      if (query?.sourceIds && query.sourceIds.length > 0) {
        supabaseQuery = supabaseQuery.in("feed_source_id", query.sourceIds);
      }

      if (query?.author) {
        supabaseQuery = supabaseQuery.eq("author", query.author);
      }

      if (query?.publishedAfter) {
        supabaseQuery = supabaseQuery.gte(
          "published_at",
          query.publishedAfter.toISOString()
        );
      }

      if (query?.publishedBefore) {
        supabaseQuery = supabaseQuery.lte(
          "published_at",
          query.publishedBefore.toISOString()
        );
      }

      if (query?.searchTerm) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query.searchTerm}%,summary.ilike.%${query.searchTerm}%,author.ilike.%${query.searchTerm}%`
        );
      }

      const { count, error } = await supabaseQuery;

      if (error) {
        throw ErrorFactory.database("count", error.message);
      }

      return count || 0;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("count", "Unknown error");
    }
  }

  private mapToEntity(data: SupabaseContentItem): ContentItemEntity {
    return ContentItem.create({
      id: data.id,
      sourceId: data.feed_source_id, // Guaranteed to be non-null
      title: data.title,
      content: data.content || undefined,
      excerpt: data.summary || undefined,
      url: data.url,
      author: data.author || undefined,
      publishedAt: data.published_at ? new Date(data.published_at) : new Date(),
      imageUrl: data.thumbnail_url || undefined,
      readingTime: data.read_time_minutes || undefined,
      contentType: "article", // Default type, can be inferred from URL
      tags: [], // No tags support in database yet, defaulting to empty array
    });
  }

  private mapToSupabase(
    entity: ContentItemEntity
  ): Omit<SupabaseContentItem, "created_at" | "updated_at"> {
    return {
      id: entity.id,
      feed_source_id: entity.sourceId,
      title: entity.title,
      content: entity.content,
      summary: entity.excerpt,
      author: entity.author,
      url: entity.url,
      published_at: entity.publishedAt.toISOString(),
      thumbnail_url: entity.imageUrl,
      read_time_minutes: entity.readingTime,
      content_hash: entity.contentHash,
    };
  }
}
