"use client";

import { useState, useCallback } from "react";

export interface UrlValidationResult {
  isValid: boolean;
  type?: "rss" | "youtube";
  error?: string;
  rssUrl?: string;
  preview?: {
    title: string;
    description: string;
    favicon?: string;
  };
}

interface UseUrlValidationReturn {
  validateUrl: (url: string) => Promise<UrlValidationResult>;
  isValidating: boolean;
  lastResult: UrlValidationResult | null;
}

export function useUrlValidation(): UseUrlValidationReturn {
  const [isValidating, setIsValidating] = useState(false);
  const [lastResult, setLastResult] = useState<UrlValidationResult | null>(
    null
  );

  const validateUrl = useCallback(
    async (url: string): Promise<UrlValidationResult> => {
      setIsValidating(true);
      try {
        const response = await fetch("/api/validate-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: UrlValidationResult = await response.json();
        setLastResult(result);
        return result;
      } catch (error) {
        const errorResult: UrlValidationResult = {
          isValid: false,
          error:
            error instanceof Error ? error.message : "Unknown validation error",
        };
        setLastResult(errorResult);
        return errorResult;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  return {
    validateUrl,
    isValidating,
    lastResult,
  };
}
