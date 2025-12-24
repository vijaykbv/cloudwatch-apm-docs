import React, { useState, useCallback, useMemo } from 'react'
import { 
  ConfigurationUseCase, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  PerformanceCharacteristics 
} from '../../types/configuration'
import { CONFIGURATION_USE_CASES, PERFORMANCE_TUNING_RECOMMENDATIONS } from '../../data/configuration-use-cases'
import { CLOUDWATCH_APM_SCHEMA } from '../../data/configuration-schema'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface ConfigurationValidationToolsProps {
  onUseCaseSelect?: (useCase: ConfigurationUseCase) => void
  onConfigurationGenerated?: (config: Record<string, unknown>) => void
}

interface PerformanceAnalysis {
  useCase: string
  estimatedOverhead: string
  recommendations: string[]
  warnings: string[]
}

const ConfigurationValidationTools: React.FC<ConfigurationValidationToolsProps> = ({
  onUseCaseSelect,
  onConfigurationGenerated
}) => {
  const [selectedUseCase, setSelectedUseCase] = useState<ConfigurationUseCase | null>(null)
  const [customConfiguration, setCustomConfiguration] = useState<Record<string, unknown>>({})
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState<'use-cases' | 'validation' | 'performance' | 'recommendations'>('use-cases')

  // Filter use cases by environment and platform
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')

  const filteredUseCases = useMemo(() => {
    return CONFIGURATION_USE_CASES.filter(useCase => {
      if (environmentFilter !== 'all' && useCase.environment !== environmentFilter) {
        return false
      }
      if (platformFilter !== 'all' && !useCase.platforms.includes(platformFilter)) {
        return false
      }
      return true
    })
  }, [environmentFilter, platformFilter])

  const handleUseCaseSelect = useCallback((useCase: ConfigurationUseCase) => {
    setSelectedUseCase(useCase)
    setCustomConfiguration(useCase.configuration)
    onUseCaseSelect?.(useCase)
    onConfigurationGenerated?.(useCase.configuration)
    
    // Analyze performance characteristics
    analyzePerformance(useCase)
  }, [onUseCaseSelect, onConfigurationGenerated])

  const analyzePerformance = useCallback((useCase: ConfigurationUseCase) => {
    const analysis: PerformanceAnalysis = {
      useCase: useCase.name,
      estimatedOverhead: useCase.performance.overhead,
      recommendations: useCase.performance.recommendations,
      warnings: []
    }

    // Add warnings based on configuration
    const config = useCase.configuration
    
    if (typeof config.samplingRate === 'number' && config.samplingRate > 0.5) {
      analysis.warnings.push('High sampling rate may impact performance in production')
    }
    
    if (config.captureHttpBody === true) {
      analysis.warnings.push('HTTP body capture can significantly increase memory usage')
    }
    
    if (config.enableLogs === true && config.logLevel === 'DEBUG') {
      analysis.warnings.push('Debug logging can generate large volumes of data')
    }
    
    if (typeof config.batchSize === 'number' && config.batchSize < 50) {
      analysis.warnings.push('Small batch sizes may increase export overhead')
    }

    setPerformanceAnalysis(analysis)
  }, [])

  const validateConfiguration = useCallback(async (config: Record<string, unknown>) => {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Validate against schema parameters
    CLOUDWATCH_APM_SCHEMA.parameters.forEach(param => {
      const value = config[param.name]
      
      // Check required parameters
      if (param.required && (value === undefined || value === '')) {
        errors.push({
          parameter: param.name,
          message: `Required parameter '${param.name}' is missing`,
          severity: 'error',
          fix: `Set a value for ${param.name}`
        })
      }

      // Validate types and constraints
      if (value !== undefined && value !== '') {
        // Type validation
        const actualType = Array.isArray(value) ? 'array' : typeof value
        if (actualType !== param.type && !(param.type === 'number' && actualType === 'string' && !isNaN(Number(value)))) {
          errors.push({
            parameter: param.name,
            message: `Expected type '${param.type}' but got '${actualType}'`,
            severity: 'error',
            fix: `Convert value to ${param.type}`
          })
        }

        // Validation rules
        if (param.validationRules) {
          param.validationRules.forEach(rule => {
            switch (rule.type) {
              case 'min':
                if (param.type === 'number' && typeof value === 'number' && value < (rule.value as number)) {
                  errors.push({
                    parameter: param.name,
                    message: rule.message,
                    severity: 'error',
                    fix: `Set value to at least ${rule.value}`
                  })
                }
                break
              case 'max':
                if (param.type === 'number' && typeof value === 'number' && value > (rule.value as number)) {
                  errors.push({
                    parameter: param.name,
                    message: rule.message,
                    severity: 'error',
                    fix: `Set value to at most ${rule.value}`
                  })
                }
                break
              case 'pattern':
                if (param.type === 'string' && typeof value === 'string' && !new RegExp(rule.value as string).test(value)) {
                  errors.push({
                    parameter: param.name,
                    message: rule.message,
                    severity: 'error',
                    fix: 'Ensure value matches the required pattern'
                  })
                }
                break
            }
          })
        }

        // Valid values check
        if (param.validValues && !param.validValues.includes(value)) {
          errors.push({
            parameter: param.name,
            message: `Value '${value}' is not in the list of valid values`,
            severity: 'error',
            fix: `Use one of: ${param.validValues.map(v => String(v)).join(', ')}`
          })
        }
      }
    })

    // Performance warnings
    if (typeof config.samplingRate === 'number' && config.samplingRate > 0.5) {
      warnings.push({
        parameter: 'samplingRate',
        message: 'High sampling rate detected',
        recommendation: 'Consider reducing sampling rate for production environments'
      })
    }

    if (config.captureHttpBody === true) {
      warnings.push({
        parameter: 'captureHttpBody',
        message: 'HTTP body capture enabled',
        recommendation: 'This may capture sensitive data and increase memory usage'
      })
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions: []
    }

    setValidationResult(result)
    return result
  }, [])

  const generateOptimizedConfiguration = useCallback((baseUseCase: string, optimizationType: 'performance' | 'cost' | 'security') => {
    const baseConfig = CONFIGURATION_USE_CASES.find(uc => uc.id === baseUseCase)?.configuration || {}
    const optimizedConfig = { ...baseConfig }

    switch (optimizationType) {
      case 'performance':
        optimizedConfig.samplingRate = 0.01
        optimizedConfig.batchSize = 500
        optimizedConfig.asyncExport = true
        optimizedConfig.compressionEnabled = true
        optimizedConfig.maxSpanAttributes = 32
        break
      
      case 'cost':
        optimizedConfig.samplingRate = 0.02
        optimizedConfig.enableMetrics = false
        optimizedConfig.enableLogs = false
        optimizedConfig.batchSize = 300
        optimizedConfig.compressionEnabled = true
        break
      
      case 'security':
        optimizedConfig.captureHttpHeaders = false
        optimizedConfig.captureHttpBody = false
        optimizedConfig.captureExceptions = false
        optimizedConfig.dataRedaction = true
        optimizedConfig.encryptionInTransit = true
        break
    }

    setCustomConfiguration(optimizedConfig)
    onConfigurationGenerated?.(optimizedConfig)
    validateConfiguration(optimizedConfig)
  }, [onConfigurationGenerated, validateConfiguration])

  const renderUseCases = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="environment-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Environment
            </label>
            <select
              id="environment-filter"
              value={environmentFilter}
              onChange={(e) => setEnvironmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Environments</option>
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
          <div>
            <label htmlFor="platform-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <select
              id="platform-filter"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Platforms</option>
              <option value="java">Java</option>
              <option value="nodejs">Node.js</option>
              <option value="python">Python</option>
              <option value="spring-boot">Spring Boot</option>
              <option value="kubernetes">Kubernetes</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Use Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUseCases.map(useCase => (
          <Card key={useCase.id}>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {useCase.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {useCase.description}
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <strong>Scenario:</strong> {useCase.scenario}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Environment:</span>
                  <span className="ml-2 capitalize">{useCase.environment}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Overhead:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    useCase.performance.overhead === 'low' ? 'bg-green-100 text-green-800' :
                    useCase.performance.overhead === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {useCase.performance.overhead}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700 text-sm">Platforms:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {useCase.platforms.map(platform => (
                    <span key={platform} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleUseCaseSelect(useCase)}
                  className={selectedUseCase?.id === useCase.id ? 'bg-blue-600' : ''}
                >
                  {selectedUseCase?.id === useCase.id ? 'Selected' : 'Select'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedUseCase(useCase)
                    setActiveTab('performance')
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderValidation = () => (
    <div className="space-y-6">
      <Card title="Configuration Validation">
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={() => customConfiguration && validateConfiguration(customConfiguration)}
              disabled={!customConfiguration || Object.keys(customConfiguration).length === 0}
            >
              Validate Configuration
            </Button>
            <Button
              variant="outline"
              onClick={() => setValidationResult(null)}
            >
              Clear Results
            </Button>
          </div>

          {validationResult && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                validationResult.isValid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  <span className={`mr-2 ${validationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validationResult.isValid ? '✅' : '❌'}
                  </span>
                  <h3 className={`font-medium ${
                    validationResult.isValid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validationResult.isValid ? 'Configuration Valid' : 'Configuration Invalid'}
                  </h3>
                </div>
              </div>

              {validationResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-800 mb-2">Errors</h4>
                  <div className="space-y-2">
                    {validationResult.errors.map((error, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="font-medium text-red-800">{error.parameter}</p>
                        <p className="text-red-700 text-sm">{error.message}</p>
                        {error.fix && (
                          <p className="text-red-600 text-sm mt-1">
                            <strong>Fix:</strong> {error.fix}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {validationResult.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">Warnings</h4>
                  <div className="space-y-2">
                    {validationResult.warnings.map((warning, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="font-medium text-yellow-800">{warning.parameter}</p>
                        <p className="text-yellow-700 text-sm">{warning.message}</p>
                        <p className="text-yellow-600 text-sm mt-1">
                          <strong>Recommendation:</strong> {warning.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )

  const renderPerformance = () => (
    <div className="space-y-6">
      {selectedUseCase && (
        <Card title={`Performance Analysis: ${selectedUseCase.name}`}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Performance Characteristics</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-600">Overhead:</dt>
                    <dd className={`font-medium ${
                      selectedUseCase.performance.overhead === 'low' ? 'text-green-600' :
                      selectedUseCase.performance.overhead === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedUseCase.performance.overhead}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Throughput:</dt>
                    <dd className="font-medium">{selectedUseCase.performance.throughput}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Latency:</dt>
                    <dd className="font-medium">{selectedUseCase.performance.latency}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Memory Usage:</dt>
                    <dd className="font-medium">{selectedUseCase.performance.memoryUsage}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Monitoring Setup</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Key Metrics</h5>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedUseCase.monitoring.keyMetrics.map(metric => (
                        <span key={metric} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Alert Thresholds</h5>
                    <div className="text-xs text-gray-600 space-y-1">
                      {Object.entries(selectedUseCase.monitoring.alertThresholds).map(([metric, threshold]) => (
                        <div key={metric}>
                          <code>{metric}</code>: {String(threshold)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm">
                {selectedUseCase.performance.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {performanceAnalysis?.warnings && performanceAnalysis.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-800 mb-3">Performance Warnings</h4>
                <ul className="space-y-2 text-sm">
                  {performanceAnalysis.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-600 mr-2">⚠️</span>
                      <span className="text-yellow-700">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card title="Configuration Optimization">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Generate optimized configurations based on your priorities:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => generateOptimizedConfiguration('basic-monitoring', 'performance')}
            >
              Optimize for Performance
            </Button>
            <Button
              size="sm"
              onClick={() => generateOptimizedConfiguration('basic-monitoring', 'cost')}
            >
              Optimize for Cost
            </Button>
            <Button
              size="sm"
              onClick={() => generateOptimizedConfiguration('basic-monitoring', 'security')}
            >
              Optimize for Security
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderRecommendations = () => (
    <div className="space-y-6">
      {Object.entries(PERFORMANCE_TUNING_RECOMMENDATIONS).map(([category, data]) => (
        <Card key={category} title={data.title}>
          <div className="space-y-4">
            {data.recommendations.map((rec, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-900">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{rec.parameter}</code>
                </h4>
                <p className="text-gray-700 text-sm mt-1">{rec.recommendation}</p>
                <p className="text-gray-500 text-xs mt-1">{rec.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card>
        <div className="flex space-x-4 border-b">
          {[
            { id: 'use-cases', label: 'Use Cases' },
            { id: 'validation', label: 'Validation' },
            { id: 'performance', label: 'Performance' },
            { id: 'recommendations', label: 'Recommendations' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'use-cases' && renderUseCases()}
      {activeTab === 'validation' && renderValidation()}
      {activeTab === 'performance' && renderPerformance()}
      {activeTab === 'recommendations' && renderRecommendations()}
    </div>
  )
}

export default ConfigurationValidationTools