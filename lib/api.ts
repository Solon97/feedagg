import { supabase } from "./supabase"

const API_BASE_URL = "https://rss-feed-processor.onrender.com"

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken()

    if (!token) {
      throw new Error("No authentication token available")
    }

    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // Feed Items
  async getUserFeedItems(
    params: {
      limit?: number
      offset?: number
      sort?: string
      order?: "asc" | "desc"
    } = {},
  ) {
    const searchParams = new URLSearchParams()
    if (params.limit) searchParams.set("limit", params.limit.toString())
    if (params.offset) searchParams.set("offset", params.offset.toString())
    if (params.sort) searchParams.set("sort", params.sort)
    if (params.order) searchParams.set("order", params.order)

    return this.makeRequest<any>(`/feed/user-feed-items?${searchParams}`)
  }

  async getFeedItem(feedItemId: string) {
    return this.makeRequest<any>(`/feed/feed-item/${feedItemId}`)
  }

  // Feeds Management
  async getUserFeeds() {
    return this.makeRequest<any>("/feed/user-feeds")
  }

  async validateFeed(url: string) {
    return this.makeRequest<any>("/feed/validate", {
      method: "POST",
      body: JSON.stringify({ url }),
    })
  }

  async subscribeFeed(url: string) {
    return this.makeRequest<any>("/feed/subscribe", {
      method: "POST",
      body: JSON.stringify({ url }),
    })
  }

  async updateFeedStatus(feedId: string, status: "active" | "inactive") {
    return this.makeRequest<any>(`/feed/user-feeds/${feedId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  }

  async deleteFeed(feedId: string) {
    return this.makeRequest<any>(`/feed/user-feeds/${feedId}`, {
      method: "DELETE",
    })
  }
}

export const apiService = new ApiService()
