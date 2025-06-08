"use client";

import { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  timestamp: number;
}

interface AuthEventData {
  type: "AUTH_CHANGE" | "LOGOUT" | "LOGIN";
  user: User | null;
  timestamp: number;
}

type AuthEventListener = (
  user: User | null,
  eventType?: AuthEventData["type"]
) => void;

class AuthEventManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<AuthEventListener> = new Set();
  private cache: AuthState | null = null;
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds cache
  private isCheckingAuth = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize();
    }
  }

  private initialize() {
    // Initialize Broadcast Channel for cross-tab communication
    this.channel = new BroadcastChannel("dgestly-auth");
    this.channel.addEventListener(
      "message",
      this.handleBroadcastMessage.bind(this)
    );

    // Listen for window focus to check auth when user returns
    window.addEventListener("focus", this.handleWindowFocus.bind(this));

    // Listen for localStorage changes (fallback for older browsers)
    window.addEventListener("storage", this.handleStorageChange.bind(this));

    // Listen for page visibility changes
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );
  }
  private handleBroadcastMessage(event: MessageEvent<AuthEventData>) {
    const { type, user, timestamp } = event.data;

    console.log(`[AuthEvents] Received ${type} event from another tab`);

    // Update cache with the new data
    this.cache = { user, timestamp };

    // Notify all listeners with event type
    this.notifyListeners(user, type);
  }

  private handleWindowFocus() {
    console.log("[AuthEvents] Window focused, checking auth status");
    this.checkAuthStatus();
  }

  private handleVisibilityChange() {
    if (!document.hidden) {
      console.log("[AuthEvents] Page became visible, checking auth status");
      this.checkAuthStatus();
    }
  }

  private handleStorageChange(event: StorageEvent) {
    if (event.key === "dgestly-auth-state") {
      console.log("[AuthEvents] Auth state changed in localStorage");
      try {
        const authState = event.newValue ? JSON.parse(event.newValue) : null;
        if (authState) {
          this.cache = authState;
          this.notifyListeners(authState.user);
        }
      } catch (error) {
        console.error(
          "[AuthEvents] Failed to parse auth state from localStorage:",
          error
        );
      }
    }
  }

  private notifyListeners(
    user: User | null,
    eventType?: AuthEventData["type"]
  ) {
    this.listeners.forEach((listener) => {
      try {
        listener(user, eventType);
      } catch (error) {
        console.error("[AuthEvents] Error in auth listener:", error);
      }
    });
  }

  private isCacheValid(): boolean {
    if (!this.cache) return false;
    const now = Date.now();
    return now - this.cache.timestamp < this.CACHE_DURATION;
  }

  private updateCache(user: User | null) {
    const timestamp = Date.now();
    this.cache = { user, timestamp };

    // Store in localStorage as fallback
    try {
      localStorage.setItem("dgestly-auth-state", JSON.stringify(this.cache));
    } catch (error) {
      console.warn(
        "[AuthEvents] Failed to store auth state in localStorage:",
        error
      );
    }
  }

  private broadcast(type: AuthEventData["type"], user: User | null) {
    if (this.channel) {
      const eventData: AuthEventData = {
        type,
        user,
        timestamp: Date.now(),
      };
      this.channel.postMessage(eventData);
      console.log(`[AuthEvents] Broadcasting ${type} event to other tabs`);
    }
  }

  async checkAuthStatus(force = false): Promise<User | null> {
    // Return cached data if valid and not forced
    if (!force && this.isCacheValid()) {
      console.log("[AuthEvents] Using cached auth state");
      return this.cache!.user;
    }

    // Prevent multiple simultaneous calls
    if (this.isCheckingAuth) {
      console.log("[AuthEvents] Auth check already in progress, skipping");
      return this.cache?.user || null;
    }

    this.isCheckingAuth = true;

    try {
      console.log("[AuthEvents] Checking auth status with server");

      const response = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-cache",
      });

      let user: User | null = null;

      if (response.ok) {
        const data = await response.json();
        user = data.user || null;
      } else if (response.status !== 401) {
        console.error("[AuthEvents] Auth check failed:", response.status);
      }

      // Update cache
      this.updateCache(user);

      // Broadcast to other tabs
      this.broadcast("AUTH_CHANGE", user);

      // Notify listeners
      this.notifyListeners(user, "AUTH_CHANGE");

      return user;
    } catch (error) {
      console.error("[AuthEvents] Failed to check auth status:", error);
      return this.cache?.user || null;
    } finally {
      this.isCheckingAuth = false;
    }
  }

  async signOut(): Promise<void> {
    try {
      console.log("[AuthEvents] Signing out");

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }

      // Update cache
      this.updateCache(null);

      // Broadcast logout to other tabs
      this.broadcast("LOGOUT", null);

      // Notify listeners with logout event
      this.notifyListeners(null, "LOGOUT");
    } catch (error) {
      console.error("[AuthEvents] Sign out failed:", error);
      throw error;
    }
  }

  onAuthChange(listener: AuthEventListener): () => void {
    this.listeners.add(listener);

    // Immediately call with current cached state if available
    if (this.cache) {
      setTimeout(() => listener(this.cache!.user, undefined), 0);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  getCurrentUser(): User | null {
    return this.cache?.user || null;
  }

  isLoading(): boolean {
    return this.isCheckingAuth;
  }

  destroy() {
    if (this.channel) {
      this.channel.close();
    }

    window.removeEventListener("focus", this.handleWindowFocus.bind(this));
    window.removeEventListener("storage", this.handleStorageChange.bind(this));
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );

    this.listeners.clear();
    this.cache = null;
  }
}

// Singleton instance
export const authEvents = new AuthEventManager();
