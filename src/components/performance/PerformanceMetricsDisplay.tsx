'use client'

import React, { useState, useMemo } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { PerformanceBenchmark, PerformanceMetric, BenchmarkCategory } from '../../types/performance'
import { performanceBenchmarks } from '../../data/performance-data'

interface PerformanceMetricsDisplayProps {
  benchmarks?: PerformanceBenchmark[]
  selectedCategory?: BenchmarkCategory
  onCategoryChange?: (category: BenchmarkCategory) => void
  showComparison?: boolean
}

export const PerformanceMetricsDisplay: React.FC<PerformanceMetricsDisplayProps> = ({
  benchmarks = performanceBenchmarks,
  selectedCategory,
  onCategoryChange,
  showComparison = true
}) => {
  const [selectedBenchmark, setSelectedBenchmark] = useState<string | null>(null)
  const [comparisonMode, setComparisonMode] = useState(false)

  const filteredBenchmarks = useMemo(() => {
    if (!selectedCategory) return benchmarks
    return benchmarks.filter(benchmark => benchmark.category === selectedCategory)
  }, [benchmarks, selectedCategory])

  const categories: BenchmarkCategory[] = [
    'throughput',
    'latency',
    'resource-usage',
    'scalability',
    'reliability'
  ]

  const formatMetricValue = (metric: PerformanceMetric): string => {
    const value = metric.value.toLocaleString()
    return `${value} ${metric.unit}`
  }

  const getThresholdStatus = (benchmark: PerformanceBenchmark, metric: PerformanceMetric): 'good' | 'warning' | 'critical' => {
    const threshold = benchmark.thresholds.find(t => t.metric === metric.id)
    if (!threshold) return 'good'

    if (threshold.direction === 'above') {
      if (metric.value >= threshold.critical) return 'critical'
      if (metric.value >= threshold.warning) return 'warning'
    } else {
      if (metric.value <= threshold.critical) return 'critical'
      if (metric.value <= threshold.warning) return 'warning'
    }
    return 'good'
  }

  const getStatusColor = (status: 'good' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const calculatePerformanceScore = (benchmark: PerformanceBenchmark): number => {
    const scores = benchmark.metrics.map(metric => {
      const status = getThresholdStatus(benchmark, metric)
      switch (status) {
        case 'good': return 100
        case 'warning': return 70
        case 'critical': return 30
        default: return 100
      }
    })
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!selectedCategory ? 'primary' : 'secondary'}
          onClick={() => onCategoryChange?.(undefined as any)}
          className="text-sm"
        >
          All Categories
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'primary' : 'secondary'}
            onClick={() => onCategoryChange?.(category)}
            className="text-sm capitalize"
          >
            {category.replace('-', ' ')}
          </Button>
        ))}
      </div>

      {/* Comparison Mode Toggle */}
      {showComparison && (
        <div className="flex items-center gap-2">
          <Button
            variant={comparisonMode ? 'primary' : 'secondary'}
            onClick={() => setComparisonMode(!comparisonMode)}
            className="text-sm"
          >
            {comparisonMode ? 'Exit Comparison' : 'Compare Benchmarks'}
          </Button>
        </div>
      )}

      {/* Benchmarks Grid */}
      <div className={`grid gap-6 ${comparisonMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {filteredBenchmarks.map(benchmark => (
          <Card key={benchmark.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{benchmark.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{benchmark.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {benchmark.category.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    Updated: {benchmark.lastUpdated.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {calculatePerformanceScore(benchmark)}
                </div>
                <div className="text-xs text-gray-500">Performance Score</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-4">
              {benchmark.metrics.map(metric => {
                const status = getThresholdStatus(benchmark, metric)
                return (
                  <div key={metric.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{metric.name}</h4>
                      <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{metric.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatMetricValue(metric)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {metric.context} • {metric.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                    {Object.keys(metric.tags).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(metric.tags).map(([key, value]) => (
                          <span
                            key={key}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Baseline Information */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Baseline</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Value:</span>
                  <span className="ml-2 font-medium">{benchmark.baseline.value.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <span className="ml-2 font-medium">{(benchmark.baseline.confidence * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Sample Size:</span>
                  <span className="ml-2 font-medium">{benchmark.baseline.sampleSize.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Environment:</span>
                  <span className="ml-2 font-medium">{benchmark.baseline.environment}</span>
                </div>
              </div>
            </div>

            {/* Test Configuration */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Test Configuration</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Instance:</span>
                  <span className="ml-2 font-medium">{benchmark.testConfiguration.instanceType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Region:</span>
                  <span className="ml-2 font-medium">{benchmark.testConfiguration.region}</span>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2 font-medium">{benchmark.testConfiguration.duration}s</span>
                </div>
                <div>
                  <span className="text-gray-600">Concurrency:</span>
                  <span className="ml-2 font-medium">{benchmark.testConfiguration.concurrency}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setSelectedBenchmark(
                  selectedBenchmark === benchmark.id ? null : benchmark.id
                )}
                className="text-sm"
              >
                {selectedBenchmark === benchmark.id ? 'Hide Details' : 'View Details'}
              </Button>
              <Button variant="secondary" className="text-sm">
                Export Data
              </Button>
              <Button variant="secondary" className="text-sm">
                Run Test
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredBenchmarks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No benchmarks found</div>
          <div className="text-sm text-gray-400">
            {selectedCategory 
              ? `No benchmarks available for ${selectedCategory.replace('-', ' ')} category`
              : 'No benchmarks available'
            }
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformanceMetricsDisplay