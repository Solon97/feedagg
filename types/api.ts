export interface Feed {
  id: string
  name: string
  url: string
  created_at: string
  last_fetched_at: string
}

export interface UserFeedSubscription {
  feed_id: string
  is_active: boolean
  created_at: string
  feed: Feed
}
