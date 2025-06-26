"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useDebounce } from "@/hooks/use-debounce"
import type { FeedFilters } from "@/hooks/use-feeds"
import type { UserFeedSubscription } from "@/types/api"

interface FeedFiltersProps {
  filters: FeedFilters
  onFiltersChange: (filters: FeedFilters) => void
  onClearFilters: () => void
  feeds: UserFeedSubscription[]
  feedsLoading: boolean
}

export function FeedFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  feeds,
  feedsLoading,
}: FeedFiltersProps) {
  // Estados locais simples
  const [titleInput, setTitleInput] = useState(filters.title || "")
  const [feedSelect, setFeedSelect] = useState(filters.feed_id || "all")
  const [typeSelect, setTypeSelect] = useState(filters.feed_type || "all")
  const [isOpen, setIsOpen] = useState(false)

  // Ref para evitar loops
  const isExternalUpdate = useRef(false)

  // Debounce apenas do título
  const debouncedTitle = useDebounce(titleInput, 400)

  // Atualizar filtros quando o título debounced mudar
  useEffect(() => {
    if (!isExternalUpdate.current) {
      onFiltersChange({
        ...filters,
        title: debouncedTitle || undefined,
      })
    }
  }, [debouncedTitle])

  // Sincronizar estado local com filtros externos (apenas quando necessário)
  useEffect(() => {
    isExternalUpdate.current = true

    if (filters.title !== titleInput && filters.title !== debouncedTitle) {
      setTitleInput(filters.title || "")
    }

    if (filters.feed_id !== feedSelect) {
      setFeedSelect(filters.feed_id || "all")
    }

    if (filters.feed_type !== typeSelect) {
      setTypeSelect(filters.feed_type || "all")
    }

    setTimeout(() => {
      isExternalUpdate.current = false
    }, 100)
  }, [filters.title, filters.feed_id, filters.feed_type])

  // Handlers simples
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleInput(e.target.value)
  }

  const handleFeedChange = (value: string) => {
    setFeedSelect(value)
    onFiltersChange({
      ...filters,
      feed_id: value === "all" ? undefined : value,
    })
  }

  const handleTypeChange = (value: string) => {
    setTypeSelect(value)
    onFiltersChange({
      ...filters,
      feed_type: value === "all" ? undefined : (value as "rss" | "youtube"),
    })
  }

  const handleClear = () => {
    setTitleInput("")
    setFeedSelect("all")
    setTypeSelect("all")
    onClearFilters()
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length
  const activeFeeds = Array.isArray(feeds) ? feeds.filter((sub) => sub.is_active) : []

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Busca por título */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Buscar por título</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar artigos..."
            value={titleInput}
            onChange={handleTitleChange}
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Seleção de feed */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Filtrar por feed</label>
        <Select value={feedSelect} onValueChange={handleFeedChange} disabled={feedsLoading}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder={feedsLoading ? "Carregando feeds..." : "Todos os feeds"} />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white hover:bg-slate-700">
              Todos os feeds
            </SelectItem>
            {activeFeeds.map((subscription) => (
              <SelectItem
                key={subscription.feed.id}
                value={subscription.feed.id}
                className="text-white hover:bg-slate-700"
              >
                {subscription.feed.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de feed */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Filtrar por tipo</label>
        <Select value={typeSelect} onValueChange={handleTypeChange}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white hover:bg-slate-700">
              Todos os tipos
            </SelectItem>
            <SelectItem value="rss" className="text-white hover:bg-slate-700">
              RSS
            </SelectItem>
            <SelectItem value="youtube" className="text-white hover:bg-slate-700">
              YouTube
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Filtros ativos</label>
          <div className="flex flex-wrap gap-2">
            {filters.title && (
              <Badge variant="secondary" className="bg-teal-900/30 text-teal-400 border-teal-700/50">
                Título: {filters.title}
              </Badge>
            )}
            {filters.feed_id && (
              <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 border-blue-700/50">
                Feed: {activeFeeds.find((f) => f.feed.id === filters.feed_id)?.feed.name || "Desconhecido"}
              </Badge>
            )}
            {filters.feed_type && (
              <Badge variant="secondary" className="bg-purple-900/30 text-purple-400 border-purple-700/50">
                Tipo: {filters.feed_type.toUpperCase()}
              </Badge>
            )}
          </div>
          <Button
            onClick={handleClear}
            variant="outline"
            size="sm"
            className="w-full border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
          >
            Limpar todos os filtros
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Filtros Desktop */}
      <div className="hidden lg:block bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <h3 className="font-medium text-white">Filtros</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-teal-900/30 text-teal-400 border-teal-700/50 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <FilterContent />
      </div>

      {/* Filtros Mobile */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-teal-900/30 text-teal-400 border-teal-700/50 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-slate-900 border-slate-700 w-80">
            <SheetHeader>
              <SheetTitle className="text-white flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
