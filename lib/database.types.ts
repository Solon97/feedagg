export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          digest_frequency: "daily" | "weekly" | "monthly";
          digest_time: string;
          timezone: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          digest_frequency?: "daily" | "weekly" | "monthly";
          digest_time?: string;
          timezone?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          digest_frequency?: "daily" | "weekly" | "monthly";
          digest_time?: string;
          timezone?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      content_sources: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          url: string;
          source_type: "rss" | "website" | "youtube" | "twitter" | "newsletter";
          description: string | null;
          category: string | null;
          is_active: boolean;
          last_fetched_at: string | null;
          fetch_frequency: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          url: string;
          source_type?:
            | "rss"
            | "website"
            | "youtube"
            | "twitter"
            | "newsletter";
          description?: string | null;
          category?: string | null;
          is_active?: boolean;
          last_fetched_at?: string | null;
          fetch_frequency?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          url?: string;
          source_type?:
            | "rss"
            | "website"
            | "youtube"
            | "twitter"
            | "newsletter";
          description?: string | null;
          category?: string | null;
          is_active?: boolean;
          last_fetched_at?: string | null;
          fetch_frequency?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      content_items: {
        Row: {
          id: string;
          source_id: string;
          title: string;
          content: string | null;
          summary: string | null;
          author: string | null;
          url: string;
          published_at: string | null;
          thumbnail_url: string | null;
          read_time_minutes: number | null;
          content_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          title: string;
          content?: string | null;
          summary?: string | null;
          author?: string | null;
          url: string;
          published_at?: string | null;
          thumbnail_url?: string | null;
          read_time_minutes?: number | null;
          content_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          title?: string;
          content?: string | null;
          summary?: string | null;
          author?: string | null;
          url?: string;
          published_at?: string | null;
          thumbnail_url?: string | null;
          read_time_minutes?: number | null;
          content_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_content: {
        Row: {
          id: string;
          user_id: string;
          content_item_id: string;
          is_read: boolean;
          is_favorite: boolean;
          notes: string | null;
          tags: string[] | null;
          saved_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_item_id: string;
          is_read?: boolean;
          is_favorite?: boolean;
          notes?: string | null;
          tags?: string[] | null;
          saved_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_item_id?: string;
          is_read?: boolean;
          is_favorite?: boolean;
          notes?: string | null;
          tags?: string[] | null;
          saved_at?: string;
          read_at?: string | null;
        };
      };
      digest_history: {
        Row: {
          id: string;
          user_id: string;
          digest_date: string;
          content_item_ids: string[] | null;
          email_sent_at: string | null;
          email_opened_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          digest_date: string;
          content_item_ids?: string[] | null;
          email_sent_at?: string | null;
          email_opened_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          digest_date?: string;
          content_item_ids?: string[] | null;
          email_sent_at?: string | null;
          email_opened_at?: string | null;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: "light" | "dark" | "system";
          email_notifications: boolean;
          digest_preview: boolean;
          content_per_digest: number;
          preferred_categories: string[] | null;
          blocked_keywords: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: "light" | "dark" | "system";
          email_notifications?: boolean;
          digest_preview?: boolean;
          content_per_digest?: number;
          preferred_categories?: string[] | null;
          blocked_keywords?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: "light" | "dark" | "system";
          email_notifications?: boolean;
          digest_preview?: boolean;
          content_per_digest?: number;
          preferred_categories?: string[] | null;
          blocked_keywords?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
