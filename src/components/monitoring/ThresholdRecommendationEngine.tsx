'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import {
  MetricDefinition,
  ThresholdRecommendation,
  AlertThreshold
} from '../../types/monitoring'
import { performanceMetrics } from '../../data/monitoring-data'

interface ThresholdRecommendationEngineProps {
  metric: MetricDefinition
  historicalData?: HistoricalDataPoint[]
  onRecommendationApply?: (threshold: AlertThreshold) => void
}

interface HistoricalDataPoint {
  timestamp: Date
  value: number
}

interface RecommendationAnalysis {
  recommendation: ThresholdRecommendation
  confidence: number
  reasoning: string
  historicalContext?: string
}

export function ThresholdRecommendationEngine({
  metric,
  historicalData,
  onRecommendationApply
}: ThresholdRecommendationEngineProps) {
  const [analysis, setAnalysis] = useState<RecommendationAnalysis[]>([])
  const [selectedRecommendation, setSelectedRecommendation] = useState<ThresholdRecommendation | null>(null)
  const [customThreshold, setCustomThreshold] = useState<Partial<AlertThreshold>>({})

  useEffect(() => {
    generateRecommendations()
  }, [metric, historicalData])

  const generateRecommendations = () => {
    const recommendations: RecommendationAnalysis[] = []

    // Use default thresholds from metric definition
    metric.defaultThresholds.forEach(threshold => {
      let confidence = 0.8 // Base confidence for default thresholds
      let reasoning = `Default threshold based on ${metric.displayName} best practices`
      let historicalContext = ''

      // Enhance recommendations with historical data if available
      if (historicalData && historicalData.length > 0) {
        const stats = calculateStatistics(historicalData)
        confidence = adjustConfidenceWithHistoricalData(threshold, stats)
        reasoning = enhanceReasoningWithStats(threshold, stats, metric)
        historicalContext = generateHistoricalContext(stats)
      }

      recommendations.push({
        recommendation: threshold,
        confidence,
        reasoning,
        historicalContext
      })
    })

    // Generate additional recommendations based on historical data
    if (historicalData && historicalData.length > 0) {
      const stats = calculateStatistics(historicalData)
      const additionalRecommendations = generateStatisticalRecommendations(stats, metric)
      recommendations.push(...additionalRecommendations)
    }

    // Sort by confidence
    recommendations.sort((a, b) => b.confidence - a.confidence)
    setAnalysis(recommendations)
  }

  const calculateStatistics = (data: HistoricalDataPoint[]) => {
    const values = data.map(d => d.value).sort((a, b) => a - b)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const median = values[Math.floor(values.length / 2)]
    const p95 = values[Math.floor(values.length * 0.95)]
    const p99 = values[Math.floor(values.length * 0.99)]
    const max = Math.max(...values)
    const min = Math.min(...values)
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    )

    return { mean, median, p95, p99, max, min, stdDev, count: values.length }
  }

  const adjustConfidenceWithHistoricalData = (
    threshold: ThresholdRecommendation,
    stats: ReturnType<typeof calculateStatistics>
  ): number => {
    let confidence = 0.8

    // Increase confidence if threshold aligns well with historical patterns
    if (threshold.condition === 'greater_than') {
      if (threshold.value > stats.p95 && threshold.value < stats.p99) {
        confidence = 0.95 // Very good threshold
      } else if (threshold.value > stats.mean + 2 * stats.stdDev) {
        confidence = 0.9 // Good threshold
      } else if (threshold.value < stats.mean) {
        confidence = 0.4 // Too low, likely to cause false positives
      }
    }

    return Math.min(confidence, 1.0)
  }

  const enhanceReasoningWithStats = (
    threshold: ThresholdRecommendation,
    stats: ReturnType<typeof calculateStatistics>,
    metric: MetricDefinition
  ): string => {
    let reasoning = threshold.rationale

    if (threshold.condition === 'greater_than') {
      const percentilePosition = (threshold.value - stats.min) / (stats.max - stats.min) * 100
      reasoning += `. Based on historical data, this threshold is at the ${percentilePosition.toFixed(1)}th percentile.`

      if (threshold.value > stats.p95) {
        reasoning += ' This should minimize false positives while catching genuine issues.'
      } else if (threshold.value < stats.mean) {
        reasoning += ' Warning: This threshold may generate frequent alerts during normal operations.'
      }
    }

    return reasoning
  }

  const generateHistoricalContext = (stats: ReturnType<typeof calculateStatistics>): string => {
    return `Historical analysis (${stats.count} data points): Mean=${stats.mean.toFixed(2)}, 95th percentile=${stats.p95.toFixed(2)}, Max=${stats.max.toFixed(2)}`
  }

  const generateStatisticalRecommendations = (
    stats: ReturnType<typeof calculateStatistics>,
    metric: MetricDefinition
  ): RecommendationAnalysis[] => {
    const recommendations: RecommendationAnalysis[] = []

    // P95-based recommendation
    recommendations.push({
      recommendation: {
        condition: 'greater_than',
        value: Math.round(stats.p95 * 1.1), // 10% above P95
        duration: '5m',
        severity: 'warning',
        description: 'Statistical threshold based on 95th percentile',
        rationale: 'Threshold set 10% above historical 95th percentile to balance sensitivity and specificity'
      },
      confidence: 0.85,
      reasoning: 'Data-driven threshold based on historical performance patterns',
      historicalContext: generateHistoricalContext(stats)
    })

    // Mean + 3 standard deviations (for normally distributed metrics)
    const threeStdThreshold = stats.mean + 3 * stats.stdDev
    if (threeStdThreshold > 0 && threeStdThreshold < stats.max * 2) {
      recommendations.push({
        recommendation: {
          condition: 'greater_than',
          value: Math.round(threeStdThreshold),
          duration: '3m',
          severity: 'critical',
          description: 'Statistical outlier detection threshold',
          rationale: 'Threshold based on 3-sigma rule for detecting statistical outliers'
        },
        confidence: 0.75,
        reasoning: 'Statistical outlier detection using 3-standard deviation rule',
        historicalContext: generateHistoricalContext(stats)
      })
    }

    return recommendations
  }

  const applyRecommendation = (recommendation: ThresholdRecommendation) => {
    const threshold: AlertThreshold = {
      condition: recommendation.condition,
      value: recommendation.value,
      duration: recommendation.duration,
      evaluationPeriods: 2,
      datapointsToAlarm: 2,
      treatMissingData: 'notBreaching'
    }

    onRecommendationApply?.(threshold)
  }

  const applyCustomThreshold = () => {
    if (customThreshold.condition && customThreshold.value && customThreshold.duration) {
      const threshold: AlertThreshold = {
        condition: customThreshold.condition,
        value: customThreshold.value,
        duration: customThreshold.duration,
        evaluationPeriods: customThreshold.evaluationPeriods || 2,
        datapointsToAlarm: customThreshold.datapointsToAlarm || 2,
        treatMissingData: customThreshold.treatMissingData || 'notBreaching'
      }

      onRecommendationApply?.(threshold)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Threshold Recommendations</h2>
        <p className="text-gray-600">
          AI-powered threshold recommendations for {metric.displayName} based on best practices and historical data
        </p>
      </div>

      {/* Metric Information */}
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{metric.displayName}</h3>
            <p className="text-gray-600 mt-1">{metric.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              <span>Unit: {metric.unit}</span>
              <span className="mx-2">•</span>
              <span>Namespace: {metric.namespace}</span>
              <span className="mx-2">•</span>
              <span className={`
                px-2 py-1 rounded-full text-xs
                ${metric.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  metric.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  metric.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }
              `}>
                {metric.severity} priority
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recommended Thresholds</h3>
        
        {analysis.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-md font-medium text-gray-900">
                    {item.recommendation.condition.replace('_', ' ')} {item.recommendation.value} {metric.unit}
                  </h4>
                  <span className={`
                    ml-3 px-2 py-1 text-xs rounded-full
                    ${item.recommendation.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}
                  `}>
                    {item.recommendation.severity}
                  </span>
                  <div className="ml-3 flex items-center">
                    <div className="text-xs text-gray-500">Confidence:</div>
                    <div className="ml-1 w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.confidence * 100}%` }}
                      />
                    </div>
                    <div className="ml-1 text-xs text-gray-600">{Math.round(item.confidence * 100)}%</div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-2">{item.recommendation.description}</p>
                <p className="text-gray-700 text-sm mb-2">{item.reasoning}</p>
                
                {item.historicalContext && (
                  <p className="text-gray-500 text-xs">{item.historicalContext}</p>
                )}
                
                <div className="mt-3 text-xs text-gray-500">
                  Duration: {item.recommendation.duration}
                </div>
              </div>
              
              <Button 
                onClick={() => applyRecommendation(item.recommendation)}
                className="ml-4"
              >
                Apply
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Custom Threshold */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Threshold</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
            <select
              value={customThreshold.condition || ''}
              onChange={(e) => setCustomThreshold(prev => ({ ...prev, condition: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select condition</option>
              <option value="greater_than">Greater than</option>
              <option value="less_than">Less than</option>
              <option value="equal_to">Equal to</option>
              <option value="not_equal_to">Not equal to</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
            <input
              type="number"
              value={customThreshold.value || ''}
              onChange={(e) => setCustomThreshold(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Threshold value"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <select
              value={customThreshold.duration || ''}
              onChange={(e) => setCustomThreshold(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select duration</option>
              <option value="1m">1 minute</option>
              <option value="5m">5 minutes</option>
              <option value="10m">10 minutes</option>
              <option value="15m">15 minutes</option>
              <option value="30m">30 minutes</option>
              <option value="1h">1 hour</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={applyCustomThreshold}
              disabled={!customThreshold.condition || !customThreshold.value || !customThreshold.duration}
              className="w-full"
            >
              Apply Custom
            </Button>
          </div>
        </div>
      </Card>

      {/* Threshold Guidelines */}
      <Card className="p-4 bg-blue-50">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Threshold Setting Guidelines</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• <strong>Warning thresholds</strong> should catch issues before they impact users</p>
          <p>• <strong>Critical thresholds</strong> should indicate immediate action is required</p>
          <p>• Consider your application's normal operating patterns and peak usage times</p>
          <p>• Start with conservative thresholds and adjust based on alert frequency</p>
          <p>• Use longer durations for volatile metrics to reduce false positives</p>
        </div>
      </Card>
    </div>
  )
}