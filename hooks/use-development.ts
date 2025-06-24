"use client"

import { useState, useEffect } from "react"

export function useDevelopment() {
  const [isDevelopment, setIsDevelopment] = useState(false)

  useEffect(() => {
    // Detectar ambiente de desenvolvimento baseado em indicadores do cliente
    const isDev =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("v0.dev") ||
        window.location.port === "3000" ||
        window.location.port === "3001" ||
        window.location.search.includes("dev=true"))

    setIsDevelopment(isDev)
  }, [])

  return isDevelopment
}
