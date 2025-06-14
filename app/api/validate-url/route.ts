import { NextRequest, NextResponse } from "next/server";

interface ValidationRequest {
  url: string;
}

interface ValidationResult {
  isValid: boolean;
  type?: "rss" | "youtube";
  error?: string;
  rssUrl?: string;
  preview?: {
    title: string;
    description: string;
    favicon?: string;
  } | null;
}

/**
 * Extrai apenas a primeira parte do título, removendo subtítulos após separadores comuns
 * Exemplos:
 * - "Rocketseat | O Melhor blog de Tecnologia" → "Rocketseat"
 * - "Investidor Sardinha l Raul Sena" → "Investidor Sardinha"
 * - "Blog - Tecnologia e Inovação" → "Blog"
 */
function extractMainTitle(title: string): string {
  if (!title) return title;

  // Lista de separadores comuns ordenados por prioridade
  const separators = [
    " | ", // pipe com espaços
    " – ", // en dash com espaços
    " — ", // em dash com espaços
    " - ", // hífen com espaços
    " • ", // bullet point com espaços
    " :: ", // dois pontos duplos
    " : ", // dois pontos simples
    " / ", // barra com espaços
  ];

  let cleanTitle = title.trim();

  // Procura pelo primeiro separador encontrado na ordem de prioridade
  for (const separator of separators) {
    const separatorIndex = cleanTitle.indexOf(separator);

    // Se encontrou o separador e não está no início da string
    if (separatorIndex > 0) {
      // Extrai a primeira parte e remove espaços extras
      const firstPart = cleanTitle.substring(0, separatorIndex).trim();

      // Só retorna se a primeira parte não estiver vazia
      if (firstPart.length > 0) {
        return firstPart;
      }
    }
  }

  // Se nenhum separador foi encontrado, retorna o título original limpo
  return cleanTitle;
}

