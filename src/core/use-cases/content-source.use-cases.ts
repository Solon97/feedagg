import { ContentSourceRepository } from "../repositories/content-source.repository";
import { UserRepository } from "../repositories/user.repository";
import {
  ContentSourceEntity,
  CreateContentSourceParams,
  UpdateContentSourceParams,
} from "../entities/content-source.entity";
import { Result, ResultFactory, ErrorFactory } from "../errors/domain-errors";

export class GetContentSourcesByUserUseCase {
  constructor(
    private readonly contentSourceRepository: ContentSourceRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(userId: string): Promise<Result<ContentSourceEntity[]>> {
    try {
      if (!userId.trim()) {
        return ResultFactory.failure(
          ErrorFactory.validation("User ID is required")
        );
      }

      // Verify user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return ResultFactory.failure(ErrorFactory.notFound("User", userId));
      }

      const sources = await this.contentSourceRepository.findByUserId(userId);
      return ResultFactory.success(sources);
    } catch (error) {
      return ResultFactory.failure(
        ErrorFactory.database(
          "findByUserId",
          error instanceof Error ? error.message : "Unknown error",
          error instanceof Error ? error : undefined
        )
      );
    }
  }
}

export class GetActiveContentSourcesByUserUseCase {
  constructor(
    private readonly contentSourceRepository: ContentSourceRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(userId: string): Promise<Result<ContentSourceEntity[]>> {
    try {
      if (!userId.trim()) {
        return ResultFactory.failure(
          ErrorFactory.validation("User ID is required")
        );
      }

      // Verify user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return ResultFactory.failure(ErrorFactory.notFound("User", userId));
      }

      const sources = await this.contentSourceRepository.findActiveByUserId(
        userId
      );
      return ResultFactory.success(sources);
    } catch (error) {
      return ResultFactory.failure(
        ErrorFactory.database(
          "findActiveByUserId",
          error instanceof Error ? error.message : "Unknown error",
          error instanceof Error ? error : undefined
        )
      );
    }
  }
}

export class CreateContentSourceUseCase {
  constructor(
    private readonly contentSourceRepository: ContentSourceRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    userId: string,
    params: CreateContentSourceParams
  ): Promise<Result<ContentSourceEntity>> {
    try {
      if (!userId.trim()) {
        return ResultFactory.failure(
          ErrorFactory.validation("User ID is required")
        );
      }

      // Verify user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return ResultFactory.failure(ErrorFactory.notFound("User", userId));
      }

      // Generate unique ID (in real implementation, this would be handled by the repository)
      const id = crypto.randomUUID();

      const source = await this.contentSourceRepository.create({
        ...params,
        id,
        userId,
      });

      return ResultFactory.success(source);
    } catch (error) {
      return ResultFactory.failure(
        ErrorFactory.database(
          "create",
          error instanceof Error ? error.message : "Unknown error",
          error instanceof Error ? error : undefined
        )
      );
    }
  }
}

export class UpdateContentSourceUseCase {
  constructor(
    private readonly contentSourceRepository: ContentSourceRepository
  ) {}

  async execute(
    id: string,
    params: UpdateContentSourceParams
  ): Promise<Result<ContentSourceEntity>> {
    try {
      if (!id.trim()) {
        return ResultFactory.failure(
          ErrorFactory.validation("Content Source ID is required")
        );
      }

      // Check if source exists
      const existingSource = await this.contentSourceRepository.findById(id);
      if (!existingSource) {
        return ResultFactory.failure(
          ErrorFactory.notFound("Content Source", id)
        );
      }

      const updatedSource = await this.contentSourceRepository.update(
        id,
        params
      );
      return ResultFactory.success(updatedSource);
    } catch (error) {
      return ResultFactory.failure(
        ErrorFactory.database(
          "update",
          error instanceof Error ? error.message : "Unknown error",
          error instanceof Error ? error : undefined
        )
      );
    }
  }
}

export class DeleteContentSourceUseCase {
  constructor(
    private readonly contentSourceRepository: ContentSourceRepository
  ) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      if (!id.trim()) {
        return ResultFactory.failure(
          ErrorFactory.validation("Content Source ID is required")
        );
      }

      // Check if source exists
      const existingSource = await this.contentSourceRepository.findById(id);
      if (!existingSource) {
        return ResultFactory.failure(
          ErrorFactory.notFound("Content Source", id)
        );
      }

      await this.contentSourceRepository.delete(id);
      return ResultFactory.success(undefined);
    } catch (error) {
      return ResultFactory.failure(
        ErrorFactory.database(
          "delete",
          error instanceof Error ? error.message : "Unknown error",
          error instanceof Error ? error : undefined
        )
      );
    }
  }
}

// Aggregator class for all content source use cases
export class ContentSourceUseCases {
  private getContentSourcesByUserUseCase: GetContentSourcesByUserUseCase;
  private getActiveContentSourcesByUserUseCase: GetActiveContentSourcesByUserUseCase;
  private createContentSourceUseCase: CreateContentSourceUseCase;
  private updateContentSourceUseCase: UpdateContentSourceUseCase;
  private deleteContentSourceUseCase: DeleteContentSourceUseCase;

  constructor(
    contentSourceRepository: ContentSourceRepository,
    userRepository: UserRepository
  ) {
    this.getContentSourcesByUserUseCase = new GetContentSourcesByUserUseCase(
      contentSourceRepository,
      userRepository
    );
    this.getActiveContentSourcesByUserUseCase =
      new GetActiveContentSourcesByUserUseCase(
        contentSourceRepository,
        userRepository
      );
    this.createContentSourceUseCase = new CreateContentSourceUseCase(
      contentSourceRepository,
      userRepository
    );
    this.updateContentSourceUseCase = new UpdateContentSourceUseCase(
      contentSourceRepository
    );
    this.deleteContentSourceUseCase = new DeleteContentSourceUseCase(
      contentSourceRepository
    );
  }

  async getContentSourcesByUser(
    userId: string
  ): Promise<Result<ContentSourceEntity[]>> {
    return this.getContentSourcesByUserUseCase.execute(userId);
  }

  async getActiveContentSourcesByUser(
    userId: string
  ): Promise<Result<ContentSourceEntity[]>> {
    return this.getActiveContentSourcesByUserUseCase.execute(userId);
  }

  async createContentSource(
    userId: string,
    params: CreateContentSourceParams
  ): Promise<Result<ContentSourceEntity>> {
    return this.createContentSourceUseCase.execute(userId, params);
  }

  async updateContentSource(
    id: string,
    params: UpdateContentSourceParams
  ): Promise<Result<ContentSourceEntity>> {
    return this.updateContentSourceUseCase.execute(id, params);
  }

  async deleteContentSource(id: string): Promise<Result<void>> {
    return this.deleteContentSourceUseCase.execute(id);
  }
}
