'use client'

import React, { useState, useMemo } from 'react'
import { IntegrationPattern } from '../../types/migration'
import { INTEGRATION_PATTERNS } from '../../data/apm-solutions'

interface IntegrationPatternLibraryProps {
  onPatternSelect?: (pattern: IntegrationPattern) => void
  className?: string
}

interface FilterOptions {
  architecture: string
  complexity: string
  searchTerm: string
}

export const IntegrationPatternLibrary: React.FC<IntegrationPatternLibraryProps> = ({
  onPatternSelect,
  className = ''
}) => {
  const [selectedPattern, setSelectedPattern] = useState<IntegrationPattern | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    architecture: 'all',
    complexity: 'all',
    searchTerm: ''
  })

  const filteredPatterns = useMemo(() => {
    return INTEGRATION_PATTERNS.filter(pattern => {
      const matchesArchitecture = filters.architecture === 'all' || pattern.architecture === filters.architecture
      const matchesComplexity = filters.complexity === 'all' || pattern.complexity === filters.complexity
      const matchesSearch = filters.searchTerm === '' || 
        pattern.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        pattern.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      
      return matchesArchitecture && matchesComplexity && matchesSearch
    })
  }, [filters])

  const handlePatternSelect = (pattern: IntegrationPattern) => {
    setSelectedPattern(pattern)
    onPatternSelect?.(pattern)
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'complex':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getArchitectureIcon = (architecture: string) => {
    switch (architecture) {
      case 'monolith':
        return '🏢'
      case 'microservices':
        return '🔗'
      case 'serverless':
        return '⚡'
      case 'hybrid':
        return '🔄'
      default:
        return '📦'
    }
  }

  const renderPatternCard = (pattern: IntegrationPattern) => (
    <div
      key={pattern.id}
      className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
        selectedPattern?.id === pattern.id
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => handlePatternSelect(pattern)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getArchitectureIcon(pattern.architecture)}</span>
          <div>
            <h3 className="font-semibold text-lg">{pattern.name}</h3>
            <p className="text-gray-600 text-sm capitalize">{pattern.architecture} Architecture</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(pattern.complexity)}`}>
          {pattern.complexity}
        </span>
      </div>
      
      <p className="text-gray-700 mb-4">{pattern.description}</p>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm text-gray-900 mb-2">Key Components</h4>
          <div className="flex flex-wrap gap-2">
            {pattern.components.slice(0, 3).map((component, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {component.name}
              </span>
            ))}
            {pattern.components.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{pattern.components.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-sm text-gray-900 mb-2">Benefits</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {pattern.benefits.slice(0, 2).map((benefit, index) => (
              <li key={index}>• {benefit}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )

  const renderPatternDetails = (pattern: IntegrationPattern) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{getArchitectureIcon(pattern.architecture)}</span>
          <div>
            <h2 className="text-2xl font-bold">{pattern.name}</h2>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-gray-600 capitalize">{pattern.architecture} Architecture</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(pattern.complexity)}`}>
                {pattern.complexity} complexity
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setSelectedPattern(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-8">
        {/* Overview */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Overview</h3>
          <p className="text-gray-700">{pattern.description}</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">{pattern.implementation.overview}</p>
          </div>
        </div>

        {/* Components */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Architecture Components</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pattern.components.map((component, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">{component.name}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded capitalize">
                    {component.type.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{component.description}</p>
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  <strong>APM Integration:</strong> {component.apmIntegration}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Implementation Steps</h3>
          <div className="space-y-4">
            {pattern.implementation.steps.map((step, index) => (
              <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{step.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded text-xs ${
                          step.category === 'preparation' ? 'bg-yellow-100 text-yellow-800' :
                          step.category === 'implementation' ? 'bg-blue-100 text-blue-800' :
                          step.category === 'validation' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {step.category}
                        </span>
                        <span>{step.estimatedTime}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    
                    {step.prerequisites.length > 0 && (
                      <div className="mb-3">
                        <h5 className="font-medium text-sm mb-1">Prerequisites:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {step.prerequisites.map((prereq, i) => (
                            <li key={i}>• {prereq}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <h5 className="font-medium text-sm mb-1">Instructions:</h5>
                      <ol className="text-sm text-gray-600 space-y-1">
                        {step.instructions.map((instruction, i) => (
                          <li key={i}>{i + 1}. {instruction}</li>
                        ))}
                      </ol>
                    </div>
                    
                    {step.codeExamples && step.codeExamples.length > 0 && (
                      <div className="mb-3">
                        <h5 className="font-medium text-sm mb-2">Code Examples:</h5>
                        {step.codeExamples.map((example, i) => (
                          <div key={i} className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{example.title}</span>
                              <span className="text-xs text-gray-500">{example.language}</span>
                            </div>
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                              <code>{example.after}</code>
                            </pre>
                            <p className="text-xs text-gray-600 mt-1">{example.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {step.warnings && step.warnings.length > 0 && (
                      <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <h5 className="font-medium text-sm text-yellow-800 mb-1">⚠️ Warnings:</h5>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {step.warnings.map((warning, i) => (
                            <li key={i}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {step.tips && step.tips.length > 0 && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                        <h5 className="font-medium text-sm text-blue-800 mb-1">💡 Tips:</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {step.tips.map((tip, i) => (
                            <li key={i}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Examples */}
        {pattern.implementation.configurationExamples.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Configuration Examples</h3>
            <div className="space-y-4">
              {pattern.implementation.configurationExamples.map((example, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{example.title}</h4>
                    <span className="text-xs text-gray-500">{example.language}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{example.description}</p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <code>{example.configuration}</code>
                  </pre>
                  {example.notes && example.notes.length > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <h5 className="font-medium text-sm mb-1">Notes:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {example.notes.map((note, i) => (
                          <li key={i}>• {note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits and Considerations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Benefits</h3>
            <ul className="space-y-2">
              {pattern.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Considerations</h3>
            <ul className="space-y-2">
              {pattern.considerations.map((consideration, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-yellow-600 mt-1">⚠️</span>
                  <span className="text-gray-700">{consideration}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Testing Strategy */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Testing Strategy</h3>
          <ul className="space-y-2">
            {pattern.implementation.testingStrategy.map((strategy, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">🧪</span>
                <span className="text-gray-700">{strategy}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {!selectedPattern ? (
        <>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Integration Pattern Library</h1>
            <p className="text-gray-600">
              Browse proven integration patterns for migrating different architectures to CloudWatch APM.
              Each pattern includes detailed implementation steps, code examples, and best practices.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Architecture</label>
                <select
                  value={filters.architecture}
                  onChange={(e) => setFilters(prev => ({ ...prev, architecture: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">All Architectures</option>
                  <option value="monolith">Monolithic</option>
                  <option value="microservices">Microservices</option>
                  <option value="serverless">Serverless</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Complexity</label>
                <select
                  value={filters.complexity}
                  onChange={(e) => setFilters(prev => ({ ...prev, complexity: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">All Complexities</option>
                  <option value="simple">Simple</option>
                  <option value="moderate">Moderate</option>
                  <option value="complex">Complex</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search patterns..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Pattern Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPatterns.map(renderPatternCard)}
          </div>

          {filteredPatterns.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No patterns match your current filters.</p>
              <button
                onClick={() => setFilters({ architecture: 'all', complexity: 'all', searchTerm: '' })}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      ) : (
        renderPatternDetails(selectedPattern)
      )}
    </div>
  )
}