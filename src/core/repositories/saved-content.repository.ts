import {
  SavedContentEntity,
  CreateSavedContentParams,
  UpdateSavedContentParams,
} from "../entities/saved-content.entity";

export interface SavedContentRepository {
  findById(id: string): Promise<SavedContentEntity | null>;
  findByUserId(
    userId: string,
    query?: FindSavedContentQuery
  ): Promise<SavedContentEntity[]>;
  findByUserIdAndContentItemId(
    userId: string,
    contentItemId: string
  ): Promise<SavedContentEntity | null>;
  create(
    params: CreateSavedContentParams & { id: string; userId: string }
  ): Promise<SavedContentEntity>;
  update(
    id: string,
    params: UpdateSavedContentParams
  ): Promise<SavedContentEntity>;
  delete(id: string): Promise<void>;
  markAsRead(id: string): Promise<SavedContentEntity>;
  toggleFavorite(id: string): Promise<SavedContentEntity>;
  exists(userId: string, contentItemId: string): Promise<boolean>;
  count(userId: string, query?: FindSavedContentQuery): Promise<number>;
}

export interface FindSavedContentQuery {
  isRead?: boolean;
  isFavorite?: boolean;
  tags?: string[];
  searchTerm?: string;
  savedAfter?: Date;
  savedBefore?: Date;
  limit?: number;
  offset?: number;
  orderBy?: "savedAt" | "readAt";
  orderDirection?: "asc" | "desc";
}
