"use client";

import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      logger.info("Connection restored");
    };

    const handleOffline = () => {
      setIsOnline(false);
      logger.info("Connection lost");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export function OnlineStatusIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 text-sm text-center font-medium">
      📡 Você está offline. Algumas funcionalidades podem não estar disponíveis.
    </div>
  );
}
