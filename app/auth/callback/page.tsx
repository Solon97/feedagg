"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { useSecureAuth } from "@/hooks/use-secure-auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { replaceSecure } = useSecureAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the auth callback using Supabase
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          logger.error("Auth callback error", { error: error.message });
          // Redirect to login with error
          replaceSecure("/auth/login?error=callback_failed");
          return;
        }

        if (data?.session) {
          logger.info("Auth callback successful", {
            userId: data.session.user?.id,
            provider: data.session.user?.app_metadata?.provider,
          });

          // Check if there's a YouTube channel ID stored (for subscribe flow)
          const storedChannelId = localStorage.getItem(
            "yt_subscribe_channel_id"
          );
          if (storedChannelId) {
            localStorage.removeItem("yt_subscribe_channel_id");
            // Redirect back to the item page - we'll handle the subscription there
            replaceSecure(`/item/video/${storedChannelId}`);
            return;
          }

          // Clean URL and redirect to main page
          replaceSecure("/feeds");
        } else {
          logger.warn("Auth callback completed but no session found");
          replaceSecure("/auth/login");
        }
      } catch (error: any) {
        logger.error("Unexpected auth callback error", {
          error: error.message,
        });
        replaceSecure("/auth/login?error=unexpected_error");
      }
    };

    handleAuthCallback();
  }, [replaceSecure]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Processando login...</p>
      </div>
    </div>
  );
}
