'use client'

import React, { useState, useMemo } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { ScalingRecommendation, ScalingCategory, Priority, Complexity } from '../../types/performance'
import { scalingRecommendations } from '../../data/performance-data'

interface ScalingRecommendationEngineProps {
  recommendations?: ScalingRecommendation[]
  currentMetrics?: Record<string, number>
  onApplyRecommendation?: (recommendationId: string) => void
}

export const ScalingRecommendationEngine: React.FC<ScalingRecommendationEngineProps> = ({
  recommendations = scalingRecommendations,
  currentMetrics = {},
  onApplyRecommendation
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ScalingCategory | null>(null)
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null)
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null)

  const categories: ScalingCategory[] = [
    'horizontal',
    'vertical',
    'auto-scaling',
    'load-balancing',
    'caching'
  ]

  const priorities: Priority[] = ['low', 'medium', 'high', 'critical']

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      if (selectedCategory && rec.category !== selectedCategory) return false
      if (selectedPriority && rec.priority !== selectedPriority) return false
      return true
    })
  }, [recommendations, selectedCategory, selectedPriority])

  const sortedRecommendations = useMemo(() => {
    return [...filteredRecommendations].sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [filteredRecommendations])

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplexityColor = (complexity: Complexity): string => {
    switch (complexity) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const formatImpactScore = (score: number): string => {
    if (score > 0) return `+${score}%`
    return `${score}%`
  }

  const getImpactColor = (score: number): string => {
    if (score > 20) return 'text-green-600'
    if (score > 0) return 'text-blue-600'
    if (score > -10) return 'text-yellow-600'
    return 'text-red-600'
  }

  const calculateROI = (recommendation: ScalingRecommendation): number => {
    const totalCost = recommendation.recommendations.reduce((sum, rec) => 
      sum + rec.estimatedCost.monthly, 0
    )
    const performanceGain = recommendation.estimatedImpact.performance
    if (totalCost === 0) return performanceGain
    return (performanceGain / totalCost) * 100
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scaling Recommendations</h2>
          <p className="text-gray-600 mt-1">
            AI-powered recommendations to optimize your CloudWatch APM performance
          </p>
        </div>
        <Button variant="primary" className="text-sm">
          Generate New Recommendations
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 self-center">Category:</span>
          <Button
            variant={!selectedCategory ? 'primary' : 'secondary'}
            onClick={() => setSelectedCategory(null)}
            className="text-sm"
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'secondary'}
              onClick={() => setSelectedCategory(category)}
              className="text-sm capitalize"
            >
              {category.replace('-', ' ')}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 self-center">Priority:</span>
          <Button
            variant={!selectedPriority ? 'primary' : 'secondary'}
            onClick={() => setSelectedPriority(null)}
            className="text-sm"
          >
            All
          </Button>
          {priorities.map(priority => (
            <Button
              key={priority}
              variant={selectedPriority === priority ? 'primary' : 'secondary'}
              onClick={() => setSelectedPriority(priority)}
              className="text-sm capitalize"
            >
              {priority}
            </Button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {sortedRecommendations.map(recommendation => (
          <Card key={recommendation.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {recommendation.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                    {recommendation.priority}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {recommendation.category.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{recommendation.description}</p>
                
                {/* Current Metrics */}
                <div className="flex flex-wrap gap-4 mb-3">
                  {recommendation.currentMetrics.map(metric => (
                    <div key={metric.id} className="text-sm">
                      <span className="text-gray-600">{metric.name}:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        {metric.value} {metric.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="text-lg font-bold text-gray-900">
                  ROI: {calculateROI(recommendation).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Performance/Cost Ratio</div>
              </div>
            </div>

            {/* Impact Estimates */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-lg font-semibold ${getImpactColor(recommendation.estimatedImpact.performance)}`}>
                  {formatImpactScore(recommendation.estimatedImpact.performance)}
                </div>
                <div className="text-xs text-gray-600">Performance</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-lg font-semibold ${getImpactColor(recommendation.estimatedImpact.cost)}`}>
                  {formatImpactScore(recommendation.estimatedImpact.cost)}
                </div>
                <div className="text-xs text-gray-600">Cost</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-lg font-semibold ${getImpactColor(recommendation.estimatedImpact.reliability)}`}>
                  {formatImpactScore(recommendation.estimatedImpact.reliability)}
                </div>
                <div className="text-xs text-gray-600">Reliability</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-lg font-semibold ${getImpactColor(recommendation.estimatedImpact.maintainability)}`}>
                  {formatImpactScore(recommendation.estimatedImpact.maintainability)}
                </div>
                <div className="text-xs text-gray-600">Maintainability</div>
              </div>
            </div>

            {/* Recommendation Items */}
            <div className="space-y-3 mb-4">
              {recommendation.recommendations.map(item => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        ${item.estimatedCost.monthly}/mo
                      </div>
                      <div className={`text-xs ${getComplexityColor(item.complexity)}`}>
                        {item.complexity} complexity
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="capitalize">{item.type.replace('-', ' ')}</span>
                    <span>•</span>
                    <span>Setup: ${item.estimatedCost.setup}</span>
                    <span>•</span>
                    <span>Annual: ${item.estimatedCost.annual}</span>
                    <span>•</span>
                    <span>{(item.estimatedCost.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Implementation Details */}
            {expandedRecommendation === recommendation.id && (
              <div className="border-t pt-4 mt-4">
                <h5 className="font-medium text-gray-900 mb-3">Implementation Guide</h5>
                
                {/* Prerequisites */}
                <div className="mb-4">
                  <h6 className="text-sm font-medium text-gray-700 mb-2">Prerequisites</h6>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {recommendation.implementation.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Implementation Steps */}
                <div className="mb-4">
                  <h6 className="text-sm font-medium text-gray-700 mb-2">Implementation Steps</h6>
                  <div className="space-y-3">
                    {recommendation.implementation.steps.map((step, index) => (
                      <div key={step.id} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {index + 1}
                          </span>
                          <h7 className="font-medium text-gray-900">{step.title}</h7>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 ml-8">{step.description}</p>
                        {step.commands.length > 0 && (
                          <div className="ml-8">
                            <div className="text-xs text-gray-500 mb-1">Commands:</div>
                            <div className="bg-gray-900 text-gray-100 p-2 rounded text-xs font-mono">
                              {step.commands.map((command, cmdIndex) => (
                                <div key={cmdIndex}>{command}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estimated Time and Validation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Estimated Time:</span>
                    <span className="ml-2 font-medium">{recommendation.implementation.estimatedTime} minutes</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Confidence:</span>
                    <span className="ml-2 font-medium">{(recommendation.estimatedImpact.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="primary"
                onClick={() => onApplyRecommendation?.(recommendation.id)}
                className="text-sm"
              >
                Apply Recommendation
              </Button>
              <Button
                variant="secondary"
                onClick={() => setExpandedRecommendation(
                  expandedRecommendation === recommendation.id ? null : recommendation.id
                )}
                className="text-sm"
              >
                {expandedRecommendation === recommendation.id ? 'Hide Details' : 'View Implementation'}
              </Button>
              <Button variant="secondary" className="text-sm">
                Simulate Impact
              </Button>
              <Button variant="secondary" className="text-sm">
                Export Plan
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {sortedRecommendations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No recommendations found</div>
          <div className="text-sm text-gray-400">
            Try adjusting your filters or generate new recommendations
          </div>
        </div>
      )}
    </div>
  )
}

export default ScalingRecommendationEngine