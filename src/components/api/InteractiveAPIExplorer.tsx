'use client'

import React, { useState, useCallback } from 'react'
import { OpenAPISpec, Operation, Parameter, APIExplorerState, APIResponse } from '../../types/api'
import { cloudwatchAPMOpenAPISpec } from '../../data/api-documentation'

interface InteractiveAPIExplorerProps {
  spec?: OpenAPISpec
  className?: string
}

export function InteractiveAPIExplorer({ 
  spec = cloudwatchAPMOpenAPISpec, 
  className = '' 
}: InteractiveAPIExplorerProps) {
  const [explorerState, setExplorerState] = useState<APIExplorerState>({
    parameters: {},
    loading: false
  })

  const [selectedPath, setSelectedPath] = useState<string>('')
  const [selectedMethod, setSelectedMethod] = useState<string>('')

  const updateParameter = useCallback((paramName: string, value: unknown) => {
    setExplorerState(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [paramName]: value
      }
    }))
  }, [])

  const updateRequestBody = useCallback((body: unknown) => {
    setExplorerState(prev => ({
      ...prev,
      requestBody: body
    }))
  }, [])

  const executeRequest = useCallback(async () => {
    if (!selectedPath || !selectedMethod) return

    setExplorerState(prev => ({ ...prev, loading: true, error: undefined }))

    try {
      // Simulate API call - in real implementation, this would make actual HTTP requests
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock response based on the operation
      const operation = spec.paths[selectedPath]?.[selectedMethod as keyof typeof spec.paths[typeof selectedPath]] as Operation
      const mockResponse: APIResponse = {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': `req-${Date.now()}`
        },
        data: generateMockResponse(operation, selectedMethod, selectedPath),
        timestamp: new Date()
      }

      setExplorerState(prev => ({
        ...prev,
        loading: false,
        response: mockResponse
      }))
    } catch (error) {
      setExplorerState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }))
    }
  }, [selectedPath, selectedMethod, spec.paths])

  const generateMockResponse = (operation: Operation, method: string, path: string) => {
    // Generate mock response based on the operation definition
    if (path === '/applications' && method === 'get') {
      return {
        Applications: [
          {
            ApplicationName: 'sample-web-app',
            ApplicationArn: 'arn:aws:application-insights:us-east-1:123456789012:application/sample-web-app',
            CreationTime: '2023-11-27T10:00:00Z',
            LastUpdateTime: '2023-11-27T10:00:00Z'
          },
          {
            ApplicationName: 'api-service',
            ApplicationArn: 'arn:aws:application-insights:us-east-1:123456789012:application/api-service',
            CreationTime: '2023-11-26T15:30:00Z',
            LastUpdateTime: '2023-11-27T09:15:00Z'
          }
        ],
        NextToken: null
      }
    } else if (path === '/applications' && method === 'post') {
      return {
        ApplicationArn: 'arn:aws:application-insights:us-east-1:123456789012:application/new-app',
        ApplicationName: (explorerState.requestBody as any)?.ApplicationName || 'new-app'
      }
    } else if (path.includes('/traces') && method === 'get') {
      return {
        Traces: [
          {
            TraceId: '1-5e1b4151-1234567890123456',
            Duration: 245.5,
            Segments: [
              {
                Id: 'segment-1',
                Name: 'api-gateway',
                StartTime: 1578012345.123,
                EndTime: 1578012345.368
              },
              {
                Id: 'segment-2',
                Name: 'lambda-function',
                StartTime: 1578012345.130,
                EndTime: 1578012345.360
              }
            ]
          }
        ]
      }
    }
    
    return { message: 'Mock response generated successfully' }
  }

  const renderParameterInput = (param: Parameter) => {
    const value = explorerState.parameters[param.name] || ''
    
    return (
      <div key={param.name} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {param.name}
          {param.required && <span className="text-red-500 ml-1">*</span>}
          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {param.in}
          </span>
        </label>
        
        {param.description && (
          <p className="text-sm text-gray-600 mb-2">{param.description}</p>
        )}
        
        {param.schema?.enum ? (
          <select
            value={String(value)}
            onChange={(e) => updateParameter(param.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select value...</option>
            {param.schema.enum.map((enumValue, index) => (
              <option key={index} value={String(enumValue)}>
                {String(enumValue)}
              </option>
            ))}
          </select>
        ) : param.schema?.type === 'boolean' ? (
          <select
            value={String(value)}
            onChange={(e) => updateParameter(param.name, e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select value...</option>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : param.schema?.type === 'integer' || param.schema?.type === 'number' ? (
          <input
            type="number"
            value={String(value)}
            onChange={(e) => updateParameter(param.name, Number(e.target.value))}
            placeholder={param.example ? String(param.example) : `Enter ${param.name}`}
            min={param.schema.minimum}
            max={param.schema.maximum}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <input
            type="text"
            value={String(value)}
            onChange={(e) => updateParameter(param.name, e.target.value)}
            placeholder={param.example ? String(param.example) : `Enter ${param.name}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        
        {param.example !== undefined && (
          <p className="text-xs text-gray-500 mt-1">
            Example: {JSON.stringify(param.example)}
          </p>
        )}
      </div>
    )
  }

  const renderRequestBodyEditor = (operation: Operation) => {
    if (!operation.requestBody) return null

    const contentTypes = Object.keys(operation.requestBody.content)
    const firstContentType = contentTypes[0]
    const content = operation.requestBody.content[firstContentType]

    // Generate example based on schema
    const generateExample = () => {
      if (content.example) return content.example
      if (content.schema?.example) return content.schema.example
      
      // Simple example generation for common patterns
      if (selectedPath === '/applications' && selectedMethod === 'post') {
        return {
          ApplicationName: 'my-new-application',
          Tags: [
            { Key: 'Environment', Value: 'production' },
            { Key: 'Team', Value: 'backend' }
          ]
        }
      }
      
      return {}
    }

    const exampleJson = JSON.stringify(generateExample(), null, 2)

    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Request Body</h4>
        {operation.requestBody.description && (
          <p className="text-sm text-gray-600 mb-3">{operation.requestBody.description}</p>
        )}
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type: {firstContentType}
          </label>
        </div>
        
        <textarea
          value={JSON.stringify(explorerState.requestBody || generateExample(), null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value)
              updateRequestBody(parsed)
            } catch {
              // Invalid JSON, keep the text for editing
              updateRequestBody(e.target.value)
            }
          }}
          placeholder={exampleJson}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        
        <button
          onClick={() => updateRequestBody(generateExample())}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Use example
        </button>
      </div>
    )
  }

  const renderResponse = () => {
    if (!explorerState.response) return null

    const { response } = explorerState

    return (
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Response</h4>
        
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              response.status >= 200 && response.status < 300 
                ? 'bg-green-100 text-green-800'
                : response.status >= 400
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {response.status} {response.statusText}
            </span>
            <span className="text-sm text-gray-500">
              {response.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Headers</h5>
          <div className="bg-gray-50 rounded p-3 text-sm font-mono">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="mb-1">
                <span className="text-blue-600">{key}:</span> {value}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Response Body</h5>
          <pre className="bg-gray-50 rounded p-3 text-sm font-mono overflow-x-auto">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  const selectedOperation = selectedPath && selectedMethod ? 
    spec.paths[selectedPath]?.[selectedMethod as keyof typeof spec.paths[typeof selectedPath]] as Operation : 
    null

  return (
    <div className={`interactive-api-explorer ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">API Explorer</h2>
        <p className="text-gray-700">
          Try out the CloudWatch APM API endpoints with interactive examples
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoint selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Endpoint</h3>
            
            <div className="space-y-3">
              {Object.entries(spec.paths).map(([path, pathItem]) => (
                <div key={path} className="border border-gray-200 rounded p-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">{path}</div>
                  <div className="space-y-1">
                    {Object.entries(pathItem).map(([method, operation]) => {
                      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
                        return null
                      }
                      
                      const isSelected = selectedPath === path && selectedMethod === method
                      
                      return (
                        <button
                          key={method}
                          onClick={() => {
                            setSelectedPath(path)
                            setSelectedMethod(method)
                            setExplorerState({
                              parameters: {},
                              loading: false
                            })
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm ${
                            isSelected 
                              ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                              : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <span className={`uppercase font-bold mr-2 ${
                            method === 'get' ? 'text-blue-600' :
                            method === 'post' ? 'text-green-600' :
                            method === 'put' ? 'text-yellow-600' :
                            method === 'delete' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {method}
                          </span>
                          {(operation as Operation).summary || 'No summary'}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Request configuration */}
        <div className="lg:col-span-2">
          {selectedOperation ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-sm font-bold px-3 py-1 rounded uppercase ${
                    selectedMethod === 'get' ? 'bg-blue-100 text-blue-800' :
                    selectedMethod === 'post' ? 'bg-green-100 text-green-800' :
                    selectedMethod === 'put' ? 'bg-yellow-100 text-yellow-800' :
                    selectedMethod === 'delete' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedMethod}
                  </span>
                  <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                    {selectedPath}
                  </code>
                </div>
                
                {selectedOperation.summary && (
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {selectedOperation.summary}
                  </h3>
                )}
                
                {selectedOperation.description && (
                  <p className="text-gray-700">{selectedOperation.description}</p>
                )}
              </div>

              {/* Parameters */}
              {selectedOperation.parameters && selectedOperation.parameters.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Parameters</h4>
                  {selectedOperation.parameters.map(renderParameterInput)}
                </div>
              )}

              {/* Request Body */}
              {renderRequestBodyEditor(selectedOperation)}

              {/* Try it button */}
              <div className="mb-6">
                <button
                  onClick={executeRequest}
                  disabled={explorerState.loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {explorerState.loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Executing...
                    </>
                  ) : (
                    'Try it out'
                  )}
                </button>
              </div>

              {/* Error display */}
              {explorerState.error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-red-800 font-medium mb-2">Error</h4>
                  <p className="text-red-700">{explorerState.error}</p>
                </div>
              )}

              {/* Response */}
              {renderResponse()}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Select an endpoint to try it out
              </h3>
              <p className="text-gray-600">
                Choose an endpoint from the sidebar to start exploring the API
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InteractiveAPIExplorer