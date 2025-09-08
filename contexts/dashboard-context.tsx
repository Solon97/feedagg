"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useAuth } from "@/contexts/auth-context";
import { isSubscriptionActive } from "@/lib/subscription-utils";

type DashboardContextType = ReturnType<typeof useDashboardData>;

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const { user } = useAuth();
  const dashboardData = useDashboardData(user?.id);

  return (
    <DashboardContext.Provider value={dashboardData}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

// Hook to get only subscription data for navbar
export function useSubscriptionFromDashboard() {
  const { subscription, loading } = useDashboard();

  return {
    isActive: isSubscriptionActive(subscription?.status),
    currentPeriodEnd: subscription?.current_period_end
      ? new Date(subscription.current_period_end)
      : null,
    manageUrl: "/subscribe",
    loading,
    error: null, // We'll handle errors in the main dashboard
  };
}
