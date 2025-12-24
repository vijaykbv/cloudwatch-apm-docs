'use client'

import React, { useState, useMemo } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { performanceTuningGuides } from '../../data/performance-data'

interface TuningRecommendation {
  parameter: string
  description: string
  defaultValue: string
  recommendedValue: string
  impact: string
}

interface TuningGuide {
  id: string
  title: string
  description: string
  category: string
  recommendations: TuningRecommendation[]
}

interface PerformanceTuningGuidesProps {
  guides?: TuningGuide[]
  onApplyTuning?: (guideId: string, parameters: Record<string, string>) => void
}

export const PerformanceTuningGuides: React.FC<PerformanceTuningGuidesProps> = ({
  guides = performanceTuningGuides,
  onApplyTuning
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null)
  const [tuningParameters, setTuningParameters] = useState<Record<string, Record<string, string>>>({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  const categories = useMemo(() => {
    const cats = Array.from(new Set(guides.map(guide => guide.category)))
    return cats.sort()
  }, [guides])

  const filteredGuides = useMemo(() => {
    if (!selectedCategory) return guides
    return guides.filter(guide => guide.category === selectedCategory)
  }, [guides, selectedCategory])

  const updateParameter = (guideId: string, parameter: string, value: string) => {
    setTuningParameters(prev => ({
      ...prev,
      [guideId]: {
        ...prev[guideId],
        [parameter]: value
      }
    }))
  }

  const getParameterValue = (guideId: string, parameter: string, defaultValue: string): string => {
    return tuningParameters[guideId]?.[parameter] || defaultValue
  }

  const calculatePerformanceImpact = (guide: TuningGuide): number => {
    // Simple calculation based on number of optimized parameters
    const currentParams = tuningParameters[guide.id] || {}
    const optimizedCount = guide.recommendations.filter(rec => 
      currentParams[rec.parameter] === rec.recommendedValue
    ).length
    return Math.round((optimizedCount / guide.recommendations.length) * 100)
  }

  const generateConfigurationFile = (guide: TuningGuide): string => {
    const params = tuningParameters[guide.id] || {}
    
    if (guide.category === 'configuration') {
      // Generate YAML configuration for OpenTelemetry Collector
      return `# ${guide.title} Configuration
# Generated on ${new Date().toISOString()}

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: ${params['batch.timeout'] || '1s'}
    send_batch_size: ${params['batch.send_batch_size'] || '512'}
    send_batch_max_size: ${params['batch.send_batch_max_size'] || '1024'}
  
  memory_limiter:
    limit_mib: ${params['memory_limiter.limit_mib'] || '512'}
    spike_limit_mib: ${params['memory_limiter.spike_limit_mib'] || '128'}

exporters:
  awsxray:
    region: us-east-1
    no_verify_ssl: false
    
  awscloudwatchmetrics:
    region: us-east-1
    namespace: CloudWatchAPM

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [awsxray]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [awscloudwatchmetrics]
      
  extensions: [health_check, pprof, zpages]
  
  telemetry:
    logs:
      level: ${params['telemetry.logs.level'] || 'info'}
    metrics:
      address: 0.0.0.0:8888`
    }
    
    return '# Configuration format not supported for this guide type'
  }

  const commonTuningScenarios = [
    {
      name: 'High Throughput',
      description: 'Optimize for maximum trace ingestion rate',
      parameters: {
        'batch.timeout': '200ms',
        'batch.send_batch_size': '2048',
        'memory_limiter.limit_mib': '1024'
      }
    },
    {
      name: 'Low Latency',
      description: 'Minimize end-to-end trace processing latency',
      parameters: {
        'batch.timeout': '100ms',
        'batch.send_batch_size': '256',
        'memory_limiter.limit_mib': '256'
      }
    },
    {
      name: 'Resource Constrained',
      description: 'Optimize for minimal resource usage',
      parameters: {
        'batch.timeout': '5s',
        'batch.send_batch_size': '1024',
        'memory_limiter.limit_mib': '128'
      }
    }
  ]

  const applyScenario = (guideId: string, scenario: typeof commonTuningScenarios[0]) => {
    setTuningParameters(prev => ({
      ...prev,
      [guideId]: {
        ...prev[guideId],
        ...scenario.parameters
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Tuning Guides</h2>
          <p className="text-gray-600 mt-1">
            Optimize your CloudWatch APM configuration for maximum performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showAdvanced ? 'primary' : 'secondary'}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm"
          >
            {showAdvanced ? 'Hide Advanced' : 'Advanced Mode'}
          </Button>
          <Button variant="primary" className="text-sm">
            Export All Configs
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!selectedCategory ? 'primary' : 'secondary'}
          onClick={() => setSelectedCategory(null)}
          className="text-sm"
        >
          All Categories
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'primary' : 'secondary'}
            onClick={() => setSelectedCategory(category)}
            className="text-sm capitalize"
          >
            {category.replace('-', ' ')}
          </Button>
        ))}
      </div>

      {/* Common Scenarios */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tuning Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {commonTuningScenarios.map(scenario => (
            <div key={scenario.name} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{scenario.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
              <div className="space-y-1 text-xs text-gray-500 mb-3">
                {Object.entries(scenario.parameters).map(([key, value]) => (
                  <div key={key}>{key}: {value}</div>
                ))}
              </div>
              <Button
                variant="secondary"
                onClick={() => filteredGuides.forEach(guide => applyScenario(guide.id, scenario))}
                className="text-sm w-full"
              >
                Apply to All
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Tuning Guides */}
      <div className="space-y-4">
        {filteredGuides.map(guide => (
          <Card key={guide.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{guide.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {guide.category.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{guide.description}</p>
              </div>

              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-blue-600">
                  {calculatePerformanceImpact(guide)}%
                </div>
                <div className="text-xs text-gray-500">Optimized</div>
              </div>
            </div>

            {/* Quick Scenario Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {commonTuningScenarios.map(scenario => (
                <Button
                  key={scenario.name}
                  variant="secondary"
                  onClick={() => applyScenario(guide.id, scenario)}
                  className="text-xs"
                >
                  Apply {scenario.name}
                </Button>
              ))}
            </div>

            {/* Tuning Parameters */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-gray-900">Tuning Parameters</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {guide.recommendations.map(rec => (
                  <div key={rec.parameter} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{rec.parameter}</h5>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">Default:</span>
                        <span className="ml-2 font-medium text-gray-900">{rec.defaultValue}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Recommended:</span>
                        <span className="ml-2 font-medium text-blue-600">{rec.recommendedValue}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Value
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={getParameterValue(guide.id, rec.parameter, rec.defaultValue)}
                          onChange={(e) => updateParameter(guide.id, rec.parameter, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="secondary"
                          onClick={() => updateParameter(guide.id, rec.parameter, rec.recommendedValue)}
                          className="text-xs"
                        >
                          Use Recommended
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                      <strong>Impact:</strong> {rec.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuration Preview */}
            {expandedGuide === guide.id && (
              <div className="border-t pt-6 mt-4">
                <h4 className="font-medium text-gray-900 mb-3">Generated Configuration</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{generateConfigurationFile(guide)}</code>
                  </pre>
                </div>
                
                {showAdvanced && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h5 className="font-medium text-yellow-900 mb-2">Advanced Tuning Tips</h5>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Monitor memory usage when increasing batch sizes</li>
                      <li>• Lower timeouts reduce latency but may increase CPU usage</li>
                      <li>• Test changes in a staging environment first</li>
                      <li>• Use CloudWatch metrics to validate performance improvements</li>
                      <li>• Consider network bandwidth when tuning batch sizes</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => onApplyTuning?.(guide.id, tuningParameters[guide.id] || {})}
                className="text-sm"
              >
                Apply Configuration
              </Button>
              <Button
                variant="secondary"
                onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
                className="text-sm"
              >
                {expandedGuide === guide.id ? 'Hide Config' : 'Show Config'}
              </Button>
              <Button variant="secondary" className="text-sm">
                Download Config
              </Button>
              <Button variant="secondary" className="text-sm">
                Test Configuration
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No tuning guides found</div>
          <div className="text-sm text-gray-400">
            {selectedCategory 
              ? `No guides available for ${selectedCategory} category`
              : 'No tuning guides available'
            }
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformanceTuningGuides