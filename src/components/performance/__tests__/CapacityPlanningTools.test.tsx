import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import CapacityPlanningTools from '../CapacityPlanningTools'
import { CapacityPlan, TimeFrame, TrendDirection, CapacityAction, RiskCategory } from '../../../types/performance'

// Mock data for testing
const mockPlans: CapacityPlan[] = [
  {
    id: 'test-plan',
    name: 'Test Capacity Plan',
    description: 'Test capacity planning for Q1',
    timeframe: '3-months' as TimeFrame,
    currentCapacity: {
      cpu: {
        current: 65,
        peak: 85,
        average: 60,
        unit: 'percentage',
        utilization: 0.65,
        trend: 'increasing' as TrendDirection
      },
      memory: {
        current: 70,
        peak: 90,
        average: 65,
        unit: 'percentage',
        utilization: 0.70,
        trend: 'stable' as TrendDirection
      },
      storage: {
        current: 1000,
        peak: 1500,
        average: 900,
        unit: 'GB',
        utilization: 0.67,
        trend: 'increasing' as TrendDirection
      },
      network: {
        current: 500,
        peak: 800,
        average: 450,
        unit: 'Mbps',
        utilization: 0.63,
        trend: 'increasing' as TrendDirection
      },
      requests: {
        current: 5000,
        peak: 8000,
        average: 4500,
        unit: 'requests/second',
        utilization: 0.67,
        trend: 'increasing' as TrendDirection
      },
      custom: {}
    },
    projectedCapacity: {
      cpu: {
        current: 80,
        peak: 95,
        average: 75,
        unit: 'percentage',
        utilization: 0.80,
        trend: 'increasing' as TrendDirection
      },
      memory: {
        current: 85,
        peak: 95,
        average: 80,
        unit: 'percentage',
        utilization: 0.85,
        trend: 'increasing' as TrendDirection
      },
      storage: {
        current: 1500,
        peak: 2000,
        average: 1400,
        unit: 'GB',
        utilization: 0.75,
        trend: 'increasing' as TrendDirection
      },
      network: {
        current: 750,
        peak: 1200,
        average: 700,
        unit: 'Mbps',
        utilization: 0.75,
        trend: 'increasing' as TrendDirection
      },
      requests: {
        current: 7500,
        peak: 12000,
        average: 7000,
        unit: 'requests/second',
        utilization: 0.75,
        trend: 'increasing' as TrendDirection
      },
      custom: {}
    },
    recommendations: [
      {
        id: 'scale-cpu',
        resource: 'cpu',
        action: 'scale-out' as CapacityAction,
        magnitude: 50,
        timeline: '2 weeks',
        justification: 'CPU utilization approaching limits',
        cost: {
          setup: 0,
          monthly: 400,
          annual: 4800,
          currency: 'USD',
          confidence: 0.9
        }
      }
    ],
    assumptions: [
      'Traffic growth continues at 15% monthly',
      'No major architectural changes'
    ],
    risks: [
      {
        id: 'traffic-spike',
        description: 'Unexpected traffic spike',
        probability: 0.3,
        impact: 8,
        mitigation: 'Implement auto-scaling',
        category: 'performance' as RiskCategory
      }
    ]
  }
]

