import React, { useState, useCallback } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'

interface ConfigurationValidatorProps {
  onValidationComplete?: (results: ValidationResults) => void
}

interface ValidationResults {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
}

interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

interface ValidationWarning {
  field: string
  message: string
  recommendation: string
}

interface ValidationSuggestion {
  category: string
  message: string
  action: string
}

const ConfigurationValidator: React.FC<ConfigurationValidatorProps> = ({
  onValidationComplete
}) => {
  const [configInput, setConfigInput] = useState('')
  const [configFormat, setConfigFormat] = useState<'properties' | 'yaml' | 'json' | 'env'>('properties')
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateConfiguration = useCallback(async () => {
    if (!configInput.trim()) {
      return
    }

    setIsValidating(true)
    
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      const results = performValidation(configInput, configFormat)
      setValidationResults(results)
      onValidationComplete?.(results)
    } catch (error) {
      setValidationResults({
        isValid: false,
        errors: [{
          field: 'format',
          message: 'Invalid configuration format',
          severity: 'error'
        }],
        warnings: [],
        suggestions: []
      })
    }

    setIsValidating(false)
  }, [configInput, configFormat, onValidationComplete])

  const performValidation = (config: string, format: string): ValidationResults => {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []

    // Parse configuration based on format
    let parsedConfig: Record<string, unknown> = {}
    
    try {
      switch (format) {
        case 'json':
          parsedConfig = JSON.parse(config)
          break
        case 'yaml':
          parsedConfig = parseYamlConfig(config)
          break
        case 'properties':
          parsedConfig = parsePropertiesConfig(config)
          break
        case 'env':
          parsedConfig = parseEnvConfig(config)
          break
      }
    } catch (error) {
      errors.push({
        field: 'format',
        message: `Invalid ${format.toUpperCase()} format`,
        severity: 'error'
      })
      return { isValid: false, errors, warnings, suggestions }
    }

    // Validate required fields
    const requiredFields = ['serviceName', 'serviceVersion', 'environment', 'region']
    requiredFields.forEach(field => {
      if (!parsedConfig[field]) {
        errors.push({
          field,
          message: `${field} is required`,
          severity: 'error'
        })
      }
    })

    // Validate service name format
    if (parsedConfig.serviceName && typeof parsedConfig.serviceName === 'string') {
      if (!/^[a-z0-9-]+$/.test(parsedConfig.serviceName)) {
        errors.push({
          field: 'serviceName',
          message: 'Service name must contain only lowercase letters, numbers, and hyphens',
          severity: 'error'
        })
      }
    }

    // Validate sampling rate
    if (parsedConfig.samplingRate !== undefined) {
      const rate = Number(parsedConfig.samplingRate)
      if (isNaN(rate) || rate < 0 || rate > 1) {
        errors.push({
          field: 'samplingRate',
          message: 'Sampling rate must be a number between 0 and 1',
          severity: 'error'
        })
      } else if (rate > 0.5) {
        warnings.push({
          field: 'samplingRate',
          message: 'High sampling rate may impact performance',
          recommendation: 'Consider reducing sampling rate for production environments'
        })
      }
    }

    // Validate region
    const validRegions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']
    if (parsedConfig.region && !validRegions.includes(parsedConfig.region as string)) {
      warnings.push({
        field: 'region',
        message: 'Uncommon AWS region specified',
        recommendation: 'Verify that CloudWatch APM is available in this region'
      })
    }

    // Performance suggestions
    if (parsedConfig.batchSize && Number(parsedConfig.batchSize) < 10) {
      suggestions.push({
        category: 'Performance',
        message: 'Small batch size may increase network overhead',
        action: 'Consider increasing batch size to 100 or higher for better performance'
      })
    }

    if (parsedConfig.exportTimeout && Number(parsedConfig.exportTimeout) > 60000) {
      suggestions.push({
        category: 'Performance',
        message: 'Long export timeout may delay application shutdown',
        action: 'Consider reducing export timeout to 30 seconds or less'
      })
    }

    // Security suggestions
    if (parsedConfig.environment === 'production' && parsedConfig.logLevel === 'DEBUG') {
      suggestions.push({
        category: 'Security',
        message: 'Debug logging enabled in production',
        action: 'Set log level to INFO or WARN for production environments'
      })
    }

    // Feature recommendations
    if (!parsedConfig.enableMetrics) {
      suggestions.push({
        category: 'Monitoring',
        message: 'Metrics collection is disabled',
        action: 'Enable metrics for better observability and alerting capabilities'
      })
    }

    if (parsedConfig.environment === 'production' && parsedConfig.samplingRate === 1.0) {
      suggestions.push({
        category: 'Cost Optimization',
        message: '100% sampling in production may be expensive',
        action: 'Consider reducing sampling rate to 0.1 (10%) for cost optimization'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }

  const parsePropertiesConfig = (config: string): Record<string, unknown> => {
    const result: Record<string, unknown> = {}
    const lines = config.split('\n')
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim()
          const normalizedKey = key.replace(/^cloudwatch\.apm\./, '').replace(/[-.](.)/g, (_, char) => char.toUpperCase())
          result[normalizedKey] = parseValue(value)
        }
      }
    })
    
    return result
  }

  const parseYamlConfig = (config: string): Record<string, unknown> => {
    // Simple YAML parser for CloudWatch APM config
    const result: Record<string, unknown> = {}
    const lines = config.split('\n')
    
    let currentPath: string[] = []
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const indent = line.length - line.trimStart().length
        const [key, ...valueParts] = trimmed.split(':')
        
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim()
          if (value) {
            const normalizedKey = key.replace(/[-](.)/g, (_, char) => char.toUpperCase())
            result[normalizedKey] = parseValue(value)
          }
        }
      }
    })
    
    return result
  }

  const parseEnvConfig = (config: string): Record<string, unknown> => {
    const result: Record<string, unknown> = {}
    const lines = config.split('\n')
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim()
          const normalizedKey = key.replace(/^CLOUDWATCH_APM_/, '').toLowerCase().replace(/_(.)/g, (_, char) => char.toUpperCase())
          result[normalizedKey] = parseValue(value)
        }
      }
    })
    
    return result
  }

  const parseValue = (value: string): unknown => {
    // Remove quotes
    const cleaned = value.replace(/^["']|["']$/g, '')
    
    // Try to parse as boolean
    if (cleaned.toLowerCase() === 'true') return true
    if (cleaned.toLowerCase() === 'false') return false
    
    // Try to parse as number
    const num = Number(cleaned)
    if (!isNaN(num)) return num
    
    // Return as string
    return cleaned
  }

  const getExampleConfig = (format: string): string => {
    const examples = {
      properties: `# CloudWatch APM Configuration
cloudwatch.apm.service-name=my-app
cloudwatch.apm.service-version=1.0.0
cloudwatch.apm.environment=production
cloudwatch.apm.region=us-east-1
cloudwatch.apm.sampling-rate=0.1
cloudwatch.apm.tracing.enabled=true
cloudwatch.apm.metrics.enabled=true
cloudwatch.apm.logs.enabled=false`,
      
      yaml: `cloudwatch:
  apm:
    service-name: my-app
    service-version: 1.0.0
    environment: production
    region: us-east-1
    sampling-rate: 0.1
    tracing:
      enabled: true
    metrics:
      enabled: true
    logs:
      enabled: false`,
      
      json: `{
  "serviceName": "my-app",
  "serviceVersion": "1.0.0",
  "environment": "production",
  "region": "us-east-1",
  "samplingRate": 0.1,
  "enableTracing": true,
  "enableMetrics": true,
  "enableLogs": false
}`,
      
      env: `CLOUDWATCH_APM_SERVICE_NAME=my-app
CLOUDWATCH_APM_SERVICE_VERSION=1.0.0
CLOUDWATCH_APM_ENVIRONMENT=production
CLOUDWATCH_APM_REGION=us-east-1
CLOUDWATCH_APM_SAMPLING_RATE=0.1
CLOUDWATCH_APM_TRACING_ENABLED=true
CLOUDWATCH_APM_METRICS_ENABLED=true
CLOUDWATCH_APM_LOGS_ENABLED=false`
    }
    
    return examples[format as keyof typeof examples] || ''
  }

  return (
    <div className="space-y-6">
      <Card title="Configuration Validator">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Configuration Format
            </label>
            <select
              value={configFormat}
              onChange={(e) => setConfigFormat(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="properties">Java Properties</option>
              <option value="yaml">YAML</option>
              <option value="json">JSON</option>
              <option value="env">Environment Variables</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Configuration Content
              </label>
              <button
                onClick={() => setConfigInput(getExampleConfig(configFormat))}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Load Example
              </button>
            </div>
            <textarea
              value={configInput}
              onChange={(e) => setConfigInput(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
              placeholder={`Paste your ${configFormat.toUpperCase()} configuration here...`}
            />
          </div>

          <Button
            onClick={validateConfiguration}
            disabled={!configInput.trim() || isValidating}
            size="lg"
          >
            {isValidating ? 'Validating...' : 'Validate Configuration'}
          </Button>
        </div>
      </Card>

      {/* Validation Results */}
      {validationResults && (
        <Card title="Validation Results">
          <div className="space-y-6">
            {/* Overall Status */}
            <div className={`p-4 rounded-lg ${
              validationResults.isValid
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  validationResults.isValid ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <h4 className={`font-medium ${
                  validationResults.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validationResults.isValid ? 'Configuration Valid' : 'Configuration Invalid'}
                </h4>
              </div>
              <p className={`text-sm mt-1 ${
                validationResults.isValid ? 'text-green-700' : 'text-red-700'
              }`}>
                {validationResults.isValid
                  ? 'Your configuration passes all validation checks'
                  : `Found ${validationResults.errors.length} error(s) that need to be fixed`
                }
              </p>
            </div>

            {/* Errors */}
            {validationResults.errors.length > 0 && (
              <div>
                <h5 className="font-medium text-red-800 mb-3">Errors</h5>
                <div className="space-y-2">
                  {validationResults.errors.map((error, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded">
                      <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium text-red-800">{error.field}</p>
                        <p className="text-red-700 text-sm">{error.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {validationResults.warnings.length > 0 && (
              <div>
                <h5 className="font-medium text-yellow-800 mb-3">Warnings</h5>
                <div className="space-y-2">
                  {validationResults.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium text-yellow-800">{warning.field}</p>
                        <p className="text-yellow-700 text-sm">{warning.message}</p>
                        <p className="text-yellow-600 text-sm mt-1">
                          <strong>Recommendation:</strong> {warning.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {validationResults.suggestions.length > 0 && (
              <div>
                <h5 className="font-medium text-blue-800 mb-3">Suggestions</h5>
                <div className="space-y-2">
                  {validationResults.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium text-blue-800">{suggestion.category}</p>
                        <p className="text-blue-700 text-sm">{suggestion.message}</p>
                        <p className="text-blue-600 text-sm mt-1">
                          <strong>Action:</strong> {suggestion.action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

export default ConfigurationValidator