import { UserRepository } from "../repositories/user.repository";
import {
  UserEntity,
  CreateUserParams,
  UpdateUserParams,
} from "../entities/user.entity";
import {
  Result,
  ResultFactory,
  ErrorFactory,
  NotFoundError,
} from "../errors/domain-errors";

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<Result<UserEntity>> {
    try {
      if (!id.trim()) {
        return ResultFactory.failure(
          ErrorFactory.validation("User ID is required")
        );
      }

      const user = await this.userRepository.findById(id);

      if (!user) {
        return ResultFactory.failure(ErrorFactory.notFound("User", id));
      }

      return ResultFactory.success(user);
    } catch (error) {
      return ResultFactory.failure(
        ErrorFactory.database(
          "findById",
          error instanceof Error ? error.message : "Unknown error",
          error instanceof Error ? error : undefined
        )
      );
    }
  }
}

export class GetUserByEmailUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(email: string): Promise<Result<UserEntity>> {
    try {
      if (!email.trim()) {
        return ResultFactory.failure(
          ErrorFactory.validation("Email is required")
        );
      }

      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return ResultFactory.failure(ErrorFactory.notFound("User", email));
      }

      return ResultFactory.success(user);
    } catch (error) {
      return ResultFactory.failure(
        ErrorFactory.database(
          "findByEmail",
          error instanceof Error ? error.message : "Unknown error",
          error instanceof Error ? error : undefined
        )
      );
    }
  }
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    params: CreateUserParams & { id: string }
  ): Promise<Result<UserEntity>> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(params.email);
      if (existingUser) {
        return ResultFactory.failure(
          ErrorFactory.conflict("User with this email already exists")
        );
      }

      const user = await this.userRepository.create(params);
      return ResultFactory.success(user);
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

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    id: string,
    params: UpdateUserParams
  ): Promise<Result<UserEntity>> {
    try {
      if (!id.trim()) {
        return ResultFactory.failure(
          ErrorFactory.validation("User ID is required")
        );
      }

      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        return ResultFactory.failure(ErrorFactory.notFound("User", id));
      }

      const updatedUser = await this.userRepository.update(id, params);
      return ResultFactory.success(updatedUser);
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

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<Result<void>> {
    try {
      if (!id.trim()) {
        return ResultFactory.failure(
          ErrorFactory.validation("User ID is required")
        );
      }

      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        return ResultFactory.failure(ErrorFactory.notFound("User", id));
      }

      await this.userRepository.delete(id);
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

// Aggregator class for all user use cases
export class UserUseCases {
  private getUserByIdUseCase: GetUserByIdUseCase;
  private getUserByEmailUseCase: GetUserByEmailUseCase;
  private createUserUseCase: CreateUserUseCase;
  private updateUserUseCase: UpdateUserUseCase;
  private deleteUserUseCase: DeleteUserUseCase;

  constructor(userRepository: UserRepository) {
    this.getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
    this.getUserByEmailUseCase = new GetUserByEmailUseCase(userRepository);
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(userRepository);
  }

  async getUserById(id: string): Promise<Result<UserEntity>> {
    return this.getUserByIdUseCase.execute(id);
  }

  async getUserByEmail(email: string): Promise<Result<UserEntity>> {
    return this.getUserByEmailUseCase.execute(email);
  }

  async createUser(
    params: CreateUserParams & { id: string }
  ): Promise<Result<UserEntity>> {
    return this.createUserUseCase.execute(params);
  }

  async updateUser(
    id: string,
    params: UpdateUserParams
  ): Promise<Result<UserEntity>> {
    return this.updateUserUseCase.execute(id, params);
  }

  async deleteUser(id: string): Promise<Result<void>> {
    return this.deleteUserUseCase.execute(id);
  }
}
