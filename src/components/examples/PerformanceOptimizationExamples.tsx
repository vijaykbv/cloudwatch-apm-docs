'use client'

import React, { useState } from 'react'
import { PerformanceExample, ProgrammingLanguage } from '../../types/examples'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface PerformanceOptimizationExamplesProps {
  examples: PerformanceExample[]
  className?: string
}

const categoryLabels = {
  optimization: 'Code Optimization',
  monitoring: 'Performance Monitoring',
  tuning: 'System Tuning',
  measurement: 'Performance Measurement'
}

const categoryColors = {
  optimization: 'bg-green-100 text-green-800 border-green-200',
  monitoring: 'bg-blue-100 text-blue-800 border-blue-200',
  tuning: 'bg-purple-100 text-purple-800 border-purple-200',
  measurement: 'bg-orange-100 text-orange-800 border-orange-200'
}

const languageLabels: Record<ProgrammingLanguage, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  shell: 'Shell',
  yaml: 'YAML',
  json: 'JSON',
  dockerfile: 'Dockerfile'
}

export function PerformanceOptimizationExamples({ examples, className = '' }: PerformanceOptimizationExamplesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [expandedExample, setExpandedExample] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('before')

  const categories = Array.from(new Set(examples.map(ex => ex.category)))
  const languages = Array.from(new Set(examples.map(ex => ex.language)))

  const filteredExamples = examples.filter(example => {
    const matchesCategory = selectedCategory === 'all' || example.category === selectedCategory
    const matchesLanguage = selectedLanguage === 'all' || example.language === selectedLanguage
    return matchesCategory && matchesLanguage
  })

  const toggleExpanded = (exampleId: string) => {
    setExpandedExample(expandedExample === exampleId ? null : exampleId)
    setActiveTab('before')
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const formatMetricValue = (value: number, unit: string) => {
    if (unit === '%') {
      return `${value}${unit}`
    }
    if (unit === 'ms' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}s`
    }
    if (unit === 'MB' && value >= 1024) {
      return `${(value / 1024).toFixed(1)}GB`
    }
    return `${value}${unit}`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Optimization Examples</h2>
        <p className="text-gray-600">
          Learn how to optimize application performance with before/after code examples and measurable improvements.
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Languages</option>
              {languages.map(language => (
                <option key={language} value={language}>
                  {languageLabels[language as ProgrammingLanguage]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory('all')
                setSelectedLanguage('all')
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredExamples.length} optimization example{filteredExamples.length !== 1 ? 's' : ''}
      </div>

      {/* Examples */}
      <div className="space-y-6">
        {filteredExamples.map((example) => (
          <Card key={example.id} className="overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{example.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[example.category]}`}>
                      {categoryLabels[example.category]}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                      {languageLabels[example.language]}
                    </span>
                  </div>
                  <p className="text-gray-600">{example.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExpanded(example.id)}
                >
                  {expandedExample === example.id ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>

              {/* Performance Metrics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {example.metrics.slice(0, 3).map((metric, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">{metric.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-red-600 text-sm">
                        {formatMetricValue(metric.beforeValue, metric.unit)}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 text-sm font-medium">
                        {formatMetricValue(metric.afterValue, metric.unit)}
                      </span>
                      <span className="text-green-600 text-xs">
                        ({metric.improvement > 0 ? '+' : ''}{metric.improvement}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {example.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Expanded Content */}
              {expandedExample === example.id && (
                <div className="space-y-6 pt-4 border-t border-gray-200">
                  {/* Code Comparison */}
                  <div>
                    <div className="flex space-x-1 mb-4">
                      <button
                        onClick={() => setActiveTab('before')}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                          activeTab === 'before'
                            ? 'bg-red-50 text-red-700 border-b-2 border-red-500'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Before (Unoptimized)
                      </button>
                      <button
                        onClick={() => setActiveTab('after')}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                          activeTab === 'after'
                            ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        After (Optimized)
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute top-2 right-2 z-10">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyCode(activeTab === 'before' ? example.beforeCode : example.afterCode)}
                        >
                          Copy
                        </Button>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{activeTab === 'before' ? example.beforeCode : example.afterCode}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Optimization Explanation</h4>
                    <p className="text-gray-600 text-sm">{example.explanation}</p>
                  </div>

                  {/* Detailed Metrics */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Performance Impact</h4>
                    <div className="space-y-3">
                      {example.metrics.map((metric, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-800">{metric.name}</h5>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              metric.improvement > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {metric.improvement > 0 ? '+' : ''}{metric.improvement}% improvement
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <div>
                              <span className="text-gray-600">Before: </span>
                              <span className="text-red-600 font-medium">
                                {formatMetricValue(metric.beforeValue, metric.unit)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">After: </span>
                              <span className="text-green-600 font-medium">
                                {formatMetricValue(metric.afterValue, metric.unit)}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-xs mt-2">{metric.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tools Used */}
                  {example.tools.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Tools & Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {example.tools.map((tool, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    Last updated: {example.lastUpdated.toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredExamples.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">No optimization examples found</h3>
            <p>Try adjusting your filters to see more examples.</p>
          </div>
        </Card>
      )}
    </div>
  )
}