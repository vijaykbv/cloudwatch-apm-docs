'use client'

import React, { useState, useMemo } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { ArchitecturePattern, ArchitectureCategory, ScaleLevel, ComponentType } from '../../types/performance'
import { architecturePatterns } from '../../data/performance-data'

interface ArchitecturePatternLibraryProps {
  patterns?: ArchitecturePattern[]
  onSelectPattern?: (patternId: string) => void
  onImplementPattern?: (patternId: string) => void
}

export const ArchitecturePatternLibrary: React.FC<ArchitecturePatternLibraryProps> = ({
  patterns = architecturePatterns,
  onSelectPattern,
  onImplementPattern
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ArchitectureCategory | null>(null)
  const [selectedScale, setSelectedScale] = useState<ScaleLevel | null>(null)
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'implementation' | 'monitoring'>('overview')

  const categories: ArchitectureCategory[] = ['microservices', 'serverless', 'container', 'hybrid', 'edge']
  const scales: ScaleLevel[] = ['small', 'medium', 'large', 'enterprise']

  const filteredPatterns = useMemo(() => {
    return patterns.filter(pattern => {
      if (selectedCategory && pattern.category !== selectedCategory) return false
      if (selectedScale && pattern.scale !== selectedScale) return false
      return true
    })
  }, [patterns, selectedCategory, selectedScale])

  const getCategoryColor = (category: ArchitectureCategory): string => {
    switch (category) {
      case 'microservices': return 'bg-blue-100 text-blue-800'
      case 'serverless': return 'bg-green-100 text-green-800'
      case 'container': return 'bg-purple-100 text-purple-800'
      case 'hybrid': return 'bg-yellow-100 text-yellow-800'
      case 'edge': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScaleColor = (scale: ScaleLevel): string => {
    switch (scale) {
      case 'small': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'large': return 'bg-orange-100 text-orange-800'
      case 'enterprise': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getComponentTypeIcon = (type: ComponentType): string => {
    switch (type) {
      case 'compute': return '🖥️'
      case 'storage': return '💾'
      case 'network': return '🌐'
      case 'database': return '🗄️'
      case 'cache': return '⚡'
      case 'queue': return '📬'
      case 'load-balancer': return '⚖️'
      default: return '📦'
    }
  }

  const renderPatternOverview = (pattern: ArchitecturePattern) => (
    <div className="space-y-4">
      <div>
        <h5 className="font-medium text-gray-900 mb-2">Description</h5>
        <p className="text-gray-600">{pattern.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h5 className="font-medium text-gray-900 mb-2">Benefits</h5>
          <ul className="space-y-1">
            {pattern.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 mt-1">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="font-medium text-gray-900 mb-2">Trade-offs</h5>
          <ul className="space-y-1">
            {pattern.tradeoffs.map((tradeoff, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-yellow-500 mt-1">⚠</span>
                {tradeoff}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-gray-900 mb-2">Use Cases</h5>
        <div className="flex flex-wrap gap-2">
          {pattern.useCases.map((useCase, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {useCase}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPatternComponents = (pattern: ArchitecturePattern) => (
    <div className="space-y-4">
      {pattern.components.map(component => (
        <div key={component.id} className="border rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">{getComponentTypeIcon(component.type)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h6 className="font-medium text-gray-900">{component.name}</h6>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 capitalize">
                  {component.type.replace('-', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{component.description}</p>

              {/* Scaling Properties */}
              <div className="mb-3">
                <h7 className="text-xs font-medium text-gray-700 mb-1 block">Scaling Properties</h7>
                <div className="flex flex-wrap gap-2 text-xs">
                  {component.scalingProperties.horizontal && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Horizontal</span>
                  )}
                  {component.scalingProperties.vertical && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Vertical</span>
                  )}
                  {component.scalingProperties.autoScaling && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Auto-scaling</span>
                  )}
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {component.scalingProperties.minInstances}-{component.scalingProperties.maxInstances} instances
                  </span>
                </div>
              </div>

              {/* Dependencies */}
              {component.dependencies.length > 0 && (
                <div>
                  <h7 className="text-xs font-medium text-gray-700 mb-1 block">Dependencies</h7>
                  <div className="flex flex-wrap gap-1">
                    {component.dependencies.map(dep => (
                      <span key={dep} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Configuration Preview */}
              {Object.keys(component.configuration).length > 0 && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                  <div className="font-medium text-gray-700 mb-1">Configuration:</div>
                  <div className="text-gray-600">
                    {Object.entries(component.configuration).slice(0, 3).map(([key, value]) => (
                      <div key={key}>
                        {key}: {typeof value === 'boolean' ? value.toString() : value}
                      </div>
                    ))}
                    {Object.keys(component.configuration).length > 3 && (
                      <div className="text-gray-500">... and {Object.keys(component.configuration).length - 3} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderPatternImplementation = (pattern: ArchitecturePattern) => (
    <div className="space-y-6">
      {/* Implementation Steps */}
      <div>
        <h5 className="font-medium text-gray-900 mb-3">Implementation Steps</h5>
        <div className="space-y-3">
          {pattern.implementation.steps.map((step, index) => (
            <div key={step.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {index + 1}
                </span>
                <h6 className="font-medium text-gray-900">{step.title}</h6>
              </div>
              <p className="text-sm text-gray-600 mb-3 ml-8">{step.description}</p>
              
              {step.commands.length > 0 && (
                <div className="ml-8">
                  <div className="text-xs text-gray-500 mb-1">Commands:</div>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                    {step.commands.map((command, cmdIndex) => (
                      <div key={cmdIndex} className="mb-1 last:mb-0">{command}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Code Examples */}
      {pattern.implementation.codeExamples.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Code Examples</h5>
          <div className="space-y-4">
            {pattern.implementation.codeExamples.map(example => (
              <div key={`${example.language}-${example.title}`} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="font-medium text-gray-900">{example.title}</h6>
                      <p className="text-sm text-gray-600">{example.description}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {example.language}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                    <code>{example.code.trim()}</code>
                  </pre>
                  {example.dependencies.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">Dependencies:</div>
                      <div className="flex flex-wrap gap-1">
                        {example.dependencies.map(dep => (
                          <span key={dep} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Examples */}
      {pattern.implementation.configurations.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Configuration Examples</h5>
          <div className="space-y-4">
            {pattern.implementation.configurations.map(config => (
              <div key={config.name} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h6 className="font-medium text-gray-900">{config.name}</h6>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>
                <div className="p-4">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                    <code>{config.content.trim()}</code>
                  </pre>
                  {Object.keys(config.variables).length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">Variables:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(config.variables).map(([key, value]) => (
                          <div key={key} className="bg-gray-100 p-2 rounded">
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderPatternMonitoring = (pattern: ArchitecturePattern) => (
    <div className="space-y-6">
      {/* Metrics */}
      <div>
        <h5 className="font-medium text-gray-900 mb-3">Key Metrics</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {pattern.implementation.monitoring.metrics.map(metric => (
            <div key={metric} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-blue-900">{metric}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div>
        <h5 className="font-medium text-gray-900 mb-3">Recommended Alerts</h5>
        <div className="space-y-3">
          {pattern.implementation.monitoring.alerts.map(alert => (
            <div key={alert.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h6 className="font-medium text-gray-900">{alert.name}</h6>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.severity}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">{alert.condition}</div>
              <div className="text-xs text-gray-500">Threshold: {alert.threshold}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboards */}
      <div>
        <h5 className="font-medium text-gray-900 mb-3">Dashboard Templates</h5>
        <div className="space-y-4">
          {pattern.implementation.monitoring.dashboards.map(dashboard => (
            <div key={dashboard.name} className="border rounded-lg p-4">
              <h6 className="font-medium text-gray-900 mb-3">{dashboard.name}</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dashboard.widgets.map((widget, index) => (
                  <div key={index} className="bg-gray-50 border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h7 className="text-sm font-medium text-gray-900">{widget.title}</h7>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {widget.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Metrics: {widget.metrics.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Architecture Pattern Library</h2>
          <p className="text-gray-600 mt-1">
            Proven architecture patterns for different scales and use cases
          </p>
        </div>
        <Button variant="primary" className="text-sm">
          Create Custom Pattern
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 self-center">Category:</span>
          <Button
            variant={!selectedCategory ? 'primary' : 'secondary'}
            onClick={() => setSelectedCategory(null)}
            className="text-sm"
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'secondary'}
              onClick={() => setSelectedCategory(category)}
              className="text-sm capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 self-center">Scale:</span>
          <Button
            variant={!selectedScale ? 'primary' : 'secondary'}
            onClick={() => setSelectedScale(null)}
            className="text-sm"
          >
            All
          </Button>
          {scales.map(scale => (
            <Button
              key={scale}
              variant={selectedScale === scale ? 'primary' : 'secondary'}
              onClick={() => setSelectedScale(scale)}
              className="text-sm capitalize"
            >
              {scale}
            </Button>
          ))}
        </div>
      </div>

      {/* Patterns Grid */}
      <div className="space-y-6">
        {filteredPatterns.map(pattern => (
          <Card key={pattern.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{pattern.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(pattern.category)}`}>
                    {pattern.category}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScaleColor(pattern.scale)}`}>
                    {pattern.scale} scale
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{pattern.description}</p>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{pattern.components.length} components</span>
                  <span>•</span>
                  <span>{pattern.benefits.length} benefits</span>
                  <span>•</span>
                  <span>{pattern.useCases.length} use cases</span>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedPattern === pattern.id && (
              <div className="border-t pt-6 mt-4">
                {/* Tab Navigation */}
                <div className="flex border-b mb-6">
                  {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'components', label: 'Components' },
                    { key: 'implementation', label: 'Implementation' },
                    { key: 'monitoring', label: 'Monitoring' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && renderPatternOverview(pattern)}
                {activeTab === 'components' && renderPatternComponents(pattern)}
                {activeTab === 'implementation' && renderPatternImplementation(pattern)}
                {activeTab === 'monitoring' && renderPatternMonitoring(pattern)}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="primary"
                onClick={() => onImplementPattern?.(pattern.id)}
                className="text-sm"
              >
                Implement Pattern
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setExpandedPattern(expandedPattern === pattern.id ? null : pattern.id)
                  setActiveTab('overview')
                }}
                className="text-sm"
              >
                {expandedPattern === pattern.id ? 'Hide Details' : 'View Details'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => onSelectPattern?.(pattern.id)}
                className="text-sm"
              >
                Select Pattern
              </Button>
              <Button variant="secondary" className="text-sm">
                Export Template
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredPatterns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No architecture patterns found</div>
          <div className="text-sm text-gray-400">
            Try adjusting your filters or create a custom pattern
          </div>
        </div>
      )}
    </div>
  )
}

export default ArchitecturePatternLibrary