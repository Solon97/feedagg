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
  private static readonly RSS_PATTERNS = [/\/feed\/?$/, /\/rss\/?$/, /\/atom\/?$/, /\.xml$/, /\/index\.xml$/, /\/blog\/rss\/?$/, /\/blog\/feed\/?$/]

  private static normalizeUrl(url: string): string {
    // Remove whitespace
    url = url.trim()

    // If URL doesn't start with http:// or https://, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    return url
  }

  static async validateUrl(url: string): Promise<ValidationResult> {
    try {
      // Normalize URL by adding https:// if needed
      const normalizedUrl = this.normalizeUrl(url)

      // Basic URL validation
      const urlObj = new URL(normalizedUrl)

      // Check if it's a YouTube URL
      if (this.isYouTubeUrl(urlObj)) {
        return await this.validateYouTubeChannel(normalizedUrl)
      }

      // Check for RSS feed
      return await this.validateRssFeed(normalizedUrl)
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
      console.log(`Validating YouTube channel: ${url}`)

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
      console.log(`Fetching YouTube RSS for: ${handleUrl}`)

      // Fetch the YouTube page to find RSS link
      const response = await fetch(handleUrl, {
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      if (!response.ok) {
        console.error(`Failed to fetch YouTube page: ${response.status}`)
        return null
      }

      const html = await response.text()

      // Look for RSS feed link in the HTML
      const rssMatch = html.match(/<link rel="alternate" type="application\/rss\+xml"[^>]*href="([^"]+)"/)
      if (rssMatch && rssMatch[1]) {
        return rssMatch[1]
      }

      // If no RSS link found, try to extract channel ID from various sources
      const channelIdPatterns = [
        /"channelId":"([^"]+)"/,
        /"channel_id":"([^"]+)"/,
        /\/channel\/([a-zA-Z0-9_-]+)/,
        /"externalId":"([^"]+)"/
      ]

      for (const pattern of channelIdPatterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          return `https://www.youtube.com/feeds/videos.xml?channel_id=${match[1]}`
        }
      }

      return null
    } catch (error) {
      console.error("Error fetching YouTube RSS:", error)
      return null
    }
  }
  private static async validateRssFeed(url: string): Promise<ValidationResult> {
    try {
      console.log(`Validating RSS feed: ${url}`)

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
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      if (!response.ok) {
        console.error(`RSS feed returned ${response.status}`)
        return false
      }

      const contentType = response.headers.get('content-type') || ''

      // Check if content type indicates XML/RSS
      if (contentType.includes('application/rss+xml') ||
        contentType.includes('application/atom+xml') ||
        contentType.includes('application/xml') ||
        contentType.includes('text/xml')) {
        return true
      }

      // If content type is not explicitly RSS, check the actual content
      const content = await response.text()

      // Look for RSS/Atom feed indicators
      const rssIndicators = [
        /<rss[^>]*version/i,
        /<feed[^>]*xmlns/i,
        /<channel>/i,
        /<item>/i,
        /<entry>/i
      ]

      return rssIndicators.some(pattern => pattern.test(content))
    } catch (error) {
      console.error(`Error checking RSS validity for ${url}:`, error)
      return false
    }
  }
  private static async findRssFeed(url: string): Promise<string | null> {
    try {
      const urlObj = new URL(url)
      const baseUrl = `${urlObj.protocol}//${urlObj.host}`

      // First, try to fetch the main page to look for RSS links
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(10000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })

        if (response.ok) {
          const html = await response.text()

          // Look for RSS feed links in the HTML
          const rssLinkPatterns = [
            /<link[^>]*rel=["']alternate["'][^>]*type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/i,
            /<link[^>]*type=["']application\/rss\+xml["'][^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i,
            /<link[^>]*rel=["']alternate["'][^>]*type=["']application\/atom\+xml["'][^>]*href=["']([^"']+)["']/i,
            /<link[^>]*type=["']application\/atom\+xml["'][^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i
          ]

          for (const pattern of rssLinkPatterns) {
            const match = html.match(pattern)
            if (match && match[1]) {
              let rssUrl = match[1]
              // Handle relative URLs
              if (rssUrl.startsWith('/')) {
                rssUrl = `${baseUrl}${rssUrl}`
              } else if (!rssUrl.startsWith('http')) {
                rssUrl = `${baseUrl}/${rssUrl}`
              }

              // Validate the found RSS URL
              const isValid = await this.checkRssValidity(rssUrl)
              if (isValid) {
                return rssUrl
              }
            }
          }
        }
      } catch (error) {
        console.log(`Could not fetch main page, trying common RSS paths: ${error}`)
      }

      // If no RSS link found in HTML, try common RSS paths
      const commonPaths = [
        "/feed/",
        "/rss/",
        "/atom.xml",
        "/feed.xml",
        "/index.xml",
        "/rss.xml",
        "/blog/feed/",
        "/blog/rss/",
        "/blog/rss.xml",
        "/blog/feed.xml"
      ]

      // Special handling for Rocketseat
      if (urlObj.hostname.includes('rocketseat.com.br')) {
        commonPaths.unshift("/blog/rss")
      }

      for (const path of commonPaths) {
        const testUrl = `${baseUrl}${path}`
        console.log(`Testing RSS path: ${testUrl}`)

        const isValid = await this.checkRssValidity(testUrl)
        if (isValid) {
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
