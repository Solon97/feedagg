"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { FeedItem } from "@/types/api"

interface SelectedItemContextType {
  selectedItem: FeedItem | null
  setSelectedItem: (item: FeedItem | null) => void
}

const SelectedItemContext = createContext<SelectedItemContextType | undefined>(undefined)

export function SelectedItemProvider({ children }: { children: ReactNode }) {
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null)

  return (
    <SelectedItemContext.Provider value={{ selectedItem, setSelectedItem }}>{children}</SelectedItemContext.Provider>
  )
}

export function useSelectedItem() {
  const context = useContext(SelectedItemContext)
  if (context === undefined) {
    throw new Error("useSelectedItem must be used within a SelectedItemProvider")
  }
  return context
}
