'use client'

import React, { useState, useEffect } from 'react'
import { 
  SecurityChecklistItem, 
  ChecklistStatus, 
  SecurityCategory 
} from '../../types/security'
import { securityConfigurations } from '../../data/security-data'

interface SecurityChecklistProps {
  category?: SecurityCategory
  onStatusChange?: (itemId: string, status: ChecklistStatus, notes?: string) => void
}

export const SecurityChecklist: React.FC<SecurityChecklistProps> = ({
  category,
  onStatusChange
}) => {
  const [checklistItems, setChecklistItems] = useState<SecurityChecklistItem[]>([])
  const [filter, setFilter] = useState<ChecklistStatus | 'all'>('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Extract checklist items from security configurations
    const items: SecurityChecklistItem[] = []
    
    securityConfigurations.forEach(config => {
      if (!category || config.category === category) {
        config.validation.checklist.forEach(item => {
          items.push({
            ...item,
            status: item.status || 'pending'
          })
        })
      }
    })
    
    setChecklistItems(items)
  }, [category])

  const handleStatusChange = (itemId: string, newStatus: ChecklistStatus, notes?: string) => {
    setChecklistItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, status: newStatus, notes }
          : item
      )
    )
    
    if (onStatusChange) {
      onStatusChange(itemId, newStatus, notes)
    }
  }

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const filteredItems = checklistItems.filter(item => 
    filter === 'all' || item.status === filter
  )

  const getStatusIcon = (status: ChecklistStatus) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'in-progress':
        return '🔄'
      case 'failed':
        return '❌'
      default:
        return '⏳'
    }
  }

  const getStatusColor = (status: ChecklistStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'in-progress':
        return 'text-blue-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getCategoryIcon = (category: SecurityCategory) => {
    const icons = {
      'authentication': '🔐',
      'authorization': '🛡️',
      'encryption': '🔒',
      'network': '🌐',
      'data-protection': '📊',
      'audit-logging': '📝',
      'access-control': '🚪',
      'compliance': '📋',
      'incident-response': '🚨'
    }
    return icons[category] || '🔧'
  }

  const completionStats = {
    total: checklistItems.length,
    completed: checklistItems.filter(item => item.status === 'completed').length,
    inProgress: checklistItems.filter(item => item.status === 'in-progress').length,
    failed: checklistItems.filter(item => item.status === 'failed').length,
    pending: checklistItems.filter(item => item.status === 'pending').length
  }

  const completionPercentage = completionStats.total > 0 
    ? Math.round((completionStats.completed / completionStats.total) * 100)
    : 0

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Security Configuration Checklist
        </h2>
        <p className="text-gray-600">
          Comprehensive security checklist for CloudWatch APM configuration
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Progress Overview</h3>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Completion Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {completionStats.completed}
            </div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {completionStats.inProgress}
            </div>
            <div className="text-sm text-blue-700">In Progress</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {completionStats.failed}
            </div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {completionStats.pending}
            </div>
            <div className="text-sm text-gray-700">Pending</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({checklistItems.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending ({completionStats.pending})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'in-progress'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            In Progress ({completionStats.inProgress})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completed ({completionStats.completed})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Failed ({completionStats.failed})
          </button>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      {item.required && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          Required
                        </span>
                      )}
                      <span className={`text-lg ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-sm text-gray-500">
                        Category: {item.category}
                      </span>
                      <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                        Status: {item.status}
                      </span>
                    </div>

                    {/* Status Controls */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(['pending', 'in-progress', 'completed', 'failed'] as ChecklistStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(item.id, status)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            item.status === status
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </button>
                      ))}
                    </div>

                    {/* Validation Instructions */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        Validation Instructions:
                      </h4>
                      <p className="text-sm text-gray-700">{item.validation}</p>
                    </div>

                    {/* Notes Section */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes:
                      </label>
                      <textarea
                        value={item.notes || ''}
                        onChange={(e) => handleStatusChange(item.id, item.status, e.target.value)}
                        placeholder="Add notes about this checklist item..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {expandedItems.has(item.id) ? '▼' : '▶'}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedItems.has(item.id) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Implementation Details:
                      </h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p><strong>Category:</strong> {item.category}</p>
                        <p><strong>Required:</strong> {item.required ? 'Yes' : 'No'}</p>
                        <p><strong>ID:</strong> {item.id}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Validation Method:
                      </h4>
                      <p className="text-sm text-gray-700">{item.validation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No checklist items found
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No security checklist items are available.'
              : `No items with status "${filter}" found.`
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default SecurityChecklist