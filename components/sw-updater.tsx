"use client";
import { useEffect } from "react";
import { registerSW } from "@/lib/register-sw";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function SwUpdater() {
  const { toast, dismiss } = useToast();

  useEffect(() => {
    registerSW((refresh) => {
      const t = toast({
        title: "Atualização disponível",
        description: "Uma nova versão do app está pronta. Atualizar agora?",
        action: (
          <Button
            onClick={() => {
              t.dismiss();
              refresh();
            }}
            variant="default"
            size="sm"
          >
            Atualizar
          </Button>
        ),
      });
    });
  }, [toast, dismiss]);

  return null;
}
