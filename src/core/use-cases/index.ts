// Use Cases Index - Centralized exports for all use cases
export { UserUseCases } from "./user.use-cases";
export { ContentSourceUseCases } from "./content-source.use-cases";
export { ContentItemUseCases } from "./content-item.use-cases";
export { SavedContentUseCases } from "./saved-content.use-cases";
export { UrlValidationUseCases } from "./url-validation.use-cases";

// Use case factory for dependency injection
import { UserUseCases } from "./user.use-cases";
import { ContentSourceUseCases } from "./content-source.use-cases";
import { ContentItemUseCases } from "./content-item.use-cases";
import { SavedContentUseCases } from "./saved-content.use-cases";
import { UrlValidationUseCases } from "./url-validation.use-cases";

import { UserRepository } from "../repositories/user.repository";
import { ContentSourceRepository } from "../repositories/content-source.repository";
import { ContentItemRepository } from "../repositories/content-item.repository";
import { SavedContentRepository } from "../repositories/saved-content.repository";

export interface UseCaseDependencies {
  userRepository: UserRepository;
  contentSourceRepository: ContentSourceRepository;
  contentItemRepository: ContentItemRepository;
  savedContentRepository: SavedContentRepository;
}

export class UseCaseFactory {
  private userUseCases: UserUseCases;
  private contentSourceUseCases: ContentSourceUseCases;
  private contentItemUseCases: ContentItemUseCases;
  private savedContentUseCases: SavedContentUseCases;
  private urlValidationUseCases: UrlValidationUseCases;

  constructor(dependencies: UseCaseDependencies) {
    this.userUseCases = new UserUseCases(dependencies.userRepository);
    this.contentSourceUseCases = new ContentSourceUseCases(
      dependencies.contentSourceRepository
    );
    this.contentItemUseCases = new ContentItemUseCases(
      dependencies.contentItemRepository
    );
    this.savedContentUseCases = new SavedContentUseCases(
      dependencies.savedContentRepository,
      dependencies.contentItemRepository
    );
    this.urlValidationUseCases = new UrlValidationUseCases();
  }

  getUserUseCases(): UserUseCases {
    return this.userUseCases;
  }

  getContentSourceUseCases(): ContentSourceUseCases {
    return this.contentSourceUseCases;
  }

  getContentItemUseCases(): ContentItemUseCases {
    return this.contentItemUseCases;
  }

  getSavedContentUseCases(): SavedContentUseCases {
    return this.savedContentUseCases;
  }

  getUrlValidationUseCases(): UrlValidationUseCases {
    return this.urlValidationUseCases;
  }
}
