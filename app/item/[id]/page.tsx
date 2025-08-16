"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSelectedItem } from "@/contexts/selected-item-context";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";
import { apiService } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { parseTextWithLinks } from "@/lib/text-utils";
import type { FeedItem } from "@/types/api";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Play,
  ThumbsUp,
  Youtube,
  User,
  UserPlus,
  Rss,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface ItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ItemPage({ params }: ItemPageProps) {
  const { t, localizedDate, localizedTime } = useLocalizedTranslations();
  const router = useRouter();
  const { selectedItem, setSelectedItem } = useSelectedItem();
  const { toast } = useToast();
  const [item, setItem] = useState<FeedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Unwrap the params Promise
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Strategy 1: Check if we have the item in local context and it matches the requested ID
        if (selectedItem && selectedItem.id === resolvedParams.id) {
          console.log("Using local data from context");
          setItem(selectedItem);
          setLoading(false);
          return;
        }

        // Strategy 2: Fetch from API if not available locally
        console.log(
          "Fetching from API - local data not available or doesn't match"
        );
        const response = await apiService.getFeedItem(resolvedParams.id);

        // The API now returns the item directly (not wrapped in data)
        setItem(response);
        setSelectedItem(response);
      } catch (err) {
        console.error("Error fetching item:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch item");
      } finally {
        setLoading(false);
      }
    };

    fetchItemData();
  }, [resolvedParams.id, selectedItem, setSelectedItem]);

  const getYouTubeVideoId = (url: string) => {
    // Handle regular YouTube URLs
    let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (match) return match[1];

    // Handle YouTube Shorts URLs
    match = url.match(/youtube\.com\/shorts\/([^&\n?#]+)/);
    if (match) return match[1];

    return null;
  };

  const isYouTubeShort = (url: string) => {
    return url.includes("/shorts/");
  };

  const extractYouTubeChannelId = (feedUrl?: string | null) => {
    if (!feedUrl) return null;
    try {
      const u = new URL(feedUrl);
      // Common YouTube feed URL pattern: feeds/videos.xml?channel_id=UCxxxx
      const chId = u.searchParams.get("channel_id");
      if (chId) return chId;
      // Fallback: if path contains /channel/UCxxxx
      const m = u.pathname.match(/\/channel\/([A-Za-z0-9_-]{10,})/);
      if (m) return m[1];
    } catch {}
    return null;
  };

  const truncateDescription = (content: string, maxLength = 300) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  const isMedium = (url: string) => {
    return url.includes("medium.com") || url.includes("/@");
  };

  // Handle post-login continuation of like/subscribe actions (must be before any early returns)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!item) return;
    const isYT =
      item.url.includes("youtube.com") || item.url.includes("youtu.be");
    if (!isYT) return;
    const currentVideoId = getYouTubeVideoId(item.url);
    const pendingLike = localStorage.getItem("yt_like_video_id");
    const pendingSubscribe = localStorage.getItem("yt_subscribe_channel_id");

    if (pendingLike && currentVideoId && pendingLike === currentVideoId) {
      (async () => {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        const providerToken = (currentSession as any)?.provider_token as
          | string
          | undefined;
        if (providerToken) {
          await likeVideo(currentVideoId, providerToken);
        }
        localStorage.removeItem("yt_like_video_id");
      })();
    }

    const chId = extractYouTubeChannelId(item.feed?.url);
    if (pendingSubscribe && chId && pendingSubscribe === chId) {
      (async () => {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        const providerToken = (currentSession as any)?.provider_token as
          | string
          | undefined;
        if (providerToken) {
          await subscribeChannel(chId, providerToken);
        }
        localStorage.removeItem("yt_subscribe_channel_id");
      })();
    }
  }, [item]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navbar />
          <div className="w-full md:max-w-6xl md:mx-auto px-0 md:px-4 py-6 lg:py-8">
            <div className="animate-pulse space-y-6 px-4 md:px-0">
              <div className="flex justify-between">
                <div className="h-8 bg-slate-700 rounded w-24"></div>
                <div className="h-8 bg-slate-700 rounded w-32"></div>
              </div>
              <div className="h-12 bg-slate-700 rounded w-3/4"></div>
              <div className="h-6 bg-slate-700 rounded w-1/2"></div>
              <div className="h-64 bg-slate-700 rounded"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                <div className="h-4 bg-slate-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !item) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navbar />
          <div className="w-full md:max-w-6xl md:mx-auto px-4 py-8">
            <Card className="bg-red-900/20 border-red-700/50">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold text-red-300 mb-2">
                  {t("errors.loadingError")}
                </h2>
                <p className="text-red-400 mb-4">
                  {error || t("errors.notFound")}
                </p>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-slate-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("common.goBack")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isYouTube =
    item.url.includes("youtube.com") || item.url.includes("youtu.be");
  const youtubeVideoId = isYouTube ? getYouTubeVideoId(item.url) : null;
  const youtubeChannelId = isYouTube
    ? extractYouTubeChannelId(item.feed?.url) || null
    : null;

  const startGoogleOAuthForYouTube = async (videoId: string) => {
    // Persist intent
    if (typeof window !== "undefined") {
      localStorage.setItem("yt_like_video_id", videoId);
    }
    const redirectTo =
      typeof window !== "undefined" ? window.location.href : undefined;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/youtube.force-ssl",
        redirectTo,
        queryParams: {
          prompt: "consent",
          access_type: "offline",
          include_granted_scopes: "true",
        },
      },
    });
  };

  const startGoogleOAuthForSubscribe = async (channelId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("yt_subscribe_channel_id", channelId);
    }
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Need both scopes for managing subscriptions and ensuring like scope remains if previously granted
        scopes:
          "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl",
        redirectTo,
        queryParams: {
          prompt: "consent",
          access_type: "offline",
          include_granted_scopes: "true",
        },
      },
    });
  };

  const likeVideo = async (videoId: string, providerToken?: string) => {
    try {
      setLiking(true);
      // Ensure we have a provider token
      let token = providerToken;
      if (!token) {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        token = (currentSession as any)?.provider_token as string | undefined;
      }

      if (!token) {
        // Re-initiate OAuth with YouTube scope to get provider token
        await startGoogleOAuthForYouTube(videoId);
        return;
      }

      const resp = await fetch("/api/youtube/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-provider-token": token,
        },
        body: JSON.stringify({ videoId }),
      });

      if (resp.ok) {
        setLiked(true);
        toast({
          title: "Vídeo curtido no YouTube",
          description: "Seu like foi registrado.",
          variant: "default" as any,
        });
      } else {
        const data = await resp.json().catch(() => ({}));
        if (resp.status === 403) {
          const reason =
            data?.details?.errors?.[0]?.reason ||
            data?.error?.errors?.[0]?.reason ||
            data?.error;
          if (reason === "insufficientPermissions") {
            toast({
              title: "Permissão do YouTube necessária",
              description:
                "Precisamos de permissão para curtir vídeos. Vamos solicitar o escopo ao Google.",
              variant: "default" as any,
            });
            await startGoogleOAuthForYouTube(videoId);
            return;
          } else if (reason === "youtubeSignupRequired") {
            toast({
              title: "Conta do YouTube necessária",
              description:
                "Você precisa criar/ativar seu canal do YouTube para curtir vídeos. Acesse youtube.com e finalize a configuração.",
              variant: "destructive" as any,
            });
            return;
          } else if (reason === "quotaExceeded") {
            toast({
              title: "Cota da API excedida",
              description:
                "A cota da API do YouTube foi excedida. Tente novamente mais tarde.",
              variant: "destructive" as any,
            });
            return;
          } else if (reason === "forbidden") {
            toast({
              title: "Acesso negado pelo YouTube",
              description:
                data?.error?.message ||
                "Não foi possível registrar o like. Verifique as permissões e tente novamente.",
              variant: "destructive" as any,
            });
            return;
          }
        }
        throw new Error(data?.error || `Erro: ${resp.status}`);
      }
    } catch (e: any) {
      toast({
        title: "Falha ao curtir",
        description: e?.message || "Tente novamente",
        variant: "destructive" as any,
      });
    } finally {
      setLiking(false);
    }
  };

  const subscribeChannel = async (
    channelId: string,
    providerToken?: string
  ) => {
    try {
      setSubscribing(true);
      let token = providerToken;
      if (!token) {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        token = (currentSession as any)?.provider_token as string | undefined;
      }

      if (!token) {
        await startGoogleOAuthForSubscribe(channelId);
        return;
      }

      const resp = await fetch("/api/youtube/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-provider-token": token,
        },
        body: JSON.stringify({ channelId }),
      });

      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        setSubscribed(true);
        toast({
          title: "Inscrito no canal",
          description: "Inscrição realizada com sucesso.",
          variant: "default" as any,
        });
        return;
      }

      if (resp.status === 403) {
        const reason =
          data?.reason ||
          data?.details?.errors?.[0]?.reason ||
          data?.error?.errors?.[0]?.reason ||
          data?.error;
        if (reason === "insufficientPermissions") {
          toast({
            title: "Permissão do YouTube necessária",
            description:
              "Precisamos de permissão para inscrever no canal. Vamos solicitar o escopo ao Google.",
            variant: "default" as any,
          });
          await startGoogleOAuthForSubscribe(channelId);
          return;
        } else if (reason === "youtubeSignupRequired") {
          toast({
            title: "Conta do YouTube necessária",
            description:
              "Ative seu canal do YouTube antes de se inscrever em outros canais.",
            variant: "destructive" as any,
          });
          return;
        } else if (reason === "quotaExceeded") {
          toast({
            title: "Cota da API excedida",
            description:
              "A cota da API do YouTube foi excedida. Tente mais tarde.",
            variant: "destructive" as any,
          });
          return;
        } else if (reason === "forbidden") {
          toast({
            title: "Acesso negado pelo YouTube",
            description:
              data?.error?.message ||
              "Não foi possível realizar a inscrição. Verifique as permissões.",
            variant: "destructive" as any,
          });
          return;
        }
      }

      if (resp.status === 409 || data?.reason === "subscriptionDuplicate") {
        setSubscribed(true);
        toast({
          title: "Já inscrito",
          description: "Você já está inscrito neste canal.",
          variant: "default" as any,
        });
        return;
      }

      throw new Error(data?.error || `Erro: ${resp.status}`);
    } catch (e: any) {
      toast({
        title: "Falha ao inscrever",
        description: e?.message || "Tente novamente",
        variant: "destructive" as any,
      });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

        <div className="w-full md:max-w-6xl md:mx-auto px-0 md:px-4 py-6 lg:py-8">
          {/* Top Navigation Bar - Now Horizontal */}
          <div className="flex items-center justify-between gap-3 mb-6 px-4 md:px-0">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-slate-600 text-gray-300 hover:bg-slate-700 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.goBack")}
            </Button>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button className="bg-teal-600 hover:bg-teal-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                {isYouTube
                  ? t("feedItems.watchOnYoutube")
                  : t("feedItems.readOriginal")}
              </Button>
            </a>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4 px-4 md:px-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {item.title}
              </h1>

              {/* Metadata Bar */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span className="font-medium text-teal-400">
                    {item.feed.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {localizedDate(item.published_at)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {localizedTime(item.published_at)}
                </div>
                {isYouTube && (
                  <Badge
                    variant="outline"
                    className="border-red-700/50 text-red-400"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    {isYouTubeShort(item.url) ? "Shorts" : "YouTube"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="px-4 md:px-0">
              <Separator className="bg-slate-700" />
            </div>

            {/* Media Content */}
            {youtubeVideoId && (
              <div className="space-y-4">
                {isYouTubeShort(item.url) ? (
                  // YouTube Shorts - Use different aspect ratio and parameters
                  <div className="aspect-[9/16] max-w-md mx-auto bg-slate-900 shadow-2xl overflow-hidden md:rounded-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&playsinline=1`}
                      title={item.title}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                ) : (
                  // Regular YouTube videos
                  <div className="aspect-video bg-slate-900 shadow-2xl overflow-hidden md:rounded-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                      title={item.title}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}

                {/* YouTube Action Box */}
                {(youtubeChannelId || youtubeVideoId) && (
                  <div className="mt-2 p-4 bg-red-900/30 border border-red-700/50 rounded-lg shadow-md ring-1 ring-teal-500/10">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-700/50 text-red-200 flex items-center justify-center shadow-inner">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-red-100 font-semibold mb-1">
                          Gostou do vídeo? Inscreva-se e curta no YouTube para
                          apoiar o criador.
                        </h4>
                        <div className="mt-6 flex flex-col sm:flex-row justify-center sm:justify-start gap-2">
                          {youtubeChannelId && (
                            <Button
                              className="flex-1 sm:flex-none bg-red-700/90 hover:bg-red-600 text-white border border-red-800/50 shadow-sm hover:shadow-red-900/30 transition-transform duration-150 ease-out hover:-translate-y-[1px] active:translate-y-0"
                              disabled={subscribing || subscribed}
                              onClick={async () => {
                                await subscribeChannel(youtubeChannelId);
                              }}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              {subscribed
                                ? "Inscrito"
                                : subscribing
                                ? "Inscrevendo..."
                                : "Inscrever-se no canal"}
                            </Button>
                          )}
                          {youtubeVideoId && (
                            <Button
                              className="flex-1 sm:flex-none bg-red-700/90 hover:bg-red-600 text-white border border-red-800/50 shadow-sm hover:shadow-red-900/30 transition-transform duration-150 ease-out hover:-translate-y-[1px] active:translate-y-0"
                              disabled={liking || liked}
                              onClick={async () => {
                                await likeVideo(youtubeVideoId);
                              }}
                            >
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              {liked
                                ? "Curtido"
                                : liking
                                ? "Curtindo..."
                                : "Curtir vídeo"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Non-YouTube Thumbnail */}
            {!isYouTube && item.thumbnail && (
              <div className="space-y-4">
                <div className="bg-slate-900 shadow-2xl overflow-hidden md:rounded-lg">
                  <img
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-auto max-h-96 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <Card className="bg-slate-800/30 border-slate-700/50 border-x-0 md:border-x rounded-none md:rounded-lg">
              <CardContent className="p-4 md:p-6 lg:p-8">
                {isYouTube ? (
                  /* YouTube Description with Show More/Less */
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {t("feedItems.description")}
                    </h3>
                    <div className="prose prose-invert prose-lg max-w-none">
                      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {item.content && item.content.trim() ? (
                          <div>
                            {parseTextWithLinks(
                              showFullDescription
                                ? item.content
                                : truncateDescription(item.content),
                              60
                            ).map((part, index) =>
                              typeof part === "string"
                                ? part
                                : React.cloneElement(
                                    part as React.ReactElement,
                                    {
                                      key: `link-${index}`,
                                    }
                                  )
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">
                            {t("feedItems.noDescription")}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.content && item.content.length > 300 && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setShowFullDescription(!showFullDescription)
                        }
                        className="text-teal-400 hover:text-teal-300 hover:bg-slate-700/50 p-0 h-auto font-normal"
                      >
                        {showFullDescription ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            {t("feedItems.showLess")}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            {t("feedItems.showMore")}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="article-prose prose-lg">
                      {item.content && item.content.trim() ? (
                        <div
                          className="leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                      ) : (
                        <div className="text-gray-500 italic">
                          {t("feedItems.noContentAvailable")}
                        </div>
                      )}
                    </div>
                    <div className="mt-8 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-white text-sm font-bold">
                            <Rss className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-amber-300 font-semibold mb-2">
                            {t("feedItems.originalContent.title")}
                          </h4>
                          <p className="text-amber-200/80 text-sm mb-3">
                            {t("feedItems.originalContent.description")}
                          </p>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              {t("feedItems.originalContent.readFullArticle")}
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
