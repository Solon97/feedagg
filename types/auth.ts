import type { User, Session } from "@supabase/supabase-js";

export interface AuthUser extends User {
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithMicrosoft: () => Promise<{ error: any }>;
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}
