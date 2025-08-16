"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session to check if user is already authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // User is authenticated, redirect appropriately
          const storedChannelId = localStorage.getItem(
            "yt_subscribe_channel_id"
          );
          if (storedChannelId) {
            localStorage.removeItem("yt_subscribe_channel_id");
            window.location.href = `/item/video/${storedChannelId}`;
          } else {
            window.location.href = "/";
          }
          return;
        }

        // If no session, wait a bit and try again (OAuth might still be processing)
        setTimeout(async () => {
          const {
            data: { session: retrySession },
          } = await supabase.auth.getSession();

          if (retrySession) {
            const storedChannelId = localStorage.getItem(
              "yt_subscribe_channel_id"
            );
            if (storedChannelId) {
              localStorage.removeItem("yt_subscribe_channel_id");
              window.location.href = `/item/video/${storedChannelId}`;
            } else {
              window.location.href = "/";
            }
          } else {
            // Still no session, redirect to login
            window.location.href = "/auth/login";
          }
        }, 2000);
      } catch (error) {
        console.error("Auth callback error:", error);
        window.location.href = "/auth/login";
      }
    };

    handleAuthCallback();

    // Fallback timeout
    const timeout = setTimeout(() => {
      window.location.href = "/auth/login";
    }, 10000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Processando login...</p>
      </div>
    </div>
  );
}
