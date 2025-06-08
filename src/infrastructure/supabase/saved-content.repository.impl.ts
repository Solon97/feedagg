import { createClient } from "@supabase/supabase-js";
import {
  SavedContentEntity,
  CreateSavedContentParams,
  UpdateSavedContentParams,
  SavedContent,
} from "../../core/entities/saved-content.entity";
import {
  SavedContentRepository,
  FindSavedContentQuery,
} from "../../core/repositories/saved-content.repository";

interface SupabaseSavedContent {
  id: string;
  user_id: string;
  content_item_id: string;
  is_read: boolean;
  is_favorite: boolean;
  notes: string | null;
  tags: string[];
  saved_at: string;
  read_at: string | null;
}

export class SavedContentRepositoryImpl implements SavedContentRepository {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  async findById(id: string): Promise<SavedContentEntity | null> {
    const { data, error } = await this.supabase
      .from("saved_content")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to find saved content: ${error.message}`);
    }

    return this.mapToEntity(data as unknown as SupabaseSavedContent);
  }

  async findByUserId(
    userId: string,
    query?: FindSavedContentQuery
  ): Promise<SavedContentEntity[]> {
    let supabaseQuery = this.supabase
      .from("saved_content")
      .select("*")
      .eq("user_id", userId);

    // Apply filters
    if (query?.isRead !== undefined) {
      supabaseQuery = supabaseQuery.eq("is_read", query.isRead);
    }

    if (query?.isFavorite !== undefined) {
      supabaseQuery = supabaseQuery.eq("is_favorite", query.isFavorite);
    }

    if (query?.tags && query.tags.length > 0) {
      supabaseQuery = supabaseQuery.overlaps("tags", query.tags);
    }

    if (query?.searchTerm) {
      supabaseQuery = supabaseQuery.ilike("notes", `%${query.searchTerm}%`);
    }

    if (query?.savedAfter) {
      supabaseQuery = supabaseQuery.gte(
        "saved_at",
        query.savedAfter.toISOString()
      );
    }

    if (query?.savedBefore) {
      supabaseQuery = supabaseQuery.lte(
        "saved_at",
        query.savedBefore.toISOString()
      );
    }

    // Apply ordering
    const orderBy = query?.orderBy || "saved_at";
    const orderDirection = query?.orderDirection || "desc";
    supabaseQuery = supabaseQuery.order(orderBy, {
      ascending: orderDirection === "asc",
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
      throw new Error(`Failed to find saved content: ${error.message}`);
    }

    return data.map((item) =>
      this.mapToEntity(item as unknown as SupabaseSavedContent)
    );
  }

  async findByUserIdAndContentItemId(
    userId: string,
    contentItemId: string
  ): Promise<SavedContentEntity | null> {
    const { data, error } = await this.supabase
      .from("saved_content")
      .select("*")
      .eq("user_id", userId)
      .eq("content_item_id", contentItemId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to find saved content: ${error.message}`);
    }

    return this.mapToEntity(data as unknown as SupabaseSavedContent);
  }

  async create(
    params: CreateSavedContentParams & { id: string; userId: string }
  ): Promise<SavedContentEntity> {
    const savedContent = SavedContent.create(params);
    const data = this.mapToSupabase(savedContent);

    const { data: createdData, error } = await this.supabase
      .from("saved_content")
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create saved content: ${error.message}`);
    }

    return this.mapToEntity(createdData as unknown as SupabaseSavedContent);
  }

  async update(
    id: string,
    params: UpdateSavedContentParams
  ): Promise<SavedContentEntity> {
    // First get the current saved content
    const current = await this.findById(id);
    if (!current) {
      throw new Error("Saved content not found");
    }

    // Update using entity logic
    const updated = SavedContent.update(current, params);
    const data = this.mapToSupabase(updated);

    const { data: updatedData, error } = await this.supabase
      .from("saved_content")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update saved content: ${error.message}`);
    }

    return this.mapToEntity(updatedData as unknown as SupabaseSavedContent);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("saved_content")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete saved content: ${error.message}`);
    }
  }

  async markAsRead(id: string): Promise<SavedContentEntity> {
    const current = await this.findById(id);
    if (!current) {
      throw new Error("Saved content not found");
    }

    const updated = SavedContent.markAsRead(current);
    const data = this.mapToSupabase(updated);

    const { data: updatedData, error } = await this.supabase
      .from("saved_content")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to mark as read: ${error.message}`);
    }

    return this.mapToEntity(updatedData as unknown as SupabaseSavedContent);
  }

  async toggleFavorite(id: string): Promise<SavedContentEntity> {
    const current = await this.findById(id);
    if (!current) {
      throw new Error("Saved content not found");
    }

    const updated = SavedContent.toggleFavorite(current);
    const data = this.mapToSupabase(updated);

    const { data: updatedData, error } = await this.supabase
      .from("saved_content")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle favorite: ${error.message}`);
    }

    return this.mapToEntity(updatedData as unknown as SupabaseSavedContent);
  }

  async exists(userId: string, contentItemId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("saved_content")
      .select("id")
      .eq("user_id", userId)
      .eq("content_item_id", contentItemId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to check existence: ${error.message}`);
    }

    return !!data;
  }

  async count(userId: string, query?: FindSavedContentQuery): Promise<number> {
    let supabaseQuery = this.supabase
      .from("saved_content")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Apply same filters as findByUserId
    if (query?.isRead !== undefined) {
      supabaseQuery = supabaseQuery.eq("is_read", query.isRead);
    }

    if (query?.isFavorite !== undefined) {
      supabaseQuery = supabaseQuery.eq("is_favorite", query.isFavorite);
    }

    if (query?.tags && query.tags.length > 0) {
      supabaseQuery = supabaseQuery.overlaps("tags", query.tags);
    }

    if (query?.searchTerm) {
      supabaseQuery = supabaseQuery.ilike("notes", `%${query.searchTerm}%`);
    }

    if (query?.savedAfter) {
      supabaseQuery = supabaseQuery.gte(
        "saved_at",
        query.savedAfter.toISOString()
      );
    }

    if (query?.savedBefore) {
      supabaseQuery = supabaseQuery.lte(
        "saved_at",
        query.savedBefore.toISOString()
      );
    }

    const { count, error } = await supabaseQuery;

    if (error) {
      throw new Error(`Failed to count saved content: ${error.message}`);
    }

    return count || 0;
  }

  private mapToEntity(data: SupabaseSavedContent): SavedContentEntity {
    return {
      id: data.id,
      userId: data.user_id,
      contentItemId: data.content_item_id,
      isRead: data.is_read,
      isFavorite: data.is_favorite,
      notes: data.notes,
      tags: data.tags,
      savedAt: new Date(data.saved_at),
      readAt: data.read_at ? new Date(data.read_at) : null,
    };
  }

  private mapToSupabase(
    savedContent: SavedContentEntity
  ): Omit<SupabaseSavedContent, "id"> {
    return {
      user_id: savedContent.userId,
      content_item_id: savedContent.contentItemId,
      is_read: savedContent.isRead,
      is_favorite: savedContent.isFavorite,
      notes: savedContent.notes,
      tags: [...savedContent.tags],
      saved_at: savedContent.savedAt.toISOString(),
      read_at: savedContent.readAt?.toISOString() || null,
    };
  }
}
