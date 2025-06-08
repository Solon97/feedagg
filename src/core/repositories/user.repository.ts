import {
  UserEntity,
  CreateUserParams,
  UpdateUserParams,
} from "../entities/user.entity";

// Repository interface following Repository Pattern
export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(params: CreateUserParams & { id: string }): Promise<UserEntity>;
  update(id: string, params: UpdateUserParams): Promise<UserEntity>;
  delete(id: string): Promise<void>;
  exists(email: string): Promise<boolean>;
}

// Query parameters for filtering users
export interface FindUsersQuery {
  isActive?: boolean;
  digestFrequency?: string;
  limit?: number;
  offset?: number;
}
