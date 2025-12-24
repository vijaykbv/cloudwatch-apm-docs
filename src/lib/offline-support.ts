// Offline support and critical content caching

import React from 'react'

export interface CachedContent {
  id: string
  title: string
  content: string
  category: string
  lastUpdated: Date
  priority: 'critical' | 'important' | 'normal'
}

export interface OfflineConfig {
  maxCacheSize: number // in MB
  criticalContentIds: string[]
  enableServiceWorker: boolean
  syncOnReconnect: boolean
}

export class OfflineManager {
  private isOnline: boolean = navigator.onLine
  private cache: Map<string, CachedContent> = new Map()
  private listeners: Array<(online: boolean) => void> = []
  private config: OfflineConfig

  constructor(config: Partial<OfflineConfig> = {}) {
    this.config = {
      maxCacheSize: 50, // 50MB default
      criticalContentIds: [
        'getting-started',
        'quick-start',
        'troubleshooting',
        'basic-configuration'
      ],
      enableServiceWorker: true,
      syncOnReconnect: true,
      ...config
    }

    this.initializeOfflineSupport()
  }

  /**
   * Initialize offline support
   */
  private initializeOfflineSupport(): void {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)

    // Load cached content from localStorage
    this.loadCacheFromStorage()

    // Register service worker if enabled
    if (this.config.enableServiceWorker && 'serviceWorker' in navigator) {
      this.registerServiceWorker()
    }

