"use client"

import type { ReactNode } from "react"
import { useDevelopment } from "@/hooks/use-development"

interface DevOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function DevOnly({ children, fallback = null }: DevOnlyProps) {
  const isDevelopment = useDevelopment()

  return isDevelopment ? <>{children}</> : <>{fallback}</>
}
