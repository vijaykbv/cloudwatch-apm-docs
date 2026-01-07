'use client'

import React, { useState, useCallback, useEffect } from 'react'

interface ValidationCheck {
  id: string
  category: 'functionality' | 'performance' | 'data-integrity' | 'monitoring'
  name: string
  description: string
  automated: boolean
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning'
  result?: string
  details?: string
  lastRun?: Date
  duration?: string
}

interface MonitoringMetric {
  id: string
  name: string
  description: string
  currentValue: number
  baselineValue: number
  threshold: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
}

interface MonitoringValidationProps {
  onValidationComplete?: (results: ValidationCheck[]) => void
  className?: string
}

const VALIDATION_CHECKS: ValidationCheck[] = [
  {
    id: 'apm-data-collection',
    category: 'functionality',
    name: 'APM Data Collection',
    description: 'Verify that CloudWatch APM is collecting traces, metrics, and logs',
    automated: true,
    status: 'pending'
  },
  {
    id: 'service-discovery',
    category: 'functionality',
    name: 'Service Discovery',
    description: 'Confirm all services are properly discovered and mapped',
    automated: true,
    status: 'pending'
  },
  {
    id: 'distributed-tracing',
    category: 'functionality',
    name: 'Distributed Tracing',
    description: 'Validate end-to-end trace propagation across services',
    automated: true,
    status: 'pending'
  },
  {
    id: 'alert-functionality',
    category: 'monitoring',
    name: 'Alert Functionality',
    description: 'Test that alerts are triggered correctly and notifications are sent',
    automated: false,
    status: 'pending'
  },
  {
    id: 'dashboard-accuracy',
    category: 'monitoring',
    name: 'Dashboard Accuracy',
    description: 'Verify dashboard metrics match expected values',
    automated: false,
    status: 'pending'
  },
  {
    id: 'performance-baseline',
    category: 'performance',
    name: 'Performance Baseline',
    description: 'Compare application performance before and after APM deployment',
    automated: true,
    status: 'pending'
  },
  {
    id: 'resource-utilization',
    category: 'performance',
    name: 'Resource Utilization',
    description: 'Monitor CPU, memory, and network impact of APM agent',
    automated: true,
    status: 'pending'
  },
  {
    id: 'data-consistency',
    category: 'data-integrity',
    name: 'Data Consistency',
    description: 'Compare metrics between old and new APM systems',
    automated: false,
    status: 'pending'
  },
  {
    id: 'data-completeness',
    category: 'data-integrity',
    name: 'Data Completeness',
    description: 'Ensure no data loss during migration',
    automated: true,
    status: 'pending'
  },
  {
    id: 'error-tracking',
    category: 'functionality',
    name: 'Error Tracking',
    description: 'Verify error detection and reporting functionality',
    automated: true,
    status: 'pending'
  }
]

const MONITORING_METRICS: MonitoringMetric[] = [
  {
    id: 'response-time',
    name: 'Average Response Time',
    description: 'Average response time across all services',
    currentValue: 245,
    baselineValue: 230,
    threshold: 300,
    unit: 'ms',
    status: 'normal',
    trend: 'up'
  },
  {
    id: 'error-rate',
    name: 'Error Rate',
    description: 'Percentage of requests resulting in errors',
    currentValue: 0.8,
    baselineValue: 0.5,
    threshold: 2.0,
    unit: '%',
    status: 'warning',
    trend: 'up'
  },
  {
    id: 'throughput',
    name: 'Request Throughput',
    description: 'Number of requests processed per minute',
    currentValue: 1250,
    baselineValue: 1200,
    threshold: 1000,
    unit: 'req/min',
    status: 'normal',
    trend: 'up'
  },
  {
    id: 'cpu-utilization',
    name: 'CPU Utilization',
    description: 'Average CPU usage across application instances',
    currentValue: 68,
    baselineValue: 65,
    threshold: 80,
    unit: '%',
    status: 'normal',
    trend: 'up'
  },
  {
    id: 'memory-utilization',
    name: 'Memory Utilization',
    description: 'Average memory usage across application instances',
    currentValue: 72,
    baselineValue: 70,
    threshold: 85,
    unit: '%',
    status: 'normal',
    trend: 'stable'
  },
  {
    id: 'apm-overhead',
    name: 'APM Agent Overhead',
    description: 'Additional resource usage from APM instrumentation',
    currentValue: 3.2,
    baselineValue: 0,
    threshold: 5.0,
    unit: '%',
    status: 'normal',
    trend: 'stable'
  }
]

