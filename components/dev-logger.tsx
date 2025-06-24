"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Download } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warn" | "error" | "debug"
  message: string
  data?: any
  requestId?: string
  userId?: string
  endpoint?: string
  method?: string
  statusCode?: number
  duration?: number
}

export function DevLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [isVisible, setIsVisible] = useState(false)

  // Only show in development
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === "development")
  }, [])

  const clearLogs = () => {
    setLogs([])
  }

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `feedagg-logs-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true
    return log.level === filter
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-900/30 text-red-400 border-red-700/50"
      case "warn":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-700/50"
      case "info":
        return "bg-blue-900/30 text-blue-400 border-blue-700/50"
      case "debug":
        return "bg-gray-900/30 text-gray-400 border-gray-700/50"
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-700/50"
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 z-50">
      <Card className="bg-slate-900/95 border-slate-700 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-white">Development Logs</CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs bg-slate-800 border-slate-600 text-white rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="error">Errors</option>
                <option value="warn">Warnings</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
              <Button onClick={exportLogs} size="sm" variant="outline" className="h-6 w-6 p-0 border-slate-600">
                <Download className="h-3 w-3" />
              </Button>
              <Button onClick={clearLogs} size="sm" variant="outline" className="h-6 w-6 p-0 border-slate-600">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-4">No logs to display</p>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="bg-slate-800/50 rounded p-2 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className={getLevelColor(log.level)}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-white mb-1">{log.message}</div>
                    {log.endpoint && (
                      <div className="text-gray-400">
                        {log.method} {log.endpoint}
                        {log.statusCode && ` (${log.statusCode})`}
                        {log.duration && ` - ${log.duration}ms`}
                      </div>
                    )}
                    {log.requestId && <div className="text-gray-500 text-xs">ID: {log.requestId}</div>}
                    {log.data && (
                      <details className="mt-1">
                        <summary className="text-gray-400 cursor-pointer">Data</summary>
                        <pre className="text-gray-300 text-xs mt-1 overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
