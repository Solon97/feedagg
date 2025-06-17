"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RouteGuard } from "@/components/route-guard";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to news page as the new main page
    router.replace("/news");
  }, [router]);

  return (
    <RouteGuard>
      <div>Redirecting...</div>
    </RouteGuard>
  );
}
