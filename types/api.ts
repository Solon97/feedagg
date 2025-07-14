export interface FeedItem {
  id: string;
  title: string;
  content: string;
  published_at: string;
  url: string;
  thumbnail?: string;
  created_at: string;
  duration?: string; // Representa a duração no formato ISO 8601, ex: 'PT10M47S'
  feed: {
    id: string;
    name: string;
    url: string;
    topic?: Topic;
  };
}

export interface Topic {
  id: string;
  name: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTopicRequest {
  name: string;
  color?: string;
}

export interface UserFeedSubscription {
  feed_id: string;
  is_active: boolean;
  created_at: string;
  topic_id?: string;
  topic?: Topic;
  feed: {
    id: string;
    name: string;
    url: string;
    status: "active" | "error" | "inactive";
    created_at: string;
    last_fetched_at?: string;
  };
}

export interface Feed {
  id: string;
  name: string;
  url: string;
  status: "active" | "error" | "inactive";
  last_updated_at?: string;
  feed_type: "blog" | "youtube";
  error_message?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ValidateFeedResponse {
  valid: boolean;
  feed_type?: "blog" | "youtube";
  title?: string;
  message?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  current_period_start: Date;
  current_period_end: Date;
}

export interface UserSubscriptionStatus {
  isActive: boolean;
  currentPeriodEnd: Date | null;
  manageUrl: string;
}