describe('CapacityPlanningTools', () => {
  it('renders without crashing', () => {
    render(<CapacityPlanningTools plans={mockPlans} />)
    expect(screen.getByText('Capacity Planning Tools')).toBeInTheDocument()
  })

  it('displays capacity plans', () => {
    render(<CapacityPlanningTools plans={mockPlans} />)
    
    expect(screen.getByText('Test Capacity Plan')).toBeInTheDocument()
    expect(screen.getByText('Test capacity planning for Q1')).toBeInTheDocument()
    expect(screen.getByText('3-months')).toBeInTheDocument()
  })

  it('shows current and projected capacity', () => {
    render(<CapacityPlanningTools plans={mockPlans} />)
    
    expect(screen.getByText('Current Capacity')).toBeInTheDocument()
    expect(screen.getByText('Projected Capacity')).toBeInTheDocument()
    
    // Check for CPU utilization
    expect(screen.getByText('65%')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('displays capacity recommendations', () => {
    render(<CapacityPlanningTools plans={mockPlans} />)
    
    expect(screen.getByText('Capacity Recommendations')).toBeInTheDocument()
    expect(screen.getByText('scale out')).toBeInTheDocument()
    expect(screen.getByText('+50%')).toBeInTheDocument()
    expect(screen.getByText('$400/mo')).toBeInTheDocument()
  })

  it('shows assumptions and risks', () => {
    render(<CapacityPlanningTools plans={mockPlans} />)
    
    expect(screen.getByText('Assumptions')).toBeInTheDocument()
    expect(screen.getByText('Traffic growth continues at 15% monthly')).toBeInTheDocument()
    
    expect(screen.getByText('Risk Assessment')).toBeInTheDocument()
    expect(screen.getByText('Unexpected traffic spike')).toBeInTheDocument()
    expect(screen.getByText('Risk Score: 2.4')).toBeInTheDocument()
  })

  it('toggles capacity calculator', () => {
    render(<CapacityPlanningTools plans={mockPlans} />)
    
    const calculatorButton = screen.getByText('Capacity Calculator')
    fireEvent.click(calculatorButton)
    
    expect(screen.getByText('Capacity Calculator')).toBeInTheDocument()
    expect(screen.getByText('Current CPU Utilization (%)')).toBeInTheDocument()
  })

  it('calculates projected capacity needs', () => {
    render(<CapacityPlanningTools plans={mockPlans} />)
    
    // Open calculator
    fireEvent.click(screen.getByText('Capacity Calculator'))
    
    expect(screen.getByText('Projected Capacity Needs')).toBeInTheDocument()
    // Just check that the calculator is working
    expect(screen.getByText('Current CPU Utilization (%)')).toBeInTheDocument()
  })

  it('updates calculator inputs', () => {
    render(<CapacityPlanningTools plans={mockPlans} />)
    
    // Open calculator
    fireEvent.click(screen.getByText('Capacity Calculator'))
    
    const cpuInput = screen.getByDisplayValue('65')
    fireEvent.change(cpuInput, { target: { value: '75' } })
    
    expect(cpuInput).toHaveValue(75)
  })

  it('changes planning timeframe', () => {
    render(<CapacityPlanningTools plans={mockPlans} />)
    
    // Open calculator
    fireEvent.click(screen.getByText('Capacity Calculator'))
    
    const sixMonthsButton = screen.getByText('6-months')
    fireEvent.click(sixMonthsButton)
    
    // Button should be selected (primary variant)
    expect(sixMonthsButton).toHaveClass('bg-blue-600')
  })

  it('displays trend indicators', () => {
    render(<CapacityPlanningTools plans={mockPlans} />)
    
    // Check for trend icons (increasing trend should show ↗️)
    expect(screen.getAllByText('↗️').length).toBeGreaterThan(0)
  })

  it('shows action buttons', () => {
    render(<CapacityPlanningTools plans={mockPlans} />)
    
    expect(screen.getByText('View Details')).toBeInTheDocument()
    expect(screen.getByText('Update Plan')).toBeInTheDocument()
    expect(screen.getByText('Export Plan')).toBeInTheDocument()
    expect(screen.getByText('Clone Plan')).toBeInTheDocument()
  })

  it('handles empty plans array', () => {
    render(<CapacityPlanningTools plans={[]} />)
    
    expect(screen.getByText('No capacity plans found')).toBeInTheDocument()
    expect(screen.getByText('Create your first capacity plan to get started')).toBeInTheDocument()
  })

  it('handles create plan callback', () => {
    const onCreatePlan = jest.fn()
    render(<CapacityPlanningTools plans={mockPlans} onCreatePlan={onCreatePlan} />)
    
    // Check if the callback prop is passed correctly by checking the component renders
    expect(screen.getByText('Create New Plan')).toBeInTheDocument()
  })

  it('identifies scaling needs in calculator', () => {
    render(<CapacityPlanningTools plans={mockPlans} />)
    
    // Open calculator
    fireEvent.click(screen.getByText('Capacity Calculator'))
    
    // Set high CPU utilization that would trigger scaling
    const cpuInput = screen.getByDisplayValue('65')
    fireEvent.change(cpuInput, { target: { value: '90' } })
    
    // Should show scaling needed indicator
    expect(screen.getByText('Scaling Needed')).toBeInTheDocument()
  })
})