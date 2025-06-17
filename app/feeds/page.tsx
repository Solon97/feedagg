"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { RouteGuard } from "@/components/route-guard";

// Disable SSR for the feeds page content to ensure client-side initialization
const FeedsPageContent = dynamic(
  () =>
    import("@/features/feeds/components/feeds-page-content").then((mod) => ({
      default: mod.FeedsPageContent,
    })),
  { ssr: false }
);

export default function FeedsPage() {
  return (
    <RouteGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <FeedsPageContent />
      </Suspense>
    </RouteGuard>
  );
}
