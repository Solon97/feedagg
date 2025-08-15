"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const storedChannelId = localStorage.getItem("yt_subscribe_channel_id");
        if (storedChannelId) {
          localStorage.removeItem("yt_subscribe_channel_id");
          window.location.href = `/item/video/${storedChannelId}`;
        } else {
          window.location.href = "/";
        }
      } else if (
        event === "SIGNED_OUT" ||
        (event === "TOKEN_REFRESHED" && !session)
      ) {
        window.location.href = "/auth/login";
      }
    });

    const timeout = setTimeout(() => {
      window.location.href = "/auth/login";
    }, 10000);

    return () => {
      subscription.unsubscribe();
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
