'use client'

import React, { useState } from 'react'
import { AuthenticationGuide } from '../../types/api'
import { authenticationGuides } from '../../data/api-documentation'

interface AuthenticationGuidesProps {
  guides?: AuthenticationGuide[]
  className?: string
}

export function AuthenticationGuides({ 
  guides = authenticationGuides, 
  className = '' 
}: AuthenticationGuidesProps) {
  const [selectedGuide, setSelectedGuide] = useState<string>(guides[0]?.id || '')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['steps']))

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const selectedGuideData = guides.find(guide => guide.id === selectedGuide)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const renderCodeBlock = (code: string, language?: string) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
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

  const renderSteps = (guide: AuthenticationGuide) => (
    <div className="space-y-6">
      {guide.steps.map((step, index) => (
        <div key={step.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step.required 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {index + 1}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-lg font-semibold text-gray-800">{step.title}</h4>
                {step.required && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Required
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 mb-4">{step.description}</p>
              
              {step.code && (
                <div className="mt-4">
                  {renderCodeBlock(step.code, step.language)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderExamples = (guide: AuthenticationGuide) => (
    <div className="space-y-6">
      {guide.examples.map((example) => (
        <div key={example.id} className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">{example.title}</h4>
          <p className="text-gray-700 mb-4">{example.description}</p>
          
          <div className="mb-4">
            {renderCodeBlock(example.code, example.language)}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-blue-800 mb-2">Explanation</h5>
            <p className="text-blue-700 text-sm">{example.explanation}</p>
          </div>
        </div>
      ))}
    </div>
  )

  const renderTroubleshooting = (guide: AuthenticationGuide) => (
    <div className="space-y-4">
      {guide.troubleshooting.map((item) => (
        <div key={item.id} className="border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-red-800 mb-2">
              Issue: {item.issue}
            </h4>
            <p className="text-gray-700">{item.solution}</p>
          </div>
          
          {item.code && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-800 mb-2">Solution Code:</h5>
              {renderCodeBlock(item.code, item.language)}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const getAuthTypeIcon = (type: string) => {
    switch (type) {
      case 'apiKey':
        return '🔑'
      case 'oauth2':
        return '🔐'
      case 'jwt':
        return '🎫'
      case 'iam':
        return '👤'
      default:
        return '🔒'
    }
  }

  const getAuthTypeColor = (type: string) => {
    switch (type) {
      case 'apiKey':
        return 'bg-blue-100 text-blue-800'
      case 'oauth2':
        return 'bg-green-100 text-green-800'
      case 'jwt':
        return 'bg-purple-100 text-purple-800'
      case 'iam':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!selectedGuideData) {
    return (
      <div className={`authentication-guides ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-600">No authentication guides available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`authentication-guides ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication & Authorization</h2>
        <p className="text-gray-700">
          Learn how to authenticate your requests to the CloudWatch APM API
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with guide selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Authentication Methods</h3>
            <div className="space-y-2">
              {guides.map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedGuide === guide.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{getAuthTypeIcon(guide.type)}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getAuthTypeColor(guide.type)}`}>
                      {guide.type.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1">{guide.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{guide.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Guide header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{getAuthTypeIcon(selectedGuideData.type)}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{selectedGuideData.title}</h3>
                  <span className={`text-sm px-3 py-1 rounded ${getAuthTypeColor(selectedGuideData.type)}`}>
                    {selectedGuideData.type.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-gray-700">{selectedGuideData.description}</p>
            </div>

            {/* Navigation tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'steps', label: 'Setup Steps', count: selectedGuideData.steps.length },
                  { id: 'examples', label: 'Code Examples', count: selectedGuideData.examples.length },
                  { id: 'troubleshooting', label: 'Troubleshooting', count: selectedGuideData.troubleshooting.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => toggleSection(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      expandedSections.has(tab.id)
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content sections */}
            <div className="space-y-8">
              {expandedSections.has('steps') && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Setup Steps</h3>
                  {renderSteps(selectedGuideData)}
                </div>
              )}

              {expandedSections.has('examples') && selectedGuideData.examples.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Code Examples</h3>
                  {renderExamples(selectedGuideData)}
                </div>
              )}

              {expandedSections.has('troubleshooting') && selectedGuideData.troubleshooting.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Common Issues</h3>
                  {renderTroubleshooting(selectedGuideData)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthenticationGuides