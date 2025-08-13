"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-redirect when connection is restored
      setTimeout(() => {
        router.replace("/feeds");
      }, 1000);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  const tryAgain = () => {
    if (navigator.onLine) {
      router.replace("/feeds");
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
          <p className="text-slate-300 mb-4">
            Redirecionando você de volta para o app...
          </p>
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
          variant="outline"
          className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
        >
          Tentar Novamente
        </Button>
      </div>
    </main>
  );
}
