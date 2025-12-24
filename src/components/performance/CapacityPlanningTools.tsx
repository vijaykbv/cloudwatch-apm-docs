'use client'

import React, { useState, useMemo } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { CapacityPlan, TimeFrame, TrendDirection, CapacityAction, RiskCategory } from '../../types/performance'
import { capacityPlans } from '../../data/performance-data'

interface CapacityPlanningToolsProps {
  plans?: CapacityPlan[]
  onCreatePlan?: (plan: Partial<CapacityPlan>) => void
  onUpdatePlan?: (planId: string, updates: Partial<CapacityPlan>) => void
}

export const CapacityPlanningTools: React.FC<CapacityPlanningToolsProps> = ({
  plans = capacityPlans,
  onCreatePlan,
  onUpdatePlan
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorInputs, setCalculatorInputs] = useState({
    currentCpu: 65,
    currentMemory: 70,
    currentStorage: 2048,
    currentRequests: 8000,
    growthRate: 15,
    timeframe: '3-months' as TimeFrame,
    targetUtilization: 80
  })

  const timeframes: TimeFrame[] = ['1-month', '3-months', '6-months', '1-year', '2-years']

  const getTrendIcon = (trend: TrendDirection): string => {
    switch (trend) {
      case 'increasing': return '↗️'
      case 'decreasing': return '↘️'
      case 'stable': return '→'
      case 'volatile': return '↕️'
      default: return '→'
    }
  }

  const getTrendColor = (trend: TrendDirection): string => {
    switch (trend) {
      case 'increasing': return 'text-red-600'
      case 'decreasing': return 'text-green-600'
      case 'stable': return 'text-blue-600'
      case 'volatile': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getUtilizationColor = (utilization: number): string => {
    if (utilization >= 0.9) return 'text-red-600'
    if (utilization >= 0.8) return 'text-yellow-600'
    if (utilization >= 0.7) return 'text-blue-600'
    return 'text-green-600'
  }

  const getActionColor = (action: CapacityAction): string => {
    switch (action) {
      case 'scale-up':
      case 'scale-out': return 'text-blue-600'
      case 'scale-down':
      case 'scale-in': return 'text-green-600'
      case 'optimize': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskColor = (category: RiskCategory): string => {
    switch (category) {
      case 'performance': return 'bg-red-100 text-red-800'
      case 'cost': return 'bg-yellow-100 text-yellow-800'
      case 'availability': return 'bg-orange-100 text-orange-800'
      case 'security': return 'bg-purple-100 text-purple-800'
      case 'compliance': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateProjectedValue = (current: number, growthRate: number, months: number): number => {
    return Math.round(current * Math.pow(1 + growthRate / 100, months / 12))
  }

  const calculateCapacityNeeds = () => {
    const months = {
      '1-month': 1,
      '3-months': 3,
      '6-months': 6,
      '1-year': 12,
      '2-years': 24
    }[calculatorInputs.timeframe]

    const projectedCpu = calculateProjectedValue(calculatorInputs.currentCpu, calculatorInputs.growthRate, months)
    const projectedMemory = calculateProjectedValue(calculatorInputs.currentMemory, calculatorInputs.growthRate, months)
    const projectedStorage = calculateProjectedValue(calculatorInputs.currentStorage, calculatorInputs.growthRate, months)
    const projectedRequests = calculateProjectedValue(calculatorInputs.currentRequests, calculatorInputs.growthRate, months)

    return {
      cpu: {
        current: calculatorInputs.currentCpu,
        projected: projectedCpu,
        needsScaling: projectedCpu > calculatorInputs.targetUtilization,
        scalingFactor: projectedCpu / calculatorInputs.targetUtilization
      },
      memory: {
        current: calculatorInputs.currentMemory,
        projected: projectedMemory,
        needsScaling: projectedMemory > calculatorInputs.targetUtilization,
        scalingFactor: projectedMemory / calculatorInputs.targetUtilization
      },
      storage: {
        current: calculatorInputs.currentStorage,
        projected: projectedStorage,
        needsScaling: projectedStorage > calculatorInputs.currentStorage * 1.5,
        scalingFactor: projectedStorage / (calculatorInputs.currentStorage * 1.5)
      },
      requests: {
        current: calculatorInputs.currentRequests,
        projected: projectedRequests,
        needsScaling: projectedRequests > calculatorInputs.currentRequests * 1.5,
        scalingFactor: projectedRequests / (calculatorInputs.currentRequests * 1.5)
      }
    }
  }

  const capacityNeeds = useMemo(() => calculateCapacityNeeds(), [calculatorInputs])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Capacity Planning Tools</h2>
          <p className="text-gray-600 mt-1">
            Plan and forecast your CloudWatch APM capacity requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showCalculator ? 'primary' : 'secondary'}
            onClick={() => setShowCalculator(!showCalculator)}
            className="text-sm"
          >
            {showCalculator ? 'Hide Calculator' : 'Capacity Calculator'}
          </Button>
          <Button variant="primary" className="text-sm">
            Create New Plan
          </Button>
        </div>
      </div>

      {/* Capacity Calculator */}
      {showCalculator && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Calculator</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current CPU Utilization (%)
              </label>
              <Input
                type="number"
                value={calculatorInputs.currentCpu}
                onChange={(e) => setCalculatorInputs(prev => ({
                  ...prev,
                  currentCpu: Number(e.target.value)
                }))}
                min="0"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Memory Utilization (%)
              </label>
              <Input
                type="number"
                value={calculatorInputs.currentMemory}
                onChange={(e) => setCalculatorInputs(prev => ({
                  ...prev,
                  currentMemory: Number(e.target.value)
                }))}
                min="0"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Storage (GB)
              </label>
              <Input
                type="number"
                value={calculatorInputs.currentStorage}
                onChange={(e) => setCalculatorInputs(prev => ({
                  ...prev,
                  currentStorage: Number(e.target.value)
                }))}
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Requests/sec
              </label>
              <Input
                type="number"
                value={calculatorInputs.currentRequests}
                onChange={(e) => setCalculatorInputs(prev => ({
                  ...prev,
                  currentRequests: Number(e.target.value)
                }))}
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Growth Rate (% per year)
              </label>
              <Input
                type="number"
                value={calculatorInputs.growthRate}
                onChange={(e) => setCalculatorInputs(prev => ({
                  ...prev,
                  growthRate: Number(e.target.value)
                }))}
                min="0"
                max="1000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Utilization (%)
              </label>
              <Input
                type="number"
                value={calculatorInputs.targetUtilization}
                onChange={(e) => setCalculatorInputs(prev => ({
                  ...prev,
                  targetUtilization: Number(e.target.value)
                }))}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Planning Timeframe</label>
            <div className="flex flex-wrap gap-2">
              {timeframes.map(timeframe => (
                <Button
                  key={timeframe}
                  variant={calculatorInputs.timeframe === timeframe ? 'primary' : 'secondary'}
                  onClick={() => setCalculatorInputs(prev => ({ ...prev, timeframe }))}
                  className="text-sm"
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>

          {/* Calculation Results */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Projected Capacity Needs</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(capacityNeeds).map(([resource, data]) => (
                <div key={resource} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900 capitalize">{resource}</h5>
                    {data.needsScaling && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Scaling Needed
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium">
                        {resource === 'storage' ? `${data.current.toLocaleString()} GB` : 
                         resource === 'requests' ? `${data.current.toLocaleString()}/sec` :
                         `${data.current}%`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Projected:</span>
                      <span className={`font-medium ${data.needsScaling ? 'text-red-600' : 'text-green-600'}`}>
                        {resource === 'storage' ? `${data.projected.toLocaleString()} GB` : 
                         resource === 'requests' ? `${data.projected.toLocaleString()}/sec` :
                         `${data.projected}%`}
                      </span>
                    </div>
                    {data.needsScaling && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Scale Factor:</span>
                        <span className="font-medium text-blue-600">
                          {data.scalingFactor.toFixed(1)}x
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Existing Capacity Plans */}
      <div className="space-y-4">
        {plans.map(plan => (
          <Card key={plan.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 mt-1">{plan.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {plan.timeframe}
                  </span>
                </div>
              </div>
            </div>

            {/* Current vs Projected Capacity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Current Capacity</h4>
                <div className="space-y-3">
                  {Object.entries(plan.currentCapacity).filter(([key]) => key !== 'custom').map(([resource, metrics]) => (
                    <div key={resource} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 capitalize">{resource}</span>
                        <span className={`text-sm ${getTrendColor(metrics.trend)}`}>
                          {getTrendIcon(metrics.trend)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getUtilizationColor(metrics.utilization)}`}>
                          {(metrics.utilization * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {metrics.current} {metrics.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Projected Capacity</h4>
                <div className="space-y-3">
                  {Object.entries(plan.projectedCapacity).filter(([key]) => key !== 'custom').map(([resource, metrics]) => (
                    <div key={resource} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 capitalize">{resource}</span>
                        <span className={`text-sm ${getTrendColor(metrics.trend)}`}>
                          {getTrendIcon(metrics.trend)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getUtilizationColor(metrics.utilization)}`}>
                          {(metrics.utilization * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {metrics.current} {metrics.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Capacity Recommendations</h4>
              <div className="space-y-3">
                {plan.recommendations.map(rec => (
                  <div key={rec.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 capitalize">{rec.resource}</span>
                          <span className={`text-sm font-medium ${getActionColor(rec.action)}`}>
                            {rec.action.replace('-', ' ')}
                          </span>
                          <span className="text-sm text-gray-600">
                            {rec.magnitude > 0 ? `+${rec.magnitude}%` : `${rec.magnitude}%`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{rec.justification}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          ${rec.cost.monthly}/mo
                        </div>
                        <div className="text-xs text-gray-500">{rec.timeline}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assumptions and Risks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Assumptions</h4>
                <ul className="space-y-2">
                  {plan.assumptions.map((assumption, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                      {assumption}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Risk Assessment</h4>
                <div className="space-y-2">
                  {plan.risks.map(risk => (
                    <div key={risk.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.category)}`}>
                            {risk.category}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            Risk Score: {(risk.probability * risk.impact).toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{risk.description}</p>
                        <p className="text-xs text-gray-500">{risk.mitigation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
                className="text-sm"
              >
                {selectedPlan === plan.id ? 'Hide Details' : 'View Details'}
              </Button>
              <Button variant="secondary" className="text-sm">
                Update Plan
              </Button>
              <Button variant="secondary" className="text-sm">
                Export Plan
              </Button>
              <Button variant="secondary" className="text-sm">
                Clone Plan
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No capacity plans found</div>
          <div className="text-sm text-gray-400">
            Create your first capacity plan to get started
          </div>
        </div>
      )}
    </div>
  )
}

export default CapacityPlanningTools