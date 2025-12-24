'use client'

import React, { useState } from 'react'
import { useServiceStatus } from '@/lib/service-status'
import { useOfflineSupport } from '@/lib/offline-support'

interface StatusIndicatorProps {
  className?: string
  showDetails?: boolean
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const { health } = useServiceStatus()
  const { isOnline, cacheStats } = useOfflineSupport()
  const [showDropdown, setShowDropdown] = useState(false)

  // Determine overall status
  const getOverallStatus = () => {
    if (!isOnline) return 'offline'
    if (!health) return 'unknown'
    return health.overall
  }

  const status = getOverallStatus()

  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'degraded': return 'text-yellow-500'
      case 'down': return 'text-red-500'
      case 'offline': return 'text-gray-500'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'degraded':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'down':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'offline':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'healthy': return 'All systems operational'
      case 'degraded': return 'Some services degraded'
      case 'down': return 'Service issues detected'
      case 'offline': return 'Offline mode'
      default: return 'Status unknown'
    }
  }

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        <span className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">System Status</h3>
            
            {/* Overall Status */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Status</span>
                <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
                  {getStatusIcon()}
                  <span className="text-sm capitalize">{status}</span>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Connection</span>
                <div className={`flex items-center space-x-1 ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>

            {/* Service Status */}
            {health && health.services.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Services</h4>
                <div className="space-y-2">
                  {health.services.map((service) => (
                    <div key={service.service} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{service.service}</span>
                      <div className={`flex items-center space-x-1 ${
                        service.status === 'healthy' ? 'text-green-500' :
                        service.status === 'degraded' ? 'text-yellow-500' :
                        service.status === 'down' ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          service.status === 'healthy' ? 'bg-green-500' :
                          service.status === 'degraded' ? 'bg-yellow-500' :
                          service.status === 'down' ? 'bg-red-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-sm capitalize">{service.status}</span>
                        {service.responseTime && (
                          <span className="text-xs text-gray-500">({service.responseTime}ms)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cache Status */}
            {cacheStats && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Offline Cache</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Cached Items:</span>
                    <span>{cacheStats.totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Size:</span>
                    <span>{cacheStats.totalSize} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical Items:</span>
                    <span>{cacheStats.criticalItems}</span>
                  </div>
                  {cacheStats.lastUpdated && (
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span>{cacheStats.lastUpdated.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Last Updated */}
            {health && (
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                Last checked: {health.lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}

export default StatusIndicator