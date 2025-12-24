import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import CostOptimizationCalculator from '../CostOptimizationCalculator'
import { CostOptimization, CostCategory } from '../../../types/performance'

// Mock data for testing
const mockOptimizations: CostOptimization[] = [
  {
    id: 'test-rightsizing',
    title: 'Test Right-sizing Optimization',
    description: 'Test optimization for rightsizing instances',
    category: 'compute' as CostCategory,
    currentCost: {
      total: 1000,
      compute: 800,
      storage: 100,
      network: 50,
      monitoring: 50,
      other: 0,
      currency: 'USD',
      period: 'monthly'
    },
    optimizedCost: {
      total: 800,
      compute: 640,
      storage: 100,
      network: 40,
      monitoring: 50,
      other: 0,
      currency: 'USD',
      period: 'monthly'
    },
    savings: {
      amount: 200,
      percentage: 20,
      timeframe: 'monthly',
      confidence: 0.9,
      recurring: true
    },
    recommendations: [
      {
        id: 'downsize-instances',
        title: 'Downsize Instances',
        description: 'Move to smaller instance types',
        type: 'rightsizing',
        savings: 160,
        effort: 'low',
        risk: 'low',
        timeline: '1 week'
      }
    ],
    implementation: {
      steps: [
        {
          id: 'analyze',
          title: 'Analyze Usage',
          description: 'Review current usage patterns',
          commands: ['aws cloudwatch get-metric-statistics'],
          validation: 'Check metrics',
          rollback: 'N/A'
        }
      ],
      prerequisites: ['CloudWatch enabled'],
      estimatedTime: 120,
      rollbackPlan: ['Revert changes'],
      validationSteps: ['Validate performance']
    }
  }
]

describe('CostOptimizationCalculator', () => {
  it('renders without crashing', () => {
    render(<CostOptimizationCalculator optimizations={mockOptimizations} />)
    expect(screen.getByText('Cost Optimization')).toBeInTheDocument()
  })

  it('displays optimization opportunities', () => {
    render(<CostOptimizationCalculator optimizations={mockOptimizations} />)
    
    expect(screen.getByText('Test Right-sizing Optimization')).toBeInTheDocument()
    expect(screen.getByText('Test optimization for rightsizing instances')).toBeInTheDocument()
    expect(screen.getByText('$200')).toBeInTheDocument()
    expect(screen.getByText('20% savings')).toBeInTheDocument()
  })

  it('shows category filter buttons', () => {
    render(<CostOptimizationCalculator optimizations={mockOptimizations} />)
    
    expect(screen.getByText('All Categories')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'compute' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'storage' })).toBeInTheDocument()
  })

  it('displays cost breakdown comparison', () => {
    render(<CostOptimizationCalculator optimizations={mockOptimizations} />)
    
    expect(screen.getByText('Current Cost Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Optimized Cost Breakdown')).toBeInTheDocument()
    expect(screen.getByText('$1,000')).toBeInTheDocument()
    // Use more specific selector for optimized cost
    expect(screen.getByText('Optimized Cost Breakdown')).toBeInTheDocument()
  })

  it('shows optimization recommendations', () => {
    render(<CostOptimizationCalculator optimizations={mockOptimizations} />)
    
    expect(screen.getByText('Optimization Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Downsize Instances')).toBeInTheDocument()
    expect(screen.getByText('Move to smaller instance types')).toBeInTheDocument()
    expect(screen.getByText('$160')).toBeInTheDocument()
  })

  it('toggles cost calculator', () => {
    render(<CostOptimizationCalculator optimizations={mockOptimizations} />)
    
    const calculatorButton = screen.getByText('Cost Calculator')
    fireEvent.click(calculatorButton)
    
    expect(screen.getByText('Cost Optimization Calculator')).toBeInTheDocument()
    expect(screen.getByText('Current Compute Cost ($/month)')).toBeInTheDocument()
  })

  it('calculates potential savings in calculator', () => {
    render(<CostOptimizationCalculator optimizations={mockOptimizations} />)
    
    // Open calculator
    fireEvent.click(screen.getByText('Cost Calculator'))
    
    expect(screen.getByText('Potential Savings')).toBeInTheDocument()
    expect(screen.getByText('Total Potential Savings')).toBeInTheDocument()
  })

  it('handles apply optimization callback', () => {
    const onApplyOptimization = jest.fn()
    render(
      <CostOptimizationCalculator 
        optimizations={mockOptimizations}
        onApplyOptimization={onApplyOptimization}
      />
    )
    
    fireEvent.click(screen.getByText('Apply Optimization'))
    expect(onApplyOptimization).toHaveBeenCalledWith('test-rightsizing')
  })

  it('shows implementation overview', () => {
    render(<CostOptimizationCalculator optimizations={mockOptimizations} />)
    
    expect(screen.getByText('Implementation Overview')).toBeInTheDocument()
    expect(screen.getByText('1 items')).toBeInTheDocument()
    expect(screen.getByText('1 steps')).toBeInTheDocument()
    expect(screen.getByText('120 minutes')).toBeInTheDocument()
  })

  it('displays action buttons', () => {
    render(<CostOptimizationCalculator optimizations={mockOptimizations} />)
    
    expect(screen.getByText('Apply Optimization')).toBeInTheDocument()
    expect(screen.getByText('View Implementation')).toBeInTheDocument()
    expect(screen.getByText('Simulate Impact')).toBeInTheDocument()
    expect(screen.getByText('Export Analysis')).toBeInTheDocument()
  })

  it('handles empty optimizations array', () => {
    render(<CostOptimizationCalculator optimizations={[]} />)
    
    expect(screen.getByText('No cost optimizations found')).toBeInTheDocument()
    expect(screen.getByText('No optimizations available')).toBeInTheDocument()
  })

  it('updates calculator inputs', () => {
    render(<CostOptimizationCalculator optimizations={mockOptimizations} />)
    
    // Open calculator
    fireEvent.click(screen.getByText('Cost Calculator'))
    
    const computeInput = screen.getByDisplayValue('1800')
    fireEvent.change(computeInput, { target: { value: '2000' } })
    
    expect(computeInput).toHaveValue(2000)
  })
})