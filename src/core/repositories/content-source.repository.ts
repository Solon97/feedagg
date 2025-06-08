import {
  ContentSourceEntity,
  CreateContentSourceParams,
  UpdateContentSourceParams,
} from "../entities/content-source.entity";
import { Result, RepositoryError } from "../errors/domain-errors";

export interface ContentSourceRepository {
  findById(id: string): Promise<Result<ContentSourceEntity | null>>;
  findByUserId(userId: string): Promise<Result<ContentSourceEntity[]>>;
  findActiveByUserId(userId: string): Promise<Result<ContentSourceEntity[]>>;
  create(
    params: CreateContentSourceParams & { id: string; userId: string }
  ): Promise<Result<ContentSourceEntity>>;
  update(
    id: string,
    params: UpdateContentSourceParams
  ): Promise<Result<ContentSourceEntity>>;
  delete(id: string): Promise<Result<void>>;
  markAsFetched(id: string): Promise<Result<ContentSourceEntity>>;
  findDueForFetch(): Promise<Result<ContentSourceEntity[]>>;
}

export interface FindContentSourcesQuery {
  userId?: string;
  isActive?: boolean;
  category?: string;
  limit?: number;
  offset?: number;
  orderBy?: "name" | "createdAt" | "lastFetched";
  orderDirection?: "asc" | "desc";
}
