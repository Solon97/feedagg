interface ValidationResult {
  isValid: boolean
  rssUrl?: string
  type: "youtube" | "rss" | "invalid"
  error?: string
}

export class UrlValidator {
  private static readonly YOUTUBE_PATTERNS = [
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
  ]

  private static readonly RSS_PATTERNS = [/\/feed\/?$/, /\/rss\/?$/, /\/atom\/?$/, /\.xml$/, /\/index\.xml$/]

  static async validateUrl(url: string): Promise<ValidationResult> {
    try {
      // Basic URL validation
      const urlObj = new URL(url)

      // Check if it's a YouTube URL
      if (this.isYouTubeUrl(urlObj)) {
        return await this.validateYouTubeChannel(url)
      }

      // Check for RSS feed
      return await this.validateRssFeed(url)
    } catch (error) {
      return {
        isValid: false,
        type: "invalid",
        error: "Invalid URL format",
      }
    }
  }

  private static isYouTubeUrl(urlObj: URL): boolean {
    return urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")
  }

  private static async validateYouTubeChannel(url: string): Promise<ValidationResult> {
    try {
      // Simulate fetching YouTube channel page
      console.log(`Validating YouTube channel: ${url}`)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

      // Mock YouTube channel validation
      const rssUrl = await this.getYouTubeChannelRss(url)

      if (rssUrl) {
        return {
          isValid: true,
          rssUrl,
          type: "youtube",
        }
      } else {
        return {
          isValid: false,
          type: "invalid",
          error: "YouTube channel not found or RSS feed unavailable",
        }
      }
    } catch (error) {
      return {
        isValid: false,
        type: "invalid",
        error: "Failed to validate YouTube channel",
      }
    }
  }

  private static async getYouTubeChannelRss(handleUrl: string): Promise<string | null> {
    try {
      // Mock implementation - in real app, this would fetch the actual page
      console.log(`Fetching YouTube RSS for: ${handleUrl}`)

      // Simulate the HTML parsing logic
      const mockChannelIds: Record<string, string> = {
        "https://youtube.com/@vercel": "UCLq8gNoee7oXM7MvTdjyQvA",
        "https://youtube.com/c/vercel": "UCLq8gNoee7oXM7MvTdjyQvA",
        "https://youtube.com/channel/UCLq8gNoee7oXM7MvTdjyQvA": "UCLq8gNoee7oXM7MvTdjyQvA",
        "https://youtube.com/@techworld-with-nana": "UCdngmbVKX1Tgre699-XLlUA",
        "https://youtube.com/@codewithmosh": "UCWv7vMbMWH4-V0ZXdmDpPBA",
        "https://youtube.com/@kentcdodds": "UCz-BYvuntVRt_VpfR6FKXJw",
      }

      // Normalize URL for lookup
      const normalizedUrl = handleUrl.toLowerCase().replace(/\/$/, "")
      const channelId = mockChannelIds[normalizedUrl]

      if (channelId) {
        return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
      }

      // If not in mock data, simulate HTML parsing
     /* if (handleUrl.includes("youtube.com")) {
        // Simulate finding RSS link in HTML
        const mockHtml = `
          <html>
            <head>
              <link rel="alternate" type="application/rss+xml" href="https://www.youtube.com/feeds/videos.xml?channel_id=MOCK_CHANNEL_ID">
            </head>
          </html>
        `

        const match = mockHtml.match(/<link rel="alternate" type="application\/rss\+xml"[^>]*href="([^"]+)"/)
        return match ? match[1] : null
      }
    */
      return null
    } catch (error) {
      console.error("Error fetching YouTube RSS:", error)
      return null
    }
  }

  private static async validateRssFeed(url: string): Promise<ValidationResult> {
    try {
      console.log(`Validating RSS feed: ${url}`)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))

      // First, check if the URL already looks like an RSS feed
      if (this.looksLikeRssFeed(url)) {
        const isValidRss = await this.checkRssValidity(url)
        if (isValidRss) {
          return {
            isValid: true,
            rssUrl: url,
            type: "rss",
          }
        }
      }

      // Try to find RSS feed on the website
      const rssUrl = await this.findRssFeed(url)

      if (rssUrl) {
        return {
          isValid: true,
          rssUrl,
          type: "rss",
        }
      } else {
        return {
          isValid: false,
          type: "invalid",
          error: "No RSS feed found on this website",
        }
      }
    } catch (error) {
      return {
        isValid: false,
        type: "invalid",
        error: "Failed to validate RSS feed",
      }
    }
  }

  private static looksLikeRssFeed(url: string): boolean {
    return this.RSS_PATTERNS.some((pattern) => pattern.test(url))
  }

  private static async checkRssValidity(url: string): Promise<boolean> {
    // Mock RSS validation - in real app, would fetch and parse XML
    const mockValidRssUrls = [
      "https://techcrunch.com/feed/",
      "https://dev.to/feed",
      "https://feeds.feedburner.com/oreilly/radar",
      "https://css-tricks.com/feed/",
      "https://blog.mozilla.org/feed/",
    ]

    return mockValidRssUrls.some((validUrl) => url.includes(validUrl.split("/")[2]))
  }

  private static async findRssFeed(url: string): Promise<string | null> {
    try {
      // Mock implementation - in real app, would fetch the page and parse HTML
      const domain = new URL(url).hostname

      // Mock RSS feed discovery
      const mockRssFeeds: Record<string, string> = {
        "techcrunch.com": "https://techcrunch.com/feed/",
        "dev.to": "https://dev.to/feed",
        "css-tricks.com": "https://css-tricks.com/feed/",
        "blog.mozilla.org": "https://blog.mozilla.org/feed/",
        "a11yproject.com": "https://www.a11yproject.com/feed.xml",
        "smashingmagazine.com": "https://www.smashingmagazine.com/feed/",
        "alistapart.com": "https://alistapart.com/main/feed/",
      }

      // Check if we have a known RSS feed for this domain
      const rssUrl = mockRssFeeds[domain]
      if (rssUrl) {
        return rssUrl
      }

      // Simulate common RSS feed paths
      const commonPaths = ["/feed/", "/rss/", "/atom.xml", "/feed.xml", "/index.xml"]

      for (const path of commonPaths) {
        const testUrl = `${url.replace(/\/$/, "")}${path}`
        // In real implementation, would test if these URLs exist
        if (Math.random() > 0.7) {
          // Simulate 30% chance of finding RSS
          return testUrl
        }
      }

      return null
    } catch (error) {
      console.error("Error finding RSS feed:", error)
      return null
    }
  }
}