export async function POST(request: NextRequest) {
  try {
    const { url }: ValidationRequest = await request.json();

    if (!url) {
      return NextResponse.json(
        { isValid: false, error: "URL is required" },
        { status: 400 }
      );
    }

    // Normalize URL by adding https:// if needed
    const normalizedUrl = normalizeUrl(url.trim());

    // Validate URL format
    let urlObj: URL;
    try {
      urlObj = new URL(normalizedUrl);
    } catch {
      return NextResponse.json({
        isValid: false,
        error: "Invalid URL format",
      });
    }

    // Check if it's a YouTube URL
    if (isYouTubeUrl(urlObj)) {
      const result = await validateYouTubeChannel(normalizedUrl);
      return NextResponse.json(result);
    }

    // Check for RSS feed
    const result = await validateRssFeed(normalizedUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error("URL validation error:", error);
    return NextResponse.json(
      { isValid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

function normalizeUrl(url: string): string {
  // Remove whitespace
  url = url.trim();

  // If URL doesn't start with http:// or https://, add https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  return url;
}

function isYouTubeUrl(urlObj: URL): boolean {
  return (
    urlObj.hostname.includes("youtube.com") ||
    urlObj.hostname.includes("youtu.be")
  );
}

async function validateYouTubeChannel(url: string): Promise<ValidationResult> {
  try {
    console.log(`Validating YouTube channel: ${url}`);

    const rssUrl = await getYouTubeChannelRss(url);

    if (rssUrl) {
      const preview = await fetchUrlPreview(rssUrl);
      return {
        isValid: true,
        rssUrl,
        type: "youtube",
        preview,
      };
    } else {
      return {
        isValid: false,
        error: "YouTube channel not found or RSS feed unavailable",
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: "Failed to validate YouTube channel",
    };
  }
}

async function getYouTubeChannelRss(handleUrl: string): Promise<string | null> {
  try {
    console.log(`Fetching YouTube RSS for: ${handleUrl}`);

    // Try to fetch the YouTube page and extract RSS feed
    const response = await fetch(handleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FeedReader/1.0)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`Failed to fetch YouTube page: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Extract RSS feed URL from HTML
    const match = html.match(
      /<link rel="alternate" type="application\/rss\+xml"[^>]*href="([^"]+)"/
    );

    if (match && match[1]) {
      return match[1].replace(/&amp;/g, "&"); // Decode HTML entities
    }

    return null;
  } catch (error) {
    console.error("Error fetching YouTube RSS:", error);
    return null;
  }
}

async function validateRssFeed(url: string): Promise<ValidationResult> {
  try {
    console.log(`Validating RSS feed: ${url}`);

    // First, check if the URL already looks like an RSS feed
    if (looksLikeRssFeed(url)) {
      const isValidRss = await checkRssValidity(url);
      if (isValidRss) {
        const preview = await fetchUrlPreview(url);
        return {
          isValid: true,
          rssUrl: url,
          type: "rss",
          preview,
        };
      }
    }

    // Try to find RSS feed on the website
    const rssUrl = await findRssFeed(url);

    if (rssUrl) {
      const preview = await fetchUrlPreview(rssUrl);
      return {
        isValid: true,
        rssUrl,
        type: "rss",
        preview,
      };
    } else {
      return {
        isValid: false,
        error: "No RSS feed found on this website",
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: "Failed to validate RSS feed",
    };
  }
}

function looksLikeRssFeed(url: string): boolean {
  const RSS_PATTERNS = [
    /\/feed\/?$/,
    /\/rss\/?$/,
    /\/atom\/?$/,
    /\.xml$/,
    /\/index\.xml$/,
    /\/blog\/rss\/?$/,
    /\/blog\/feed\/?$/,
  ];
  return RSS_PATTERNS.some((pattern) => pattern.test(url));
}

async function checkRssValidity(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FeedReader/1.0)",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return false;
    }

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    // Check if it's XML and contains RSS/Atom elements
    const isXml =
      contentType.includes("xml") || text.trim().startsWith("<?xml");
    const hasRssElements =
      text.includes("<rss") ||
      text.includes("<feed") ||
      text.includes("<channel>");

    return isXml && hasRssElements;
  } catch (error) {
    console.error("Error checking RSS validity:", error);
    return false;
  }
}

async function findRssFeed(url: string): Promise<string | null> {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Known RSS feeds mapping
    const knownRssFeeds: Record<string, string> = {
      "techcrunch.com": "https://techcrunch.com/feed/",
      "dev.to": "https://dev.to/feed",
      "css-tricks.com": "https://css-tricks.com/feed/",
      "blog.mozilla.org": "https://blog.mozilla.org/feed/",
      "a11yproject.com": "https://www.a11yproject.com/feed.xml",
      "smashingmagazine.com": "https://www.smashingmagazine.com/feed/",
      "alistapart.com": "https://alistapart.com/main/feed/",
      "www.rocketseat.com.br": "https://www.rocketseat.com.br/blog/rss",
      "rocketseat.com.br": "https://www.rocketseat.com.br/blog/rss",
    };

    // Check if we have a known RSS feed for this domain
    const knownRssUrl = knownRssFeeds[domain];
    if (knownRssUrl) {
      const isValid = await checkRssValidity(knownRssUrl);
      if (isValid) {
        return knownRssUrl;
      }
    }

    // Try to fetch the page and look for RSS autodiscovery
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FeedReader/1.0)",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const html = await response.text();

        // Look for RSS autodiscovery links
        const rssLinkMatches = html.match(
          /<link[^>]*rel=["\'](?:alternate|feed)["\'][^>]*href=["\']([^"']+)["\'][^>]*>/gi
        );

        if (rssLinkMatches) {
          for (const linkMatch of rssLinkMatches) {
            const hrefMatch = linkMatch.match(/href=["\']([^"']+)["\']/);
            if (hrefMatch && hrefMatch[1]) {
              let feedUrl = hrefMatch[1];

              // Convert relative URLs to absolute
              if (feedUrl.startsWith("//")) {
                feedUrl = urlObj.protocol + feedUrl;
              } else if (feedUrl.startsWith("/")) {
                feedUrl = `${urlObj.protocol}//${urlObj.host}${feedUrl}`;
              }

              // Check if it's a valid RSS feed
              const isValid = await checkRssValidity(feedUrl);
              if (isValid) {
                return feedUrl;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching page for RSS discovery:", error);
    }

    // Fallback: try common RSS paths
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    const commonPaths = [
      "/feed/",
      "/rss/",
      "/atom.xml",
      "/feed.xml",
      "/index.xml",
      "/rss.xml",
      "/blog/rss",
      "/blog/feed",
      "/blog/rss.xml",
      "/blog/feed.xml",
    ];

    for (const path of commonPaths) {
      const testUrl = `${baseUrl}${path}`;
      const isValid = await checkRssValidity(testUrl);
      if (isValid) {
        return testUrl;
      }
    }

    return null;
  } catch (error) {
    console.error("Error finding RSS feed:", error);
    return null;
  }
}

async function fetchUrlPreview(
  url: string
): Promise<{ title: string; description: string; favicon?: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FeedReader/1.0)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return null;
    }

    const content = await response.text();

    // Extract title from RSS/Atom feed or HTML
    let title = "";
    let description = "";
    let favicon = "";

    // Try RSS/Atom feed parsing first
    const titleMatch = content.match(
      /<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i
    );
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    // Try description from RSS/Atom
    const descMatch =
      content.match(
        /<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/i
      ) ||
      content.match(
        /<subtitle[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/subtitle>/i
      );
    if (descMatch) {
      description = descMatch[1].trim();
    }

    // If no title found in RSS, try HTML meta tags
    if (!title) {
      const htmlTitleMatch =
        content.match(
          /<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i
        ) ||
        content.match(
          /<meta[^>]*name=["\']title["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i
        );
      if (htmlTitleMatch) {
        title = htmlTitleMatch[1].trim();
      }
    }

    // If no description found in RSS, try HTML meta tags
    if (!description) {
      const htmlDescMatch =
        content.match(
          /<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i
        ) ||
        content.match(
          /<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i
        );
      if (htmlDescMatch) {
        description = htmlDescMatch[1].trim();
      }
    }

    // Try to extract favicon
    const faviconMatch = content.match(
      /<link[^>]*rel=["\'](?:icon|shortcut icon)["\'][^>]*href=["\']([^"']+)["\'][^>]*>/i
    );
    if (faviconMatch) {
      favicon = faviconMatch[1];
      const urlObj = new URL(url);

      // Convert relative URLs to absolute
      if (favicon.startsWith("//")) {
        favicon = urlObj.protocol + favicon;
      } else if (favicon.startsWith("/")) {
        favicon = `${urlObj.protocol}//${urlObj.host}${favicon}`;
      }
    }

    return {
      title: extractMainTitle(title || "Untitled Feed"),
      description: description || "No description available",
      favicon,
    };
  } catch (error) {
    console.error("Error fetching preview:", error);
    return null;
  }
}
