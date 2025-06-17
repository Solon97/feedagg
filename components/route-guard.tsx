"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RouteGuard({ children, fallback }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is complete and user is not authenticated, redirect to auth
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      const redirectUrl = `/auth?redirect=${encodeURIComponent(currentPath)}`;

      console.log(
        "[RouteGuard] User not authenticated, redirecting to:",
        redirectUrl
      );
      router.push(redirectUrl);
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      )
    );
  }

  // If user is not authenticated, show nothing (redirect will happen)
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
