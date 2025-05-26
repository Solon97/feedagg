interface CachedPreview {
  preview: UrlPreview
  timestamp: number
  expiresAt: number
}

interface UrlPreview {
  title: string
  description: string
  image?: string
  siteName: string
  favicon?: string
  isValid: boolean
}

class PreviewCache {
  private cache = new Map<string, CachedPreview>()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  private readonly MAX_CACHE_SIZE = 100 // Maximum number of cached items

  constructor() {
    // Load cache from localStorage on initialization
    this.loadFromStorage()

    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), 60 * 60 * 1000) // Every hour
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      // Remove trailing slash and fragments for consistent caching
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`.replace(/\/$/, "")
    } catch {
      return url
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("digestly-preview-cache")
      if (stored) {
        const data = JSON.parse(stored)
        Object.entries(data).forEach(([key, value]) => {
          const cached = value as CachedPreview
          // Only load non-expired entries
          if (cached.expiresAt > Date.now()) {
            this.cache.set(key, cached)
          }
        })
      }
    } catch (error) {
      console.warn("Failed to load preview cache from storage:", error)
    }
  }

  private saveToStorage(): void {
    try {
      const data: Record<string, CachedPreview> = {}
      this.cache.forEach((value, key) => {
        data[key] = value
      })
      localStorage.setItem("digestly-preview-cache", JSON.stringify(data))
    } catch (error) {
      console.warn("Failed to save preview cache to storage:", error)
    }
  }

  private cleanup(): void {
    const now = Date.now()
    let removedCount = 0

    // Remove expired entries
    this.cache.forEach((cached, key) => {
      if (cached.expiresAt <= now) {
        this.cache.delete(key)
        removedCount++
      }
    })

    // If cache is still too large, remove oldest entries
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

      const toRemove = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE)
      toRemove.forEach(([key]) => {
        this.cache.delete(key)
        removedCount++
      })
    }

    if (removedCount > 0) {
      this.saveToStorage()
      console.log(`Cleaned up ${removedCount} expired/old cache entries`)
    }
  }

  get(url: string): UrlPreview | null {
    const normalizedUrl = this.normalizeUrl(url)
    const cached = this.cache.get(normalizedUrl)

    if (!cached) {
      return null
    }

    // Check if expired
    if (cached.expiresAt <= Date.now()) {
      this.cache.delete(normalizedUrl)
      this.saveToStorage()
      return null
    }

    return cached.preview
  }

  set(url: string, preview: UrlPreview): void {
    const normalizedUrl = this.normalizeUrl(url)
    const now = Date.now()

    const cached: CachedPreview = {
      preview,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION,
    }

    this.cache.set(normalizedUrl, cached)
    this.saveToStorage()
  }

  has(url: string): boolean {
    return this.get(url) !== null
  }

  clear(): void {
    this.cache.clear()
    localStorage.removeItem("digestly-preview-cache")
  }

  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
    }
  }

  // Get all cached URLs for debugging
  getCachedUrls(): string[] {
    return Array.from(this.cache.keys())
  }
}

// Export singleton instance
export const previewCache = new PreviewCache()
export type { UrlPreview }
