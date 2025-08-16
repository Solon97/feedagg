"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle OAuth callback - Supabase should automatically process URL params
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        // If there's an error in the callback, redirect to login
        if (error) {
          console.error("OAuth error:", error);
          window.location.href = "/auth/login";
          return;
        }

        // If there's a code, this is an OAuth callback - wait for Supabase to process it
        if (code) {
          // Try to exchange code for session (newer Supabase versions)
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(
              code
            );
            if (error) throw error;

            if (data?.session?.user) {
              // Session established, wait a bit more for context to update
              await new Promise((resolve) => setTimeout(resolve, 500));

              setIsRedirecting(true);
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
          } catch (exchangeError) {
            // Fallback for older Supabase versions - the callback should be processed automatically
            console.log(
              "Code exchange not available, waiting for automatic processing..."
            );
          }
        }

        // Wait for Supabase to automatically process the authentication
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Session error:", sessionError);
            break;
          }

          // If we have a session with a user, proceed with redirect
          if (session?.user) {
            setIsRedirecting(true);

            // Extra wait to ensure the auth context is updated
            await new Promise((resolve) => setTimeout(resolve, 300));

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

          attempts++;
        }

        // If we still don't have a session after all attempts, redirect to login
        console.warn(
          "No session found after OAuth callback, redirecting to login"
        );
        window.location.href = "/auth/login";
      } catch (error) {
        console.error("Auth callback error:", error);
        window.location.href = "/auth/login";
      }
    };

    handleAuthCallback();

    // Fallback timeout (increased to give more time for OAuth processing)
    const timeout = setTimeout(() => {
      if (!isRedirecting) {
        console.warn("Auth callback timeout, redirecting to login");
        window.location.href = "/auth/login";
      }
    }, 20000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-slate-400">
          {isRedirecting ? "Redirecionando..." : "Processando login..."}
        </p>
      </div>
    </div>
  );
}
