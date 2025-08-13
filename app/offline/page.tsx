"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setIsRedirecting(true);
      // Auto-redirect when connection is restored
      setTimeout(() => {
        router.replace("/");
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsRedirecting(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  const tryAgain = async () => {
    setIsChecking(true);
    // Force a network check by trying to fetch something
    try {
      await fetch("/", { method: "HEAD", cache: "no-cache" });
      setIsOnline(true);
      setIsRedirecting(true);
      router.replace("/");
    } catch (error) {
      // Still offline
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isOnline) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2 text-green-400">
            Conexão Restaurada!
          </h1>
          <p className="text-slate-300 mb-6">
            {isRedirecting
              ? "Redirecionando você de volta para o app..."
              : "Sua conexão com a internet foi restabelecida."}
          </p>
          {!isRedirecting && (
            <Button
              onClick={() => router.replace("/")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Voltar ao App
            </Button>
          )}
          {isRedirecting && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400 mx-auto"></div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-white max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.18l.09 2.016m-.09 15.604l-.09-2.016M2.18 12l2.016-.09m15.604 0L19.82 12"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Você está offline</h1>
        <p className="text-slate-400 mb-6">
          Sem conexão no momento. Algumas funcionalidades podem não estar
          disponíveis.
        </p>
        <p className="text-sm text-slate-500 mb-6">
          Assim que a conexão for restabelecida, o conteúdo será atualizado
          automaticamente.
        </p>
        <Button
          onClick={tryAgain}
          disabled={isChecking}
          variant="outline"
          className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 disabled:opacity-50"
        >
          {isChecking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-200 mr-2"></div>
              Verificando...
            </>
          ) : (
            "Tentar Novamente"
          )}
        </Button>
      </div>
    </main>
  );
}
