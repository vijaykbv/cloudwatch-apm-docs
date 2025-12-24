'use client'

import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { DiagnosticTool, DiagnosticParameter } from '../../types/troubleshooting'
import { diagnosticTools } from '../../data/troubleshooting-data'

interface DiagnosticToolsProps {
  className?: string
}

interface ToolExecution {
  tool: DiagnosticTool
  parameters: Record<string, any>
  isRunning: boolean
  result?: any
  error?: string
}

export default function DiagnosticTools({ className = '' }: DiagnosticToolsProps) {
  const [selectedTool, setSelectedTool] = useState<DiagnosticTool | null>(null)
  const [executions, setExecutions] = useState<ToolExecution[]>([])
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({})

  const categories = Array.from(new Set(diagnosticTools.map(tool => tool.category)))

  const getToolsByCategory = (category: string) => {
    return diagnosticTools.filter(tool => tool.category === category)
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      connectivity: '🌐',
      configuration: '⚙️',
      performance: '⚡',
      logs: '📝',
      metrics: '📊',
      system: '💻'
    }
    return icons[category as keyof typeof icons] || '🔧'
  }

  const handleParameterChange = (paramName: string, value: any) => {
    setParameterValues(prev => ({
      ...prev,
      [paramName]: value
    }))
  }

  const validateParameters = (tool: DiagnosticTool): string[] => {
    const errors: string[] = []
    
    tool.parameters.forEach(param => {
      const value = parameterValues[param.name]
      
      if (param.required && (value === undefined || value === '')) {
        errors.push(`${param.name} is required`)
      }
      
      if (value !== undefined && value !== '') {
        switch (param.type) {
          case 'number':
            if (isNaN(Number(value))) {
              errors.push(`${param.name} must be a number`)
            }
            break
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`${param.name} must be true or false`)
            }
            break
        }
      }
    })
    
    return errors
  }

  const executeTool = async (tool: DiagnosticTool) => {
    const validationErrors = validateParameters(tool)
    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n' + validationErrors.join('\n'))
      return
    }

    const execution: ToolExecution = {
      tool,
      parameters: { ...parameterValues },
      isRunning: true
    }

    setExecutions(prev => [execution, ...prev])

    // Simulate tool execution
    try {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
      
      // Generate mock results based on tool type
      const mockResult = generateMockResult(tool)
      
      setExecutions(prev => prev.map(exec => 
        exec === execution 
          ? { ...exec, isRunning: false, result: mockResult }
          : exec
      ))
    } catch (error) {
      setExecutions(prev => prev.map(exec => 
        exec === execution 
          ? { ...exec, isRunning: false, error: 'Tool execution failed' }
          : exec
      ))
    }
  }

  const generateMockResult = (tool: DiagnosticTool) => {
    switch (tool.id) {
      case 'agent-status-checker':
        return {
          status: Math.random() > 0.3 ? 'running' : 'stopped',
          version: '1.247350.0b251814',
          configFile: '/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json',
          lastStarted: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          memoryUsage: Math.floor(Math.random() * 200) + 50,
          cpuUsage: Math.floor(Math.random() * 20) + 1
        }
      
      case 'connectivity-tester':
        return {
          all_endpoints_reachable: Math.random() > 0.2,
          endpoints: [
            { name: 'CloudWatch Metrics', url: 'monitoring.us-east-1.amazonaws.com', reachable: true, latency: 45 },
            { name: 'CloudWatch Logs', url: 'logs.us-east-1.amazonaws.com', reachable: Math.random() > 0.1, latency: 52 },
            { name: 'CloudWatch Events', url: 'events.us-east-1.amazonaws.com', reachable: true, latency: 38 }
          ]
        }
      
      default:
        return {
          message: 'Tool executed successfully',
          timestamp: new Date().toISOString(),
          data: { status: 'ok' }
        }
    }
  }

  const renderParameterInput = (param: DiagnosticParameter) => {
    const value = parameterValues[param.name] ?? param.defaultValue ?? ''

    switch (param.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {param.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name={param.name}
                value="true"
                checked={value === true}
                onChange={() => handleParameterChange(param.name, true)}
                className="mr-2"
              />
              True
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={param.name}
                value="false"
                checked={value === false}
                onChange={() => handleParameterChange(param.name, false)}
                className="mr-2"
              />
              False
            </label>
          </div>
        )
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
            placeholder={param.defaultValue?.toString() || ''}
          />
        )
      
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            placeholder={param.defaultValue?.toString() || ''}
          />
        )
    }
  }

  const renderResult = (execution: ToolExecution) => {
    if (execution.isRunning) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Running diagnostic...</span>
        </div>
      )
    }

    if (execution.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 text-xl mr-2">❌</span>
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-2">{execution.error}</p>
        </div>
      )
    }

    if (!execution.result) {
      return null
    }

    // Render results based on output format
    switch (execution.tool.outputFormat) {
      case 'json':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Results (JSON)</h4>
            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
              <code>{JSON.stringify(execution.result, null, 2)}</code>
            </pre>
            {renderInterpretation(execution)}
          </div>
        )
      
      case 'table':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Results (Table)</h4>
            {execution.result.endpoints && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Endpoint</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {execution.result.endpoints.map((endpoint: any, index: number) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-2 text-sm text-gray-900">{endpoint.name}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            endpoint.reachable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {endpoint.reachable ? 'Reachable' : 'Unreachable'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{endpoint.latency}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {renderInterpretation(execution)}
          </div>
        )
      
      default:
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Results</h4>
            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
              <code>{JSON.stringify(execution.result, null, 2)}</code>
            </pre>
            {renderInterpretation(execution)}
          </div>
        )
    }
  }

  const renderInterpretation = (execution: ToolExecution) => {
    const interpretations = execution.tool.interpretation.filter(interp => {
      try {
        // Simple condition evaluation (in a real app, use a proper expression evaluator)
        const condition = interp.condition.replace(/===/g, '==')
        return eval(condition.replace(/(\w+)/g, (match) => {
          return `execution.result.${match}`
        }))
      } catch {
        return false
      }
    })

    if (interpretations.length === 0) {
      return null
    }

    return (
      <div className="mt-4 space-y-3">
        <h5 className="font-medium text-gray-900">Interpretation</h5>
        {interpretations.map((interp, index) => (
          <div key={index} className={`p-3 rounded-lg border-l-4 ${
            interp.severity === 'critical' ? 'bg-red-50 border-red-400' :
            interp.severity === 'high' ? 'bg-orange-50 border-orange-400' :
            interp.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
            'bg-green-50 border-green-400'
          }`}>
            <p className="text-sm font-medium text-gray-900 mb-1">{interp.meaning}</p>
            {interp.recommendedActions.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700">Recommended Actions:</span>
                <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                  {interp.recommendedActions.map((action, actionIndex) => (
                    <li key={actionIndex}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`diagnostic-tools ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Diagnostic Tools</h1>
        <p className="text-lg text-gray-600">
          Run automated diagnostic tools to identify and troubleshoot issues with your CloudWatch APM setup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool Selection */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Tools</h2>
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">{getCategoryIcon(category)}</span>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h3>
                  <div className="space-y-2 ml-6">
                    {getToolsByCategory(category).map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedTool(tool)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedTool?.id === tool.id
                            ? 'border-blue-300 bg-blue-50 text-blue-900'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{tool.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{tool.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Tool Configuration and Execution */}
        <div className="lg:col-span-2">
          {selectedTool ? (
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{getCategoryIcon(selectedTool.category)}</span>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTool.name}</h2>
                </div>
                <p className="text-gray-600">{selectedTool.description}</p>
              </div>

              {/* Parameters */}
              {selectedTool.parameters.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Parameters</h3>
                  <div className="space-y-4">
                    {selectedTool.parameters.map(param => (
                      <div key={param.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {param.name}
                          {param.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <p className="text-sm text-gray-600 mb-2">{param.description}</p>
                        {renderParameterInput(param)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Execute Button */}
              <div className="mb-6">
                <Button
                  onClick={() => executeTool(selectedTool)}
                  className="w-full"
                  disabled={executions.some(exec => exec.isRunning)}
                >
                  {executions.some(exec => exec.isRunning) ? 'Running...' : 'Run Diagnostic'}
                </Button>
              </div>

              {/* Command Preview */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Command</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <pre className="text-sm text-gray-800">
                    <code>
                      {selectedTool.command}
                      {Object.entries(parameterValues).map(([key, value]) => 
                        value !== undefined && value !== '' ? ` --${key}="${value}"` : ''
                      ).join('')}
                    </code>
                  </pre>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <span className="text-4xl">🔧</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Diagnostic Tool</h3>
              <p className="text-gray-600">
                Choose a diagnostic tool from the left panel to configure and run it.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Execution History */}
      {executions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Execution History</h2>
          <div className="space-y-4">
            {executions.map((execution, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{execution.tool.name}</h3>
                    <p className="text-sm text-gray-600">
                      Executed with parameters: {JSON.stringify(execution.parameters)}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
                {renderResult(execution)}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}