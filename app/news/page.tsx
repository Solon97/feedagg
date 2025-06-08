"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<NewsPageSkeleton />}>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Latest News</h1>
          <p className="text-muted-foreground">
            News page is being refactored with the new Clean Architecture.
            Coming soon!
          </p>
        </div>
      </Suspense>
    </div>
  );
}

function NewsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Filters Skeleton */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="w-[140px] h-10 bg-muted rounded animate-pulse" />
            <div className="w-20 h-10 bg-muted rounded animate-pulse" />
            <div className="w-20 h-10 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-3 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="flex justify-between">
                <div className="h-3 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
