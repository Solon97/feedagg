// Base error class for domain errors
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Authentication errors
export class AuthenticationError extends DomainError {
  readonly code = "AUTHENTICATION_ERROR";
  readonly statusCode = 401;
}

export class AuthorizationError extends DomainError {
  readonly code = "AUTHORIZATION_ERROR";
  readonly statusCode = 403;
}

// Validation errors
export class ValidationError extends DomainError {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 400;

  constructor(message: string, public readonly field?: string, cause?: Error) {
    super(message, cause);
  }
}

// Not found errors
export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND_ERROR";
  readonly statusCode = 404;

  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message);
  }
}

// Conflict errors
export class ConflictError extends DomainError {
  readonly code = "CONFLICT_ERROR";
  readonly statusCode = 409;
}

// External service errors
export class ExternalServiceError extends DomainError {
  readonly code = "EXTERNAL_SERVICE_ERROR";
  readonly statusCode = 502;

  constructor(service: string, message: string, cause?: Error) {
    super(`External service '${service}' error: ${message}`, cause);
  }
}

// Infrastructure errors
export class InfrastructureError extends DomainError {
  readonly code = "INFRASTRUCTURE_ERROR";
  readonly statusCode = 500;
}

// Database errors
export class DatabaseError extends InfrastructureError {
  constructor(operation: string, message: string, cause?: Error) {
    super(`Database ${operation} failed: ${message}`, cause);
  }
}

// Network errors
export class NetworkError extends InfrastructureError {
  constructor(message: string, cause?: Error) {
    super(`Network error: ${message}`, cause);
  }
}

// Repository errors
export class RepositoryError extends InfrastructureError {
  constructor(message: string, cause?: Error) {
    super(`Repository error: ${message}`, cause);
  }
}

// Error factory for consistent error creation
export class ErrorFactory {
  static authentication(message: string, cause?: Error): AuthenticationError {
    return new AuthenticationError(message, cause);
  }

  static authorization(message: string, cause?: Error): AuthorizationError {
    return new AuthorizationError(message, cause);
  }

  static validation(
    message: string,
    field?: string,
    cause?: Error
  ): ValidationError {
    return new ValidationError(message, field, cause);
  }

  static notFound(resource: string, identifier?: string): NotFoundError {
    return new NotFoundError(resource, identifier);
  }

  static conflict(message: string, cause?: Error): ConflictError {
    return new ConflictError(message, cause);
  }

  static externalService(
    service: string,
    message: string,
    cause?: Error
  ): ExternalServiceError {
    return new ExternalServiceError(service, message, cause);
  }

  static database(
    operation: string,
    message: string,
    cause?: Error
  ): DatabaseError {
    return new DatabaseError(operation, message, cause);
  }

  static network(message: string, cause?: Error): NetworkError {
    return new NetworkError(message, cause);
  }

  static repository(message: string, cause?: Error): RepositoryError {
    return new RepositoryError(message, cause);
  }
}

// Error result type for use cases
export type Result<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: DomainError;
    };

// Result factory
export class ResultFactory {
  static success<T>(data: T): Result<T> {
    return { success: true, data };
  }

  static failure<T>(error: DomainError): Result<T> {
    return { success: false, error };
  }
}
