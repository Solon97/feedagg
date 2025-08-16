"use client";
import { useEffect, useState } from "react";
import { registerSW } from "@/lib/register-sw";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function SwUpdater() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Manual cache clearing function
  const clearCacheManually = async () => {
    try {
      setIsUpdating(true);

      // Clear all caches
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Clear storage
      localStorage.clear();
      sessionStorage.clear();

      // Show success toast
      toast({
        title: "Cache Limpo",
        description: "Cache limpo com sucesso. Recarregando...",
        duration: 2000,
      });

      // Force reload with cache bypass
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.set("_clear", Date.now().toString());
        window.location.replace(url.toString());
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao limpar cache. Tente recarregar manualmente.",
        variant: "destructive",
      });
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    registerSW((refresh) => {
      const t = toast({
        title: "🚀 Atualização Disponível",
        description: "Deseja atualizar ?",
        duration: 0, // Don't auto-dismiss
        action: (
          <div className="flex gap-2">
            <Button
              onClick={clearCacheManually}
              variant="secondary"
              size="sm"
              disabled={isUpdating}
            >
              {isUpdating ? "Atualizando..." : "Atualizar"}
            </Button>
            <Button
              onClick={() => {
                t.dismiss();
              }}
              variant="outline"
              size="sm"
            >
              Depois
            </Button>
          </div>
        ),
      });
    });
  }, [toast, isUpdating]);

  return null;
}
