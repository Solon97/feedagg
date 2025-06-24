import { logger } from "./logger"

export interface DiagnosticInfo {
  timestamp: string
  requestId: string
  step: string
  success: boolean
  data?: any
  error?: any
  duration?: number
}

class ApiDiagnostics {
  private diagnostics: DiagnosticInfo[] = []

  log(requestId: string, step: string, success: boolean, data?: any, error?: any, duration?: number) {
    const diagnostic: DiagnosticInfo = {
      timestamp: new Date().toISOString(),
      requestId,
      step,
      success,
      data,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
      duration,
    }

    this.diagnostics.push(diagnostic)

    // Log to console for immediate debugging
    const level = success ? "info" : "error"
    logger[level](`[DIAGNOSTIC] ${step}`, {
      requestId,
      success,
      data: data ? JSON.stringify(data).slice(0, 200) : undefined,
      error: error?.message,
      duration,
    })

    // Keep only last 100 diagnostics to prevent memory issues
    if (this.diagnostics.length > 100) {
      this.diagnostics = this.diagnostics.slice(-100)
    }
  }

  getDiagnostics(requestId?: string): DiagnosticInfo[] {
    if (requestId) {
      return this.diagnostics.filter((d) => d.requestId === requestId)
    }
    return this.diagnostics
  }

  getLastErrors(count = 10): DiagnosticInfo[] {
    return this.diagnostics.filter((d) => !d.success).slice(-count)
  }

  clear() {
    this.diagnostics = []
  }
}

export const apiDiagnostics = new ApiDiagnostics()
