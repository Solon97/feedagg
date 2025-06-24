export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly payload?: unknown,
  ) {
    super(message)
    // Maintains proper stack trace for where our error was thrown (only on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
    this.name = "ApiError"
  }
}
