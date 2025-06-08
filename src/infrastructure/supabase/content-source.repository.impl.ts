import { createClient } from "@supabase/supabase-js";
import {
  ContentSourceEntity,
  CreateContentSourceParams,
  UpdateContentSourceParams,
  ContentSource,
} from "../../core/entities/content-source.entity";
import { ContentSourceRepository } from "../../core/repositories/content-source.repository";
import {
  Result,
  ResultFactory,
  RepositoryError,
} from "../../core/errors/domain-errors";

export class ContentSourceRepositoryImpl implements ContentSourceRepository {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  async findById(id: string): Promise<Result<ContentSourceEntity | null>> {
    try {
      // Query the new user_feed_subscriptions table with JOIN
      const { data, error } = await this.supabase
        .from("user_feed_subscriptions")
        .select(
          `
          *,
          feed_sources (
            url,
            source_type,
            last_fetched_at,
            fetch_frequency
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return ResultFactory.success(null);
        }
        return ResultFactory.failure(
          new RepositoryError(`Failed to find content source: ${error.message}`)
        );
      }

      const entity = this.mapNewStructureToEntity(data);
      return ResultFactory.success(entity);
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  async findByUserId(userId: string): Promise<Result<ContentSourceEntity[]>> {
    try {
      const { data, error } = await this.supabase
        .from("user_feed_subscriptions")
        .select(
          `
          *,
          feed_sources (
            url,
            source_type,
            last_fetched_at,
            fetch_frequency
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return ResultFactory.failure(
          new RepositoryError(
            `Failed to find content sources: ${error.message}`
          )
        );
      }

      const entities = data.map((item) => this.mapNewStructureToEntity(item));
      return ResultFactory.success(entities);
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  async findActiveByUserId(
    userId: string
  ): Promise<Result<ContentSourceEntity[]>> {
    try {
      const { data, error } = await this.supabase
        .from("user_feed_subscriptions")
        .select(
          `
          *,
          feed_sources (
            url,
            source_type,
            last_fetched_at,
            fetch_frequency
          )
        `
        )
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        return ResultFactory.failure(
          new RepositoryError(
            `Failed to find active content sources: ${error.message}`
          )
        );
      }

      const entities = data.map((item) => this.mapNewStructureToEntity(item));
      return ResultFactory.success(entities);
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  async create(
    params: CreateContentSourceParams & { id: string; userId: string }
  ): Promise<Result<ContentSourceEntity>> {
    try {
      // Step 1: Create or get feed source
      const { data: feedSource, error: feedSourceError } = await this.supabase
        .from("feed_sources")
        .upsert(
          {
            url: params.url,
            source_type: params.sourceType || "rss",
            fetch_frequency: params.fetchFrequency || 3600,
          },
          { onConflict: "url" }
        )
        .select()
        .single();

      if (feedSourceError) {
        return ResultFactory.failure(
          new RepositoryError(
            `Failed to create feed source: ${feedSourceError.message}`
          )
        );
      }

      // Step 2: Check if subscription already exists
      const { data: existingSubscription, error: checkError } =
        await this.supabase
          .from("user_feed_subscriptions")
          .select(
            `
          *,
          feed_sources (
            url,
            source_type,
            last_fetched_at,
            fetch_frequency
          )
        `
          )
          .eq("user_id", params.userId)
          .eq("feed_source_id", (feedSource as { id: string }).id)
          .single();

      // If subscription already exists, return it (idempotent behavior)
      if (existingSubscription && !checkError) {
        const entity = this.mapNewStructureToEntity(existingSubscription);
        return ResultFactory.success(entity);
      }

      // Step 3: Create new user subscription
      const { data: subscription, error: subscriptionError } =
        await this.supabase
          .from("user_feed_subscriptions")
          .insert({
            id: params.id, // Use the provided ID
            user_id: params.userId,
            feed_source_id: feedSource.id,
            name: params.name,
            description: params.description,
            category: params.category,
            is_active: params.isActive ?? true,
          })
          .select(
            `
          *,
          feed_sources (
            url,
            source_type,
            last_fetched_at,
            fetch_frequency
          )
        `
          )
          .single();

      if (subscriptionError) {
        return ResultFactory.failure(
          new RepositoryError(
            `Failed to create subscription: ${subscriptionError.message}`
          )
        );
      }

      const entity = this.mapNewStructureToEntity(subscription);
      return ResultFactory.success(entity);
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  async update(
    id: string,
    params: UpdateContentSourceParams
  ): Promise<Result<ContentSourceEntity>> {
    try {
      // Check if we need to update feed_sources (URL or fetchFrequency changed)
      const needsFeedSourceUpdate =
        params.url || params.fetchFrequency !== undefined;

      if (needsFeedSourceUpdate) {
        // Get current subscription to know current feed_source_id
        const { data: currentSubscription, error: fetchError } =
          await this.supabase
            .from("user_feed_subscriptions")
            .select("feed_source_id")
            .eq("id", id)
            .single();

        if (fetchError) {
          return ResultFactory.failure(
            new RepositoryError(
              `Failed to find subscription: ${fetchError.message}`
            )
          );
        }

        // Get current feed source details
        const { data: currentFeedSource, error: feedSourceError } =
          await this.supabase
            .from("feed_sources")
            .select("*")
            .eq("id", currentSubscription.feed_source_id as string)
            .single();

        if (feedSourceError) {
          return ResultFactory.failure(
            new RepositoryError(
              `Failed to find feed source: ${feedSourceError.message}`
            )
          );
        }

        // Prepare new feed source data with fallbacks to current values
        const newFeedSourceData = {
          url: params.url || currentFeedSource.url,
          source_type: currentFeedSource.source_type, // Keep current type
          fetch_frequency:
            params.fetchFrequency !== undefined
              ? params.fetchFrequency
              : currentFeedSource.fetch_frequency,
        };

        // Check if URL changed - if so, we need to upsert a new feed source
        let feedSourceId = currentSubscription.feed_source_id as string;

        if (params.url && params.url !== currentFeedSource.url) {
          // URL changed - create or get existing feed source with new URL
          const { data: newFeedSource, error: upsertError } =
            await this.supabase
              .from("feed_sources")
              .upsert(newFeedSourceData, { onConflict: "url" })
              .select()
              .single();

          if (upsertError) {
            return ResultFactory.failure(
              new RepositoryError(
                `Failed to create/update feed source: ${upsertError.message}`
              )
            );
          }

          feedSourceId = newFeedSource.id as string;
        } else {
          // URL didn't change - just update the existing feed source
          const { error: updateError } = await this.supabase
            .from("feed_sources")
            .update(newFeedSourceData)
            .eq("id", feedSourceId);

          if (updateError) {
            return ResultFactory.failure(
              new RepositoryError(
                `Failed to update feed source: ${updateError.message}`
              )
            );
          }
        }

        // Update user subscription with new feed_source_id and other params
        const { data, error } = await this.supabase
          .from("user_feed_subscriptions")
          .update({
            feed_source_id: feedSourceId,
            name: params.name,
            description: params.description,
            category: params.category,
            is_active: params.isActive,
          })
          .eq("id", id)
          .select(
            `
            *,
            feed_sources (
              url,
              source_type,
              last_fetched_at,
              fetch_frequency
            )
          `
          )
          .single();

        if (error) {
          return ResultFactory.failure(
            new RepositoryError(
              `Failed to update subscription: ${error.message}`
            )
          );
        }

        const entity = this.mapNewStructureToEntity(data);
        return ResultFactory.success(entity);
      } else {
        // No feed source changes needed - just update subscription metadata
        const { data, error } = await this.supabase
          .from("user_feed_subscriptions")
          .update({
            name: params.name,
            description: params.description,
            category: params.category,
            is_active: params.isActive,
          })
          .eq("id", id)
          .select(
            `
            *,
            feed_sources (
              url,
              source_type,
              last_fetched_at,
              fetch_frequency
            )
          `
          )
          .single();

        if (error) {
          return ResultFactory.failure(
            new RepositoryError(
              `Failed to update content source: ${error.message}`
            )
          );
        }

        const entity = this.mapNewStructureToEntity(data);
        return ResultFactory.success(entity);
      }
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase
        .from("user_feed_subscriptions")
        .delete()
        .eq("id", id);

      if (error) {
        return ResultFactory.failure(
          new RepositoryError(
            `Failed to delete content source: ${error.message}`
          )
        );
      }

      return ResultFactory.success(undefined);
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  async markAsFetched(id: string): Promise<Result<ContentSourceEntity>> {
    try {
      // Get subscription to find feed_source_id
      const { data: subscription } = await this.supabase
        .from("user_feed_subscriptions")
        .select("feed_source_id")
        .eq("id", id)
        .single();

      if (!subscription) {
        return ResultFactory.failure(
          new RepositoryError("Subscription not found")
        );
      }

      // Update feed source
      await this.supabase
        .from("feed_sources")
        .update({ last_fetched_at: new Date().toISOString() })
        .eq("id", subscription.feed_source_id as string);

      // Return updated entity - ensure it's not null
      const result = await this.findById(id);
      if (result.success && result.data === null) {
        return ResultFactory.failure(
          new RepositoryError("Failed to find updated content source")
        );
      }
      return result as Result<ContentSourceEntity>;
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  async findDueForFetch(): Promise<Result<ContentSourceEntity[]>> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data, error } = await this.supabase
        .from("user_feed_subscriptions")
        .select(
          `
          *,
          feed_sources!inner (
            url,
            source_type,
            last_fetched_at,
            fetch_frequency
          )
        `
        )
        .eq("is_active", true)
        .or(
          `feed_sources.last_fetched_at.is.null,feed_sources.last_fetched_at.lt.${oneHourAgo}`
        )
        .order("feed_sources(last_fetched_at)", {
          ascending: true,
          nullsFirst: true,
        });

      if (error) {
        return ResultFactory.failure(
          new RepositoryError(
            `Failed to find content sources due for fetch: ${error.message}`
          )
        );
      }

      const entities = data.map((item) => this.mapNewStructureToEntity(item));
      return ResultFactory.success(entities);
    } catch (error) {
      return ResultFactory.failure(
        new RepositoryError(`Unexpected error: ${error}`)
      );
    }
  }

  private mapNewStructureToEntity(data: any): ContentSourceEntity {
    const feedSource = data.feed_sources;
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      type: feedSource.source_type,
      url: feedSource.url,
      description: data.description,
      category: data.category,
      isActive: data.is_active,
      fetchFrequency: feedSource.fetch_frequency,
      lastFetchedAt: feedSource.last_fetched_at
        ? new Date(feedSource.last_fetched_at)
        : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      feedSourceId: data.feed_source_id,
      sourceType: feedSource.source_type,
    };
  }
}
