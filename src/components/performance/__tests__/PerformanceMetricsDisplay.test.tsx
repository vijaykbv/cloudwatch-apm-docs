import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PerformanceMetricsDisplay from '../PerformanceMetricsDisplay'
import { PerformanceBenchmark, BenchmarkCategory } from '../../../types/performance'

// Mock data for testing
const mockBenchmarks: PerformanceBenchmark[] = [
  {
    id: 'test-throughput',
    name: 'Test Throughput Benchmark',
    description: 'Test benchmark for throughput',
    category: 'throughput' as BenchmarkCategory,
    metrics: [
      {
        id: 'requests-per-second',
        name: 'Requests Per Second',
        description: 'Number of requests processed per second',
        unit: 'requests/second',
        value: 1000,
        timestamp: new Date('2024-01-01'),
        tags: { environment: 'test' },
        context: 'production'
      }
    ],
    baseline: {
      value: 1000,
      confidence: 0.95,
      sampleSize: 100,
      environment: 'test',
      version: '1.0.0',
      date: new Date('2024-01-01')
    },
    thresholds: [
      {
        metric: 'requests-per-second',
        warning: 800,
        critical: 500,
        direction: 'below',
        description: 'Throughput degradation threshold'
      }
    ],
    testConfiguration: {
      environment: 'test',
      instanceType: 'm5.large',
      region: 'us-east-1',
      duration: 300,
      concurrency: 10,
      dataSize: '1KB',
      parameters: {}
    },
    lastUpdated: new Date('2024-01-01')
  }
]

describe('PerformanceMetricsDisplay', () => {
  it('renders without crashing', () => {
    render(<PerformanceMetricsDisplay benchmarks={mockBenchmarks} />)
    expect(screen.getByText('Test Throughput Benchmark')).toBeInTheDocument()
  })

  it('displays benchmark metrics correctly', () => {
    render(<PerformanceMetricsDisplay benchmarks={mockBenchmarks} />)
    
    expect(screen.getByText('Requests Per Second')).toBeInTheDocument()
    expect(screen.getByText('1,000 requests/second')).toBeInTheDocument()
    expect(screen.getByText('Number of requests processed per second')).toBeInTheDocument()
  })

  it('shows category filter buttons', () => {
    render(<PerformanceMetricsDisplay benchmarks={mockBenchmarks} />)
    
    expect(screen.getByText('All Categories')).toBeInTheDocument()
    // Use getByRole to target the button specifically
    expect(screen.getByRole('button', { name: 'throughput' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'latency' })).toBeInTheDocument()
  })

  it('filters benchmarks by category', () => {
    const onCategoryChange = jest.fn()
    render(
      <PerformanceMetricsDisplay 
        benchmarks={mockBenchmarks} 
        onCategoryChange={onCategoryChange}
      />
    )
    
    fireEvent.click(screen.getByRole('button', { name: 'throughput' }))
    expect(onCategoryChange).toHaveBeenCalledWith('throughput')
  })

  it('calculates performance score correctly', () => {
    render(<PerformanceMetricsDisplay benchmarks={mockBenchmarks} />)
    
    // Should show 100% since metric value (1000) is above warning threshold (800)
    expect(screen.getByText('Performance Score')).toBeInTheDocument()
    // Use more specific selector for the performance score
    const performanceScoreElement = screen.getByText('Performance Score').previousElementSibling
    expect(performanceScoreElement).toHaveTextContent('100')
  })

  it('displays baseline information', () => {
    render(<PerformanceMetricsDisplay benchmarks={mockBenchmarks} />)
    
    expect(screen.getByText('Baseline')).toBeInTheDocument()
    expect(screen.getByText('1,000')).toBeInTheDocument()
    expect(screen.getByText('95.0%')).toBeInTheDocument()
    // Use more specific selector for sample size
    expect(screen.getByText('Sample Size:')).toBeInTheDocument()
  })

  it('shows test configuration details', () => {
    render(<PerformanceMetricsDisplay benchmarks={mockBenchmarks} />)
    
    expect(screen.getByText('Test Configuration')).toBeInTheDocument()
    expect(screen.getByText('m5.large')).toBeInTheDocument()
    expect(screen.getByText('us-east-1')).toBeInTheDocument()
    expect(screen.getByText('300s')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('handles empty benchmarks array', () => {
    render(<PerformanceMetricsDisplay benchmarks={[]} />)
    
    expect(screen.getByText('No benchmarks found')).toBeInTheDocument()
    expect(screen.getByText('No benchmarks available')).toBeInTheDocument()
  })

  it('toggles comparison mode', () => {
    render(<PerformanceMetricsDisplay benchmarks={mockBenchmarks} showComparison={true} />)
    
    const comparisonButton = screen.getByText('Compare Benchmarks')
    fireEvent.click(comparisonButton)
    
    expect(screen.getByText('Exit Comparison')).toBeInTheDocument()
  })

  it('displays metric tags', () => {
    render(<PerformanceMetricsDisplay benchmarks={mockBenchmarks} />)
    
    expect(screen.getByText('environment: test')).toBeInTheDocument()
  })

  it('shows action buttons', () => {
    render(<PerformanceMetricsDisplay benchmarks={mockBenchmarks} />)
    
    expect(screen.getByText('View Details')).toBeInTheDocument()
    expect(screen.getByText('Export Data')).toBeInTheDocument()
    expect(screen.getByText('Run Test')).toBeInTheDocument()
  })
})