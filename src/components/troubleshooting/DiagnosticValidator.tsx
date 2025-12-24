'use client'

import React, { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface DiagnosticValidatorProps {
  className?: string
}

interface ValidationRule {
  id: string
  name: string
  description: string
  category: 'configuration' | 'system' | 'network' | 'permissions'
  validator: (input: string) => ValidationResult
}

interface ValidationResult {
  isValid: boolean
  message: string
  severity: 'info' | 'warning' | 'error'
  suggestions?: string[]
}

export default function DiagnosticValidator({ className = '' }: DiagnosticValidatorProps) {
  const [selectedRule, setSelectedRule] = useState<ValidationRule | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [validationHistory, setValidationHistory] = useState<Array<{
    rule: ValidationRule
    input: string
    result: ValidationResult
    timestamp: Date
  }>>([])

  const validationRules: ValidationRule[] = [
    {
      id: 'config-json-syntax',
      name: 'CloudWatch Agent Configuration JSON Syntax',
      description: 'Validate JSON syntax and structure of CloudWatch agent configuration',
      category: 'configuration',
      validator: (input: string): ValidationResult => {
        try {
          const config = JSON.parse(input)
          
          // Check for required sections
          const requiredSections = ['agent', 'metrics', 'logs']
          const missingSections = requiredSections.filter(section => !config[section])
          
          if (missingSections.length > 0) {
            return {
              isValid: false,
              message: `Missing required sections: ${missingSections.join(', ')}`,
              severity: 'error',
              suggestions: [
                'Add the missing configuration sections',
                'Refer to the CloudWatch agent configuration reference',
                'Use the configuration wizard to generate a complete config'
              ]
            }
          }
          
          // Check for common configuration issues
          if (config.agent && !config.agent.region) {
            return {
              isValid: false,
              message: 'Agent region is not specified',
              severity: 'warning',
              suggestions: [
                'Add "region" field to the agent section',
                'Use the same region as your EC2 instance'
              ]
            }
          }
          
          return {
            isValid: true,
            message: 'Configuration JSON is valid and well-structured',
            severity: 'info'
          }
        } catch (error) {
          return {
            isValid: false,
            message: `Invalid JSON syntax: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'error',
            suggestions: [
              'Check for missing commas, brackets, or quotes',
              'Use a JSON validator to identify syntax errors',
              'Ensure proper escaping of special characters'
            ]
          }
        }
      }
    },
    {
      id: 'iam-policy-validation',
      name: 'IAM Policy for CloudWatch Agent',
      description: 'Validate IAM policy JSON for CloudWatch agent permissions',
      category: 'permissions',
      validator: (input: string): ValidationResult => {
        try {
          const policy = JSON.parse(input)
          
          if (!policy.Statement || !Array.isArray(policy.Statement)) {
            return {
              isValid: false,
              message: 'Policy must contain a Statement array',
              severity: 'error',
              suggestions: ['Add a Statement array to the policy document']
            }
          }
          
          // Check for required CloudWatch permissions
          const requiredActions = [
            'cloudwatch:PutMetricData',
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents'
          ]
          
          const allActions = policy.Statement.flatMap((stmt: any) => 
            Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action]
          )
          
          const missingActions = requiredActions.filter(action => 
            !allActions.some((a: string) => a === action || a === '*' || a.endsWith('*'))
          )
          
          if (missingActions.length > 0) {
            return {
              isValid: false,
              message: `Missing required permissions: ${missingActions.join(', ')}`,
              severity: 'error',
              suggestions: [
                'Add the missing CloudWatch permissions',
                'Consider using the CloudWatchAgentServerPolicy managed policy',
                'Ensure the policy allows the required actions'
              ]
            }
          }
          
          return {
            isValid: true,
            message: 'IAM policy contains required CloudWatch permissions',
            severity: 'info'
          }
        } catch (error) {
          return {
            isValid: false,
            message: `Invalid policy JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'error',
            suggestions: [
              'Check JSON syntax',
              'Ensure proper policy document structure',
              'Validate against AWS IAM policy schema'
            ]
          }
        }
      }
    },
    {
      id: 'log-group-name',
      name: 'CloudWatch Log Group Name',
      description: 'Validate CloudWatch log group name format and conventions',
      category: 'configuration',
      validator: (input: string): ValidationResult => {
        const logGroupName = input.trim()
        
        if (!logGroupName) {
          return {
            isValid: false,
            message: 'Log group name cannot be empty',
            severity: 'error',
            suggestions: ['Provide a valid log group name']
          }
        }
        
        // AWS log group name validation rules
        if (logGroupName.length > 512) {
          return {
            isValid: false,
            message: 'Log group name exceeds maximum length of 512 characters',
            severity: 'error',
            suggestions: ['Shorten the log group name']
          }
        }
        
        if (!/^[a-zA-Z0-9_/.-]+$/.test(logGroupName)) {
          return {
            isValid: false,
            message: 'Log group name contains invalid characters',
            severity: 'error',
            suggestions: [
              'Use only letters, numbers, underscores, hyphens, periods, and forward slashes',
              'Remove any special characters or spaces'
            ]
          }
        }
        
        if (logGroupName.startsWith('/aws/')) {
          return {
            isValid: true,
            message: 'Valid AWS service log group name',
            severity: 'info'
          }
        }
        
        if (!logGroupName.startsWith('/')) {
          return {
            isValid: true,
            message: 'Valid custom log group name',
            severity: 'info',
            suggestions: [
              'Consider using a hierarchical naming convention with forward slashes',
              'Example: /application/environment/component'
            ]
          }
        }
        
        return {
          isValid: true,
          message: 'Valid log group name format',
          severity: 'info'
        }
      }
    },
    {
      id: 'metric-namespace',
      name: 'CloudWatch Metric Namespace',
      description: 'Validate custom metric namespace format and best practices',
      category: 'configuration',
      validator: (input: string): ValidationResult => {
        const namespace = input.trim()
        
        if (!namespace) {
          return {
            isValid: false,
            message: 'Metric namespace cannot be empty',
            severity: 'error',
            suggestions: ['Provide a valid metric namespace']
          }
        }
        
        if (namespace.length > 255) {
          return {
            isValid: false,
            message: 'Namespace exceeds maximum length of 255 characters',
            severity: 'error',
            suggestions: ['Shorten the namespace']
          }
        }
        
        if (namespace.startsWith('AWS/')) {
          return {
            isValid: false,
            message: 'Cannot use AWS/ prefix for custom metrics',
            severity: 'error',
            suggestions: [
              'Remove the AWS/ prefix',
              'Use a custom namespace like MyApp/Component'
            ]
          }
        }
        
        if (!/^[a-zA-Z0-9_/.-]+$/.test(namespace)) {
          return {
            isValid: false,
            message: 'Namespace contains invalid characters',
            severity: 'error',
            suggestions: [
              'Use only letters, numbers, underscores, hyphens, periods, and forward slashes',
              'Remove any special characters or spaces'
            ]
          }
        }
        
        // Best practice checks
        if (!namespace.includes('/')) {
          return {
            isValid: true,
            message: 'Valid namespace, but consider using hierarchical naming',
            severity: 'warning',
            suggestions: [
              'Consider using hierarchical naming like Application/Component',
              'This helps organize metrics in the CloudWatch console'
            ]
          }
        }
        
        return {
          isValid: true,
          message: 'Valid metric namespace format',
          severity: 'info'
        }
      }
    },
    {
      id: 'endpoint-url',
      name: 'CloudWatch Endpoint URL',
      description: 'Validate CloudWatch service endpoint URL format',
      category: 'network',
      validator: (input: string): ValidationResult => {
        const url = input.trim()
        
        if (!url) {
          return {
            isValid: false,
            message: 'Endpoint URL cannot be empty',
            severity: 'error',
            suggestions: ['Provide a valid CloudWatch endpoint URL']
          }
        }
        
        try {
          const parsedUrl = new URL(url)
          
          if (parsedUrl.protocol !== 'https:') {
            return {
              isValid: false,
              message: 'CloudWatch endpoints must use HTTPS',
              severity: 'error',
              suggestions: ['Change the protocol to https://']
            }
          }
          
          // Check for valid CloudWatch endpoint patterns
          const validPatterns = [
            /^monitoring\.[a-z0-9-]+\.amazonaws\.com$/,
            /^logs\.[a-z0-9-]+\.amazonaws\.com$/,
            /^events\.[a-z0-9-]+\.amazonaws\.com$/
          ]
          
          const isValidEndpoint = validPatterns.some(pattern => 
            pattern.test(parsedUrl.hostname)
          )
          
          if (!isValidEndpoint) {
            return {
              isValid: false,
              message: 'URL does not match CloudWatch endpoint format',
              severity: 'warning',
              suggestions: [
                'Use format: https://monitoring.region.amazonaws.com',
                'Use format: https://logs.region.amazonaws.com',
                'Ensure the region is correct'
              ]
            }
          }
          
          return {
            isValid: true,
            message: 'Valid CloudWatch endpoint URL',
            severity: 'info'
          }
        } catch (error) {
          return {
            isValid: false,
            message: 'Invalid URL format',
            severity: 'error',
            suggestions: [
              'Ensure the URL is properly formatted',
              'Include the protocol (https://)',
              'Check for typos in the hostname'
            ]
          }
        }
      }
    }
  ]

  const categories = Array.from(new Set(validationRules.map(rule => rule.category)))

  const getCategoryIcon = (category: string) => {
    const icons = {
      configuration: '⚙️',
      system: '💻',
      network: '🌐',
      permissions: '🔐'
    }
    return icons[category as keyof typeof icons] || '🔧'
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      configuration: 'bg-blue-100 text-blue-800',
      system: 'bg-green-100 text-green-800',
      network: 'bg-purple-100 text-purple-800',
      permissions: 'bg-orange-100 text-orange-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return '✅'
      default: return 'ℹ️'
    }
  }

  const handleValidation = () => {
    if (!selectedRule || !inputValue.trim()) return

    const result = selectedRule.validator(inputValue)
    setValidationResult(result)

    // Add to history
    setValidationHistory(prev => [{
      rule: selectedRule,
      input: inputValue,
      result,
      timestamp: new Date()
    }, ...prev.slice(0, 9)]) // Keep last 10 validations
  }

  const clearValidation = () => {
    setValidationResult(null)
    setInputValue('')
  }

  return (
    <div className={`diagnostic-validator ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Diagnostic Validator</h1>
        <p className="text-lg text-gray-600">
          Validate configuration files, policies, and other CloudWatch APM settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Validation Rules */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Validation Rules</h2>
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">{getCategoryIcon(category)}</span>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h3>
                  <div className="space-y-2 ml-6">
                    {validationRules
                      .filter(rule => rule.category === category)
                      .map(rule => (
                        <button
                          key={rule.id}
                          onClick={() => setSelectedRule(rule)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedRule?.id === rule.id
                              ? 'border-blue-300 bg-blue-50 text-blue-900'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-sm">{rule.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{rule.description}</div>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Validation Interface */}
        <div className="lg:col-span-2">
          {selectedRule ? (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">{getCategoryIcon(selectedRule.category)}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedRule.name}</h2>
                    <p className="text-gray-600">{selectedRule.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedRule.category)}`}>
                    {selectedRule.category}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="validation-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Input to Validate
                    </label>
                    <textarea
                      id="validation-input"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={`Enter ${selectedRule.category} data to validate...`}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleValidation}
                      disabled={!inputValue.trim()}
                      className="flex-1"
                    >
                      Validate
                    </Button>
                    <Button
                      onClick={clearValidation}
                      variant="outline"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Validation Result */}
              {validationResult && (
                <Card className={`p-6 border-l-4 ${getSeverityColor(validationResult.severity)}`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getSeverityIcon(validationResult.severity)}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Validation Result
                      </h3>
                      <p className="text-gray-700 mb-4">{validationResult.message}</p>
                      
                      {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {validationResult.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Validation Rule</h3>
              <p className="text-gray-600">
                Choose a validation rule from the left panel to validate your configuration or settings.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Validation History */}
      {validationHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Validation History</h2>
          <div className="space-y-4">
            {validationHistory.map((entry, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{entry.rule.name}</h3>
                    <p className="text-sm text-gray-600">{entry.rule.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(entry.result.severity)}`}>
                      <span className="mr-1">{getSeverityIcon(entry.result.severity)}</span>
                      {entry.result.severity.toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {entry.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-2">{entry.result.message}</div>
                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    View Input
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-50 rounded border text-xs overflow-x-auto">
                    <code>{entry.input}</code>
                  </pre>
                </details>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}