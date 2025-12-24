import React, { useState, useCallback, useMemo } from 'react'
import { 
  ConfigurationParameter, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning, 
  ValidationSuggestion 
} from '../../types/configuration'
import { CLOUDWATCH_APM_SCHEMA } from '../../data/configuration-schema'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface ParameterValidatorProps {
  parameters?: ConfigurationParameter[]
  initialConfiguration?: Record<string, unknown>
  onValidationResult?: (result: ValidationResult) => void
}

const ParameterValidator: React.FC<ParameterValidatorProps> = ({
  parameters = CLOUDWATCH_APM_SCHEMA.parameters,
  initialConfiguration = {},
  onValidationResult
}) => {
  const [configuration, setConfiguration] = useState<Record<string, unknown>>(initialConfiguration)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Create parameter lookup map
  const parameterMap = useMemo(() => {
    const map = new Map<string, ConfigurationParameter>()
    parameters.forEach(param => map.set(param.name, param))
    return map
  }, [parameters])

  const validateConfiguration = useCallback(async () => {
    setIsValidating(true)
    
    try {
      const result = await performValidation(configuration, parameters)
      setValidationResult(result)
      onValidationResult?.(result)
    } catch (error) {
      console.error('Validation error:', error)
      setValidationResult({
        isValid: false,
        errors: [{
          parameter: 'system',
          message: 'Validation system error occurred',
          severity: 'error'
        }],
        warnings: [],
        suggestions: []
      })
    } finally {
      setIsValidating(false)
    }
  }, [configuration, parameters, onValidationResult])

  const updateConfigurationValue = useCallback((parameterName: string, value: unknown) => {
    setConfiguration(prev => ({
      ...prev,
      [parameterName]: value
    }))
    
    // Clear validation result when configuration changes
    if (validationResult) {
      setValidationResult(null)
    }
  }, [validationResult])

  const generateExampleConfiguration = useCallback((useCase: 'monitoring' | 'debugging' | 'performance' | 'alerting') => {
    const exampleConfig: Record<string, unknown> = {}
    
    parameters.forEach(param => {
      // Find example for the specific use case, or fall back to first example
      const example = param.examples.find(ex => ex.useCase === useCase) || param.examples[0]
      
      if (example) {
        exampleConfig[param.name] = example.value
      } else if (param.defaultValue !== undefined) {
        exampleConfig[param.name] = param.defaultValue
      } else if (param.required) {
        // Generate a reasonable default for required parameters
        switch (param.type) {
          case 'string':
            exampleConfig[param.name] = param.name === 'serviceName' ? 'my-service' : 'example-value'
            break
          case 'number':
            exampleConfig[param.name] = 0
            break
          case 'boolean':
            exampleConfig[param.name] = true
            break
          case 'array':
            exampleConfig[param.name] = []
            break
          case 'object':
            exampleConfig[param.name] = {}
            break
        }
      }
    })
    
    setConfiguration(exampleConfig)
    setValidationResult(null)
  }, [parameters])

  const clearConfiguration = useCallback(() => {
    setConfiguration({})
    setValidationResult(null)
  }, [])

  const exportConfiguration = useCallback((format: 'json' | 'yaml' | 'properties' | 'env') => {
    let content = ''
    let filename = ''
    let mimeType = 'text/plain'

    switch (format) {
      case 'json':
        content = JSON.stringify(configuration, null, 2)
        filename = 'cloudwatch-apm-config.json'
        mimeType = 'application/json'
        break
      case 'yaml':
        content = generateYamlConfig(configuration)
        filename = 'cloudwatch-apm-config.yml'
        mimeType = 'text/yaml'
        break
      case 'properties':
        content = generatePropertiesConfig(configuration)
        filename = 'application.properties'
        mimeType = 'text/plain'
        break
      case 'env':
        content = generateEnvConfig(configuration)
        filename = '.env'
        mimeType = 'text/plain'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [configuration])

  const renderConfigurationForm = () => (
    <Card title="Configuration Parameters">
      <div className="space-y-6">
        {CLOUDWATCH_APM_SCHEMA.categories.map(category => {
          const categoryParams = parameters.filter(p => p.category.id === category.id)
          if (categoryParams.length === 0) return null

          return (
            <div key={category.id} className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryParams.map(param => (
                  <div key={param.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {param.name}
                      {param.required && <span className="text-red-500 ml-1">*</span>}
                      {param.deprecated && <span className="text-yellow-500 ml-1">⚠️</span>}
                    </label>
                    
                    {renderParameterInput(param)}
                    
                    <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                    
                    {param.defaultValue !== undefined && (
                      <p className="text-xs text-gray-400 mt-1">
                        Default: {String(param.defaultValue)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )

  const renderParameterInput = (param: ConfigurationParameter) => {
    const currentValue = configuration[param.name]

    switch (param.type) {
      case 'boolean':
        return (
          <select
            value={currentValue === undefined ? '' : String(currentValue)}
            onChange={(e) => updateConfigurationValue(param.name, e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Select...</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        )

      case 'number':
        return (
          <input
            type="number"
            value={currentValue === undefined ? '' : String(currentValue)}
            onChange={(e) => updateConfigurationValue(param.name, e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            step={param.validationRules?.find(r => r.type === 'min' && typeof r.value === 'number' && r.value < 1) ? '0.01' : '1'}
          />
        )

      case 'string':
        if (param.validValues) {
          return (
            <select
              value={currentValue === undefined ? '' : String(currentValue)}
              onChange={(e) => updateConfigurationValue(param.name, e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Select...</option>
              {param.validValues.map(value => (
                <option key={String(value)} value={String(value)}>
                  {String(value)}
                </option>
              ))}
            </select>
          )
        } else {
          return (
            <input
              type="text"
              value={currentValue === undefined ? '' : String(currentValue)}
              onChange={(e) => updateConfigurationValue(param.name, e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder={param.examples[0]?.value ? String(param.examples[0].value) : undefined}
            />
          )
        }

      default:
        return (
          <textarea
            value={currentValue === undefined ? '' : JSON.stringify(currentValue, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                updateConfigurationValue(param.name, parsed)
              } catch {
                // Invalid JSON, keep as string for now
                updateConfigurationValue(param.name, e.target.value)
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            rows={3}
          />
        )
    }
  }

  const renderValidationResults = () => {
    if (!validationResult) return null

    return (
      <Card title="Validation Results">
        <div className="space-y-4">
          {/* Overall Status */}
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

          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div>
              <h4 className="font-medium text-red-800 mb-2">Errors</h4>
              <div className="space-y-2">
                {validationResult.errors.map((error, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-start">
                      <span className="text-red-600 mr-2">❌</span>
                      <div className="flex-1">
                        <p className="font-medium text-red-800">{error.parameter}</p>
                        <p className="text-red-700 text-sm">{error.message}</p>
                        {error.fix && (
                          <p className="text-red-600 text-sm mt-1">
                            <strong>Fix:</strong> {error.fix}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Warnings</h4>
              <div className="space-y-2">
                {validationResult.warnings.map((warning, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <div className="flex items-start">
                      <span className="text-yellow-600 mr-2">⚠️</span>
                      <div className="flex-1">
                        <p className="font-medium text-yellow-800">{warning.parameter}</p>
                        <p className="text-yellow-700 text-sm">{warning.message}</p>
                        <p className="text-yellow-600 text-sm mt-1">
                          <strong>Recommendation:</strong> {warning.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {validationResult.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Suggestions</h4>
              <div className="space-y-2">
                {validationResult.suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <span className="text-blue-600 mr-2">💡</span>
                        <div className="flex-1">
                          <p className="font-medium text-blue-800">{suggestion.parameter}</p>
                          <p className="text-blue-700 text-sm">{suggestion.reason}</p>
                          <p className="text-blue-600 text-sm mt-1">
                            Current: <code>{String(suggestion.currentValue)}</code> → 
                            Suggested: <code>{String(suggestion.suggestedValue)}</code>
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateConfigurationValue(suggestion.parameter, suggestion.suggestedValue)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Parameter Validator</h2>
          <div className="flex space-x-2">
            <Button onClick={validateConfiguration} disabled={isValidating}>
              {isValidating ? 'Validating...' : 'Validate'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateExampleConfiguration('monitoring')}
          >
            Load Monitoring Example
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateExampleConfiguration('debugging')}
          >
            Load Debugging Example
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateExampleConfiguration('performance')}
          >
            Load Performance Example
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateExampleConfiguration('alerting')}
          >
            Load Alerting Example
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearConfiguration}
          >
            Clear All
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportConfiguration('json')}
          >
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportConfiguration('yaml')}
          >
            Export YAML
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportConfiguration('properties')}
          >
            Export Properties
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportConfiguration('env')}
          >
            Export .env
          </Button>
        </div>
      </Card>

      {/* Configuration Form */}
      {renderConfigurationForm()}

      {/* Validation Results */}
      {renderValidationResults()}
    </div>
  )
}

// Validation logic
const performValidation = async (
  configuration: Record<string, unknown>,
  parameters: ConfigurationParameter[]
): Promise<ValidationResult> => {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const suggestions: ValidationSuggestion[] = []

  // Create parameter lookup
  const paramMap = new Map<string, ConfigurationParameter>()
  parameters.forEach(param => paramMap.set(param.name, param))

  // Check required parameters
  parameters.forEach(param => {
    if (param.required && (configuration[param.name] === undefined || configuration[param.name] === '')) {
      errors.push({
        parameter: param.name,
        message: `Required parameter '${param.name}' is missing`,
        severity: 'error',
        fix: `Set a value for ${param.name}`
      })
    }
  })

  // Validate each configured parameter
  Object.entries(configuration).forEach(([name, value]) => {
    const param = paramMap.get(name)
    
    if (!param) {
      warnings.push({
        parameter: name,
        message: `Unknown parameter '${name}'`,
        recommendation: 'Remove this parameter or check for typos'
      })
      return
    }

    // Type validation
    if (value !== undefined && value !== '') {
      const actualType = Array.isArray(value) ? 'array' : typeof value
      if (actualType !== param.type && !(param.type === 'number' && actualType === 'string' && !isNaN(Number(value)))) {
        errors.push({
          parameter: name,
          message: `Expected type '${param.type}' but got '${actualType}'`,
          severity: 'error',
          fix: `Convert value to ${param.type}`
        })
      }
    }

    // Validation rules
    if (param.validationRules && value !== undefined && value !== '') {
      param.validationRules.forEach(rule => {
        const validationError = validateRule(name, value, rule)
        if (validationError) {
          errors.push(validationError)
        }
      })
    }

    // Valid values check
    if (param.validValues && value !== undefined && value !== '') {
      if (!param.validValues.includes(value)) {
        errors.push({
          parameter: name,
          message: `Value '${value}' is not in the list of valid values`,
          severity: 'error',
          fix: `Use one of: ${param.validValues.map(v => String(v)).join(', ')}`
        })
      }
    }

    // Deprecation warnings
    if (param.deprecated) {
      warnings.push({
        parameter: name,
        message: `Parameter '${name}' is deprecated`,
        recommendation: param.deprecationMessage || 'Consider using an alternative parameter'
      })
    }

    // Performance suggestions
    if (name === 'samplingRate' && typeof value === 'number' && value > 0.5) {
      suggestions.push({
        parameter: name,
        currentValue: value,
        suggestedValue: 0.1,
        reason: 'High sampling rates can impact performance in production'
      })
    }

    if (name === 'batchSize' && typeof value === 'number' && value < 50) {
      suggestions.push({
        parameter: name,
        currentValue: value,
        suggestedValue: 100,
        reason: 'Larger batch sizes improve export efficiency'
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  }
}

const validateRule = (paramName: string, value: unknown, rule: any): ValidationError | null => {
  switch (rule.type) {
    case 'min':
      if (typeof value === 'string' && value.length < rule.value) {
        return {
          parameter: paramName,
          message: rule.message,
          severity: 'error',
          fix: `Ensure minimum length of ${rule.value} characters`
        }
      }
      if (typeof value === 'number' && value < rule.value) {
        return {
          parameter: paramName,
          message: rule.message,
          severity: 'error',
          fix: `Set value to at least ${rule.value}`
        }
      }
      break

    case 'max':
      if (typeof value === 'string' && value.length > rule.value) {
        return {
          parameter: paramName,
          message: rule.message,
          severity: 'error',
          fix: `Ensure maximum length of ${rule.value} characters`
        }
      }
      if (typeof value === 'number' && value > rule.value) {
        return {
          parameter: paramName,
          message: rule.message,
          severity: 'error',
          fix: `Set value to at most ${rule.value}`
        }
      }
      break

    case 'pattern':
      if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
        return {
          parameter: paramName,
          message: rule.message,
          severity: 'error',
          fix: `Ensure value matches the required pattern`
        }
      }
      break
  }

  return null
}

// Helper functions for export formats
const generateYamlConfig = (config: Record<string, unknown>): string => {
  const lines = ['cloudwatch:', '  apm:']
  
  Object.entries(config).forEach(([key, value]) => {
    const yamlKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    lines.push(`    ${yamlKey}: ${JSON.stringify(value)}`)
  })
  
  return lines.join('\n')
}

const generatePropertiesConfig = (config: Record<string, unknown>): string => {
  return Object.entries(config)
    .map(([key, value]) => {
      const propKey = `cloudwatch.apm.${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      return `${propKey}=${value}`
    })
    .join('\n')
}

const generateEnvConfig = (config: Record<string, unknown>): string => {
  return Object.entries(config)
    .map(([key, value]) => {
      const envKey = `CLOUDWATCH_APM_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`
      return `${envKey}=${value}`
    })
    .join('\n')
}

export default ParameterValidator