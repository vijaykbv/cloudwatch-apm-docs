'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import {
  MetricDefinition,
  MetricCategory,
  MetricUseCase,
  MetricRelationship
} from '../../types/monitoring'
import { performanceMetricCatalog } from '../../data/monitoring-data'

interface PerformanceMetricCatalogProps {
  onMetricSelect?: (metric: MetricDefinition) => void
  onUseCaseSelect?: (useCase: MetricUseCase) => void
}

interface FilterState {
  category: string
  severity: string
  namespace: string
  searchTerm: string
}

export function PerformanceMetricCatalog({ 
  onMetricSelect, 
  onUseCaseSelect 
}: PerformanceMetricCatalogProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricDefinition | null>(null)
  const [activeTab, setActiveTab] = useState<'metrics' | 'categories' | 'usecases' | 'relationships'>('metrics')
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    severity: '',
    namespace: '',
    searchTerm: ''
  })

  const filteredMetrics = useMemo(() => {
    return performanceMetricCatalog.metrics.filter(metric => {
      if (filters.category && metric.category.id !== filters.category) {
        return false
      }
      if (filters.severity && metric.severity !== filters.severity) {
        return false
      }
      if (filters.namespace && metric.namespace !== filters.namespace) {
        return false
      }
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesName = metric.displayName.toLowerCase().includes(searchLower)
        const matchesDescription = metric.description.toLowerCase().includes(searchLower)
        const matchesNamespace = metric.namespace.toLowerCase().includes(searchLower)
        
        if (!matchesName && !matchesDescription && !matchesNamespace) {
          return false
        }
      }
      return true
    })
  }, [filters])

  const uniqueNamespaces = useMemo(() => {
    const namespaces = new Set(performanceMetricCatalog.metrics.map(m => m.namespace))
    return Array.from(namespaces).sort()
  }, [])

  const getRelatedMetrics = (metricId: string): MetricDefinition[] => {
    const relationships = performanceMetricCatalog.relationships.filter(
      rel => rel.primary === metricId
    )
    const relatedIds = relationships.flatMap(rel => rel.related)
    return performanceMetricCatalog.metrics.filter(m => relatedIds.includes(m.id))
  }

  const getMetricRelationships = (metricId: string): MetricRelationship[] => {
    return performanceMetricCatalog.relationships.filter(
      rel => rel.primary === metricId || rel.related.includes(metricId)
    )
  }

  if (selectedMetric) {
    return (
      <MetricDetail
        metric={selectedMetric}
        relatedMetrics={getRelatedMetrics(selectedMetric.id)}
        relationships={getMetricRelationships(selectedMetric.id)}
        onBack={() => setSelectedMetric(null)}
        onMetricSelect={onMetricSelect}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Metric Catalog</h2>
        <p className="text-gray-600">
          Comprehensive catalog of CloudWatch APM metrics with detailed descriptions, thresholds, and relationships
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'metrics', label: 'Metrics', count: performanceMetricCatalog.metrics.length },
            { id: 'categories', label: 'Categories', count: performanceMetricCatalog.categories.length },
            { id: 'usecases', label: 'Use Cases', count: performanceMetricCatalog.useCases.length },
            { id: 'relationships', label: 'Relationships', count: performanceMetricCatalog.relationships.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <Input
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  placeholder="Search metrics..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {performanceMetricCatalog.categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Namespace</label>
                <select
                  value={filters.namespace}
                  onChange={(e) => setFilters(prev => ({ ...prev, namespace: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Namespaces</option>
                  {uniqueNamespaces.map(namespace => (
                    <option key={namespace} value={namespace}>
                      {namespace}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Metrics list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMetrics.map(metric => (
              <Card key={metric.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div onClick={() => setSelectedMetric(metric)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{metric.displayName}</h3>
                      <p className="text-sm text-gray-500">{metric.category.name}</p>
                    </div>
                    <span className={`
                      px-2 py-1 text-xs rounded-full
                      ${metric.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        metric.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        metric.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }
                    `}>
                      {metric.severity}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{metric.description}</p>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Unit:</span>
                      <span className="ml-2 text-gray-600">{metric.unit}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Namespace:</span>
                      <span className="ml-2 text-gray-600">{metric.namespace}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Dimensions:</span>
                      <span className="ml-2 text-gray-600">{metric.dimensions.length}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Thresholds:</span>
                      <span className="ml-2 text-gray-600">{metric.defaultThresholds.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t mt-4">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMetricSelect?.(metric)
                    }}
                    className="flex-1"
                  >
                    Use Metric
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedMetric(metric)
                    }}
                    className="flex-1"
                  >
                    Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performanceMetricCatalog.categories.map(category => {
            const categoryMetrics = performanceMetricCatalog.metrics.filter(m => m.category.id === category.id)
            return (
              <Card key={category.id} className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: category.color + '20' }}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{categoryMetrics.length} metrics</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <div className="space-y-2">
                  {categoryMetrics.slice(0, 3).map(metric => (
                    <div key={metric.id} className="text-sm">
                      <button
                        onClick={() => setSelectedMetric(metric)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {metric.displayName}
                      </button>
                    </div>
                  ))}
                  {categoryMetrics.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{categoryMetrics.length - 3} more metrics
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {activeTab === 'usecases' && (
        <div className="space-y-6">
          {performanceMetricCatalog.useCases.map(useCase => (
            <Card key={useCase.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{useCase.name}</h3>
                  <p className="text-gray-600">{useCase.description}</p>
                </div>
                <Button
                  onClick={() => onUseCaseSelect?.(useCase)}
                  variant="outline"
                >
                  Use This Setup
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Scenario</h4>
                <p className="text-gray-700 text-sm">{useCase.scenario}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Metrics ({useCase.metrics.length})</h4>
                  <ul className="space-y-1">
                    {useCase.metrics.map(metricId => {
                      const metric = performanceMetricCatalog.metrics.find(m => m.id === metricId)
                      return (
                        <li key={metricId} className="text-gray-600">
                          {metric?.displayName || metricId}
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Dashboards ({useCase.dashboards.length})</h4>
                  <ul className="space-y-1">
                    {useCase.dashboards.map(dashboard => (
                      <li key={dashboard} className="text-gray-600">{dashboard}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Alerts ({useCase.alerts.length})</h4>
                  <ul className="space-y-1">
                    {useCase.alerts.map(alert => (
                      <li key={alert} className="text-gray-600">{alert}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Interpretation</h4>
                  <p className="text-gray-600">{useCase.interpretation}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'relationships' && (
        <div className="space-y-6">
          {performanceMetricCatalog.relationships.map((relationship, index) => {
            const primaryMetric = performanceMetricCatalog.metrics.find(m => m.id === relationship.primary)
            const relatedMetrics = performanceMetricCatalog.metrics.filter(m => 
              relationship.related.includes(m.id)
            )

            return (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${relationship.type === 'correlation' ? 'bg-blue-100 text-blue-800' :
                      relationship.type === 'causation' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }
                  `}>
                    {relationship.type}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Primary Metric</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-900">{primaryMetric?.displayName}</div>
                      <div className="text-sm text-gray-600">{primaryMetric?.description}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Related Metrics</h4>
                    <div className="space-y-2">
                      {relatedMetrics.map(metric => (
                        <div key={metric.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium text-gray-900">{metric.displayName}</div>
                          <div className="text-sm text-gray-600">{metric.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Relationship Description</h4>
                  <p className="text-blue-800 text-sm">{relationship.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MetricDetail({
  metric,
  relatedMetrics,
  relationships,
  onBack,
  onMetricSelect
}: {
  metric: MetricDefinition
  relatedMetrics: MetricDefinition[]
  relationships: MetricRelationship[]
  onBack: () => void
  onMetricSelect?: (metric: MetricDefinition) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{metric.displayName}</h2>
          <p className="text-gray-600">{metric.category.name}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          ← Back to Catalog
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-600 mb-4">{metric.description}</p>
            <p className="text-gray-700">{metric.documentation}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dimensions</h3>
            <div className="space-y-3">
              {metric.dimensions.map(dimension => (
                <div key={dimension.name} className="border-l-4 border-blue-400 pl-4">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900">{dimension.name}</h4>
                    {dimension.required && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{dimension.description}</p>
                  {dimension.possibleValues && (
                    <div className="text-sm text-gray-500 mt-1">
                      Possible values: {dimension.possibleValues.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Thresholds</h3>
            <div className="space-y-4">
              {metric.defaultThresholds.map((threshold, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">
                      {threshold.condition.replace('_', ' ')} {threshold.value} {metric.unit}
                    </div>
                    <span className={`
                      px-2 py-1 text-xs rounded-full
                      ${threshold.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}
                    `}>
                      {threshold.severity}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{threshold.description}</p>
                  <p className="text-gray-700 text-sm">{threshold.rationale}</p>
                  <div className="text-xs text-gray-500 mt-2">Duration: {threshold.duration}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Examples</h3>
            <div className="space-y-4">
              {metric.examples.map(example => (
                <div key={example.id} className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-medium text-gray-900 mb-2">{example.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{example.description}</p>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Scenario:</strong> {example.scenario}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Expected Value:</strong> {example.expectedValue} {metric.unit}
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>Interpretation:</strong> {example.interpretation}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Unit:</span>
                <span className="ml-2">{metric.unit}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Namespace:</span>
                <span className="ml-2">{metric.namespace}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Severity:</span>
                <span className={`
                  ml-2 px-2 py-1 rounded-full text-xs
                  ${metric.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    metric.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    metric.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }
                `}>
                  {metric.severity}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <Button onClick={() => onMetricSelect?.(metric)} className="w-full">
                Use This Metric
              </Button>
              <Button variant="outline" className="w-full">
                Create Alert
              </Button>
              <Button variant="outline" className="w-full">
                Add to Dashboard
              </Button>
            </div>
          </Card>

          {relatedMetrics.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Metrics</h3>
              <div className="space-y-2">
                {relatedMetrics.map(related => (
                  <div key={related.id} className="text-sm">
                    <button
                      onClick={() => onMetricSelect?.(related)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {related.displayName}
                    </button>
                    <div className="text-gray-500 text-xs">{related.category.name}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {relationships.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Relationships</h3>
              <div className="space-y-3">
                {relationships.map((rel, index) => (
                  <div key={index} className="text-sm">
                    <div className={`
                      px-2 py-1 rounded text-xs font-medium mb-1
                      ${rel.type === 'correlation' ? 'bg-blue-100 text-blue-800' :
                        rel.type === 'causation' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }
                    `}>
                      {rel.type}
                    </div>
                    <p className="text-gray-600">{rel.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}