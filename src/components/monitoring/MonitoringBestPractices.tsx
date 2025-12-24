'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import {
  MonitoringBestPractice,
  BestPracticeCategory,
  ImplementationStep
} from '../../types/monitoring'
import { monitoringBestPractices, bestPracticeCategories } from '../../data/monitoring-data'

interface MonitoringBestPracticesProps {
  onImplementationStart?: (practice: MonitoringBestPractice) => void
}

interface FilterState {
  category: string
  importance: string
  difficulty: string
  searchTerm: string
}

export function MonitoringBestPractices({ onImplementationStart }: MonitoringBestPracticesProps) {
  const [selectedPractice, setSelectedPractice] = useState<MonitoringBestPractice | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    importance: '',
    difficulty: '',
    searchTerm: ''
  })

  const filteredPractices = useMemo(() => {
    return monitoringBestPractices.filter(practice => {
      if (filters.category && practice.category.id !== filters.category) {
        return false
      }
      if (filters.importance && practice.importance !== filters.importance) {
        return false
      }
      if (filters.difficulty && practice.implementation.difficulty !== filters.difficulty) {
        return false
      }
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesTitle = practice.title.toLowerCase().includes(searchLower)
        const matchesDescription = practice.description.toLowerCase().includes(searchLower)
        const matchesTags = practice.tags.some(tag => tag.toLowerCase().includes(searchLower))
        
        if (!matchesTitle && !matchesDescription && !matchesTags) {
          return false
        }
      }
      return true
    })
  }, [filters])

  if (selectedPractice) {
    return (
      <BestPracticeDetail
        practice={selectedPractice}
        onBack={() => setSelectedPractice(null)}
        onImplementationStart={() => onImplementationStart?.(selectedPractice)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Monitoring Best Practices</h2>
        <p className="text-gray-600">
          Learn industry best practices for effective monitoring and alerting strategies
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <Input
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="Search practices..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {bestPracticeCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Importance</label>
            <select
              value={filters.importance}
              onChange={(e) => setFilters(prev => ({ ...prev, importance: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Categories overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bestPracticeCategories.map(category => {
          const categoryPractices = filteredPractices.filter(p => p.category.id === category.id)
          return (
            <Card key={category.id} className="p-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">{category.icon}</span>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">{category.description}</p>
              <div className="text-sm text-blue-600">{categoryPractices.length} practices</div>
            </Card>
          )
        })}
      </div>

      {/* Best practices list */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Best Practices ({filteredPractices.length})
          </h3>
          <Button
            variant="outline"
            onClick={() => setFilters({ category: '', importance: '', difficulty: '', searchTerm: '' })}
          >
            Clear Filters
          </Button>
        </div>

        {filteredPractices.map(practice => (
          <Card key={practice.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div onClick={() => setSelectedPractice(practice)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mr-3">{practice.title}</h3>
                    <span className={`
                      px-2 py-1 text-xs rounded-full
                      ${practice.importance === 'critical' ? 'bg-red-100 text-red-800' :
                        practice.importance === 'high' ? 'bg-orange-100 text-orange-800' :
                        practice.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }
                    `}>
                      {practice.importance} priority
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{practice.description}</p>
                  <div className="text-sm text-gray-500 mb-3">
                    Category: {practice.category.name} | 
                    Difficulty: {practice.implementation.difficulty} | 
                    Time: {practice.implementation.estimatedTime}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {practice.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="text-sm text-gray-600">
                {practice.implementation.steps.length} implementation steps
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t mt-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPractice(practice)
                }}
              >
                View Details →
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredPractices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No practices found</div>
          <div className="text-gray-500">Try adjusting your filters or search terms</div>
        </div>
      )}
    </div>
  )
}

function BestPracticeDetail({
  practice,
  onBack,
  onImplementationStart
}: {
  practice: MonitoringBestPractice
  onBack: () => void
  onImplementationStart: () => void
}) {
  const [activeStep, setActiveStep] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{practice.title}</h2>
          <p className="text-gray-600">{practice.category.name}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          ← Back to Practices
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
            <p className="text-gray-600 mb-4">{practice.description}</p>
            <p className="text-gray-700">{practice.implementation.overview}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prerequisites</h3>
            <ul className="space-y-2">
              {practice.implementation.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{prereq}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation Steps</h3>
            <div className="space-y-4">
              {practice.implementation.steps.map((step, index) => (
                <ImplementationStepCard
                  key={step.id}
                  step={step}
                  stepNumber={index + 1}
                  isActive={activeStep === step.id}
                  onToggle={() => setActiveStep(activeStep === step.id ? null : step.id)}
                />
              ))}
            </div>
          </Card>

          {practice.examples.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Examples</h3>
              <div className="space-y-4">
                {practice.examples.map(example => (
                  <div key={example.id} className="border-l-4 border-blue-400 pl-4">
                    <h4 className="font-medium text-gray-900 mb-2">{example.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{example.description}</p>
                    <div className="text-sm text-gray-700 mb-2">
                      <strong>Scenario:</strong> {example.scenario}
                    </div>
                    <div className="text-sm text-gray-700 mb-3">
                      <strong>Implementation:</strong> {example.implementation}
                    </div>
                    <div className="text-sm">
                      <strong>Benefits:</strong>
                      <ul className="list-disc list-inside mt-1 text-gray-600">
                        {example.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Importance:</span>
                <span className={`
                  ml-2 px-2 py-1 rounded-full text-xs
                  ${practice.importance === 'critical' ? 'bg-red-100 text-red-800' :
                    practice.importance === 'high' ? 'bg-orange-100 text-orange-800' :
                    practice.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }
                `}>
                  {practice.importance}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Difficulty:</span>
                <span className="ml-2 capitalize">{practice.implementation.difficulty}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Estimated Time:</span>
                <span className="ml-2">{practice.implementation.estimatedTime}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Steps:</span>
                <span className="ml-2">{practice.implementation.steps.length}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <Button onClick={onImplementationStart} className="w-full">
                Start Implementation
              </Button>
              <Button variant="outline" className="w-full">
                Save for Later
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {practice.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {tag}
                </span>
              ))}
            </div>
          </Card>

          {practice.relatedPractices.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Practices</h3>
              <div className="space-y-2">
                {practice.relatedPractices.map(relatedId => {
                  const related = monitoringBestPractices.find(p => p.id === relatedId)
                  return related ? (
                    <div key={relatedId} className="text-sm">
                      <a href="#" className="text-blue-600 hover:text-blue-800">
                        {related.title}
                      </a>
                    </div>
                  ) : null
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ImplementationStepCard({
  step,
  stepNumber,
  isActive,
  onToggle
}: {
  step: ImplementationStep
  stepNumber: number
  isActive: boolean
  onToggle: () => void
}) {
  return (
    <div className="border rounded-lg">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
              {stepNumber}
            </div>
            <h4 className="font-medium text-gray-900">{step.title}</h4>
          </div>
          <span className="text-gray-400">
            {isActive ? '−' : '+'}
          </span>
        </div>
      </div>

      {isActive && (
        <div className="px-4 pb-4 border-t bg-gray-50">
          <p className="text-gray-600 mb-4">{step.description}</p>

          {step.code && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Code Example:</h5>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                <pre><code>{step.code}</code></pre>
              </div>
            </div>
          )}

          {step.commands && step.commands.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Commands:</h5>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm space-y-2">
                {step.commands.map((command, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <code>{command}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(command)}
                      className="ml-2 text-xs"
                    >
                      Copy
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <h5 className="text-sm font-medium text-blue-800 mb-1">Validation:</h5>
            <p className="text-sm text-blue-700">{step.validation}</p>
          </div>

          {step.troubleshooting && step.troubleshooting.length > 0 && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <h5 className="text-sm font-medium text-yellow-800 mb-2">Troubleshooting:</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                {step.troubleshooting.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}