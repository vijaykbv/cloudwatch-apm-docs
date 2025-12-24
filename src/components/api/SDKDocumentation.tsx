'use client'

import React, { useState } from 'react'
import { SDKDocumentation, RateLimitingInfo } from '../../types/api'
import { sdkDocumentations, rateLimitingInfo } from '../../data/api-documentation'

interface SDKDocumentationProps {
  sdks?: SDKDocumentation[]
  rateLimiting?: RateLimitingInfo
  className?: string
}

export function SDKDocumentationComponent({ 
  sdks = sdkDocumentations, 
  rateLimiting = rateLimitingInfo,
  className = '' 
}: SDKDocumentationProps) {
  const [selectedSDK, setSelectedSDK] = useState<string>(sdks[0]?.id || '')
  const [activeSection, setActiveSection] = useState<string>('installation')

  const selectedSDKData = sdks.find(sdk => sdk.id === selectedSDK)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const renderCodeBlock = (code: string, language?: string, title?: string) => (
    <div className="relative mb-4">
      {title && (
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 text-sm font-medium text-gray-700">
          {title}
        </div>
      )}
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm">
        <code className={language ? `language-${language}` : ''}>{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code)}
        className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
      >
        Copy
      </button>
    </div>
  )

  const renderInstallation = (sdk: SDKDocumentation) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Installation</h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-blue-800 font-medium mb-2">Requirements</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            {sdk.installation.requirements.map((req, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <h4 className="text-gray-800 font-medium mb-2">Install using {sdk.installation.packageManager}</h4>
          {renderCodeBlock(sdk.installation.command, 'bash')}
        </div>

        {sdk.installation.additionalSteps && sdk.installation.additionalSteps.length > 0 && (
          <div>
            <h4 className="text-gray-800 font-medium mb-3">Additional Setup Steps</h4>
            <div className="space-y-4">
              {sdk.installation.additionalSteps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-2">{step.title}</h5>
                  <p className="text-gray-700 mb-3">{step.description}</p>
                  {step.code && renderCodeBlock(step.code, 'bash')}
                  {step.platform && (
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {step.platform}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderQuickStart = (sdk: SDKDocumentation) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{sdk.quickStart.title}</h3>
        <p className="text-gray-700 mb-6">{sdk.quickStart.description}</p>
      </div>

      <div className="space-y-6">
        {sdk.quickStart.steps.map((step, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h4>
                <p className="text-gray-700 mb-4">{step.description}</p>
                
                {renderCodeBlock(step.code, sdk.language.toLowerCase())}
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-green-800 mb-2">Explanation</h5>
                  <p className="text-green-700 text-sm">{step.explanation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Complete Example</h4>
        {renderCodeBlock(sdk.quickStart.completeExample, sdk.language.toLowerCase(), 'Full Working Example')}
      </div>
    </div>
  )

  const renderAPIReference = (sdk: SDKDocumentation) => (
    <div className="space-y-8">
      {/* Classes */}
      {sdk.apiReference.classes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Classes</h3>
          <div className="space-y-6">
            {sdk.apiReference.classes.map((cls, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{cls.name}</h4>
                <p className="text-gray-700 mb-4">{cls.description}</p>

                {/* Constructor */}
                <div className="mb-6">
                  <h5 className="text-lg font-medium text-gray-800 mb-3">Constructor</h5>
                  <p className="text-gray-700 mb-3">{cls.constructor.description}</p>
                  
                  {cls.constructor.parameters.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-sm font-medium text-gray-800 mb-2">Parameters:</h6>
                      <div className="space-y-2">
                        {cls.constructor.parameters.map((param, paramIndex) => (
                          <div key={paramIndex} className="flex items-start gap-3 text-sm">
                            <code className="bg-gray-100 px-2 py-1 rounded">{param.name}</code>
                            <span className="text-blue-600">{param.type}</span>
                            <span className="text-gray-700">{param.description}</span>
                            {param.required && (
                              <span className="text-red-600 text-xs">required</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {renderCodeBlock(cls.constructor.example, sdk.language.toLowerCase(), 'Constructor Example')}
                </div>

                {/* Methods */}
                {cls.methods.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-lg font-medium text-gray-800 mb-3">Methods</h5>
                    <div className="space-y-4">
                      {cls.methods.map((method, methodIndex) => (
                        <div key={methodIndex} className="border border-gray-100 rounded p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <code className="text-lg font-mono">{method.name}</code>
                            {method.deprecated && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                deprecated
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mb-3">{method.description}</p>
                          
                          {method.parameters.length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-sm font-medium text-gray-800 mb-2">Parameters:</h6>
                              <div className="space-y-1">
                                {method.parameters.map((param, paramIndex) => (
                                  <div key={paramIndex} className="flex items-start gap-3 text-sm">
                                    <code className="bg-gray-100 px-2 py-1 rounded">{param.name}</code>
                                    <span className="text-blue-600">{param.type}</span>
                                    <span className="text-gray-700">{param.description}</span>
                                    {param.required && (
                                      <span className="text-red-600 text-xs">required</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="mb-3">
                            <h6 className="text-sm font-medium text-gray-800 mb-1">Returns:</h6>
                            <div className="flex items-start gap-3 text-sm">
                              <span className="text-blue-600">{method.returnType}</span>
                              <span className="text-gray-700">{method.returnDescription}</span>
                            </div>
                          </div>
                          
                          {method.examples.length > 0 && (
                            <div>
                              <h6 className="text-sm font-medium text-gray-800 mb-2">Examples:</h6>
                              {method.examples.map((example, exampleIndex) => (
                                <div key={exampleIndex} className="mb-2">
                                  {renderCodeBlock(example, sdk.language.toLowerCase())}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Properties */}
                {cls.properties.length > 0 && (
                  <div>
                    <h5 className="text-lg font-medium text-gray-800 mb-3">Properties</h5>
                    <div className="space-y-2">
                      {cls.properties.map((prop, propIndex) => (
                        <div key={propIndex} className="flex items-start gap-3 text-sm border border-gray-100 rounded p-3">
                          <code className="bg-gray-100 px-2 py-1 rounded">{prop.name}</code>
                          <span className="text-blue-600">{prop.type}</span>
                          <span className="text-gray-700 flex-1">{prop.description}</span>
                          {prop.readOnly && (
                            <span className="text-gray-500 text-xs">read-only</span>
                          )}
                          {prop.deprecated && (
                            <span className="text-yellow-600 text-xs">deprecated</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Functions */}
      {sdk.apiReference.functions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Functions</h3>
          <div className="space-y-4">
            {sdk.apiReference.functions.map((func, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-lg font-mono">{func.name}</code>
                  {func.deprecated && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      deprecated
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4">{func.description}</p>
                
                {func.parameters.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Parameters:</h5>
                    <div className="space-y-2">
                      {func.parameters.map((param, paramIndex) => (
                        <div key={paramIndex} className="flex items-start gap-3 text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded">{param.name}</code>
                          <span className="text-blue-600">{param.type}</span>
                          <span className="text-gray-700">{param.description}</span>
                          {param.required && (
                            <span className="text-red-600 text-xs">required</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-800 mb-1">Returns:</h5>
                  <div className="flex items-start gap-3 text-sm">
                    <span className="text-blue-600">{func.returnType}</span>
                    <span className="text-gray-700">{func.returnDescription}</span>
                  </div>
                </div>
                
                {func.examples.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Examples:</h5>
                    {func.examples.map((example, exampleIndex) => (
                      <div key={exampleIndex} className="mb-2">
                        {renderCodeBlock(example, sdk.language.toLowerCase())}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Types */}
      {sdk.apiReference.types.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Types</h3>
          <div className="space-y-4">
            {sdk.apiReference.types.map((type, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{type.name}</h4>
                <p className="text-gray-700 mb-4">{type.description}</p>
                
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-800 mb-2">Properties:</h5>
                  <div className="space-y-2">
                    {type.properties.map((prop, propIndex) => (
                      <div key={propIndex} className="flex items-start gap-3 text-sm border border-gray-100 rounded p-3">
                        <code className="bg-gray-100 px-2 py-1 rounded">{prop.name}</code>
                        <span className="text-blue-600">{prop.type}</span>
                        <span className="text-gray-700 flex-1">{prop.description}</span>
                        {prop.readOnly && (
                          <span className="text-gray-500 text-xs">read-only</span>
                        )}
                        {prop.deprecated && (
                          <span className="text-yellow-600 text-xs">deprecated</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {type.examples.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Examples:</h5>
                    {type.examples.map((example, exampleIndex) => (
                      <div key={exampleIndex} className="mb-2">
                        {renderCodeBlock(example, sdk.language.toLowerCase())}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderExamples = (sdk: SDKDocumentation) => (
    <div className="space-y-6">
      {sdk.examples.map((example) => (
        <div key={example.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="text-lg font-semibold text-gray-800">{example.title}</h4>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {example.category}
            </span>
          </div>
          
          <p className="text-gray-700 mb-4">{example.description}</p>
          
          {renderCodeBlock(example.code, sdk.language.toLowerCase())}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h5 className="text-sm font-medium text-blue-800 mb-2">Explanation</h5>
            <p className="text-blue-700 text-sm">{example.explanation}</p>
          </div>
          
          {example.relatedMethods.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-800 mb-2">Related Methods:</h5>
              <div className="flex flex-wrap gap-2">
                {example.relatedMethods.map((method, index) => (
                  <code key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                    {method}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const renderRateLimiting = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Rate Limits</h3>
        <div className="space-y-4">
          {rateLimiting.defaultLimits.map((limit, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{limit.operation}</code>
                <span className="text-lg font-semibold text-blue-600">
                  {limit.limit} / {limit.window}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{limit.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quota Information</h3>
        <div className="space-y-4">
          {rateLimiting.quotaInformation.map((quota, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{quota.resource}</span>
                <span className="text-lg font-semibold text-green-600">
                  {quota.limit} {quota.period}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{quota.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Best Practices</h3>
        <ul className="space-y-2">
          {rateLimiting.bestPractices.map((practice, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-gray-700">{practice}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Error Handling</h3>
        <div className="space-y-4">
          {rateLimiting.errorHandling.map((error, index) => (
            <div key={index} className="border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <code className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                  {error.errorCode}
                </code>
              </div>
              <p className="text-gray-700 mb-3">{error.description}</p>
              <p className="text-gray-700 mb-3 font-medium">Solution: {error.solution}</p>
              {renderCodeBlock(error.example, 'javascript', 'Error Handling Example')}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderChangelog = (sdk: SDKDocumentation) => (
    <div className="space-y-6">
      {sdk.changelog.map((entry, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Version {entry.version}</h4>
            <span className="text-gray-600">{entry.date}</span>
          </div>
          
          <div className="space-y-3">
            {entry.changes.map((change, changeIndex) => (
              <div key={changeIndex} className="flex items-start gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  change.type === 'added' ? 'bg-green-100 text-green-800' :
                  change.type === 'changed' ? 'bg-blue-100 text-blue-800' :
                  change.type === 'deprecated' ? 'bg-yellow-100 text-yellow-800' :
                  change.type === 'removed' ? 'bg-red-100 text-red-800' :
                  change.type === 'fixed' ? 'bg-purple-100 text-purple-800' :
                  change.type === 'security' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {change.type.toUpperCase()}
                </span>
                <span className="text-gray-700 flex-1">{change.description}</span>
                {change.breaking && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    BREAKING
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const getLanguageIcon = (language: string) => {
    switch (language.toLowerCase()) {
      case 'javascript':
        return '🟨'
      case 'python':
        return '🐍'
      case 'java':
        return '☕'
      case 'go':
        return '🐹'
      case 'c#':
        return '🔷'
      default:
        return '📄'
    }
  }

  if (!selectedSDKData) {
    return (
      <div className={`sdk-documentation ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-600">No SDK documentation available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`sdk-documentation ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">SDK Documentation</h2>
        <p className="text-gray-700">
          Language-specific guides and references for CloudWatch APM SDKs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with SDK selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select SDK</h3>
            <div className="space-y-2 mb-6">
              {sdks.map((sdk) => (
                <button
                  key={sdk.id}
                  onClick={() => setSelectedSDK(sdk.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedSDK === sdk.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{getLanguageIcon(sdk.language)}</span>
                    <span className="font-medium text-gray-800">{sdk.language}</span>
                  </div>
                  <div className="text-xs text-gray-600">Version {sdk.version}</div>
                </button>
              ))}
            </div>

            {/* Section navigation */}
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Sections</h4>
            <nav className="space-y-1">
              {[
                { id: 'installation', label: 'Installation' },
                { id: 'quickstart', label: 'Quick Start' },
                { id: 'api-reference', label: 'API Reference' },
                { id: 'examples', label: 'Examples' },
                { id: 'rate-limiting', label: 'Rate Limiting' },
                { id: 'changelog', label: 'Changelog' }
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* SDK header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{getLanguageIcon(selectedSDKData.language)}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{selectedSDKData.title}</h3>
                  <span className="text-sm text-gray-600">Version {selectedSDKData.version}</span>
                </div>
              </div>
              <p className="text-gray-700">{selectedSDKData.description}</p>
            </div>

            {/* Content sections */}
            <div>
              {activeSection === 'installation' && renderInstallation(selectedSDKData)}
              {activeSection === 'quickstart' && renderQuickStart(selectedSDKData)}
              {activeSection === 'api-reference' && renderAPIReference(selectedSDKData)}
              {activeSection === 'examples' && renderExamples(selectedSDKData)}
              {activeSection === 'rate-limiting' && renderRateLimiting()}
              {activeSection === 'changelog' && renderChangelog(selectedSDKData)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SDKDocumentationComponent