export const MonitoringValidation: React.FC<MonitoringValidationProps> = ({
  onValidationComplete,
  className = ''
}) => {
  const [checks, setChecks] = useState<ValidationCheck[]>(VALIDATION_CHECKS)
  const [metrics, setMetrics] = useState<MonitoringMetric[]>(MONITORING_METRICS)
  const [activeTab, setActiveTab] = useState<'validation' | 'monitoring'>('validation')
  const [isRunningValidation, setIsRunningValidation] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const runValidationCheck = useCallback(async (checkId: string) => {
    setChecks(prev => prev.map(check => 
      check.id === checkId 
        ? { ...check, status: 'running', lastRun: new Date() }
        : check
    ))

    // Simulate validation check
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

    const success = Math.random() > 0.2 // 80% success rate
    const hasWarning = Math.random() > 0.7 // 30% warning rate

    setChecks(prev => prev.map(check => 
      check.id === checkId 
        ? { 
            ...check, 
            status: success ? (hasWarning ? 'warning' : 'passed') : 'failed',
            result: success 
              ? (hasWarning ? 'Passed with warnings' : 'Passed successfully')
              : 'Failed - requires attention',
            details: success 
              ? (hasWarning ? 'Minor configuration issues detected' : 'All checks completed successfully')
              : 'Critical issues found that need to be resolved',
            duration: `${Math.floor(Math.random() * 30 + 10)}s`
          }
        : check
    ))
  }, [])

  const runAllValidations = useCallback(async () => {
    setIsRunningValidation(true)
    
    for (const check of checks.filter(c => c.automated)) {
      await runValidationCheck(check.id)
      // Small delay between checks
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsRunningValidation(false)
    
    const updatedChecks = checks.map(check => {
      if (check.automated) {
        const success = Math.random() > 0.2
        const hasWarning = Math.random() > 0.7
        return {
          ...check,
          status: success ? (hasWarning ? 'warning' : 'passed') : 'failed',
          result: success 
            ? (hasWarning ? 'Passed with warnings' : 'Passed successfully')
            : 'Failed - requires attention',
          lastRun: new Date(),
          duration: `${Math.floor(Math.random() * 30 + 10)}s`
        }
      }
      return check
    })
    
    onValidationComplete?.(updatedChecks as ValidationCheck[])
  }, [checks, runValidationCheck, onValidationComplete])

  const updateMetrics = useCallback(() => {
    setMetrics(prev => prev.map(metric => {
      const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
      const newValue = Math.max(0, metric.currentValue * (1 + variation))
      
      let status: 'normal' | 'warning' | 'critical' = 'normal'
      if (newValue > metric.threshold) {
        status = 'critical'
      } else if (newValue > metric.threshold * 0.8) {
        status = 'warning'
      }
      
      const trend = newValue > metric.currentValue ? 'up' : 
                   newValue < metric.currentValue ? 'down' : 'stable'
      
      return {
        ...metric,
        currentValue: Math.round(newValue * 100) / 100,
        status,
        trend
      }
    }))
  }, [])

  useEffect(() => {
    const interval = setInterval(updateMetrics, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [updateMetrics])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'running':
        return 'text-blue-600 bg-blue-100'
      case 'pending':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️'
      case 'down':
        return '↘️'
      case 'stable':
        return '➡️'
      default:
        return '➡️'
    }
  }

  const filteredChecks = selectedCategory === 'all' 
    ? checks 
    : checks.filter(check => check.category === selectedCategory)

  const validationSummary = {
    total: checks.length,
    passed: checks.filter(c => c.status === 'passed').length,
    failed: checks.filter(c => c.status === 'failed').length,
    warning: checks.filter(c => c.status === 'warning').length,
    pending: checks.filter(c => c.status === 'pending').length
  }

  const renderValidationTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{validationSummary.total}</div>
          <div className="text-sm text-gray-800">Total Checks</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{validationSummary.passed}</div>
          <div className="text-sm text-green-800">Passed</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{validationSummary.failed}</div>
          <div className="text-sm text-red-800">Failed</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{validationSummary.warning}</div>
          <div className="text-sm text-yellow-800">Warnings</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{validationSummary.pending}</div>
          <div className="text-sm text-gray-800">Pending</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Categories</option>
            <option value="functionality">Functionality</option>
            <option value="performance">Performance</option>
            <option value="data-integrity">Data Integrity</option>
            <option value="monitoring">Monitoring</option>
          </select>
        </div>
        
        <button
          onClick={runAllValidations}
          disabled={isRunningValidation}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isRunningValidation ? 'Running Validations...' : 'Run All Automated Checks'}
        </button>
      </div>

      {/* Validation Checks */}
      <div className="space-y-3">
        {filteredChecks.map(check => (
          <div key={check.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-medium">{check.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(check.status)}`}>
                    {check.status}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{check.category}</span>
                  {!check.automated && (
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Manual</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{check.description}</p>
                
                {check.result && (
                  <div className="text-sm">
                    <span className="font-medium">Result: </span>
                    <span className={check.status === 'failed' ? 'text-red-600' : 
                                   check.status === 'warning' ? 'text-yellow-600' : 'text-green-600'}>
                      {check.result}
                    </span>
                  </div>
                )}
                
                {check.details && (
                  <div className="text-sm text-gray-600 mt-1">
                    {check.details}
                  </div>
                )}
                
                {check.lastRun && (
                  <div className="text-xs text-gray-500 mt-2">
                    Last run: {check.lastRun.toLocaleString()}
                    {check.duration && ` (${check.duration})`}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {check.automated && (
                  <button
                    onClick={() => runValidationCheck(check.id)}
                    disabled={check.status === 'running'}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    {check.status === 'running' ? 'Running...' : 'Run Check'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderMonitoringTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Real-time Monitoring Metrics</h3>
        <p className="text-gray-600">
          Monitor key performance indicators during and after the migration process.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map(metric => (
          <div key={metric.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-medium">{metric.name}</h4>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
              <span className="text-lg">{getTrendIcon(metric.trend)}</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-2xl font-bold ${getMetricStatusColor(metric.status)}`}>
                    {metric.currentValue}
                  </span>
                  <span className="text-gray-500">{metric.unit}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Baseline: {metric.baselineValue} {metric.unit}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    metric.status === 'critical' ? 'bg-red-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (metric.currentValue / metric.threshold) * 100)}%` 
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>Threshold: {metric.threshold} {metric.unit}</span>
              </div>
              
              <div className={`text-sm font-medium ${getMetricStatusColor(metric.status)}`}>
                {metric.status === 'normal' && '✓ Normal'}
                {metric.status === 'warning' && '⚠️ Warning'}
                {metric.status === 'critical' && '🚨 Critical'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Monitoring Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Monitor metrics continuously for at least 24 hours after migration</li>
          <li>• Set up alerts for metrics that exceed baseline by more than 20%</li>
          <li>• Compare performance during peak and off-peak hours</li>
          <li>• Document any anomalies and their potential causes</li>
        </ul>
      </div>
    </div>
  )

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold mb-2">Migration Monitoring & Validation</h1>
          <p className="text-gray-600">
            Validate your CloudWatch APM migration and monitor system performance to ensure a successful transition.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('validation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'validation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Validation Checks
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monitoring'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Performance Monitoring
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'validation' && renderValidationTab()}
          {activeTab === 'monitoring' && renderMonitoringTab()}
        </div>
      </div>
    </div>
  )
}