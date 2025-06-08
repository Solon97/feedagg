// User Feed Subscription Entity - User's personalized subscription to a feed source
export interface UserFeedSubscriptionEntity {
  readonly id: string;
  readonly userId: string;
  readonly feedSourceId: string;
  readonly name: string; // User-customized name
  readonly description: string | null; // User-customized description
  readonly category: string | null; // User-customized category
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateUserFeedSubscriptionParams {
  readonly feedSourceId: string;
  readonly name: string;
  readonly description?: string;
  readonly category?: string;
  readonly isActive?: boolean;
}

export interface UpdateUserFeedSubscriptionParams {
  readonly name?: string;
  readonly description?: string;
  readonly category?: string;
  readonly isActive?: boolean;
}

// User Feed Subscription factory with validation
export class UserFeedSubscription {
  static create(
    params: CreateUserFeedSubscriptionParams & { id: string; userId: string }
  ): UserFeedSubscriptionEntity {
    if (!params.name.trim()) {
      throw new Error("Name is required");
    }

    if (!params.feedSourceId) {
      throw new Error("Feed source ID is required");
    }

    if (!params.userId) {
      throw new Error("User ID is required");
    }

    return {
      id: params.id,
      userId: params.userId,
      feedSourceId: params.feedSourceId,
      name: params.name.trim(),
      description: params.description?.trim() || null,
      category: params.category?.trim() || null,
      isActive: params.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static update(
    existing: UserFeedSubscriptionEntity,
    params: UpdateUserFeedSubscriptionParams
  ): UserFeedSubscriptionEntity {
    return {
      ...existing,
      ...params,
      name: params.name?.trim() || existing.name,
      description: params.description?.trim() || existing.description,
      category: params.category?.trim() || existing.category,
      updatedAt: new Date(),
    };
  }

  static toggle(
    existing: UserFeedSubscriptionEntity
  ): UserFeedSubscriptionEntity {
    return {
      ...existing,
      isActive: !existing.isActive,
      updatedAt: new Date(),
    };
  }
}
