"use client";
import { useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const { t } = useLocalizedTranslations();
  const { signInWithGoogle, signInWithMicrosoft } = useAuth();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setMicrosoftLoading(true);
    setError(null);
    const { error } = await signInWithMicrosoft();
    if (error) {
      setError(error.message);
      setMicrosoftLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl shadow-lg">
              <img
                src="/logo.png"
                alt="FeedAgg Icon"
                className="w-16 h-16 filter"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-600 mb-2">
            Feed<span className="text-teal-600">Agg</span>
          </h1>
          <p className="text-gray-500 text-sm">{t("app.tagline")}</p>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">
            {mode === "login"
              ? t("auth.login.title")
              : t("auth.register.title")}
          </h2>
          <p className="text-gray-500 text-sm mt-2">{t("auth.description")}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-200 bg-red-50"
          >
            <AlertDescription className="text-red-700 text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Authentication Buttons */}
        <div className="flex space-x-3">
          {/* Google Button */}
          <Button
            type="button"
            variant="outline"
            disabled={googleLoading || microsoftLoading}
            onClick={handleGoogleSignIn}
            className="flex-1 border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-700 text-gray-700 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            <div className="flex items-center justify-center w-5 h-5 sm:mr-2">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <span className="hidden sm:inline">
              {googleLoading ? t("auth.connecting") : "Google"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
