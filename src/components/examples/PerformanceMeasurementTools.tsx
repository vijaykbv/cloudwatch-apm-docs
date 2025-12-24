'use client'

import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface PerformanceTool {
  id: string
  name: string
  category: 'profiling' | 'monitoring' | 'benchmarking' | 'analysis'
  description: string
  useCase: string
  features: string[]
  integration: string
  codeExample: string
  metrics: string[]
  platforms: string[]
  documentation: string
}

interface PerformanceMeasurementToolsProps {
  tools: PerformanceTool[]
  className?: string
}

const categoryLabels = {
  profiling: 'Code Profiling',
  monitoring: 'Real-time Monitoring',
  benchmarking: 'Performance Benchmarking',
  analysis: 'Performance Analysis'
}

const categoryColors = {
  profiling: 'bg-purple-100 text-purple-800 border-purple-200',
  monitoring: 'bg-blue-100 text-blue-800 border-blue-200',
  benchmarking: 'bg-green-100 text-green-800 border-green-200',
  analysis: 'bg-orange-100 text-orange-800 border-orange-200'
}

export function PerformanceMeasurementTools({ tools, className = '' }: PerformanceMeasurementToolsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedTool, setExpandedTool] = useState<string | null>(null)

  const categories = Array.from(new Set(tools.map(tool => tool.category)))

  const filteredTools = tools.filter(tool => 
    selectedCategory === 'all' || tool.category === selectedCategory
  )

  const toggleExpanded = (toolId: string) => {
    setExpandedTool(expandedTool === toolId ? null : toolId)
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Measurement Tools</h2>
        <p className="text-gray-600">
          Discover tools and techniques for measuring and analyzing application performance with CloudWatch APM.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Tools
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {categoryLabels[category as keyof typeof categoryLabels]}
          </button>
        ))}
      </div>

      {/* Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTools.map((tool) => (
          <Card key={tool.id} className="overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[tool.category]}`}>
                      {categoryLabels[tool.category]}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{tool.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExpanded(tool.id)}
                >
                  {expandedTool === tool.id ? 'Less' : 'More'}
                </Button>
              </div>

              {/* Use Case */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Best For:</h4>
                <p className="text-gray-600 text-sm">{tool.useCase}</p>
              </div>

              {/* Key Features */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 text-sm mb-2">Key Features:</h4>
                <ul className="space-y-1">
                  {tool.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">•</span>
                      {feature}
                    </li>
                  ))}
                  {tool.features.length > 3 && !expandedTool && (
                    <li className="text-sm text-gray-500">
                      +{tool.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>

              {/* Platforms */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 text-sm mb-2">Supported Platforms:</h4>
                <div className="flex flex-wrap gap-1">
                  {tool.platforms.map((platform, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedTool === tool.id && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  {/* All Features */}
                  {tool.features.length > 3 && (
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-2">All Features:</h4>
                      <ul className="space-y-1">
                        {tool.features.slice(3).map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-green-500 mr-2 mt-0.5">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Integration */}
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-2">CloudWatch APM Integration:</h4>
                    <p className="text-gray-600 text-sm">{tool.integration}</p>
                  </div>

                  {/* Metrics */}
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Key Metrics:</h4>
                    <div className="flex flex-wrap gap-1">
                      {tool.metrics.map((metric, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Code Example */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">Implementation Example:</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyCode(tool.codeExample)}
                      >
                        Copy
                      </Button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-xs">
                      <code>{tool.codeExample}</code>
                    </pre>
                  </div>

                  {/* Documentation Link */}
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(tool.documentation, '_blank')}
                    >
                      View Documentation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">No tools found</h3>
            <p>Try selecting a different category to see available tools.</p>
          </div>
        </Card>
      )}
    </div>
  )
}

// Sample performance tools data
export const performanceTools: PerformanceTool[] = [
  {
    id: 'nodejs-profiler',
    name: 'Node.js Built-in Profiler',
    category: 'profiling',
    description: 'Built-in CPU and memory profiling capabilities for Node.js applications',
    useCase: 'Identifying performance bottlenecks and memory leaks in Node.js applications',
    features: [
      'CPU profiling with flame graphs',
      'Memory heap snapshots',
      'Event loop monitoring',
      'V8 engine metrics',
      'Zero-dependency profiling',
      'Production-safe profiling'
    ],
    integration: 'Integrates with CloudWatch APM through custom metrics and X-Ray segments for profiling data correlation',
    codeExample: `// Enable profiling with OpenTelemetry integration
const { trace, metrics } = require('@opentelemetry/api');
const inspector = require('inspector');

class PerformanceProfiler {
  constructor() {
    this.meter = metrics.getMeter('performance-profiler');
    this.cpuUsageGauge = this.meter.createObservableGauge('cpu_usage_percent');
    this.memoryUsageGauge = this.meter.createObservableGauge('memory_usage_bytes');
  }

  startProfiling() {
    const session = new inspector.Session();
    session.connect();
    
    // Start CPU profiling
    session.post('Profiler.enable');
    session.post('Profiler.start');
    
    // Monitor memory usage
    this.memoryUsageGauge.addCallback((result) => {
      const memUsage = process.memoryUsage();
      result.observe(memUsage.heapUsed, { type: 'heap_used' });
      result.observe(memUsage.heapTotal, { type: 'heap_total' });
    });

    return session;
  }

  async stopProfiling(session) {
    return new Promise((resolve) => {
      session.post('Profiler.stop', (err, { profile }) => {
        if (!err) {
          // Send profile data to CloudWatch as custom metric
          const span = trace.getActiveSpan();
          span?.setAttributes({
            'profiling.samples': profile.samples.length,
            'profiling.duration': profile.endTime - profile.startTime
          });
        }
        session.disconnect();
        resolve(profile);
      });
    });
  }
}`,
    metrics: ['CPU Usage', 'Memory Usage', 'Event Loop Lag', 'GC Frequency', 'Heap Size'],
    platforms: ['Node.js', 'Linux', 'macOS', 'Windows'],
    documentation: 'https://nodejs.org/api/inspector.html'
  },
  {
    id: 'python-cprofile',
    name: 'Python cProfile',
    category: 'profiling',
    description: 'Built-in deterministic profiling tool for Python applications',
    useCase: 'Analyzing function call performance and identifying slow code paths in Python applications',
    features: [
      'Function-level profiling',
      'Call count tracking',
      'Cumulative time measurement',
      'Statistical profiling',
      'Integration with pstats',
      'Minimal overhead'
    ],
    integration: 'Exports profiling data as custom CloudWatch metrics and correlates with X-Ray traces',
    codeExample: `import cProfile
import pstats
import io
from opentelemetry import trace, metrics

class PythonProfiler:
    def __init__(self):
        self.meter = metrics.get_meter('python-profiler')
        self.function_calls_counter = self.meter.create_counter('function_calls_total')
        self.execution_time_histogram = self.meter.create_histogram('function_execution_time')
    
    def profile_function(self, func):
        def wrapper(*args, **kwargs):
            pr = cProfile.Profile()
            pr.enable()
            
            span = trace.get_tracer(__name__).start_span(f'profile_{func.__name__}')
            
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                pr.disable()
                
                # Analyze profiling results
                s = io.StringIO()
                ps = pstats.Stats(pr, stream=s)
                ps.sort_stats('cumulative')
                
                # Extract metrics
                stats = ps.get_stats_profile()
                total_calls = sum(stat.callcount for stat in stats.values())
                
                # Send to CloudWatch
                self.function_calls_counter.add(total_calls, {
                    'function': func.__name__
                })
                
                span.set_attributes({
                    'profiling.total_calls': total_calls,
                    'profiling.function': func.__name__
                })
                span.end()
        
        return wrapper`,
    metrics: ['Function Calls', 'Execution Time', 'Memory Allocation', 'Call Stack Depth'],
    platforms: ['Python', 'Linux', 'macOS', 'Windows'],
    documentation: 'https://docs.python.org/3/library/profile.html'
  },
  {
    id: 'load-testing-artillery',
    name: 'Artillery Load Testing',
    category: 'benchmarking',
    description: 'Modern load testing toolkit for measuring application performance under load',
    useCase: 'Performance testing and benchmarking applications with realistic load patterns',
    features: [
      'HTTP/WebSocket load testing',
      'Realistic user scenarios',
      'Metrics collection',
      'CI/CD integration',
      'Real-time monitoring',
      'Custom plugins support'
    ],
    integration: 'Sends load testing metrics to CloudWatch and correlates with APM data during tests',
    codeExample: `# artillery-config.yml
config:
  target: 'https://api.example.com'
  phases:
    - duration: 60
      arrivalRate: 10
  plugins:
    cloudwatch:
      region: us-west-2
      namespace: 'LoadTesting/Artillery'

scenarios:
  - name: 'API Load Test'
    flow:
      - get:
          url: '/api/users'
          capture:
            - json: '$.length'
              as: 'userCount'
      - post:
          url: '/api/users'
          json:
            name: 'Test User'
            email: 'test@example.com'
      - think: 2

# Custom CloudWatch plugin
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

module.exports = {
  Plugin: ArtilleryCloudWatchPlugin
};

function ArtilleryCloudWatchPlugin(script, events) {
  events.on('stats', (stats) => {
    const params = {
      Namespace: 'LoadTesting/Artillery',
      MetricData: [
        {
          MetricName: 'RequestsPerSecond',
          Value: stats.requestsPerSec,
          Unit: 'Count/Second',
          Timestamp: new Date()
        },
        {
          MetricName: 'ResponseTime',
          Value: stats.latency.median,
          Unit: 'Milliseconds',
          Timestamp: new Date()
        }
      ]
    };
    
    cloudwatch.putMetricData(params).promise();
  });
}`,
    metrics: ['Requests/sec', 'Response Time', 'Error Rate', 'Throughput', 'Concurrent Users'],
    platforms: ['Node.js', 'Docker', 'AWS', 'CI/CD'],
    documentation: 'https://artillery.io/docs/'
  }
]