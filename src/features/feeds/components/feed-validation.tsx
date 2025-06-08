"use client";

import { Check, X, AlertTriangle, Youtube, Rss } from "lucide-react";
import { UrlValidationResult } from "../hooks/use-url-validation";

interface FeedValidationProps {
  validationResult: UrlValidationResult | null;
  isValidating?: boolean;
}

export function FeedValidation({
  validationResult,
  isValidating,
}: FeedValidationProps) {
  if (isValidating) {
    return (
      <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          <span className="text-sm text-blue-800">Validating URL...</span>
        </div>
      </div>
    );
  }

  if (!validationResult) {
    return null;
  }

  if (validationResult.isValid) {
    return (
      <div className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 pt-1">
            {validationResult.type === "youtube" ? (
              <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            ) : (
              <Rss className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-green-800">
              Valid{" "}
              {validationResult.type === "youtube"
                ? "YouTube Channel"
                : "RSS Feed"}
            </p>
            {validationResult.preview && (
              <div className="mt-1">
                <p className="text-sm text-green-700 font-medium break-words">
                  {validationResult.preview.title}
                </p>
                {validationResult.preview.description && (
                  <p className="text-sm text-green-600 break-words">
                    {validationResult.preview.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200">
      <div className="flex items-start space-x-2">
        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-800 break-words">
          {validationResult.error || "Invalid URL"}
        </p>
      </div>
    </div>
  );
}

export function getValidationIcon(
  validationResult: UrlValidationResult | null
) {
  if (!validationResult) return null;

  if (validationResult.isValid) {
    return <Check className="h-4 w-4 text-green-500" />;
  }

  return <X className="h-4 w-4 text-red-500" />;
}
