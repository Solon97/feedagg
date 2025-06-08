export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      content_items: {
        Row: {
          author: string | null
          content: string | null
          content_hash: string | null
          created_at: string
          feed_source_id: string | null
          id: string
          published_at: string | null
          read_time_minutes: number | null
          source_id: string
          summary: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          author?: string | null
          content?: string | null
          content_hash?: string | null
          created_at?: string
          feed_source_id?: string | null
          id?: string
          published_at?: string | null
          read_time_minutes?: number | null
          source_id: string
          summary?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          author?: string | null
          content?: string | null
          content_hash?: string | null
          created_at?: string
          feed_source_id?: string | null
          id?: string
          published_at?: string | null
          read_time_minutes?: number | null
          source_id?: string
          summary?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_feed_source_id_fkey"
            columns: ["feed_source_id"]
            isOneToOne: false
            referencedRelation: "feed_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "content_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      content_sources: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          fetch_frequency: number | null
          id: string
          is_active: boolean | null
          last_fetched_at: string | null
          name: string
          source_type: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          fetch_frequency?: number | null
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
          name: string
          source_type?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          fetch_frequency?: number | null
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
          name?: string
          source_type?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_sources_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      digest_history: {
        Row: {
          content_item_ids: string[] | null
          created_at: string
          digest_date: string
          email_opened_at: string | null
          email_sent_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          content_item_ids?: string[] | null
          created_at?: string
          digest_date: string
          email_opened_at?: string | null
          email_sent_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content_item_ids?: string[] | null
          created_at?: string
          digest_date?: string
          email_opened_at?: string | null
          email_sent_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digest_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_sources: {
        Row: {
          created_at: string
          fetch_frequency: number | null
          id: string
          last_fetched_at: string | null
          source_type: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          fetch_frequency?: number | null
          id?: string
          last_fetched_at?: string | null
          source_type?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          fetch_frequency?: number | null
          id?: string
          last_fetched_at?: string | null
          source_type?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          digest_frequency: string | null
          digest_time: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          digest_frequency?: string | null
          digest_time?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          digest_frequency?: string | null
          digest_time?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_content: {
        Row: {
          content_item_id: string
          id: string
          is_favorite: boolean | null
          is_read: boolean | null
          notes: string | null
          read_at: string | null
          saved_at: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          content_item_id: string
          id?: string
          is_favorite?: boolean | null
          is_read?: boolean | null
          notes?: string | null
          read_at?: string | null
          saved_at?: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          content_item_id?: string
          id?: string
          is_favorite?: boolean | null
          is_read?: boolean | null
          notes?: string | null
          read_at?: string | null
          saved_at?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_content_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_content_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feed_subscriptions: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          feed_source_id: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          feed_source_id: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          feed_source_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feed_subscriptions_feed_source_id_fkey"
            columns: ["feed_source_id"]
            isOneToOne: false
            referencedRelation: "feed_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feed_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          blocked_keywords: string[] | null
          content_per_digest: number | null
          created_at: string
          digest_preview: boolean | null
          email_notifications: boolean | null
          id: string
          preferred_categories: string[] | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked_keywords?: string[] | null
          content_per_digest?: number | null
          created_at?: string
          digest_preview?: boolean | null
          email_notifications?: boolean | null
          id?: string
          preferred_categories?: string[] | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked_keywords?: string[] | null
          content_per_digest?: number | null
          created_at?: string
          digest_preview?: boolean | null
          email_notifications?: boolean | null
          id?: string
          preferred_categories?: string[] | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

