"use client";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  loading?: boolean;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 30000; // 30 segundos

  get<T>(key: string, ttl: number = this.DEFAULT_TTL): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  setLoading(key: string): void {
    const existing = this.cache.get(key);
    this.cache.set(key, {
      data: existing?.data || null,
      timestamp: existing?.timestamp || Date.now(),
      loading: true,
    });
  }

  isLoading(key: string): boolean {
    const entry = this.cache.get(key);
    return entry?.loading || false;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const apiCache = new APICache();
