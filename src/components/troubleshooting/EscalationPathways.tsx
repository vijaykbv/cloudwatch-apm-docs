'use client'

import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { EscalationPath, EscalationStep } from '../../types/troubleshooting'
import { escalationPaths } from '../../data/troubleshooting-data'

interface EscalationPathwaysProps {
  className?: string
}

export default function EscalationPathways({ className = '' }: EscalationPathwaysProps) {
  const [selectedPath, setSelectedPath] = useState<EscalationPath | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const handleStepToggle = (stepId: string) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId)
    } else {
      newCompleted.add(stepId)
    }
    setCompletedSteps(newCompleted)
  }

  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧'
      case 'slack': return '💬'
      case 'ticket': return '🎫'
      case 'phone': return '📞'
      default: return '📞'
    }
  }

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800'
      case 'slack': return 'bg-purple-100 text-purple-800'
      case 'ticket': return 'bg-green-100 text-green-800'
      case 'phone': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (selectedPath) {
    const progress = (completedSteps.size / selectedPath.steps.length) * 100

    return (
      <div className={`escalation-pathways ${className}`}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedPath.name}</h2>
              <p className="text-gray-600 mt-1">{selectedPath.description}</p>
            </div>
            <Button
              onClick={() => setSelectedPath(null)}
              variant="outline"
              size="sm"
            >
              ← Back to Options
            </Button>
          </div>

          {/* Path Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{selectedPath.estimatedResponseTime}</div>
              <div className="text-sm text-gray-600">Response Time</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.round(progress)}%</div>
              <div className="text-sm text-gray-600">Steps Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{completedSteps.size} of {selectedPath.steps.length} steps</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Trigger Conditions */}
          <Card className="p-4 mb-6 border-l-4 border-blue-400">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">When to Use This Path</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {selectedPath.triggerConditions.map((condition, index) => (
                <li key={index}>{condition}</li>
              ))}
            </ul>
          </Card>

          {/* Required Information */}
          <Card className="p-4 mb-6 border-l-4 border-yellow-400">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Information You'll Need</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {selectedPath.requiredInformation.map((info, index) => (
                <li key={index}>{info}</li>
              ))}
            </ul>
          </Card>

          {/* Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Escalation Steps</h3>
            {selectedPath.steps.map((step, index) => (
              <Card key={step.id} className={`p-4 ${completedSteps.has(step.id) ? 'bg-green-50 border-green-200' : ''}`}>
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => handleStepToggle(step.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      completedSteps.has(step.id)
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {completedSteps.has(step.id) && <span className="text-xs">✓</span>}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Step {index + 1}: {step.title}
                      </h4>
                      <button
                        onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {expandedStep === step.id ? 'Collapse' : 'Expand'}
                      </button>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{step.description}</p>
                    
                    {expandedStep === step.id && (
                      <div className="space-y-4">
                        {/* Contact Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-3">Contact Information</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-lg">{getContactTypeIcon(step.contact.type)}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContactTypeColor(step.contact.type)}`}>
                                  {step.contact.type.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 font-medium">{step.contact.value}</p>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Availability:</span>
                                <span className="text-sm text-gray-600 ml-2">{step.contact.availability}</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">Response Time:</span>
                                <span className="text-sm text-gray-600 ml-2">{step.contact.responseTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Required Documentation */}
                        {step.requiredDocumentation.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2">Required Documentation</h5>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                              {step.requiredDocumentation.map((doc, docIndex) => (
                                <li key={docIndex}>{doc}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Escalation Criteria */}
                        {step.escalationCriteria.length > 0 && (
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2">Escalation Criteria</h5>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                              {step.escalationCriteria.map((criteria, criteriaIndex) => (
                                <li key={criteriaIndex}>{criteria}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={`escalation-pathways ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Get Help & Support</h1>
        <p className="text-lg text-gray-600">
          When troubleshooting steps don't resolve your issue, these escalation paths will help you get the support you need.
        </p>
      </div>

      <div className="grid gap-6">
        {escalationPaths.map(path => (
          <Card key={path.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{path.name}</h3>
                <p className="text-gray-600 mb-4">{path.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">When to Use:</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      {path.triggerConditions.slice(0, 3).map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                      {path.triggerConditions.length > 3 && (
                        <li className="text-blue-600">+{path.triggerConditions.length - 3} more...</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">You'll Need:</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      {path.requiredInformation.slice(0, 3).map((info, index) => (
                        <li key={index}>{info}</li>
                      ))}
                      {path.requiredInformation.length > 3 && (
                        <li className="text-blue-600">+{path.requiredInformation.length - 3} more...</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>⏱️ {path.estimatedResponseTime}</span>
                  <span>📋 {path.steps.length} steps</span>
                </div>
              </div>
              <Button
                onClick={() => setSelectedPath(path)}
                className="ml-4"
              >
                Start Process
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Help Section */}
      <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="text-4xl">💡</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Immediate Help?</h3>
            <p className="text-gray-700 mb-4">
              Before escalating, make sure you've tried the troubleshooting steps and diagnostic tools. 
              Having detailed information about your issue will help support teams assist you more effectively.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm">
                View Troubleshooting Guide
              </Button>
              <Button variant="outline" size="sm">
                Run Diagnostics
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}