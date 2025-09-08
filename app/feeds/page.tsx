"use client";

import { AddFeedForm } from "@/components/add-feed-form";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useFeeds } from "@/hooks/use-feeds";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";
import { useSubscription } from "@/hooks/use-subscription";
import type { UserFeedSubscription } from "@/types/api";
import {
  CheckCircle,
  Crown,
  Loader2,
  Power,
  PowerOff,
  Rss,
  Trash2,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function FeedsPage() {
  const { t, localizedDate } = useLocalizedTranslations();
  const { user } = useAuth();
  const { feeds, loading, error, refetch, updateFeedStatus, deleteFeed } =
    useFeeds();

  const { isActive: isPremium, loading: subscriptionLoading } = useSubscription(
    user?.id
  );
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Check if user can add more feeds
  function canAddMoreFeeds() {
    return isPremium || feeds.length < 1;
  }

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleFeedAdded = () => {
    refetch();
    setMessage({ type: "success", text: t("feeds.messages.subscribed") });
  };

  const handleToggleStatus = async (subscription: UserFeedSubscription) => {
    const feedId = subscription.feed.id;
    const newStatus = !subscription.is_active;

    try {
      setUpdatingStatus(feedId);
      const result = await updateFeedStatus(feedId, newStatus);
      if (result.success) {
        setMessage({
          type: "success",
          text: newStatus
            ? t("feeds.messages.activated")
            : t("feeds.messages.deactivated"),
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || t("feeds.messages.updateError"),
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: t("feeds.messages.updateError"),
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (subscription: UserFeedSubscription) => {
    if (!confirm(`${t("feeds.confirmDelete")} "${subscription.feed.name}"?`))
      return;

    const result = await deleteFeed(subscription.feed.id);
    if (result.success) {
      setMessage({ type: "success", text: t("feeds.messages.unsubscribed") });
    } else {
      setMessage({
        type: "error",
        text: result.error || t("feeds.messages.deleteError"),
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {t("feeds.manageTitle")}
            </h1>
            <p className="text-gray-400">{t("feeds.manageDescription")}</p>
          </div>

          {/* Message */}
          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className={`mb-6 ${
                message.type === "success"
                  ? "bg-green-900/20 border-green-700/50 text-green-300"
                  : "bg-red-900/20 border-red-700/50"
              }`}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Add New Feed */}
          {subscriptionLoading ? (
            <Card className="mb-8 bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-slate-700 rounded mb-2 w-1/3"></div>
                  <div className="h-4 bg-slate-700 rounded mb-2 w-2/3"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ) : canAddMoreFeeds() ? (
            <div className="mb-8">
              <AddFeedForm onSuccess={handleFeedAdded} />
            </div>
          ) : (
            <Card className="mb-8 bg-yellow-900/20 border-yellow-700/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Crown className="w-5 h-5" />
                  <p>
                    {t("feeds.upgrade.freeLimit")}{" "}
                    <Link
                      href="/subscribe"
                      className="underline hover:text-yellow-300 ml-1"
                    >
                      {t("feeds.upgrade.premiumAction")}
                    </Link>{" "}
                    {t("feeds.upgrade.unlimitedFeeds")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="mb-6 bg-red-900/20 border-red-700/50">
              <CardContent className="p-4">
                <p className="text-red-300">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Feeds List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-slate-700 rounded mb-2 w-1/3"></div>
                      <div className="h-4 bg-slate-700 rounded mb-2 w-2/3"></div>
                      <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : feeds.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-12 text-center">
                <Rss className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t("feeds.empty.title")}
                </h3>
                <p className="text-gray-400">{t("feeds.empty.description")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {feeds.map((subscription: UserFeedSubscription) => {
                const feed = subscription.feed;
                const isUpdating = updatingStatus === feed.id;

                return (
                  <Card
                    key={feed.id}
                    className="bg-slate-800/50 border-slate-700/50 shadow-lg"
                  >
                    <CardContent className="p-4 md:p-6">
                      {/* Mobile-first layout */}
                      <div className="feed-item-mobile">
                        {/* Header with name and actions */}
                        <div className="feed-header">
                          <div className="flex-1 min-w-0">
                            <h3 className="feed-title">{feed.name}</h3>
                          </div>
                          <div className="feed-actions">
                            <Button
                              onClick={() => handleToggleStatus(subscription)}
                              variant="outline"
                              size="sm"
                              className="border-slate-600 feed-action-button"
                              disabled={isUpdating}
                              aria-label={
                                subscription.is_active
                                  ? t("feeds.status.deactivate")
                                  : t("feeds.status.activate")
                              }
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : subscription.is_active ? (
                                <PowerOff className="w-4 h-4" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </Button>
                            {!subscription.is_active && (
                              <Button
                                onClick={() => handleDelete(subscription)}
                                variant="outline"
                                size="sm"
                                className="border-red-700/50 text-red-400 hover:bg-red-900/20 feed-action-button"
                                aria-label={t("feeds.delete")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Status and type badges */}
                        <div className="feed-badges">
                          <Badge
                            variant="secondary"
                            className={
                              subscription.is_active
                                ? "bg-green-900/30 text-green-400 border-green-700/50"
                                : "bg-gray-900/30 text-gray-400 border-gray-700/50"
                            }
                          >
                            {subscription.is_active ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <PowerOff className="w-3 h-3" />
                            )}
                            <span className="ml-1 feed-badge">
                              {subscription.is_active
                                ? t("feeds.status.active")
                                : t("feeds.status.inactive")}
                            </span>
                          </Badge>

                          {feed.url.includes("youtube") && (
                            <Badge
                              variant="outline"
                              className="border-red-700/50 text-red-400"
                            >
                              <Youtube className="w-3 h-3 mr-1" />
                              <span className="feed-badge">YouTube</span>
                            </Badge>
                          )}

                          {subscription.topic && (
                            <Badge
                              variant="outline"
                              className="border-teal-700/50 text-teal-400"
                            >
                              {subscription.topic.color && (
                                <div
                                  className="w-2 h-2 rounded-full mr-1"
                                  style={{
                                    backgroundColor: subscription.topic.color,
                                  }}
                                />
                              )}
                              <span className="feed-badge">
                                {subscription.topic.name}
                              </span>
                            </Badge>
                          )}
                        </div>

                        {/* URL */}
                        <div className="space-y-1">
                          <p className="feed-url">{feed.url}</p>
                          <p className="feed-meta">
                            {t("feeds.lastFetched")}{" "}
                            {localizedDate(feed.last_fetched_at)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