    // Cache critical content immediately
    this.cacheCriticalContent()
  }

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    this.isOnline = true
    this.notifyListeners(true)

    if (this.config.syncOnReconnect) {
      this.syncCachedContent()
    }
  }

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    this.isOnline = false
    this.notifyListeners(false)
  }

  /**
   * Register service worker for advanced caching
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  /**
   * Cache critical content for offline access
   */
  private async cacheCriticalContent(): Promise<void> {
    for (const contentId of this.config.criticalContentIds) {
      try {
        await this.cacheContent(contentId, 'critical')
      } catch (error) {
        console.warn(`Failed to cache critical content ${contentId}:`, error)
      }
    }
  }

  /**
   * Cache specific content
   */
  async cacheContent(
    contentId: string, 
    priority: CachedContent['priority'] = 'normal'
  ): Promise<void> {
    try {
      // In a real app, this would fetch from your content API
      const content = await this.fetchContent(contentId)
      
      if (content) {
        const cachedContent: CachedContent = {
          id: contentId,
          title: content.title || contentId,
          content: JSON.stringify(content),
          category: content.category || 'general',
          lastUpdated: new Date(),
          priority
        }

        this.cache.set(contentId, cachedContent)
        this.saveCacheToStorage()
      }
    } catch (error) {
      console.error(`Failed to cache content ${contentId}:`, error)
    }
  }

  /**
   * Get content (from cache if offline)
   */
  async getContent(contentId: string): Promise<any | null> {
    // If online, try to fetch fresh content
    if (this.isOnline) {
      try {
        const freshContent = await this.fetchContent(contentId)
        if (freshContent) {
          // Update cache with fresh content
          await this.cacheContent(contentId)
          return freshContent
        }
      } catch (error) {
        console.warn(`Failed to fetch fresh content ${contentId}, falling back to cache:`, error)
      }
    }

    // Fall back to cached content
    const cached = this.cache.get(contentId)
    if (cached) {
      try {
        return JSON.parse(cached.content)
      } catch (error) {
        console.error(`Failed to parse cached content ${contentId}:`, error)
      }
    }

    return null
  }

  /**
   * Fetch content from server (mock implementation)
   */
  private async fetchContent(contentId: string): Promise<any | null> {
    // Mock content fetching - in a real app this would be an API call
    const mockContent = {
      'getting-started': {
        id: 'getting-started',
        title: 'Getting Started with CloudWatch APM',
        category: 'getting-started',
        content: 'This is the getting started guide content...',
        sections: [
          { title: 'Prerequisites', content: 'Before you begin...' },
          { title: 'Installation', content: 'To install CloudWatch APM...' },
          { title: 'Configuration', content: 'Configure your application...' }
        ]
      },
      'quick-start': {
        id: 'quick-start',
        title: 'Quick Start Guide',
        category: 'getting-started',
        content: 'Quick start guide content...',
        steps: [
          'Install the agent',
          'Configure your application',
          'Deploy and monitor'
        ]
      },
      'troubleshooting': {
        id: 'troubleshooting',
        title: 'Troubleshooting Guide',
        category: 'troubleshooting',
        content: 'Troubleshooting guide content...',
        commonIssues: [
          { issue: 'Agent not reporting data', solution: 'Check configuration...' },
          { issue: 'High memory usage', solution: 'Adjust sampling rate...' }
        ]
      },
      'basic-configuration': {
        id: 'basic-configuration',
        title: 'Basic Configuration',
        category: 'configuration',
        content: 'Basic configuration guide...',
        examples: [
          { language: 'java', code: 'CloudWatchAPM.configure()...' },
          { language: 'python', code: 'import cloudwatch_apm...' }
        ]
      }
    }

    return mockContent[contentId as keyof typeof mockContent] || null
  }

  /**
   * Get offline status
   */
  isOffline(): boolean {
    return !this.isOnline
  }

  /**
   * Get cached content list
   */
  getCachedContent(): CachedContent[] {
    return Array.from(this.cache.values())
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalItems: number
    totalSize: number
    criticalItems: number
    lastUpdated: Date | null
  } {
    const items = Array.from(this.cache.values())
    const totalSize = items.reduce((size, item) => size + item.content.length, 0)
    const criticalItems = items.filter(item => item.priority === 'critical').length
    const lastUpdated = items.length > 0 
      ? new Date(Math.max(...items.map(item => item.lastUpdated.getTime())))
      : null

    return {
      totalItems: items.length,
      totalSize: Math.round(totalSize / 1024), // KB
      criticalItems,
      lastUpdated
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
    localStorage.removeItem('offline-cache')
  }

  /**
   * Sync cached content with server
   */
  private async syncCachedContent(): Promise<void> {
    if (!this.isOnline) return

    const cachedIds = Array.from(this.cache.keys())
    
    for (const contentId of cachedIds) {
      try {
        await this.cacheContent(contentId)
      } catch (error) {
        console.warn(`Failed to sync content ${contentId}:`, error)
      }
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem('offline-cache')
      if (stored) {
        const data = JSON.parse(stored)
        data.forEach((item: CachedContent) => {
          // Convert date strings back to Date objects
          item.lastUpdated = new Date(item.lastUpdated)
          this.cache.set(item.id, item)
        })
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error)
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCacheToStorage(): void {
    try {
      const data = Array.from(this.cache.values())
      localStorage.setItem('offline-cache', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save cache to storage:', error)
      
      // If storage is full, try to clear old content
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanupCache()
      }
    }
  }

  /**
   * Clean up cache to free space
   */
  private cleanupCache(): void {
    const items = Array.from(this.cache.values())
    
    // Sort by priority (keep critical) and age (remove oldest)
    items.sort((a, b) => {
      if (a.priority === 'critical' && b.priority !== 'critical') return -1
      if (b.priority === 'critical' && a.priority !== 'critical') return 1
      return a.lastUpdated.getTime() - b.lastUpdated.getTime()
    })

    // Remove oldest 25% of non-critical items
    const toRemove = Math.floor(items.length * 0.25)
    const nonCriticalItems = items.filter(item => item.priority !== 'critical')
    
    for (let i = 0; i < Math.min(toRemove, nonCriticalItems.length); i++) {
      this.cache.delete(nonCriticalItems[i].id)
    }

    this.saveCacheToStorage()
  }

  /**
   * Subscribe to online/offline status changes
   */
  subscribe(listener: (online: boolean) => void): () => void {
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
   * Notify listeners of status changes
   */
  private notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(online)
      } catch (error) {
        console.error('Error in offline status listener:', error)
      }
    })
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
    this.listeners = []
  }
}

// Global offline manager instance
let globalOfflineManager: OfflineManager | null = null

/**
 * Get or create the global offline manager
 */
export function getOfflineManager(): OfflineManager {
  if (!globalOfflineManager) {
    globalOfflineManager = new OfflineManager()
  }
  return globalOfflineManager
}

/**
 * React hook for offline support
 */
export function useOfflineSupport() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)
  const [cacheStats, setCacheStats] = React.useState<ReturnType<OfflineManager['getCacheStats']> | null>(null)

  React.useEffect(() => {
    const manager = getOfflineManager()
    
    // Get initial cache stats
    setCacheStats(manager.getCacheStats())
    
    // Subscribe to online/offline changes
    const unsubscribe = manager.subscribe((online) => {
      setIsOnline(online)
      setCacheStats(manager.getCacheStats())
    })
    
    return unsubscribe
  }, [])

  return {
    isOnline,
    isOffline: !isOnline,
    cacheStats,
    getContent: (contentId: string) => getOfflineManager().getContent(contentId),
    cacheContent: (contentId: string, priority?: CachedContent['priority']) => 
      getOfflineManager().cacheContent(contentId, priority)
  }
}

// Browser-specific initialization
if (typeof window !== 'undefined') {
  // Initialize offline support
  getOfflineManager()
}