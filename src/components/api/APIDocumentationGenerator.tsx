'use client'

import React, { useState, useEffect } from 'react'
import { OpenAPISpec, Operation, Parameter, Schema } from '../../types/api'
import { cloudwatchAPMOpenAPISpec } from '../../data/api-documentation'

interface APIDocumentationGeneratorProps {
  spec?: OpenAPISpec
  className?: string
}

export function APIDocumentationGenerator({ 
  spec = cloudwatchAPMOpenAPISpec, 
  className = '' 
}: APIDocumentationGeneratorProps) {
  const [selectedPath, setSelectedPath] = useState<string>('')
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Auto-select first path and method on load
    const firstPath = Object.keys(spec.paths)[0]
    if (firstPath) {
      setSelectedPath(firstPath)
      const firstMethod = Object.keys(spec.paths[firstPath]).find(key => 
        ['get', 'post', 'put', 'delete', 'patch'].includes(key)
      )
      if (firstMethod) {
        setSelectedMethod(firstMethod)
      }
    }
  }, [spec])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const renderSchema = (schema: Schema, level = 0): React.ReactNode => {
    if (!schema) return null

    const indent = level * 20

    return (
      <div style={{ marginLeft: `${indent}px` }} className="border-l border-gray-200 pl-4 my-2">
        <div className="space-y-2">
          {schema.type && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600">{schema.type}</span>
              {schema.format && (
                <span className="text-xs text-gray-500">({schema.format})</span>
              )}
              {schema.required && (
                <span className="text-xs bg-red-100 text-red-800 px-1 rounded">required</span>
              )}
            </div>
          )}
          
          {schema.description && (
            <p className="text-sm text-gray-700">{schema.description}</p>
          )}

          {schema.enum && (
            <div className="text-sm">
              <span className="font-medium">Enum values: </span>
              <code className="bg-gray-100 px-1 rounded">
                {schema.enum.map(String).join(' | ')}
              </code>
            </div>
          )}

          {schema.properties && (
            <div className="mt-2">
              <h5 className="text-sm font-medium text-gray-800 mb-2">Properties:</h5>
              {Object.entries(schema.properties).map(([propName, propSchema]) => (
                <div key={propName} className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono bg-gray-100 px-1 rounded">
                      {propName}
                    </code>
                    {schema.required?.includes(propName) && (
                      <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                        required
                      </span>
                    )}
                  </div>
                  {renderSchema(propSchema, level + 1)}
                </div>
              ))}
            </div>
          )}

          {schema.items && (
            <div className="mt-2">
              <h5 className="text-sm font-medium text-gray-800 mb-2">Array items:</h5>
              {renderSchema(schema.items, level + 1)}
            </div>
          )}

          {schema.example !== undefined && (
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-800">Example: </span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded block mt-1">
                {JSON.stringify(schema.example, null, 2)}
              </code>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderParameters = (parameters: Parameter[] = []) => {
    if (parameters.length === 0) return null

    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Parameters</h4>
        <div className="space-y-4">
          {parameters.map((param, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <code className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {param.name}
                </code>
                <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {param.in}
                </span>
                {param.required && (
                  <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                    required
                  </span>
                )}
                {param.deprecated && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                    deprecated
                  </span>
                )}
              </div>
              
              {param.description && (
                <p className="text-sm text-gray-700 mb-2">{param.description}</p>
              )}
              
              {param.schema && renderSchema(param.schema)}
              
              {param.example !== undefined && (
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-800">Example: </span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {JSON.stringify(param.example)}
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderOperation = (operation: Operation, method: string, path: string) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-sm font-bold px-3 py-1 rounded uppercase ${
              method === 'get' ? 'bg-blue-100 text-blue-800' :
              method === 'post' ? 'bg-green-100 text-green-800' :
              method === 'put' ? 'bg-yellow-100 text-yellow-800' :
              method === 'delete' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {method}
            </span>
            <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
              {path}
            </code>
          </div>
          
          {operation.summary && (
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {operation.summary}
            </h3>
          )}
          
          {operation.description && (
            <p className="text-gray-700 mb-4">{operation.description}</p>
          )}

          {operation.tags && (
            <div className="flex gap-2 mb-4">
              {operation.tags.map(tag => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {renderParameters(operation.parameters)}

        {operation.requestBody && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Request Body</h4>
            {operation.requestBody.description && (
              <p className="text-sm text-gray-700 mb-3">{operation.requestBody.description}</p>
            )}
            {operation.requestBody.required && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mb-3 inline-block">
                Required
              </span>
            )}
            
            {Object.entries(operation.requestBody.content).map(([mediaType, content]) => (
              <div key={mediaType} className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">{mediaType}</h5>
                {content.schema && renderSchema(content.schema)}
              </div>
            ))}
          </div>
        )}

        {operation.responses && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Responses</h4>
            <div className="space-y-4">
              {Object.entries(operation.responses).map(([statusCode, response]) => (
                <div key={statusCode} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-bold px-2 py-1 rounded ${
                      statusCode.startsWith('2') ? 'bg-green-100 text-green-800' :
                      statusCode.startsWith('4') ? 'bg-red-100 text-red-800' :
                      statusCode.startsWith('5') ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {statusCode}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{response.description}</p>
                  
                  {response.content && Object.entries(response.content).map(([mediaType, content]) => (
                    <div key={mediaType} className="mt-3">
                      <h6 className="text-sm font-medium text-gray-800 mb-2">{mediaType}</h6>
                      {content.schema && renderSchema(content.schema)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {operation.security && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Security</h4>
            <div className="space-y-2">
              {operation.security.map((security, index) => (
                <div key={index} className="text-sm">
                  {Object.entries(security).map(([scheme, scopes]) => (
                    <div key={scheme} className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded">{scheme}</code>
                      {scopes.length > 0 && (
                        <span className="text-gray-600">
                          Scopes: {scopes.join(', ')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const selectedOperation = selectedPath && selectedMethod ? 
    spec.paths[selectedPath]?.[selectedMethod as keyof typeof spec.paths[typeof selectedPath]] as Operation : 
    null

  return (
    <div className={`api-documentation-generator ${className}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{spec.info.title}</h1>
        <p className="text-lg text-gray-700 mb-4">{spec.info.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Version: {spec.info.version}</span>
          {spec.info.contact?.url && (
            <a href={spec.info.contact.url} className="text-blue-600 hover:underline">
              Documentation
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with endpoints */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Endpoints</h3>
            <div className="space-y-2">
              {Object.entries(spec.paths).map(([path, pathItem]) => (
                <div key={path} className="border-b border-gray-100 pb-2">
                  <div className="text-sm font-medium text-gray-700 mb-1">{path}</div>
                  <div className="space-y-1">
                    {Object.entries(pathItem).map(([method, operation]) => {
                      if (!['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method)) {
                        return null
                      }
                      
                      const isSelected = selectedPath === path && selectedMethod === method
                      
                      return (
                        <button
                          key={method}
                          onClick={() => {
                            setSelectedPath(path)
                            setSelectedMethod(method)
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-xs font-medium ${
                            isSelected 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'text-gray-600 hover:bg-gray-50'
                          } ${
                            method === 'get' ? 'border-l-2 border-blue-400' :
                            method === 'post' ? 'border-l-2 border-green-400' :
                            method === 'put' ? 'border-l-2 border-yellow-400' :
                            method === 'delete' ? 'border-l-2 border-red-400' :
                            'border-l-2 border-gray-400'
                          }`}
                        >
                          <span className="uppercase font-bold mr-2">{method}</span>
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

        {/* Main content */}
        <div className="lg:col-span-3">
          {selectedOperation ? (
            renderOperation(selectedOperation, selectedMethod, selectedPath)
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Select an endpoint to view documentation
              </h3>
              <p className="text-gray-600">
                Choose an endpoint from the sidebar to see detailed API documentation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Servers information */}
      {spec.servers && spec.servers.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">API Servers</h3>
          <div className="space-y-3">
            {spec.servers.map((server, index) => (
              <div key={index} className="border border-gray-200 rounded p-3">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{server.url}</code>
                {server.description && (
                  <p className="text-sm text-gray-700 mt-1">{server.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default APIDocumentationGenerator