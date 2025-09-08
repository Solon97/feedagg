"use client";
import Link from "next/link";

export function SiteFooter() {
  const openCookiePrefs = () => {
    window.dispatchEvent(new Event("open-cookie-banner"));
  };

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="border-t border-slate-800 py-8 text-center text-slate-400">
          <nav aria-label="Links legais" className="mb-3">
            <ul className="flex items-center justify-center gap-6 text-sm">
              <li>
                <Link
                  href="https://feedagg.net/politica"
                  className="hover:text-slate-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li className="text-slate-600" aria-hidden>
                •
              </li>
              <li>
                <Link
                  href="https://feedagg.net/termos"
                  className="hover:text-slate-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Termos de Serviço
                </Link>
              </li>
              <li className="text-slate-600" aria-hidden>
                •
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookiePrefs}
                  className="hover:text-slate-200 transition-colors underline decoration-dotted"
                >
                  Preferências de cookies
                </button>
              </li>
            </ul>
          </nav>
          <p>
            &copy; {new Date().getFullYear()} FeedAgg. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
