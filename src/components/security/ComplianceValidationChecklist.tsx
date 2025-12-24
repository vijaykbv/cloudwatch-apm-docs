'use client'

import React, { useState, useEffect } from 'react'
import { 
  ComplianceMapping, 
  ComplianceFramework, 
  ComplianceStatus,
  ComplianceControl,
  ComplianceRequirement 
} from '../../types/security'
import { complianceFrameworks } from '../../data/security-data'

interface ValidationItem {
  id: string
  title: string
  description: string
  framework: ComplianceFramework
  type: 'control' | 'requirement'
  status: ComplianceStatus
  priority: 'high' | 'medium' | 'low'
  evidence: string[]
  notes?: string
}

interface ComplianceValidationChecklistProps {
  selectedFrameworks?: ComplianceFramework[]
  onValidationUpdate?: (itemId: string, status: ComplianceStatus, notes?: string) => void
}

export const ComplianceValidationChecklist: React.FC<ComplianceValidationChecklistProps> = ({
  selectedFrameworks = [],
  onValidationUpdate
}) => {
  const [validationItems, setValidationItems] = useState<ValidationItem[]>([])
  const [filterFramework, setFilterFramework] = useState<ComplianceFramework | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<'high' | 'medium' | 'low' | 'all'>('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Convert compliance mappings to validation items
    const items: ValidationItem[] = []
    
    complianceFrameworks.forEach(mapping => {
      // Add control validation items
      mapping.controls.forEach(control => {
        items.push({
          id: `control-${control.id}`,
          title: control.name,
          description: control.description,
          framework: control.framework,
          type: 'control',
          status: mapping.status,
          priority: getPriorityFromCategory(control.category),
          evidence: control.evidence,
          notes: ''
        })
      })

      // Add requirement validation items
      mapping.requirements.forEach(requirement => {
        items.push({
          id: `requirement-${requirement.id}`,
          title: requirement.title,
          description: requirement.description,
          framework: requirement.framework,
          type: 'requirement',
          status: mapping.status,
          priority: requirement.mandatory ? 'high' : 'medium',
          evidence: [],
          notes: ''
        })
      })
    })
    
    setValidationItems(items)
  }, [])

  const getPriorityFromCategory = (category: string): 'high' | 'medium' | 'low' => {
    const highPriorityCategories = ['Security', 'Data Protection', 'Access Control']
    const mediumPriorityCategories = ['Monitoring', 'Audit', 'Configuration']
    
    if (highPriorityCategories.includes(category)) return 'high'
    if (mediumPriorityCategories.includes(category)) return 'medium'
    return 'low'
  }

  const handleStatusUpdate = (itemId: string, newStatus: ComplianceStatus, notes?: string) => {
    setValidationItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, status: newStatus, notes }
          : item
      )
    )
    
    if (onValidationUpdate) {
      onValidationUpdate(itemId, newStatus, notes)
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

  const getFrameworkIcon = (framework: ComplianceFramework) => {
    const icons = {
      'SOC2': '🛡️',
      'ISO27001': '🔒',
      'GDPR': '🇪🇺',
      'HIPAA': '🏥',
      'PCI-DSS': '💳',
      'FedRAMP': '🏛️',
      'NIST': '🔬',
      'CIS': '⚙️'
    }
    return icons[framework] || '📋'
  }

  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return '✅'
      case 'non-compliant':
        return '❌'
      case 'partial':
        return '⚠️'
      case 'not-assessed':
        return '❓'
      default:
        return '❓'
    }
  }

  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600'
      case 'non-compliant':
        return 'text-red-600'
      case 'partial':
        return 'text-yellow-600'
      case 'not-assessed':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: 'control' | 'requirement') => {
    return type === 'control' ? '🛡️' : '📝'
  }

  const filteredItems = validationItems.filter(item => {
    const frameworkMatch = filterFramework === 'all' || item.framework === filterFramework
    const statusMatch = filterStatus === 'all' || item.status === filterStatus
    const priorityMatch = filterPriority === 'all' || item.priority === filterPriority
    return frameworkMatch && statusMatch && priorityMatch
  })

  const validationStats = {
    total: validationItems.length,
    compliant: validationItems.filter(item => item.status === 'compliant').length,
    nonCompliant: validationItems.filter(item => item.status === 'non-compliant').length,
    partial: validationItems.filter(item => item.status === 'partial').length,
    notAssessed: validationItems.filter(item => item.status === 'not-assessed').length
  }

  const compliancePercentage = validationStats.total > 0 
    ? Math.round(((validationStats.compliant + validationStats.partial * 0.5) / validationStats.total) * 100)
    : 0

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Compliance Validation Checklist
        </h2>
        <p className="text-gray-600">
          Validate compliance requirements and controls across multiple frameworks
        </p>
      </div>

      {/* Compliance Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Compliance Overview</h3>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Compliance</span>
            <span>{compliancePercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${compliancePercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {validationStats.compliant}
            </div>
            <div className="text-sm text-green-700">Compliant</div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {validationStats.partial}
            </div>
            <div className="text-sm text-yellow-700">Partial</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {validationStats.nonCompliant}
            </div>
            <div className="text-sm text-red-700">Non-Compliant</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {validationStats.notAssessed}
            </div>
            <div className="text-sm text-gray-700">Not Assessed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
            <select
              value={filterFramework}
              onChange={(e) => setFilterFramework(e.target.value as ComplianceFramework | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Frameworks</option>
              <option value="SOC2">SOC2</option>
              <option value="ISO27001">ISO27001</option>
              <option value="GDPR">GDPR</option>
              <option value="HIPAA">HIPAA</option>
              <option value="PCI-DSS">PCI-DSS</option>
              <option value="FedRAMP">FedRAMP</option>
              <option value="NIST">NIST</option>
              <option value="CIS">CIS</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ComplianceStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="compliant">Compliant</option>
              <option value="non-compliant">Non-Compliant</option>
              <option value="partial">Partial</option>
              <option value="not-assessed">Not Assessed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as 'high' | 'medium' | 'low' | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Validation Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority.toUpperCase()}
                      </span>
                      <span className="text-lg">{getFrameworkIcon(item.framework)}</span>
                      <span className={`text-lg ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-sm text-gray-500">
                        Framework: {item.framework}
                      </span>
                      <span className="text-sm text-gray-500">
                        Type: {item.type}
                      </span>
                      <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                        Status: {item.status}
                      </span>
                    </div>

                    {/* Status Controls */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(['compliant', 'non-compliant', 'partial', 'not-assessed'] as ComplianceStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(item.id, status, item.notes)}
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

                    {/* Evidence */}
                    {item.evidence.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          Required Evidence:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {item.evidence.map((evidence, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {evidence}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes Section */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Validation Notes:
                      </label>
                      <textarea
                        value={item.notes || ''}
                        onChange={(e) => handleStatusUpdate(item.id, item.status, e.target.value)}
                        placeholder="Add validation notes, evidence references, or action items..."
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
                        Validation Details:
                      </h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p><strong>ID:</strong> {item.id}</p>
                        <p><strong>Framework:</strong> {item.framework}</p>
                        <p><strong>Type:</strong> {item.type}</p>
                        <p><strong>Priority:</strong> {item.priority}</p>
                        <p><strong>Current Status:</strong> {item.status}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Validation Actions:
                      </h4>
                      <div className="space-y-2">
                        <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                          Generate Evidence Report
                        </button>
                        <button className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                          Schedule Review
                        </button>
                        <button className="w-full px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors">
                          Request Assessment
                        </button>
                      </div>
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
            No validation items found
          </h3>
          <p className="text-gray-600">
            No compliance validation items match the selected filters.
          </p>
        </div>
      )}
    </div>
  )
}

export default ComplianceValidationChecklist