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
        description: "Nova versão do app detectada.",
        duration: 0, // Don't auto-dismiss
        action: (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                t.dismiss();
                setIsUpdating(true);
                refresh();
              }}
              variant="default"
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

    // Show manual clear option if there are persistent issues
    const showManualClearOption = () => {
      setTimeout(() => {
        if (performance.navigation.type === 1) {
          // reload
          toast({
            title: "🔧 Problemas Persistentes?",
            description:
              "Se ainda há erros de carregamento, tente limpar o cache manualmente.",
            duration: 10000,
            action: (
              <Button
                onClick={clearCacheManually}
                variant="secondary"
                size="sm"
                disabled={isUpdating}
              >
                {isUpdating ? "Limpando..." : "Limpar Cache"}
              </Button>
            ),
          });
        }
      }, 3000);
    };

    // Check if page has errors (like missing CSS)
    const checkForErrors = () => {
      let errorCount = 0;

      // Check for missing stylesheets
      const links = document.querySelectorAll(
        'link[rel="stylesheet"]'
      ) as NodeListOf<HTMLLinkElement>;
      links.forEach(async (link) => {
        try {
          const response = await fetch(link.href, { method: "HEAD" });
          if (!response.ok) {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      });

      if (errorCount > 0) {
        setTimeout(() => {
          toast({
            title: "⚠️ Recursos Não Encontrados",
            description: `${errorCount} arquivo(s) CSS não encontrado(s). Limpar cache pode resolver.`,
            action: (
              <Button
                onClick={clearCacheManually}
                variant="destructive"
                size="sm"
                disabled={isUpdating}
              >
                Limpar Cache Agora
              </Button>
            ),
          });
        }, 2000);
      }
    };

    showManualClearOption();
    checkForErrors();
  }, [toast, isUpdating]);

  return null;
}
