import {
  UserRepository,
  FindUsersQuery,
} from "../../core/repositories/user.repository";
import {
  UserEntity,
  CreateUserParams,
  UpdateUserParams,
  User,
} from "../../core/entities/user.entity";
import { Database } from "../../../lib/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { ErrorFactory } from "../../core/errors/domain-errors";

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw ErrorFactory.database("findById", error.message);
      }

      return this.mapToEntity(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("findById", "Unknown error");
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw ErrorFactory.database("findByEmail", error.message);
      }

      return this.mapToEntity(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("findByEmail", "Unknown error");
    }
  }

  async create(params: CreateUserParams & { id: string }): Promise<UserEntity> {
    try {
      const entity = User.create(params);

      const { data, error } = await this.supabase
        .from("profiles")
        .insert(this.mapToDatabase(entity))
        .select()
        .single();

      if (error) {
        throw ErrorFactory.database("create", error.message);
      }

      return this.mapToEntity(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("create", "Unknown error");
    }
  }

  async update(id: string, params: UpdateUserParams): Promise<UserEntity> {
    try {
      const existing = await this.findById(id);
      if (!existing) {
        throw ErrorFactory.notFound("User", id);
      }

      const updatedEntity = User.update(existing, params);

      const { data, error } = await this.supabase
        .from("profiles")
        .update(this.mapToDatabase(updatedEntity))
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw ErrorFactory.database("update", error.message);
      }

      return this.mapToEntity(data);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("update", "Unknown error");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("profiles")
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

  async exists(email: string): Promise<boolean> {
    try {
      const user = await this.findByEmail(email);
      return user !== null;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw ErrorFactory.database("exists", "Unknown error");
    }
  }

  private mapToEntity(
    data: Database["public"]["Tables"]["profiles"]["Row"]
  ): UserEntity {
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      digestFrequency: data.digest_frequency as "daily" | "weekly" | "monthly",
      digestTime: data.digest_time,
      timezone: data.timezone,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToDatabase(
    entity: UserEntity
  ): Database["public"]["Tables"]["profiles"]["Insert"] {
    return {
      id: entity.id,
      email: entity.email,
      full_name: entity.fullName,
      avatar_url: entity.avatarUrl,
      digest_frequency: entity.digestFrequency,
      digest_time: entity.digestTime,
      timezone: entity.timezone,
      is_active: entity.isActive,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
    };
  }
}
