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
      console.error(
        `API request failed: ${response.status} ${response.statusText}`,
        errorData
      );
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
    } = {}
  ) {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.offset) searchParams.set("offset", params.offset.toString());
    if (params.sort) searchParams.set("sort", params.sort);
    if (params.order) searchParams.set("order", params.order);

    return this.makeRequest<any>(`/feeds/user-feed-items?${searchParams}`);
  }

  async getFeedItem(feedItemId: string) {
    return this.makeRequest<any>(`/feeds/feed-item/${feedItemId}`);
  }

  // Feeds Management
  async getUserFeeds() {
    return this.makeRequest<any>("/feeds/user-feeds");
  }

  async validateFeed(url: string) {
    return this.makeRequest<any>("/feeds/validate", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  }

  async subscribeFeed(url: string) {
    return this.makeRequest<any>("/feeds/subscribe", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  }

  async updateFeedStatus(feedId: string, status: "active" | "inactive") {
    return this.makeRequest<any>(`/feeds/user-feeds/${feedId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async deleteFeed(feedId: string) {
    return this.makeRequest<any>(`/feeds/user-feeds/${feedId}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
