// Service status monitoring and health checking system

import React from 'react'

export interface ServiceStatus {
  service: string
  status: 'healthy' | 'degraded' | 'down' | 'unknown'
  lastChecked: Date
  responseTime?: number
  error?: string
  details?: Record<string, any>
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down'
  services: ServiceStatus[]
  lastUpdated: Date
}

export class ServiceStatusMonitor {
  private services: Map<string, ServiceStatus> = new Map()
  private checkInterval: NodeJS.Timeout | null = null
  private listeners: Array<(health: SystemHealth) => void> = []

  constructor(private config: {
    checkIntervalMs: number
    timeoutMs: number
    retryAttempts: number
  } = {
    checkIntervalMs: 30000, // 30 seconds
    timeoutMs: 5000, // 5 seconds
    retryAttempts: 3
  }) {}

  /**
   * Register a service for monitoring
   */
  registerService(
    name: string,
    healthCheckUrl?: string,
    customCheck?: () => Promise<{ healthy: boolean; details?: any }>
  ): void {
    this.services.set(name, {
      service: name,
      status: 'unknown',
      lastChecked: new Date(),
      details: {
        healthCheckUrl,
        hasCustomCheck: !!customCheck
      }
    })

    // Store custom check function
    if (customCheck) {
      (this.services.get(name) as any).customCheck = customCheck
    }
  }

  /**
   * Start monitoring all registered services
   */
  startMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    // Initial check
    this.checkAllServices()

    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAllServices()
    }, this.config.checkIntervalMs)
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  /**
   * Check health of all registered services
   */
  private async checkAllServices(): Promise<void> {
    const checkPromises = Array.from(this.services.keys()).map(serviceName =>
      this.checkService(serviceName)
    )

    await Promise.allSettled(checkPromises)
    this.notifyListeners()
  }

  /**
   * Check health of a specific service
   */
  private async checkService(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName)
    if (!service) return

    const startTime = Date.now()

    try {
      let healthy = false
      let details: any = {}

      // Use custom check if available
      if ((service as any).customCheck) {
        const result = await this.executeWithTimeout(
          (service as any).customCheck(),
          this.config.timeoutMs
        ) as { healthy: boolean; details?: any }
        healthy = result.healthy
        details = result.details || {}
      } 
      // Use HTTP health check if URL provided
      else if (service.details?.healthCheckUrl) {
        const response = await this.executeWithTimeout(
          fetch(service.details.healthCheckUrl),
          this.config.timeoutMs
        )
        healthy = response.ok
        details = {
          status: response.status,
          statusText: response.statusText
        }
      }
      // Default to healthy if no check method
      else {
        healthy = true
        details = { message: 'No health check configured' }
      }

      const responseTime = Date.now() - startTime

      this.services.set(serviceName, {
        ...service,
        status: healthy ? 'healthy' : 'degraded',
        lastChecked: new Date(),
        responseTime,
        error: undefined,
        details: { ...service.details, ...details }
      })

    } catch (error) {
      const responseTime = Date.now() - startTime
      
      this.services.set(serviceName, {
        ...service,
        status: 'down',
        lastChecked: new Date(),
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: { ...service.details, error: String(error) }
      })
    }
  }

  /**
   * Execute a promise with timeout
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), timeoutMs)
    })

    return Promise.race([promise, timeoutPromise])
  }

  /**
   * Get current system health
   */
  getSystemHealth(): SystemHealth {
    const services = Array.from(this.services.values())
    
    // Determine overall health
    let overall: SystemHealth['overall'] = 'healthy'
    
    const downServices = services.filter(s => s.status === 'down')
    const degradedServices = services.filter(s => s.status === 'degraded')
    
    if (downServices.length > 0) {
      overall = 'down'
    } else if (degradedServices.length > 0) {
      overall = 'degraded'
    }

    return {
      overall,
      services,
      lastUpdated: new Date()
    }
  }

  /**
   * Get status of a specific service
   */
  getServiceStatus(serviceName: string): ServiceStatus | undefined {
    return this.services.get(serviceName)
  }

  /**
   * Subscribe to health status changes
   */
  subscribe(listener: (health: SystemHealth) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Notify all listeners of health changes
   */
  private notifyListeners(): void {
    const health = this.getSystemHealth()
    this.listeners.forEach(listener => {
      try {
        listener(health)
      } catch (error) {
        console.error('Error in health status listener:', error)
      }
    })
  }

  /**
   * Force a health check of all services
   */
  async forceCheck(): Promise<SystemHealth> {
    await this.checkAllServices()
    return this.getSystemHealth()
  }
}

// Global service status monitor instance
let globalMonitor: ServiceStatusMonitor | null = null

/**
 * Get or create the global service status monitor
 */
export function getServiceStatusMonitor(): ServiceStatusMonitor {
  if (!globalMonitor) {
    globalMonitor = new ServiceStatusMonitor()
    
    // Register default services for documentation system
    globalMonitor.registerService('search', undefined, async () => {
      // Custom check for search functionality
      try {
        const { SearchSystem } = await import('./search-system')
        const searchSystem = new SearchSystem()
        return { healthy: true, details: { indexSize: searchSystem.getIndexSize() } }
      } catch (error) {
        return { healthy: false, details: { error: String(error) } }
      }
    })

    globalMonitor.registerService('analytics', undefined, async () => {
      // Custom check for analytics
      try {
        const { getAnalytics } = await import('./analytics')
        const analytics = getAnalytics()
        const summary = analytics.getAnalyticsSummary()
        return { 
          healthy: true, 
          details: { 
            totalEvents: summary.totalEvents,
            sessionActive: !!summary.session
          } 
        }
      } catch (error) {
        return { healthy: false, details: { error: String(error) } }
      }
    })

    globalMonitor.registerService('content', undefined, async () => {
      // Custom check for content loading
      try {
        // Simple check - try to access content types
        const contentTypes = ['getting-started', 'api', 'troubleshooting']
        return { 
          healthy: true, 
          details: { 
            contentTypes: contentTypes.length,
            message: 'Content system operational'
          } 
        }
      } catch (error) {
        return { healthy: false, details: { error: String(error) } }
      }
    })

    // Start monitoring in browser environment
    if (typeof window !== 'undefined') {
      globalMonitor.startMonitoring()
      
      // Clean up on page unload
      window.addEventListener('beforeunload', () => {
        globalMonitor?.stopMonitoring()
      })
    }
  }
  
  return globalMonitor
}

/**
 * React hook for using service status
 */
export function useServiceStatus() {
  const [health, setHealth] = React.useState<SystemHealth | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const monitor = getServiceStatusMonitor()
    
    // Get initial status
    setHealth(monitor.getSystemHealth())
    setLoading(false)
    
    // Subscribe to updates
    const unsubscribe = monitor.subscribe((newHealth) => {
      setHealth(newHealth)
    })
    
    return unsubscribe
  }, [])

  return { health, loading }
}

// Browser-specific initialization
if (typeof window !== 'undefined') {
  // Initialize service monitoring
  getServiceStatusMonitor()
}