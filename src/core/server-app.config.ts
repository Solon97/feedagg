// Server-side Application Configuration - Clean Architecture for server only
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

class ServerApplication {
  private static instance: ServerApplication;
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

  static initialize(config: AppConfig): ServerApplication {
    if (!ServerApplication.instance) {
      ServerApplication.instance = new ServerApplication(config);
    }
    return ServerApplication.instance;
  }

  static getInstance(): ServerApplication {
    if (!ServerApplication.instance) {
      throw new Error(
        "ServerApplication not initialized. Call ServerApplication.initialize() first."
      );
    }
    return ServerApplication.instance;
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

// Initialize application with environment variables (server-side only)
export function initializeServerApp(): ServerApplication {
  const config: AppConfig = {
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
    environment:
      (process.env.NODE_ENV as AppConfig["environment"]) || "development",
  };

  // Validate required environment variables
  if (!config.supabaseUrl) {
    throw new Error("SUPABASE_URL environment variable is required");
  }

  if (!config.supabaseAnonKey) {
    throw new Error("SUPABASE_ANON_KEY environment variable is required");
  }

  return ServerApplication.initialize(config);
}

// Export application instance getter for server-side use only
export const getServerApp = () => ServerApplication.getInstance();

// Export for easy access to use cases in API routes
export const getServerUserUseCases = () => getServerApp().getUserUseCases();
export const getServerContentSourceUseCases = () =>
  getServerApp().getContentSourceUseCases();
export const getServerContentItemUseCases = () =>
  getServerApp().getContentItemUseCases();
export const getServerSavedContentUseCases = () =>
  getServerApp().getSavedContentUseCases();
