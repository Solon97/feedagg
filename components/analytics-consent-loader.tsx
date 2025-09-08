"use client";
import { useEffect } from "react";

function hasConsentAll() {
  if (typeof document === "undefined") return false;
  const m = document.cookie.match(/(?:^|; )cookie_consent=([^;]+)/);
  return m && decodeURIComponent(m[1]) === "all";
}

export function AnalyticsConsentLoader() {
  useEffect(() => {
    if (!hasConsentAll()) return;
    const id = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
    const src = process.env.NEXT_PUBLIC_UMAMI_SRC;
    if (!id || !src) return;
    const s = document.createElement("script");
    s.async = true;
    s.defer = true;
    s.setAttribute("data-website-id", id);
    s.src = src;
    document.body.appendChild(s);
    return () => {
      try {
        document.body.removeChild(s);
      } catch {}
    };
  }, []);
  return null;
}
