// Infrastructure Repository Index - Centralized exports for all repository implementations
export { SupabaseUserRepository } from "./user.repository.impl";
export { ContentSourceRepositoryImpl } from "./content-source.repository.impl";
export { ContentItemRepositoryImpl } from "./content-item.repository.impl";
export { SavedContentRepositoryImpl } from "./saved-content.repository.impl";

// Repository factory for dependency injection
import { createClient } from "@supabase/supabase-js";
import { SupabaseUserRepository } from "./user.repository.impl";
import { ContentSourceRepositoryImpl } from "./content-source.repository.impl";
import { ContentItemRepositoryImpl } from "./content-item.repository.impl";
import { SavedContentRepositoryImpl } from "./saved-content.repository.impl";

import type {
  UserRepository,
  ContentSourceRepository,
  ContentItemRepository,
  SavedContentRepository,
} from "@/core/repositories";

export interface RepositoryConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export class RepositoryFactory {
  private supabase: ReturnType<typeof createClient>;
  private userRepository: UserRepository;
  private contentSourceRepository: ContentSourceRepository;
  private contentItemRepository: ContentItemRepository;
  private savedContentRepository: SavedContentRepository;

  constructor(config: RepositoryConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

    // Initialize repositories
    this.userRepository = new SupabaseUserRepository(this.supabase);
    this.contentSourceRepository = new ContentSourceRepositoryImpl(
      this.supabase
    );
    this.contentItemRepository = new ContentItemRepositoryImpl(this.supabase);
    this.savedContentRepository = new SavedContentRepositoryImpl(this.supabase);
  }

  getUserRepository(): UserRepository {
    return this.userRepository;
  }

  getContentSourceRepository(): ContentSourceRepository {
    return this.contentSourceRepository;
  }

  getContentItemRepository(): ContentItemRepository {
    return this.contentItemRepository;
  }

  getSavedContentRepository(): SavedContentRepository {
    return this.savedContentRepository;
  }

  // Get all repositories as an object for use case factory
  getAllRepositories() {
    return {
      userRepository: this.userRepository,
      contentSourceRepository: this.contentSourceRepository,
      contentItemRepository: this.contentItemRepository,
      savedContentRepository: this.savedContentRepository,
    };
  }
}
