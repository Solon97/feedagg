// Combined Feed Entity - Joins FeedSource + UserFeedSubscription for backward compatibility
import type { FeedSourceEntity } from "./feed-source.entity";
import type { UserFeedSubscriptionEntity } from "./user-feed-subscription.entity";

export interface CombinedFeedEntity {
  readonly id: string; // UserFeedSubscription ID
  readonly userId: string;
  readonly feedSourceId: string;
  readonly name: string; // From subscription
  readonly description: string | null; // From subscription
  readonly category: string | null; // From subscription
  readonly isActive: boolean; // From subscription
  readonly url: string; // From feed source
  readonly sourceType: "rss" | "website" | "youtube" | "twitter" | "newsletter"; // From feed source
  readonly lastFetchedAt: Date | null; // From feed source
  readonly fetchFrequency: number; // From feed source
  readonly createdAt: Date; // From subscription
  readonly updatedAt: Date; // From subscription
}

export interface CreateCombinedFeedParams {
  readonly name: string;
  readonly url: string;
  readonly description?: string;
  readonly category?: string;
  readonly isActive?: boolean;
  readonly sourceType?:
    | "rss"
    | "website"
    | "youtube"
    | "twitter"
    | "newsletter";
  readonly fetchFrequency?: number;
}

export interface UpdateCombinedFeedParams {
  readonly name?: string;
  readonly description?: string;
  readonly category?: string;
  readonly isActive?: boolean;
}

// Combined Feed factory - creates both entities together
export class CombinedFeed {
  static fromEntities(
    subscription: UserFeedSubscriptionEntity,
    feedSource: FeedSourceEntity
  ): CombinedFeedEntity {
    return {
      id: subscription.id,
      userId: subscription.userId,
      feedSourceId: subscription.feedSourceId,
      name: subscription.name,
      description: subscription.description,
      category: subscription.category,
      isActive: subscription.isActive,
      url: feedSource.url,
      sourceType: feedSource.sourceType,
      lastFetchedAt: feedSource.lastFetchedAt,
      fetchFrequency: feedSource.fetchFrequency,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }

  static toSubscriptionParams(params: CreateCombinedFeedParams): {
    name: string;
    description?: string;
    category?: string;
    isActive?: boolean;
  } {
    return {
      name: params.name,
      description: params.description,
      category: params.category,
      isActive: params.isActive,
    };
  }

  static toFeedSourceParams(params: CreateCombinedFeedParams): {
    url: string;
    sourceType?: "rss" | "website" | "youtube" | "twitter" | "newsletter";
    fetchFrequency?: number;
  } {
    return {
      url: params.url,
      sourceType: params.sourceType,
      fetchFrequency: params.fetchFrequency,
    };
  }
}
