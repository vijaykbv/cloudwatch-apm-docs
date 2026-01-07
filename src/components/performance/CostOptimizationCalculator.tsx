'use client'

import React, { useState, useMemo } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { CostOptimization, CostCategory, CostOptimizationType, RiskLevel, Complexity } from '../../types/performance'
import { costOptimizations } from '../../data/performance-data'

interface CostOptimizationCalculatorProps {
  optimizations?: CostOptimization[]
  onApplyOptimization?: (optimizationId: string) => void
}

export const CostOptimizationCalculator: React.FC<CostOptimizationCalculatorProps> = ({
  optimizations = costOptimizations,
  onApplyOptimization
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CostCategory | null>(null)
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorInputs, setCalculatorInputs] = useState({
    currentCompute: 1800,
    currentStorage: 300,
    currentNetwork: 200,
    currentMonitoring: 100,
    instanceCount: 10,
    instanceType: 'm5.xlarge',
    utilizationRate: 65,
    reservedInstanceDiscount: 30,
    spotInstanceDiscount: 70,
    storageOptimizationSavings: 25
  })

  const categories: CostCategory[] = ['compute', 'storage', 'network', 'monitoring', 'licensing']

  const optimizationTypes: CostOptimizationType[] = [
    'rightsizing',
    'reserved-instances',
    'spot-instances',
    'storage-optimization',
    'network-optimization'
  ]

  const filteredOptimizations = useMemo(() => {
    if (!selectedCategory) return optimizations
    return optimizations.filter(opt => opt.category === selectedCategory)
  }, [optimizations, selectedCategory])

  const getCategoryColor = (category: CostCategory): string => {
    switch (category) {
      case 'compute': return 'bg-blue-100 text-blue-800'
      case 'storage': return 'bg-green-100 text-green-800'
      case 'network': return 'bg-purple-100 text-purple-800'
      case 'monitoring': return 'bg-yellow-100 text-yellow-800'
      case 'licensing': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: RiskLevel): string => {
    switch (risk) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
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

  const calculateOptimizationSavings = () => {
    const rightsizingSavings = calculatorInputs.currentCompute * 0.2 // 20% savings from rightsizing
    const reservedInstanceSavings = calculatorInputs.currentCompute * (calculatorInputs.reservedInstanceDiscount / 100)
    const spotInstanceSavings = calculatorInputs.currentCompute * 0.3 * (calculatorInputs.spotInstanceDiscount / 100) // 30% of workload on spot
    const storageSavings = calculatorInputs.currentStorage * (calculatorInputs.storageOptimizationSavings / 100)
    const networkSavings = calculatorInputs.currentNetwork * 0.15 // 15% network optimization

    return {
      rightsizing: {
        monthly: rightsizingSavings,
        annual: rightsizingSavings * 12,
        percentage: 20
      },
      reservedInstances: {
        monthly: reservedInstanceSavings,
        annual: reservedInstanceSavings * 12,
        percentage: calculatorInputs.reservedInstanceDiscount
      },
      spotInstances: {
        monthly: spotInstanceSavings,
        annual: spotInstanceSavings * 12,
        percentage: calculatorInputs.spotInstanceDiscount * 0.3
      },
      storageOptimization: {
        monthly: storageSavings,
        annual: storageSavings * 12,
        percentage: calculatorInputs.storageOptimizationSavings
      },
      networkOptimization: {
        monthly: networkSavings,
        annual: networkSavings * 12,
        percentage: 15
      },
      total: {
        monthly: rightsizingSavings + reservedInstanceSavings + spotInstanceSavings + storageSavings + networkSavings,
        annual: (rightsizingSavings + reservedInstanceSavings + spotInstanceSavings + storageSavings + networkSavings) * 12,
        percentage: ((rightsizingSavings + reservedInstanceSavings + spotInstanceSavings + storageSavings + networkSavings) / 
                    (calculatorInputs.currentCompute + calculatorInputs.currentStorage + calculatorInputs.currentNetwork)) * 100
      }
    }
  }

  const calculatedSavings = useMemo(() => calculateOptimizationSavings(), [calculatorInputs])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cost Optimization</h2>
          <p className="text-gray-600 mt-1">
            Identify and implement cost savings opportunities for your CloudWatch APM deployment
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showCalculator ? 'primary' : 'secondary'}
            onClick={() => setShowCalculator(!showCalculator)}
            className="text-sm"
          >
            {showCalculator ? 'Hide Calculator' : 'Cost Calculator'}
          </Button>
          <Button variant="primary" className="text-sm">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Cost Calculator */}
      {showCalculator && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Optimization Calculator</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Compute Cost ($/month)
              </label>
              <Input
                type="number"
                value={calculatorInputs.currentCompute}
                onChange={(e) => setCalculatorInputs(prev => ({
                  ...prev,
                  currentCompute: Number(e.target.value)
                }))}
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Storage Cost ($/month)
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
                Current Network Cost ($/month)
              </label>
              <Input
                type="number"
                value={calculatorInputs.currentNetwork}
                onChange={(e) => setCalculatorInputs(prev => ({
                  ...prev,
                  currentNetwork: Number(e.target.value)
                }))}
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instance Count
              </label>
              <Input
                type="number"
                value={calculatorInputs.instanceCount}
                onChange={(e) => setCalculatorInputs(prev => ({
                  ...prev,
                  instanceCount: Number(e.target.value)
                }))}
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average CPU Utilization (%)
              </label>
              <Input
                type="number"
                value={calculatorInputs.utilizationRate}
                onChange={(e) => setCalculatorInputs(prev => ({
                  ...prev,
                  utilizationRate: Number(e.target.value)
                }))}
                min="0"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reserved Instance Discount (%)
              </label>
              <Input
                type="number"
                value={calculatorInputs.reservedInstanceDiscount}
                onChange={(e) => setCalculatorInputs(prev => ({
                  ...prev,
                  reservedInstanceDiscount: Number(e.target.value)
                }))}
                min="0"
                max="75"
              />
            </div>
          </div>

          {/* Calculated Savings */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Potential Savings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {Object.entries(calculatedSavings).filter(([key]) => key !== 'total').map(([type, savings]) => (
                <div key={type} className="border rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2 capitalize">
                    {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly:</span>
                      <span className="font-medium text-green-600">
                        ${savings.monthly.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual:</span>
                      <span className="font-medium text-green-600">
                        ${savings.annual.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Savings:</span>
                      <span className="font-medium text-blue-600">
                        {savings.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Savings */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2">Total Potential Savings</h5>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    ${calculatedSavings.total.monthly.toFixed(0)}
                  </div>
                  <div className="text-sm text-green-700">Monthly</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    ${calculatedSavings.total.annual.toFixed(0)}
                  </div>
                  <div className="text-sm text-green-700">Annual</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {calculatedSavings.total.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-700">Total Savings</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!selectedCategory ? 'primary' : 'secondary'}
          onClick={() => setSelectedCategory(null)}
          className="text-sm"
        >
          All Categories
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'primary' : 'secondary'}
            onClick={() => setSelectedCategory(category)}
            className="text-sm capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Optimization Opportunities */}
      <div className="space-y-4">
        {filteredOptimizations.map(optimization => (
          <Card key={optimization.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {optimization.title}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(optimization.category)}`}>
                    {optimization.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{optimization.description}</p>
              </div>

              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-green-600">
                  ${optimization.savings.amount}
                </div>
                <div className="text-sm text-gray-500">
                  {optimization.savings.percentage}% savings
                </div>
                <div className="text-xs text-gray-500">
                  {optimization.savings.timeframe}
                </div>
              </div>
            </div>

            {/* Current vs Optimized Cost Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Current Cost Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(optimization.currentCost).filter(([key]) => key !== 'currency' && key !== 'period').map(([category, cost]) => (
                    <div key={category} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category === 'total' ? 'Total' : category}
                      </span>
                      <span className={`text-sm font-semibold ${category === 'total' ? 'text-red-600' : 'text-gray-900'}`}>
                        ${typeof cost === 'number' ? cost.toLocaleString() : cost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Optimized Cost Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(optimization.optimizedCost).filter(([key]) => key !== 'currency' && key !== 'period').map(([category, cost]) => (
                    <div key={category} className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category === 'total' ? 'Total' : category}
                      </span>
                      <span className={`text-sm font-semibold ${category === 'total' ? 'text-green-600' : 'text-gray-900'}`}>
                        ${typeof cost === 'number' ? cost.toLocaleString() : cost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Optimization Recommendations</h4>
              <div className="space-y-3">
                {optimization.recommendations.map(rec => (
                  <div key={rec.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{rec.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span className="capitalize">{rec.type.replace('-', ' ')}</span>
                          <span className={`font-medium ${getComplexityColor(rec.effort)}`}>
                            {rec.effort} complexity
                          </span>
                          <span className={`font-medium ${getRiskColor(rec.risk)}`}>
                            {rec.risk} risk
                          </span>
                          <span className="text-gray-500">{rec.timeline}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-semibold text-green-600">
                          ${rec.savings}
                        </div>
                        <div className="text-xs text-gray-500">monthly savings</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation Guide Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h5 className="font-medium text-blue-900 mb-2">Implementation Overview</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Prerequisites:</span>
                  <span className="ml-2 text-blue-900">
                    {optimization.implementation.prerequisites.length} items
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Steps:</span>
                  <span className="ml-2 text-blue-900">
                    {optimization.implementation.steps.length} steps
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Estimated Time:</span>
                  <span className="ml-2 text-blue-900">
                    {optimization.implementation.estimatedTime} minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => onApplyOptimization?.(optimization.id)}
                className="text-sm"
              >
                Apply Optimization
              </Button>
              <Button variant="secondary" className="text-sm">
                View Implementation
              </Button>
              <Button variant="secondary" className="text-sm">
                Simulate Impact
              </Button>
              <Button variant="secondary" className="text-sm">
                Export Analysis
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredOptimizations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No cost optimizations found</div>
          <div className="text-sm text-gray-400">
            {selectedCategory 
              ? `No optimizations available for ${selectedCategory} category`
              : 'No optimizations available'
            }
          </div>
        </div>
      )}
    </div>
  )
}

export default CostOptimizationCalculator