"use client";

import { useEffect } from "react";
import { initializeApp } from "./app.config";

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  useEffect(() => {
    try {
      initializeApp();
    } catch (error) {
      console.error("Failed to initialize application:", error);
    }
  }, []);

  return <>{children}</>;
}
