"use client";
import { Workbox } from "workbox-window";

const isProd = process.env.NODE_ENV === "production";
const disabled =
  typeof process !== "undefined" &&
  (process.env.NEXT_PUBLIC_PWA_DISABLE === "1" ||
    process.env.NEXT_PUBLIC_PWA_DISABLE === "true");

export function registerSW(onUpdate?: (refresh: () => void) => void) {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (!isProd || disabled) return;

  // Support basePath via NEXT_PUBLIC_BASE_PATH
  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH &&
    process.env.NEXT_PUBLIC_BASE_PATH !== "/"
      ? process.env.NEXT_PUBLIC_BASE_PATH!.startsWith("/")
        ? process.env.NEXT_PUBLIC_BASE_PATH!
        : "/" + process.env.NEXT_PUBLIC_BASE_PATH!
      : "";

  const swUrl = `${basePath}/sw.js`;
  const wb = new Workbox(swUrl);

  wb.addEventListener("waiting", () => {
    const doRefresh = () => {
      wb.addEventListener("controlling", () => window.location.reload());
      wb.messageSkipWaiting();
    };
    onUpdate?.(doRefresh);
  });

  wb.addEventListener("externalwaiting", () => {
    const doRefresh = () => {
      wb.addEventListener("controlling", () => window.location.reload());
      wb.messageSkipWaiting();
    };
    onUpdate?.(doRefresh);
  });

  wb.register();
}
