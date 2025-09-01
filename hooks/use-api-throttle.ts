"use client";

import { useEffect, useRef } from "react";

// Hook para evitar chamadas HEAD desnecessárias frequentes
export function useAPIThrottle<T extends any[]>(
  callback: (...args: T) => Promise<any> | void,
  delay: number = 5000 // 5 segundos por padrão
) {
  const lastCallTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = (...args: T) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime.current;

    if (timeSinceLastCall >= delay) {
      // Execute imediatamente se passou tempo suficiente
      lastCallTime.current = now;
      return callback(...args);
    } else {
      // Agenda para executar quando o tempo for suficiente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lastCallTime.current = Date.now();
        callback(...args);
      }, delay - timeSinceLastCall);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}
