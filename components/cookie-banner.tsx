"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

function getConsent(): "all" | "essential" | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )cookie_consent=([^;]+)/);
  return m ? (decodeURIComponent(m[1]) as any) : null;
}

function setConsent(v: "all" | "essential") {
  const days = 180;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `cookie_consent=${encodeURIComponent(
    v
  )}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const c = getConsent();
    setVisible(!c);
    const handler = () => setVisible(true);
    window.addEventListener("open-cookie-banner", handler);
    return () => window.removeEventListener("open-cookie-banner", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60]">
      <div className="mx-auto max-w-5xl m-4 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur p-4 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-300">
            Usamos cookies para melhorar sua experiência. Você pode aceitar
            todos ou manter apenas os essenciais. Veja a{" "}
            <Link href="/politica" className="text-teal-400 hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setConsent("essential");
                setVisible(false);
              }}
              className="px-4 py-2 text-sm rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Manter essenciais
            </button>
            <button
              onClick={() => {
                setConsent("all");
                setVisible(false);
              }}
              className="px-4 py-2 text-sm rounded-md bg-teal-500 text-white hover:bg-teal-600"
            >
              Aceitar todos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
