export interface FeedItem {
  id: string
  title: string
  content: string
  summary?: string
  published_at: string
  url: string
  thumbnail?: string
  feed_name: string
  feed_id: string
  feed_type: "blog" | "youtube"
}

export interface Feed {
  id: string
  name: string
  url: string
  status: "active" | "error" | "inactive"
  last_updated_at?: string
  feed_type: "blog" | "youtube"
  error_message?: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}

export interface ValidateFeedResponse {
  valid: boolean
  feed_type?: "blog" | "youtube"
  title?: string
  message?: string
}
