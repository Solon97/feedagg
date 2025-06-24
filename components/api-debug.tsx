"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiService } from "@/lib/api"

interface HealthData {
  status: string
  timestamp: string
  duration: number
  environment: any
  externalApi: any
  diagnostics: any
}

interface DebugData {
  totalDiagnostics: number
  diagnostics: any[]
  recentErrors: any[]
  environment: any
}

export function ApiDebug() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runHealthCheck = async () => {
    setLoading(true)
    setError(null)

    try {
      const health = await apiService.healthCheck()
      setHealthData(health)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDebugData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const debug = await response.json()
      setDebugData(debug)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const clearDiagnostics = async () => {
    try {
      await fetch("/api/debug?action=clear")
      await fetchDebugData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const testApiCall = async () => {
    setLoading(true)
    setError(null)

    try {
      await apiService.getUserFeeds()
      await fetchDebugData() // Refresh diagnostics
    } catch (err: any) {
      setError(err.message)
      await fetchDebugData() // Refresh diagnostics even on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runHealthCheck()
    fetchDebugData()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={runHealthCheck} disabled={loading}>
          Run Health Check
        </Button>
        <Button onClick={fetchDebugData} disabled={loading}>
          Refresh Debug Data
        </Button>
        <Button onClick={testApiCall} disabled={loading}>
          Test API Call
        </Button>
        <Button onClick={clearDiagnostics} variant="outline">
          Clear Diagnostics
        </Button>
      </div>

      {error && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="health" className="w-full">
        <TabsList>
          <TabsTrigger value="health">Health Check</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="errors">Recent Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          {healthData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  API Health Status
                  <Badge variant={healthData.status === "ok" ? "default" : "destructive"}>{healthData.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Environment</h4>
                    <pre className="text-sm bg-gray-100 p-2 rounded mt-1">
                      {JSON.stringify(healthData.environment, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium">External API Status</h4>
                    <pre className="text-sm bg-gray-100 p-2 rounded mt-1">
                      {JSON.stringify(healthData.externalApi, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium">Diagnostics Summary</h4>
                    <pre className="text-sm bg-gray-100 p-2 rounded mt-1">
                      {JSON.stringify(healthData.diagnostics, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="diagnostics">
          {debugData && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostics ({debugData.totalDiagnostics} total)</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {debugData.diagnostics.map((diagnostic, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-sm ${diagnostic.success ? "bg-green-50" : "bg-red-50"}`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant={diagnostic.success ? "default" : "destructive"}>{diagnostic.step}</Badge>
                          <span className="text-xs text-gray-500">{diagnostic.timestamp}</span>
                          {diagnostic.duration && (
                            <span className="text-xs text-gray-500">{diagnostic.duration}ms</span>
                          )}
                        </div>
                        {diagnostic.error && <div className="mt-1 text-red-600">{diagnostic.error.message}</div>}
                        {diagnostic.data && (
                          <pre className="mt-1 text-xs bg-gray-100 p-1 rounded overflow-x-auto">
                            {JSON.stringify(diagnostic.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="errors">
          {debugData && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Errors ({debugData.recentErrors.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {debugData.recentErrors.map((error, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">{error.step}</Badge>
                        <span className="text-xs text-gray-500">{error.timestamp}</span>
                      </div>
                      <div className="mt-1 text-red-600 text-sm">{error.error}</div>
                    </div>
                  ))}
                  {debugData.recentErrors.length === 0 && <p className="text-gray-500">No recent errors</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
