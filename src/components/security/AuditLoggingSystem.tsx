'use client'

import React, { useState, useEffect } from 'react'
import { 
  AuditConfiguration, 
  AuditEvent, 
  AuditScope, 
  AuditAlert,
  AuditLevel,
  AuditCategory 
} from '../../types/security'
import { auditConfigurations } from '../../data/security-data'

interface AuditLoggingSystemProps {
  onConfigurationChange?: (config: AuditConfiguration) => void
}

export const AuditLoggingSystem: React.FC<AuditLoggingSystemProps> = ({
  onConfigurationChange
}) => {
  const [selectedConfig, setSelectedConfig] = useState<AuditConfiguration | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'monitoring' | 'reporting'>('overview')
  const [filterCategory, setFilterCategory] = useState<AuditCategory | 'all'>('all')
  const [filterLevel, setFilterLevel] = useState<AuditLevel | 'all'>('all')

  useEffect(() => {
    if (auditConfigurations.length > 0) {
      setSelectedConfig(auditConfigurations[0])
    }
  }, [])

  const handleConfigurationSelect = (config: AuditConfiguration) => {
    setSelectedConfig(config)
    onConfigurationChange?.(config)
  }

  const getEventIcon = (category: AuditCategory) => {
    const icons = {
      'authentication': '🔐',
      'authorization': '🛡️',
      'data-access': '📊',
      'configuration': '⚙️',
      'system': '💻',
      'security': '🔒'
    }
    return icons[category] || '📝'
  }

  const getLevelColor = (level: AuditLevel) => {
    switch (level) {
      case 'verbose':
        return 'bg-purple-100 text-purple-800'
      case 'detailed':
        return 'bg-blue-100 text-blue-800'
      case 'basic':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'error':
        return 'bg-orange-100 text-orange-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredEvents = selectedConfig?.events.filter(event => {
    const categoryMatch = filterCategory === 'all' || event.category === filterCategory
    const levelMatch = filterLevel === 'all' || event.level === filterLevel
    return categoryMatch && levelMatch
  }) || []

  if (!selectedConfig) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Audit Configurations Available
        </h3>
        <p className="text-gray-600">
          Audit logging configurations are not available at this time.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Audit and Logging Information System
        </h2>
        <p className="text-gray-600">
          Comprehensive audit logging configuration and monitoring for CloudWatch APM
        </p>
      </div>

      {/* Configuration Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Audit Configurations</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {auditConfigurations.map((config) => (
            <div
              key={config.id}
              onClick={() => handleConfigurationSelect(config)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedConfig.id === config.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">📝</span>
                <h4 className="font-semibold text-gray-900">{config.name}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">{config.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{config.events.length} events</span>
                <span>{config.scope.length} components</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'events', label: 'Audit Events', icon: '📝' },
              { id: 'monitoring', label: 'Monitoring', icon: '📊' },
              { id: 'reporting', label: 'Reporting', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {selectedConfig.name}
                </h3>
                <p className="text-gray-600 mb-6">{selectedConfig.description}</p>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Audit Scope */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Audit Scope</h4>
                    <div className="space-y-3">
                      {selectedConfig.scope.map((scope, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {scope.required ? '🔴' : '🟡'}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{scope.component}</h5>
                            <p className="text-sm text-gray-600">
                              Events: {scope.events.join(', ')}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(scope.level)}`}>
                                {scope.level}
                              </span>
                              {scope.required && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Storage Configuration */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Storage Configuration</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Location:</span>
                        <span className="text-gray-600">{selectedConfig.storage.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Encryption:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedConfig.storage.encryption 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedConfig.storage.encryption ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Backup:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedConfig.storage.backup 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedConfig.storage.backup ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Retention:</span>
                        <span className="text-gray-600">{selectedConfig.storage.retention} days</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">Access Control</h5>
                      <div className="space-y-2">
                        {selectedConfig.storage.access.map((access, index) => (
                          <div key={index} className="bg-white rounded p-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{access.role}</span>
                              <div className="flex items-center space-x-1">
                                {access.permissions.map((perm, permIndex) => (
                                  <span key={permIndex} className="px-1 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                    {perm}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {access.conditions.length > 0 && (
                              <div className="mt-1 text-xs text-gray-500">
                                Conditions: {access.conditions.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Audit Events</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as AuditCategory | 'all')}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="authentication">Authentication</option>
                    <option value="authorization">Authorization</option>
                    <option value="data-access">Data Access</option>
                    <option value="configuration">Configuration</option>
                    <option value="system">System</option>
                    <option value="security">Security</option>
                  </select>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value as AuditLevel | 'all')}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="basic">Basic</option>
                    <option value="detailed">Detailed</option>
                    <option value="verbose">Verbose</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getEventIcon(event.category)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{event.name}</h4>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(event.level)}`}>
                          {event.level}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                          {event.category}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Event Fields</h5>
                        <div className="space-y-2">
                          {event.fields.map((field, index) => (
                            <div key={index} className="bg-gray-50 rounded p-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{field.name}</span>
                                <div className="flex items-center space-x-1">
                                  <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                    {field.type}
                                  </span>
                                  {field.required && (
                                    <span className="px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                                      Required
                                    </span>
                                  )}
                                  {field.sensitive && (
                                    <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                                      Sensitive
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{field.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Configuration</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Event ID:</span>
                            <span className="text-gray-600 font-mono">{event.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Category:</span>
                            <span className="text-gray-600">{event.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Level:</span>
                            <span className="text-gray-600">{event.level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Retention:</span>
                            <span className="text-gray-600">{event.retention} days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">🔍</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-1">No Events Found</h4>
                  <p className="text-gray-600">No audit events match the selected filters.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Monitoring</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Monitoring Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Monitoring Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Real-time Monitoring:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedConfig.monitoring.realTime 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedConfig.monitoring.realTime ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Active Alerts:</span>
                        <span className="text-gray-600">{selectedConfig.monitoring.alerts.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Dashboards:</span>
                        <span className="text-gray-600">{selectedConfig.monitoring.dashboards.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Reports:</span>
                        <span className="text-gray-600">{selectedConfig.monitoring.reports.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dashboards */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Available Dashboards</h4>
                    <div className="space-y-2">
                      {selectedConfig.monitoring.dashboards.map((dashboard, index) => (
                        <div key={index} className="bg-white rounded p-2 flex items-center space-x-2">
                          <span className="text-blue-600">📊</span>
                          <span className="text-sm font-medium text-gray-900">{dashboard}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Alert Configuration</h4>
                <div className="space-y-4">
                  {selectedConfig.monitoring.alerts.map((alert) => (
                    <div key={alert.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-900">{alert.name}</h5>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-medium text-gray-900 mb-2">Condition</h6>
                          <div className="bg-gray-50 rounded p-2">
                            <code className="text-sm text-gray-700">{alert.condition}</code>
                          </div>
                        </div>
                        <div>
                          <h6 className="font-medium text-gray-900 mb-2">Notifications</h6>
                          <div className="space-y-1">
                            {alert.notification.map((notif, index) => (
                              <div key={index} className="bg-gray-50 rounded p-2">
                                <span className="text-sm text-gray-700">{notif}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reporting' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Audit Reporting</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Report Configuration */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Report Configuration</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Automated:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedConfig.reporting.automated 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedConfig.reporting.automated ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Frequency:</span>
                        <span className="text-gray-600">{selectedConfig.reporting.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Retention:</span>
                        <span className="text-gray-600">{selectedConfig.reporting.retention} days</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">Report Formats</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedConfig.reporting.format.map((format, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {format.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recipients */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Report Recipients</h4>
                    <div className="space-y-2">
                      {selectedConfig.reporting.recipients.map((recipient, index) => (
                        <div key={index} className="bg-white rounded p-2 flex items-center space-x-2">
                          <span className="text-blue-600">👤</span>
                          <span className="text-sm font-medium text-gray-900">{recipient}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Report Structure */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Sample Report Structure</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3 text-sm">
                    <div className="font-medium text-gray-900">📊 Audit Report - {selectedConfig.name}</div>
                    <div className="ml-4 space-y-1 text-gray-700">
                      <div>• Executive Summary</div>
                      <div>• Audit Scope and Coverage</div>
                      <div>• Event Statistics by Category</div>
                      <div>• Security Incidents and Alerts</div>
                      <div>• Access Patterns Analysis</div>
                      <div>• Compliance Status</div>
                      <div>• Recommendations and Action Items</div>
                      <div>• Appendix: Detailed Event Logs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuditLoggingSystem