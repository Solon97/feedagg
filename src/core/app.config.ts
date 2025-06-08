// Application Configuration - Main dependency injection container
import { RepositoryFactory } from "../infrastructure/supabase";
import { UseCaseFactory } from "./use-cases";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../lib/database.types";

// Environment configuration
interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment: "development" | "staging" | "production";
}

class Application {
  private static instance: Application;
  private repositoryFactory: RepositoryFactory;
  private useCaseFactory: UseCaseFactory;
  private config: AppConfig;

  private constructor(config: AppConfig) {
    this.config = config;

    // Create typed Supabase client
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseAnonKey
    );

    // Initialize repository factory with typed client
    this.repositoryFactory = new RepositoryFactory({
      supabase: supabase,
    });

    // Initialize use case factory with repositories
    this.useCaseFactory = new UseCaseFactory(
      this.repositoryFactory.getAllRepositories()
    );
  }

  static initialize(config: AppConfig): Application {
    if (!Application.instance) {
      Application.instance = new Application(config);
    }
    return Application.instance;
  }

  static getInstance(): Application {
    if (!Application.instance) {
      throw new Error(
        "Application not initialized. Call Application.initialize() first."
      );
    }
    return Application.instance;
  }

  // Getters for use cases (main application interface)
  getUserUseCases() {
    return this.useCaseFactory.getUserUseCases();
  }

  getContentSourceUseCases() {
    return this.useCaseFactory.getContentSourceUseCases();
  }

  getContentItemUseCases() {
    return this.useCaseFactory.getContentItemUseCases();
  }

  getSavedContentUseCases() {
    return this.useCaseFactory.getSavedContentUseCases();
  }

  // Configuration getters
  getConfig(): AppConfig {
    return { ...this.config };
  }

  isDevelopment(): boolean {
    return this.config.environment === "development";
  }

  isProduction(): boolean {
    return this.config.environment === "production";
  }
}

// Initialize application with environment variables
export function initializeApp(): Application {
  const config: AppConfig = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    environment:
      (process.env.NODE_ENV as AppConfig["environment"]) || "development",
  };

  // Validate required environment variables
  if (!config.supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL environment variable is required"
    );
  }

  if (!config.supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required"
    );
  }

  return Application.initialize(config);
}

// Export application instance getter
export const getApp = () => Application.getInstance();

// Export for easy access to use cases
export const useUserUseCases = () => getApp().getUserUseCases();
export const useContentSourceUseCases = () =>
  getApp().getContentSourceUseCases();
export const useContentItemUseCases = () => getApp().getContentItemUseCases();
export const useSavedContentUseCases = () => getApp().getSavedContentUseCases();
