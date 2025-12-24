'use client'

import React, { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { TroubleshootingIssue, IssueCategory } from '../../types/troubleshooting'
import { troubleshootingIssues } from '../../data/troubleshooting-data'

interface IssueClassifierProps {
  onIssueIdentified: (issue: TroubleshootingIssue) => void
  className?: string
}

interface ClassificationQuestion {
  id: string
  question: string
  answers: ClassificationAnswer[]
}

interface ClassificationAnswer {
  id: string
  text: string
  weight: Record<string, number> // issue ID -> weight
  nextQuestion?: string
}

export default function IssueClassifier({ onIssueIdentified, className = '' }: IssueClassifierProps) {
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('start')
  const [answers, setAnswers] = useState<string[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [suggestedIssues, setSuggestedIssues] = useState<TroubleshootingIssue[]>([])

  const questions: ClassificationQuestion[] = [
    {
      id: 'start',
      question: 'What type of problem are you experiencing?',
      answers: [
        {
          id: 'not-starting',
          text: 'CloudWatch agent won\'t start or keeps stopping',
          weight: { 'agent-not-starting': 10 },
          nextQuestion: 'agent-symptoms'
        },
        {
          id: 'no-data',
          text: 'Not seeing metrics or logs in CloudWatch console',
          weight: { 'metrics-not-appearing': 10 },
          nextQuestion: 'data-symptoms'
        },
        {
          id: 'performance',
          text: 'Performance issues or high resource usage',
          weight: {},
          nextQuestion: 'performance-symptoms'
        },
        {
          id: 'configuration',
          text: 'Configuration or setup problems',
          weight: {},
          nextQuestion: 'config-symptoms'
        },
        {
          id: 'other',
          text: 'Something else or not sure',
          weight: {},
          nextQuestion: 'general-symptoms'
        }
      ]
    },
    {
      id: 'agent-symptoms',
      question: 'Which of these symptoms do you see?',
      answers: [
        {
          id: 'service-failed',
          text: 'Service fails to start or shows as inactive',
          weight: { 'agent-not-starting': 8 }
        },
        {
          id: 'process-missing',
          text: 'No CloudWatch agent process running',
          weight: { 'agent-not-starting': 7 }
        },
        {
          id: 'startup-errors',
          text: 'Error messages in agent logs during startup',
          weight: { 'agent-not-starting': 9 }
        },
        {
          id: 'intermittent-stops',
          text: 'Agent starts but stops after a while',
          weight: { 'agent-not-starting': 6 }
        }
      ]
    },
    {
      id: 'data-symptoms',
      question: 'What specifically is missing?',
      answers: [
        {
          id: 'no-custom-metrics',
          text: 'Custom metrics not appearing',
          weight: { 'metrics-not-appearing': 8 }
        },
        {
          id: 'no-logs',
          text: 'Log groups or log streams not created',
          weight: { 'metrics-not-appearing': 7 }
        },
        {
          id: 'delayed-data',
          text: 'Data appears but with significant delay',
          weight: { 'metrics-not-appearing': 6 }
        },
        {
          id: 'partial-data',
          text: 'Some metrics work, others don\'t',
          weight: { 'metrics-not-appearing': 5 }
        }
      ]
    },
    {
      id: 'performance-symptoms',
      question: 'What performance issues are you seeing?',
      answers: [
        {
          id: 'high-cpu',
          text: 'High CPU usage by CloudWatch agent',
          weight: {}
        },
        {
          id: 'high-memory',
          text: 'High memory usage by CloudWatch agent',
          weight: {}
        },
        {
          id: 'slow-response',
          text: 'Application response time increased',
          weight: {}
        },
        {
          id: 'network-issues',
          text: 'Network connectivity problems',
          weight: {}
        }
      ]
    },
    {
      id: 'config-symptoms',
      question: 'What configuration issues are you facing?',
      answers: [
        {
          id: 'config-errors',
          text: 'Configuration file validation errors',
          weight: {}
        },
        {
          id: 'permission-errors',
          text: 'Permission or access denied errors',
          weight: {}
        },
        {
          id: 'setup-confusion',
          text: 'Not sure how to configure for my use case',
          weight: {}
        },
        {
          id: 'integration-issues',
          text: 'Problems integrating with existing systems',
          weight: {}
        }
      ]
    },
    {
      id: 'general-symptoms',
      question: 'Can you describe what you\'re experiencing?',
      answers: [
        {
          id: 'error-messages',
          text: 'Getting specific error messages',
          weight: {}
        },
        {
          id: 'unexpected-behavior',
          text: 'System behaving differently than expected',
          weight: {}
        },
        {
          id: 'need-guidance',
          text: 'Need guidance on best practices',
          weight: {}
        },
        {
          id: 'troubleshooting-help',
          text: 'Need help troubleshooting an issue',
          weight: {}
        }
      ]
    }
  ]

  const getCurrentQuestion = (): ClassificationQuestion | null => {
    return questions.find(q => q.id === currentQuestionId) || null
  }

  const handleAnswerSelect = (answer: ClassificationAnswer) => {
    const newAnswers = [...answers, answer.id]
    setAnswers(newAnswers)

    // Update scores
    const newScores = { ...scores }
    Object.entries(answer.weight).forEach(([issueId, weight]) => {
      newScores[issueId] = (newScores[issueId] || 0) + weight
    })
    setScores(newScores)

    // Move to next question or complete
    if (answer.nextQuestion) {
      setCurrentQuestionId(answer.nextQuestion)
    } else {
      completeClassification(newScores)
    }
  }

  const completeClassification = (finalScores: Record<string, number>) => {
    // Sort issues by score and get top matches
    const sortedIssues = troubleshootingIssues
      .map(issue => ({
        issue,
        score: finalScores[issue.id] || 0
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.issue)

    setSuggestedIssues(sortedIssues)
    setIsComplete(true)
  }

  const resetClassification = () => {
    setCurrentQuestionId('start')
    setAnswers([])
    setScores({})
    setIsComplete(false)
    setSuggestedIssues([])
  }

  const currentQuestion = getCurrentQuestion()

  if (isComplete) {
    return (
      <div className={`issue-classifier ${className}`}>
        <Card className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Classification Complete</h2>
            <p className="text-gray-600">
              Based on your answers, here are the most likely issues:
            </p>
          </div>

          {suggestedIssues.length > 0 ? (
            <div className="space-y-4 mb-6">
              {suggestedIssues.map((issue, index) => (
                <Card key={issue.id} className="p-4 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          #{index + 1} Match
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          issue.severity === 'critical' ? 'text-red-600 bg-red-50' :
                          issue.severity === 'high' ? 'text-orange-600 bg-orange-50' :
                          issue.severity === 'medium' ? 'text-yellow-600 bg-yellow-50' :
                          'text-green-600 bg-green-50'
                        }`}>
                          {issue.severity.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{issue.title}</h3>
                      <p className="text-gray-600 mb-3">{issue.description}</p>
                      <div className="text-sm text-gray-500">
                        {issue.solutions.length} solution{issue.solutions.length !== 1 ? 's' : ''} available
                      </div>
                    </div>
                    <Button
                      onClick={() => onIssueIdentified(issue)}
                      className="ml-4"
                    >
                      View Solutions
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center mb-6">
              <div className="text-gray-400 mb-4">
                <span className="text-4xl">🤔</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Specific Match Found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't identify a specific issue based on your answers. Try browsing all issues or contact support for help.
              </p>
            </Card>
          )}

          <div className="flex justify-center space-x-4">
            <Button onClick={resetClassification} variant="outline">
              Start Over
            </Button>
            <Button onClick={() => onIssueIdentified(suggestedIssues[0] || troubleshootingIssues[0])}>
              Browse All Issues
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className={`issue-classifier ${className}`}>
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Classification Error</h2>
          <p className="text-gray-600 mb-4">Something went wrong with the classification process.</p>
          <Button onClick={resetClassification}>Start Over</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className={`issue-classifier ${className}`}>
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Issue Classifier</h2>
            <div className="text-sm text-gray-500">
              Step {answers.length + 1}
            </div>
          </div>
          <p className="text-gray-600">
            Answer a few questions to help identify your issue and find the right solutions.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentQuestion.question}
          </h3>
          <div className="space-y-3">
            {currentQuestion.answers.map(answer => (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer)}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-gray-300 rounded-full mr-3 flex-shrink-0"></div>
                  <span className="text-gray-900">{answer.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {answers.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Button
              onClick={resetClassification}
              variant="outline"
              size="sm"
            >
              Start Over
            </Button>
            <div className="text-sm text-gray-500">
              {answers.length} question{answers.length !== 1 ? 's' : ''} answered
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}