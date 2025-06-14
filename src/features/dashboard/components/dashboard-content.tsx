"use client";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useSavedContent } from "@/features/saved-content/hooks/use-saved-content";
import { useContentSources } from "@/features/content-sources/hooks/use-content-sources";
import { useRecentContentItems } from "@/features/content-items/hooks/use-content-items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookmarkIcon,
  RssIcon,
  FileTextIcon,
  TrendingUpIcon,
  ClockIcon,
  HeartIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
} from "lucide-react";
import Link from "next/link";

export function DashboardContent() {
  const { user, isLoading: userLoading } = useCurrentUser();

  const { savedContent, isLoading: savedContentLoading } = useSavedContent(
    user?.id || ""
  );

  const { contentSources, isLoading: sourcesLoading } = useContentSources(
    user?.id || "",
    { limit: 10 }
  );

  const { contentItems: recentItems, isLoading: itemsLoading } =
    useRecentContentItems(user?.id || "", 5);

  if (userLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Welcome to FeedAgg</h2>
        <p className="text-gray-600 mb-4">
          Please sign in to see your dashboard.
        </p>
        <Button asChild>
          <Link href="/auth">Sign In</Link>
        </Button>
      </div>
    );
  }

  const activeSources = contentSources.filter((source) => source.isActive);
  const inactiveSources = contentSources.filter((source) => !source.isActive);
  const unreadContent = savedContent.filter((item) => !item.isRead);
  const favoriteContent = savedContent.filter((item) => item.isFavorite);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user.displayName || user.email}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Saved Content"
          value={savedContent.length}
          icon={<BookmarkIcon className="w-6 h-6" />}
          description={`${unreadContent.length} unread`}
          isLoading={savedContentLoading}
        />

        <StatCard
          title="Content Sources"
          value={contentSources.length}
          icon={<RssIcon className="w-6 h-6" />}
          description={`${activeSources.length} active`}
          isLoading={sourcesLoading}
        />

        <StatCard
          title="Favorites"
          value={favoriteContent.length}
          icon={<HeartIcon className="w-6 h-6" />}
          description="Starred content"
          isLoading={savedContentLoading}
        />

        <StatCard
          title="Recent Items"
          value={recentItems.length}
          icon={<FileTextIcon className="w-6 h-6" />}
          description="Last 24 hours"
          isLoading={itemsLoading}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 flex-col">
              <Link href="/feeds">
                <RssIcon className="w-8 h-8 mb-2" />
                <span>Manage Sources</span>
                <span className="text-sm text-gray-500">
                  {contentSources.length} sources
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col">
              <Link href="/saved-content">
                <BookmarkIcon className="w-8 h-8 mb-2" />
                <span>Saved Content</span>
                <span className="text-sm text-gray-500">
                  {savedContent.length} items
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col">
              <Link href="/news">
                <TrendingUpIcon className="w-8 h-8 mb-2" />
                <span>Browse News</span>
                <span className="text-sm text-gray-500">Latest updates</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Saved Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookmarkIcon className="w-5 h-5" />
                Recent Saved Content
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/saved-content">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {savedContentLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : savedContent.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No saved content yet
              </p>
            ) : (
              <div className="space-y-3">
                {savedContent.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">
                        Content Item {/* TODO: Get actual title */}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.isRead ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(item.savedAt).toLocaleDateString()}
                        </span>
                        {item.isFavorite && (
                          <HeartIcon className="w-4 h-4 text-red-500 fill-current" />
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLinkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Sources Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <RssIcon className="w-5 h-5" />
                Content Sources
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/feeds">Manage</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sourcesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : contentSources.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">No content sources yet</p>
                <Button asChild size="sm">
                  <Link href="/feeds">Add Your First Source</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {contentSources.slice(0, 5).map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{source.name}</p>
                        <Badge
                          variant={source.isActive ? "default" : "secondary"}
                        >
                          {source.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {source.url}
                      </p>
                    </div>
                  </div>
                ))}
                {contentSources.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{contentSources.length - 5} more sources
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  isLoading: boolean;
}

function StatCard({
  title,
  value,
  icon,
  description,
  isLoading,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-2"></div>
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className="text-gray-400">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
