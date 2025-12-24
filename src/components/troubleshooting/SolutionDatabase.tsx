'use client'

import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { TroubleshootingIssue, Solution, SolutionStep } from '../../types/troubleshooting'

interface SolutionDatabaseProps {
  issue: TroubleshootingIssue
  className?: string
}

export default function SolutionDatabase({ issue, className = '' }: SolutionDatabaseProps) {
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null)
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'hard': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'action': return '👆'
      case 'command': return '💻'
      case 'configuration': return '⚙️'
      case 'verification': return '✅'
      default: return '📝'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (selectedSolution) {
    const progress = (completedSteps.size / selectedSolution.steps.length) * 100

    return (
      <div className={`solution-database ${className}`}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedSolution.title}</h2>
              <p className="text-gray-600 mt-1">{selectedSolution.description}</p>
            </div>
            <Button
              onClick={() => setSelectedSolution(null)}
              variant="outline"
              size="sm"
            >
              ← Back to Solutions
            </Button>
          </div>

          {/* Solution Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{selectedSolution.estimatedTime}</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedSolution.difficulty)}`}>
                {selectedSolution.difficulty.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600 mt-1">Difficulty</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{Math.round(progress)}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{completedSteps.size} of {selectedSolution.steps.length} steps</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Prerequisites */}
          {selectedSolution.prerequisites.length > 0 && (
            <Card className="p-4 mb-6 border-l-4 border-yellow-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Prerequisites</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {selectedSolution.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Steps */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Solution Steps</h3>
            {selectedSolution.steps.map((step, index) => (
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
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getStepTypeIcon(step.type)}</span>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Step {index + 1}: {step.title}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {step.type}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{step.description}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {step.type === 'command' ? 'Command:' : 'Content:'}
                        </span>
                        <button
                          onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {expandedStep === step.id ? 'Collapse' : 'Expand'}
                        </button>
                      </div>
                      <pre className={`text-sm bg-white p-3 rounded border overflow-x-auto ${
                        expandedStep === step.id ? '' : 'max-h-20 overflow-hidden'
                      }`}>
                        <code>{step.content}</code>
                      </pre>
                    </div>
                    
                    {step.expectedResult && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Expected Result:</span>
                        <p className="text-sm text-gray-600 mt-1">{step.expectedResult}</p>
                      </div>
                    )}
                    
                    {step.troubleshootingTips && step.troubleshootingTips.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <span className="text-sm font-medium text-blue-800">💡 Troubleshooting Tips:</span>
                        <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
                          {step.troubleshootingTips.map((tip, tipIndex) => (
                            <li key={tipIndex}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Verification Steps */}
          {selectedSolution.verificationSteps.length > 0 && (
            <Card className="p-4 border-l-4 border-green-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Steps</h3>
              <p className="text-sm text-gray-600 mb-3">
                Complete these steps to verify the solution worked:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {selectedSolution.verificationSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </Card>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className={`solution-database ${className}`}>
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{issue.title}</h2>
              <p className="text-gray-600 mt-1">{issue.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(issue.severity)}`}>
              {issue.severity.toUpperCase()}
            </span>
          </div>

          {/* Issue Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Symptoms</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {issue.symptoms.map((symptom, index) => (
                  <li key={index}>{symptom}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Possible Causes</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {issue.causes.map((cause, index) => (
                  <li key={index}>{cause}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Affected Components */}
          {issue.affectedComponents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Affected Components</h3>
              <div className="flex flex-wrap gap-2">
                {issue.affectedComponents.map((component, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {component}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Solutions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Solutions ({issue.solutions.length})
          </h3>
          <div className="space-y-4">
            {issue.solutions.map((solution, index) => (
              <Card key={solution.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                        Solution {index + 1}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(solution.difficulty)}`}>
                        {solution.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{solution.title}</h4>
                    <p className="text-gray-600 mb-3">{solution.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>⏱️ {solution.estimatedTime} minutes</span>
                      <span>📋 {solution.steps.length} steps</span>
                      {solution.prerequisites.length > 0 && (
                        <span>⚠️ {solution.prerequisites.length} prerequisites</span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedSolution(solution)}
                    className="ml-4"
                  >
                    Start Solution
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Diagnostic Steps */}
        {issue.diagnosticSteps.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnostic Steps</h3>
            <div className="space-y-4">
              {issue.diagnosticSteps.map((step, index) => (
                <Card key={step.id} className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {index + 1}. {step.title}
                  </h4>
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  {step.command && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <span className="text-sm font-medium text-gray-700">Command:</span>
                      <pre className="text-sm bg-white p-2 rounded border mt-1 overflow-x-auto">
                        <code>{step.command}</code>
                      </pre>
                    </div>
                  )}
                  {step.expectedOutput && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Expected Output:</span>
                      <p className="text-sm text-gray-600 mt-1">{step.expectedOutput}</p>
                    </div>
                  )}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <span className="text-sm font-medium text-blue-800">Interpretation:</span>
                    <p className="text-sm text-blue-700 mt-1">{step.interpretation}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Related Issues */}
        {issue.relatedIssues.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Issues</h3>
            <div className="flex flex-wrap gap-2">
              {issue.relatedIssues.map((relatedId, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {relatedId}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}