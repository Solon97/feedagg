"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { SavedContentList } from "@/features/saved-content/components/saved-content-list";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { Card, CardContent } from "@/components/ui/card";

function SavedContentPageContent() {
  const { user, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>

            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <a href="/auth" className="text-blue-600 hover:underline">
              Sign in to continue
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
            <p className="text-gray-600 mb-4">
              Please sign in to view your saved content.
            </p>
            <a href="/auth" className="text-blue-600 hover:underline">
              Sign in to continue
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <SavedContentList userId={user.id} />
      </main>
    </div>
  );
}

export default function SavedContentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SavedContentPageContent />
    </Suspense>
  );
}
