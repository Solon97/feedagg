import { supabase } from "./supabase";

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        return null;
      }

      return session?.access_token || null;
    } catch (error) {
      console.error("Error in getAuthToken:", error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();

    if (!token) {
      throw new Error("No authentication token available");
    }

    const url = `/api${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  // Feed Items
  async getUserFeedItems(
    params: {
      limit?: number;
      offset?: number;
      sort?: string;
      order?: "asc" | "desc";
      title?: string;
      feed_id?: string;
      feed_type?: "rss" | "youtube";
      topic_id?: string;
    } = {}
  ) {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.offset) searchParams.set("offset", params.offset.toString());
    if (params.sort) searchParams.set("sort", params.sort);
    if (params.order) searchParams.set("order", params.order);
    if (params.title) searchParams.set("title", params.title);
    if (params.feed_id) searchParams.set("feed_id", params.feed_id);
    if (params.feed_type) searchParams.set("feed_type", params.feed_type);
    if (params.topic_id) searchParams.set("topic_id", params.topic_id);

    return this.makeRequest<any>(`/feeds/user-feed-items?${searchParams}`);
  }

  async getFeedItem(feedItemId: string) {
    // Direct response without wrapper - matches the new API structure
    return this.makeRequest<any>(`/feeds/feed-item/${feedItemId}`);
  }

  // Feeds Management
  async getUserFeeds() {
    return this.makeRequest<any>("/feeds/user-feeds");
  }

  async subscribeFeed(url: string, topicId: string) {
    return this.makeRequest<any>("/feeds/subscribe", {
      method: "POST",
      body: JSON.stringify({ url, topic_id: topicId }),
    });
  }

  async updateFeedStatus(feedId: string, isActive: boolean) {
    return this.makeRequest<any>(`/feeds/user-feeds/${feedId}/status`, {
      method: "PUT",
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  async deleteFeed(feedId: string) {
    return this.makeRequest<any>(`/feeds/user-feeds/${feedId}`, {
      method: "DELETE",
    });
  }

  // Topics
  async getTopics() {
    return this.makeRequest<any>("/topics");
  }

  async createTopic(data: { name: string; color?: string }) {
    return this.makeRequest<any>("/topics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Subscriptions
  async getUserSubscriptionStatus(userId: string) {
    return this.makeRequest<any>(`/subscriptions/user/${userId}/active`);
  }
}

export const apiService = new ApiService();
