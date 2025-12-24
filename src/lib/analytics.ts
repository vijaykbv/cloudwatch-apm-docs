// Analytics service for tracking user behavior and system usage

export interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  userId?: string
  sessionId?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface UserSession {
  sessionId: string
  userId?: string
  startTime: Date
  lastActivity: Date
  pageViews: number
  searchQueries: number
  sectionsVisited: string[]
  timeSpent: Record<string, number> // section -> milliseconds
}

export interface AnalyticsConfig {
  enabled: boolean
  endpoint?: string
  batchSize: number
  flushInterval: number // milliseconds
  enableDebugLogging: boolean
  trackingId?: string
}

export class AnalyticsService {
  private config: AnalyticsConfig
  private eventQueue: AnalyticsEvent[] = []
  private currentSession: UserSession | null = null
  private flushTimer: NodeJS.Timeout | null = null
  private sectionStartTime: Date | null = null
  private currentSection: string | null = null

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      enableDebugLogging: process.env.NODE_ENV === 'development',
      ...config
    }

    if (this.config.enabled) {
      this.initializeSession()
      this.startFlushTimer()
    }
  }

  /**
   * Initialize a new user session
   */
  private initializeSession(): void {
    const sessionId = this.generateSessionId()
    this.currentSession = {
      sessionId,
      startTime: new Date(),
      lastActivity: new Date(),
      pageViews: 0,
      searchQueries: 0,
      sectionsVisited: [],
      timeSpent: {}
    }

    this.track('session', 'start', sessionId)
  }

  /**
   * Track an analytics event
   */
  track(
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enabled) return

    const event: AnalyticsEvent = {
      event: 'user_interaction',
      category,
      action,
      label,
      value,
      sessionId: this.currentSession?.sessionId,
      timestamp: new Date(),
      metadata
    }

    this.eventQueue.push(event)
    this.updateSession(category, action)

    if (this.config.enableDebugLogging) {
      console.log('Analytics Event:', event)
    }

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush()
    }
  }

  /**
   * Track page/section navigation
   */
  trackNavigation(section: string, previousSection?: string): void {
    // Record time spent in previous section
    if (this.currentSection && this.sectionStartTime && previousSection) {
      const timeSpent = Date.now() - this.sectionStartTime.getTime()
      this.updateTimeSpent(this.currentSection, timeSpent)
    }

    // Track navigation event
    this.track('navigation', 'section_change', section, undefined, {
      previousSection,
      timestamp: new Date().toISOString()
    })

    // Update current section tracking
    this.currentSection = section
    this.sectionStartTime = new Date()

    // Update session data
    if (this.currentSession) {
      this.currentSession.pageViews++
      if (!this.currentSession.sectionsVisited.includes(section)) {
        this.currentSession.sectionsVisited.push(section)
      }
      this.currentSession.lastActivity = new Date()
    }
  }

  /**
   * Track search queries
   */
  trackSearch(query: string, resultsCount: number, filters?: Record<string, any>): void {
    this.track('search', 'query', query, resultsCount, {
      query,
      resultsCount,
      filters,
      timestamp: new Date().toISOString()
    })

    if (this.currentSession) {
      this.currentSession.searchQueries++
      this.currentSession.lastActivity = new Date()
    }
  }

  /**
   * Track user interactions with components
   */
  trackInteraction(
    component: string,
    action: string,
    details?: Record<string, any>
  ): void {
    this.track('interaction', action, component, undefined, {
      component,
      ...details,
      timestamp: new Date().toISOString()
    })

    if (this.currentSession) {
      this.currentSession.lastActivity = new Date()
    }
  }

  /**
   * Track errors and exceptions
   */
  trackError(
    error: Error | string,
    context?: string,
    metadata?: Record<string, any>
  ): void {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorStack = typeof error === 'object' ? error.stack : undefined

    this.track('error', 'exception', context || 'unknown', undefined, {
      error: errorMessage,
      stack: errorStack,
      context,
      ...metadata,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Track performance metrics
   */
  trackPerformance(
    metric: string,
    value: number,
    unit: string = 'ms',
    context?: string
  ): void {
    this.track('performance', metric, context, value, {
      metric,
      value,
      unit,
      context,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Get current session data
   */
  getSession(): UserSession | null {
    return this.currentSession
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): {
    totalEvents: number
    queuedEvents: number
    session: UserSession | null
    topSections: Array<{ section: string; timeSpent: number }>
  } {
    const topSections = this.currentSession
      ? Object.entries(this.currentSession.timeSpent)
          .map(([section, timeSpent]) => ({ section, timeSpent }))
          .sort((a, b) => b.timeSpent - a.timeSpent)
          .slice(0, 5)
      : []

    return {
      totalEvents: this.eventQueue.length,
      queuedEvents: this.eventQueue.length,
      session: this.currentSession,
      topSections
    }
  }

  /**
   * Manually flush events to analytics endpoint
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const eventsToSend = [...this.eventQueue]
    this.eventQueue = []

    try {
      if (this.config.endpoint) {
        await this.sendEvents(eventsToSend)
      } else {
        // In development or when no endpoint is configured, just log
        if (this.config.enableDebugLogging) {
          console.log('Analytics Batch:', eventsToSend)
        }
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error)
      // Re-queue events for retry
      this.eventQueue.unshift(...eventsToSend)
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }

    // Final flush
    this.flush()

    // Track session end
    if (this.currentSession) {
      this.track('session', 'end', this.currentSession.sessionId)
    }
  }

  /**
   * Update session with event information
   */
  private updateSession(category: string, action: string): void {
    if (!this.currentSession) return

    this.currentSession.lastActivity = new Date()

    // Track specific actions
    if (category === 'search' && action === 'query') {
      this.currentSession.searchQueries++
    }
  }

  /**
   * Update time spent in a section
   */
  private updateTimeSpent(section: string, timeSpent: number): void {
    if (!this.currentSession) return

    this.currentSession.timeSpent[section] = 
      (this.currentSession.timeSpent[section] || 0) + timeSpent
  }

  /**
   * Start the automatic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  /**
   * Send events to analytics endpoint
   */
  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    if (!this.config.endpoint) return

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events,
        session: this.currentSession,
        trackingId: this.config.trackingId,
        timestamp: new Date().toISOString()
      })
    })

    if (!response.ok) {
      throw new Error(`Analytics request failed: ${response.status}`)
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Global analytics instance
let globalAnalytics: AnalyticsService | null = null

/**
 * Get or create the global analytics instance
 */
export function getAnalytics(config?: Partial<AnalyticsConfig>): AnalyticsService {
  if (!globalAnalytics) {
    globalAnalytics = new AnalyticsService(config)
  }
  return globalAnalytics
}

/**
 * Convenience functions for common tracking scenarios
 */
export const analytics = {
  track: (category: string, action: string, label?: string, value?: number, metadata?: Record<string, any>) => {
    getAnalytics().track(category, action, label, value, metadata)
  },
  
  trackNavigation: (section: string, previousSection?: string) => {
    getAnalytics().trackNavigation(section, previousSection)
  },
  
  trackSearch: (query: string, resultsCount: number, filters?: Record<string, any>) => {
    getAnalytics().trackSearch(query, resultsCount, filters)
  },
  
  trackInteraction: (component: string, action: string, details?: Record<string, any>) => {
    getAnalytics().trackInteraction(component, action, details)
  },
  
  trackError: (error: Error | string, context?: string, metadata?: Record<string, any>) => {
    getAnalytics().trackError(error, context, metadata)
  },
  
  trackPerformance: (metric: string, value: number, unit?: string, context?: string) => {
    getAnalytics().trackPerformance(metric, value, unit, context)
  }
}

// Browser-specific initialization
if (typeof window !== 'undefined') {
  // Initialize analytics on page load
  window.addEventListener('load', () => {
    getAnalytics()
  })

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    if (globalAnalytics) {
      globalAnalytics.destroy()
    }
  })
}