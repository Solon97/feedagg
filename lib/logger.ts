type LogLevel = "info" | "warn" | "error" | "debug"

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  requestId?: string
  userId?: string
  endpoint?: string
  method?: string
  statusCode?: number
  duration?: number
  userAgent?: string
  ip?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development"
  private isProduction = process.env.NODE_ENV === "production"

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, requestId, userId, endpoint, method, statusCode, duration, data } = entry

    let logMessage = `[${timestamp}] ${level.toUpperCase()}`

    if (requestId) logMessage += ` [${requestId}]`
    if (userId) logMessage += ` [User: ${userId.slice(0, 8)}...]`
    if (method && endpoint) logMessage += ` ${method} ${endpoint}`
    if (statusCode) logMessage += ` ${statusCode}`
    if (duration) logMessage += ` ${duration}ms`

    logMessage += ` - ${message}`

    return logMessage
  }

  private log(level: LogLevel, message: string, data?: any, meta?: Partial<LogEntry>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      ...meta,
    }

    const formattedMessage = this.formatLog(entry)

    // Console logging
    switch (level) {
      case "error":
        console.error(formattedMessage, data ? { data } : "")
        break
      case "warn":
        console.warn(formattedMessage, data ? { data } : "")
        break
      case "debug":
        if (this.isDevelopment) {
          console.debug(formattedMessage, data ? { data } : "")
        }
        break
      default:
        console.log(formattedMessage, data ? { data } : "")
    }

    // In production, you could send logs to external services like:
    // - Vercel Analytics
    // - DataDog
    // - LogRocket
    // - Sentry
    if (this.isProduction && level === "error") {
      // Example: Send to external logging service
      this.sendToExternalService(entry)
    }
  }

  private async sendToExternalService(entry: LogEntry) {
    // Example implementation for external logging
    // You can replace this with your preferred logging service
    try {
      // await fetch('https://your-logging-service.com/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // })
    } catch (error) {
      console.error("Failed to send log to external service:", error)
    }
  }

  info(message: string, data?: any, meta?: Partial<LogEntry>) {
    this.log("info", message, data, meta)
  }

  warn(message: string, data?: any, meta?: Partial<LogEntry>) {
    this.log("warn", message, data, meta)
  }

  error(message: string, data?: any, meta?: Partial<LogEntry>) {
    this.log("error", message, data, meta)
  }

  debug(message: string, data?: any, meta?: Partial<LogEntry>) {
    this.log("debug", message, data, meta)
  }

  // API-specific logging methods
  apiRequest(method: string, endpoint: string, requestId: string, userId?: string, userAgent?: string, ip?: string) {
    this.info("API Request started", undefined, {
      method,
      endpoint,
      requestId,
      userId,
      userAgent,
      ip,
    })
  }

  apiResponse(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    requestId: string,
    userId?: string,
  ) {
    const level = statusCode >= 400 ? "error" : statusCode >= 300 ? "warn" : "info"
    this.log(level, "API Request completed", undefined, {
      method,
      endpoint,
      statusCode,
      duration,
      requestId,
      userId,
    })
  }

  apiError(method: string, endpoint: string, error: any, requestId: string, userId?: string) {
    this.error(
      "API Request failed",
      {
        error: error.message || error,
        stack: error.stack,
      },
      {
        method,
        endpoint,
        requestId,
        userId,
      },
    )
  }

  externalApiCall(url: string, method: string, statusCode: number, duration: number, requestId: string) {
    this.info("External API call", undefined, {
      endpoint: url,
      method,
      statusCode,
      duration,
      requestId,
    })
  }

  authEvent(event: string, userId?: string, requestId?: string, success = true) {
    const level = success ? "info" : "warn"
    this.log(level, `Auth event: ${event}`, undefined, {
      userId,
      requestId,
    })
  }
}

export const logger = new Logger()
