'use client'

import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface BestPractice {
  id: string
  title: string
  category: 'instrumentation' | 'performance' | 'security' | 'deployment' | 'monitoring' | 'troubleshooting'
  description: string
  problem: string
  solution: string
  implementation: string
  benefits: string[]
  considerations: string[]
  relatedPatterns: string[]
  codeExample?: string
  tags: string[]
}

interface BestPracticesLibraryProps {
  practices: BestPractice[]
  className?: string
}

const categoryLabels = {
  instrumentation: 'Instrumentation',
  performance: 'Performance',
  security: 'Security',
  deployment: 'Deployment',
  monitoring: 'Monitoring',
  troubleshooting: 'Troubleshooting'
}

const categoryColors = {
  instrumentation: 'bg-blue-100 text-blue-800 border-blue-200',
  performance: 'bg-green-100 text-green-800 border-green-200',
  security: 'bg-red-100 text-red-800 border-red-200',
  deployment: 'bg-purple-100 text-purple-800 border-purple-200',
  monitoring: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  troubleshooting: 'bg-orange-100 text-orange-800 border-orange-200'
}

export function BestPracticesLibrary({ practices, className = '' }: BestPracticesLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedPractice, setExpandedPractice] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const categories = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>

  const filteredPractices = practices.filter(practice => {
    const matchesCategory = selectedCategory === 'all' || practice.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      practice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practice.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const toggleExpanded = (practiceId: string) => {
    setExpandedPractice(expandedPractice === practiceId ? null : practiceId)
  }

  const copyCodeExample = async (code: string) => {
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Best Practices & Patterns</h2>
        <p className="text-gray-600">
          Learn proven patterns and best practices for implementing CloudWatch APM effectively.
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Search best practices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredPractices.length} best practice{filteredPractices.length !== 1 ? 's' : ''}
      </div>

      {/* Best Practices */}
      <div className="space-y-4">
        {filteredPractices.map((practice) => (
          <Card key={practice.id} className="overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{practice.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[practice.category]}`}>
                      {categoryLabels[practice.category]}
                    </span>
                  </div>
                  <p className="text-gray-600">{practice.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExpanded(practice.id)}
                >
                  {expandedPractice === practice.id ? 'Show Less' : 'Show Details'}
                </Button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {practice.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Expanded Content */}
              {expandedPractice === practice.id && (
                <div className="space-y-6 pt-4 border-t border-gray-200">
                  {/* Problem */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Problem</h4>
                    <p className="text-gray-600 text-sm">{practice.problem}</p>
                  </div>

                  {/* Solution */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Solution</h4>
                    <p className="text-gray-600 text-sm">{practice.solution}</p>
                  </div>

                  {/* Implementation */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Implementation</h4>
                    <p className="text-gray-600 text-sm">{practice.implementation}</p>
                  </div>

                  {/* Code Example */}
                  {practice.codeExample && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Code Example</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyCodeExample(practice.codeExample!)}
                        >
                          Copy
                        </Button>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{practice.codeExample}</code>
                      </pre>
                    </div>
                  )}

                  {/* Benefits */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Benefits</h4>
                    <ul className="space-y-2">
                      {practice.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="text-green-500 mr-2 mt-0.5">✓</span>
                          <span className="text-gray-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Considerations */}
                  {practice.considerations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Considerations</h4>
                      <ul className="space-y-2">
                        {practice.considerations.map((consideration, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <span className="text-yellow-500 mr-2 mt-0.5">⚠</span>
                            <span className="text-gray-600">{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Related Patterns */}
                  {practice.relatedPatterns.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Related Patterns</h4>
                      <div className="flex flex-wrap gap-2">
                        {practice.relatedPatterns.map((pattern, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredPractices.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">No best practices found</h3>
            <p>Try adjusting your search terms or category filter.</p>
          </div>
        </Card>
      )}
    </div>
  )
}

// Sample best practices data
export const bestPractices: BestPractice[] = [
  {
    id: 'structured-logging',
    title: 'Structured Logging for Better Observability',
    category: 'instrumentation',
    description: 'Implement structured logging to improve log searchability and correlation with traces',
    problem: 'Unstructured logs make it difficult to search, filter, and correlate log entries with distributed traces, leading to longer debugging times.',
    solution: 'Use structured logging with consistent field names and JSON format to enable better log analysis and correlation.',
    implementation: 'Configure logging libraries to output JSON format with standardized fields like timestamp, level, service, trace_id, and span_id.',
    benefits: [
      'Improved log searchability and filtering',
      'Better correlation between logs and traces',
      'Easier automated log analysis',
      'Consistent log format across services',
      'Enhanced debugging capabilities'
    ],
    considerations: [
      'Increased log size due to JSON formatting',
      'Need to update existing log parsing tools',
      'Training team on new log format',
      'Potential performance impact on high-volume logging'
    ],
    relatedPatterns: ['Distributed Tracing', 'Correlation IDs', 'Log Aggregation'],
    codeExample: `// Good: Structured logging with correlation
const logger = require('winston');

logger.info('User login attempt', {
  user_id: userId,
  email: userEmail,
  ip_address: req.ip,
  trace_id: span.spanContext().traceId,
  span_id: span.spanContext().spanId,
  timestamp: new Date().toISOString(),
  service: 'auth-service'
});

// Bad: Unstructured logging
console.log(\`User \${userEmail} login attempt from \${req.ip}\`);`,
    tags: ['logging', 'observability', 'debugging', 'correlation']
  },
  {
    id: 'circuit-breaker-monitoring',
    title: 'Circuit Breaker Pattern with APM Integration',
    category: 'performance',
    description: 'Implement circuit breaker pattern with comprehensive monitoring to prevent cascade failures',
    problem: 'Service failures can cascade through the system, causing widespread outages when dependent services become unavailable.',
    solution: 'Implement circuit breaker pattern with APM monitoring to track circuit state changes and failure patterns.',
    implementation: 'Use circuit breaker libraries with custom metrics to track open/closed states, failure rates, and recovery attempts.',
    benefits: [
      'Prevents cascade failures',
      'Faster failure detection and recovery',
      'Improved system resilience',
      'Better visibility into service dependencies',
      'Automatic fallback mechanisms'
    ],
    considerations: [
      'Additional complexity in service calls',
      'Need to define appropriate failure thresholds',
      'Fallback strategy implementation required',
      'Monitoring overhead for circuit state tracking'
    ],
    relatedPatterns: ['Bulkhead Pattern', 'Timeout Pattern', 'Retry Pattern'],
    codeExample: `const CircuitBreaker = require('opossum');
const { trace, metrics } = require('@opentelemetry/api');

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

const breaker = new CircuitBreaker(callExternalService, options);

// Monitor circuit breaker state
const circuitStateGauge = metrics.getMeter('circuit-breaker')
  .createObservableGauge('circuit_breaker_state');

breaker.on('open', () => {
  circuitStateGauge.addCallback((result) => {
    result.observe(1, { service: 'external-api', state: 'open' });
  });
});

breaker.on('halfOpen', () => {
  circuitStateGauge.addCallback((result) => {
    result.observe(0.5, { service: 'external-api', state: 'half-open' });
  });
});`,
    tags: ['circuit-breaker', 'resilience', 'monitoring', 'performance']
  }
]