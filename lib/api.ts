import { supabase } from "./supabase";
import { StripePricesResponse, StripeCheckoutResponse } from "@/types/stripe";

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
  ): Promise<T | null> {
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

    if (response.status === 204) {
      return null;
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
  async getTopics(hasActiveFeeds: boolean = false) {
    const endpoint = `/topics`;
    if (!hasActiveFeeds) {
      return this.makeRequest<any>(endpoint);
    }
    const searchParams = new URLSearchParams();
    searchParams.set("has_active_feeds", String(hasActiveFeeds));
    const query = searchParams.toString();
    return this.makeRequest<any>(`${endpoint}?${query}`);
  }

  async createTopic(data: { name: string; color?: string }) {
    return this.makeRequest<any>("/topics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteTopic(topicId: string) {
    return this.makeRequest<any>(`/topics/${topicId}`, {
      method: "DELETE",
    });
  }

  // Subscriptions
  async getUserSubscriptionStatus(userId: string) {
    return this.makeRequest<any>(`/subscriptions/user/${userId}/active`);
  }

  // Stripe Integration
  async getStripePrices() {
    return this.makeRequest<StripePricesResponse>("/stripe/prices");
  }

  async createStripeCheckoutSession(priceId: string) {
    return this.makeRequest<StripeCheckoutResponse>("/stripe/checkout", {
      method: "POST",
      body: JSON.stringify({ priceId }),
    });
  }
}

export const apiService = new ApiService();
