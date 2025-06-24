export interface FeedItem {
  id: string
  title: string
  url: string
  content: string
  thumbnail?: string
  published_at: string
  created_at: string
  feed: {
    id: string
    name: string
    url: string
  }
}
