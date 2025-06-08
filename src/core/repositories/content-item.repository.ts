import {
  ContentItemEntity,
  CreateContentItemParams,
  UpdateContentItemParams,
} from "../entities/content-item.entity";

export interface ContentItemRepository {
  findById(id: string): Promise<ContentItemEntity | null>;
  findBySourceId(sourceId: string): Promise<ContentItemEntity[]>;
  findByUserSources(
    userId: string,
    query?: FindContentItemsQuery
  ): Promise<ContentItemEntity[]>;
  create(
    params: CreateContentItemParams & { id: string }
  ): Promise<ContentItemEntity>;
  update(
    id: string,
    params: UpdateContentItemParams
  ): Promise<ContentItemEntity>;
  delete(id: string): Promise<void>;
  findByContentHash(hash: string): Promise<ContentItemEntity | null>;
  findRecent(userId: string, limit?: number): Promise<ContentItemEntity[]>;
  count(query?: FindContentItemsQuery): Promise<number>;
}

export interface FindContentItemsQuery {
  sourceIds?: string[];
  author?: string;
  publishedAfter?: Date;
  publishedBefore?: Date;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  orderBy?: "publishedAt" | "createdAt" | "title";
  orderDirection?: "asc" | "desc";
}
