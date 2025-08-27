"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Youtube, UserPlus, ThumbsUp, Lock } from "lucide-react";

interface YouTubeActionBoxProps {
  isDev: boolean;
  videoId: string | null;
  channelId: string | null;
  subscribed: boolean;
  subscribing: boolean;
  liked: boolean;
  liking: boolean;
  onSubscribe: () => Promise<void> | void;
  onLike: () => Promise<void> | void;
}

export function YouTubeActionBox({
  isDev,
  videoId,
  channelId,
  subscribed,
  subscribing,
  liked,
  liking,
  onSubscribe,
  onLike,
}: YouTubeActionBoxProps) {
  if (!videoId && !channelId) return null;

  if (isDev) {
    return (
      <div className="mt-2 p-5 rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-800/70 via-slate-800/50 to-slate-900/60 shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_30%_30%,white,transparent)] opacity-40" />
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 relative">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-600/30 backdrop-blur-sm text-red-200 flex items-center justify-center shadow ring-1 ring-red-500/30">
            <Youtube className="w-6 h-6" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
              <h4 className="text-slate-100 font-semibold text-sm sm:text-base">
                Gostou do vídeo?
              </h4>
            </div>
            <p className="text-slate-300/80 text-xs sm:text-sm mb-4">
              Inscreva-se e curta no YouTube para apoiar o criador.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
              {channelId && (
                <Button
                  className="flex-1 sm:flex-none bg-red-700/90 hover:bg-red-600 text-white border border-red-800/50 shadow-sm hover:shadow-red-900/30 transition-transform duration-150 ease-out hover:-translate-y-[1px] active:translate-y-0"
                  disabled={subscribing || subscribed}
                  onClick={() => onSubscribe()}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {subscribed
                    ? "Inscrito"
                    : subscribing
                    ? "Inscrevendo..."
                    : "Inscrever-se no canal"}
                </Button>
              )}
              {videoId && (
                <Button
                  className="flex-1 sm:flex-none bg-red-700/90 hover:bg-red-600 text-white border border-red-800/50 shadow-sm hover:shadow-red-900/30 transition-transform duration-150 ease-out hover:-translate-y-[1px] active:translate-y-0"
                  disabled={liking || liked}
                  onClick={() => onLike()}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {liked ? "Curtido" : liking ? "Curtindo..." : "Curtir vídeo"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Preview (non-dev)
  return (
    <div className="mt-2 p-5 rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-800/70 via-slate-800/50 to-slate-900/60 shadow-inner">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-700/60 text-slate-200 flex items-center justify-center shadow ring-1 ring-slate-600/50">
          <Youtube className="w-6 h-6" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-slate-100 font-semibold text-sm sm:text-base mb-1">
            Integração com YouTube
          </h4>
          <p className="text-slate-300/80 text-xs sm:text-sm mb-4">
            Em breve você poderá curtir e se inscrever sem sair do FeedAgg.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
            {channelId && (
              <Button
                variant="outline"
                disabled
                className="flex-1 sm:flex-none border-slate-600 text-slate-400 hover:text-slate-400 hover:bg-transparent cursor-not-allowed"
              >
                <Lock className="w-4 h-4 mr-2" />
                Inscrever-se no canal
              </Button>
            )}
            {videoId && (
              <Button
                variant="outline"
                disabled
                className="flex-1 sm:flex-none border-slate-600 text-slate-400 hover:text-slate-400 hover:bg-transparent cursor-not-allowed"
              >
                <Lock className="w-4 h-4 mr-2" />
                Curtir vídeo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
