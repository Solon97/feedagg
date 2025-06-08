// Common pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Common sorting interface
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Common search interface
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

// Form validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

// Common date range
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

// Environment types
export type Environment = "development" | "staging" | "production";

// User role types (for future use)
export type UserRole = "user" | "admin" | "moderator";

// Content status types
export type ContentStatus = "draft" | "published" | "archived";

// Notification types
export type NotificationType = "info" | "success" | "warning" | "error";

// Theme types
export type Theme = "light" | "dark" | "system";
