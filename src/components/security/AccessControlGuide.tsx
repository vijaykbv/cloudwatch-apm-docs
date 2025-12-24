'use client'

import React, { useState } from 'react'
import { 
  SecurityConfiguration, 
  SecurityRequirement, 
  SecurityCodeExample,
  SecurityConfigurationExample 
} from '../../types/security'
import { securityConfigurations } from '../../data/security-data'

interface AccessControlGuideProps {
  onConfigurationSelect?: (config: SecurityConfiguration) => void
}

export const AccessControlGuide: React.FC<AccessControlGuideProps> = ({
  onConfigurationSelect
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'implementation' | 'examples' | 'validation'>('overview')
  const [selectedExample, setSelectedExample] = useState<string>('')
  const [copiedCode, setCopiedCode] = useState<string>('')

  // Filter for access control configurations
  const accessControlConfigs = securityConfigurations.filter(
    config => config.category === 'access-control'
  )

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(''), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const renderCodeExample = (example: SecurityCodeExample) => (
    <div key={example.id} className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-300">
            {example.language.toUpperCase()}
          </span>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-400">{example.title}</span>
        </div>
        <button
          onClick={() => copyToClipboard(example.code, example.id)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
        >
          {copiedCode === example.id ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
        <code>{example.code}</code>
      </pre>
      <div className="px-4 py-3 bg-gray-800 border-t border-gray-700">
        <p className="text-sm text-gray-300 mb-2">{example.explanation}</p>
        {example.securityNotes.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-semibold text-yellow-400 mb-1">Security Notes:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              {example.securityNotes.map((note, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-400 mr-2">⚠️</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )

  const renderConfigurationExample = (example: SecurityConfigurationExample) => (
    <div key={example.id} className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-gray-900">{example.title}</h4>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            example.securityLevel === 'maximum' ? 'bg-red-100 text-red-800' :
            example.securityLevel === 'enhanced' ? 'bg-orange-100 text-orange-800' :
            example.securityLevel === 'standard' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {example.securityLevel.toUpperCase()}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            {example.environment}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4">{example.description}</p>
      
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <h5 className="text-sm font-semibold text-gray-900 mb-2">Configuration:</h5>
        <pre className="text-sm text-gray-700 overflow-x-auto">
          <code>{JSON.stringify(example.configuration, null, 2)}</code>
        </pre>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-3">
        <h5 className="text-sm font-semibold text-blue-900 mb-1">Explanation:</h5>
        <p className="text-sm text-blue-800">{example.explanation}</p>
      </div>
    </div>
  )

  if (accessControlConfigs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔒</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Access Control Configurations Found
        </h3>
        <p className="text-gray-600">
          Access control configurations are not available at this time.
        </p>
      </div>
    )
  }

  const currentConfig = accessControlConfigs[0] // Use first config for demo

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Access Control and Permissions Guide
        </h2>
        <p className="text-gray-600">
          Comprehensive guide for configuring access control and permissions for CloudWatch APM
        </p>
      </div>

      {/* Configuration Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Available Configurations</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessControlConfigs.map((config) => (
            <div
              key={config.id}
              onClick={() => onConfigurationSelect?.(config)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🛡️</span>
                <h4 className="font-semibold text-gray-900">{config.name}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">{config.description}</p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  config.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  config.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  config.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {config.severity.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {config.requirements.length} requirements
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'implementation', label: 'Implementation', icon: '⚙️' },
              { id: 'examples', label: 'Examples', icon: '💻' },
              { id: 'validation', label: 'Validation', icon: '✅' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentConfig.name}
                </h3>
                <p className="text-gray-600 mb-4">{currentConfig.description}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Security Requirements</h4>
                    <div className="space-y-3">
                      {currentConfig.requirements.map((req) => (
                        <div key={req.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {req.mandatory ? '🔴' : '🟡'}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{req.title}</h5>
                            <p className="text-sm text-gray-600">{req.description}</p>
                            <div className="mt-1">
                              <span className="text-xs text-gray-500">
                                {req.controls.length} controls
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Best Practices</h4>
                    <ul className="space-y-2">
                      {currentConfig.implementation.bestPractices.map((practice, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-sm text-gray-700">{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'implementation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Implementation Steps
                </h3>
                <div className="space-y-4">
                  {currentConfig.implementation.steps.map((step, index) => (
                    <div key={step.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {step.order}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{step.title}</h4>
                            {step.required && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{step.description}</p>
                          
                          <div className="bg-white rounded-lg p-3 mb-3">
                            <h5 className="text-sm font-semibold text-gray-900 mb-1">
                              Validation:
                            </h5>
                            <p className="text-sm text-gray-700">{step.validation}</p>
                          </div>

                          {step.troubleshooting.length > 0 && (
                            <div className="bg-yellow-50 rounded-lg p-3">
                              <h5 className="text-sm font-semibold text-yellow-800 mb-1">
                                Troubleshooting:
                              </h5>
                              <ul className="text-sm text-yellow-700 space-y-1">
                                {step.troubleshooting.map((tip, tipIndex) => (
                                  <li key={tipIndex} className="flex items-start">
                                    <span className="text-yellow-600 mr-2">•</span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Mistakes */}
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-3">Common Mistakes to Avoid</h4>
                <ul className="space-y-2">
                  {currentConfig.implementation.commonMistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-600 mt-1">⚠️</span>
                      <span className="text-sm text-red-800">{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {selectedTab === 'examples' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Code Examples
                </h3>
                <div className="space-y-6">
                  {currentConfig.implementation.codeExamples.map(renderCodeExample)}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Configuration Examples
                </h3>
                <div className="space-y-6">
                  {currentConfig.implementation.configurations.map(renderConfigurationExample)}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'validation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Validation and Testing
                </h3>
                
                {/* Automated Tests */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Automated Tests</h4>
                  <div className="space-y-4">
                    {currentConfig.validation.automatedTests.map((test) => (
                      <div key={test.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-gray-900">{test.name}</h5>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              test.automated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {test.automated ? 'Automated' : 'Manual'}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {test.frequency}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{test.description}</p>
                        
                        {test.command && (
                          <div className="bg-gray-900 rounded p-3 mb-3">
                            <code className="text-green-400 text-sm">{test.command}</code>
                          </div>
                        )}
                        
                        <div className="bg-white rounded p-3 mb-3">
                          <h6 className="text-sm font-semibold text-gray-900 mb-1">Expected Result:</h6>
                          <p className="text-sm text-gray-700">{test.expectedResult}</p>
                        </div>

                        {test.troubleshooting.length > 0 && (
                          <div className="bg-yellow-50 rounded p-3">
                            <h6 className="text-sm font-semibold text-yellow-800 mb-1">Troubleshooting:</h6>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              {test.troubleshooting.map((tip, index) => (
                                <li key={index}>• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Tools */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Security Tools</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {currentConfig.validation.tools.map((tool) => (
                      <div key={tool.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xl">🔧</span>
                          <h5 className="font-semibold text-gray-900">{tool.name}</h5>
                        </div>
                        <p className="text-gray-600 mb-3">{tool.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Type:</span>
                            <span className="ml-2 text-gray-600">{tool.type}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Installation:</span>
                            <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                              {tool.installation}
                            </code>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Platforms:</span>
                            <span className="ml-2 text-gray-600">{tool.platforms.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccessControlGuide