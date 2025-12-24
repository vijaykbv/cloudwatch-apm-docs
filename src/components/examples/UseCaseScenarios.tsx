'use client'

import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface UseCaseScenario {
  id: string
  title: string
  description: string
  businessContext: string
  technicalRequirements: string[]
  implementationSteps: string[]
  expectedOutcomes: string[]
  relatedApplications: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  tags: string[]
}

interface UseCaseScenariosProps {
  scenarios: UseCaseScenario[]
  className?: string
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200'
}

export function UseCaseScenarios({ scenarios, className = '' }: UseCaseScenariosProps) {
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  const filteredScenarios = scenarios.filter(scenario => 
    selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty
  )

  const toggleExpanded = (scenarioId: string) => {
    setExpandedScenario(expandedScenario === scenarioId ? null : scenarioId)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Use Case Scenarios</h2>
        <p className="text-gray-600">
          Explore real-world scenarios and implementation patterns for CloudWatch APM integration.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filter by difficulty:</label>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Scenarios */}
      <div className="space-y-4">
        {filteredScenarios.map((scenario) => (
          <Card key={scenario.id} className="overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{scenario.title}</h3>
                  <p className="text-gray-600">{scenario.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[scenario.difficulty]}`}>
                    {scenario.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">~{scenario.estimatedTime} hours</span>
                </div>
              </div>

              {/* Business Context */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Business Context</h4>
                <p className="text-gray-600 text-sm">{scenario.businessContext}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {scenario.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Expand/Collapse Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleExpanded(scenario.id)}
                className="mb-4"
              >
                {expandedScenario === scenario.id ? 'Show Less' : 'Show Details'}
              </Button>

              {/* Expanded Content */}
              {expandedScenario === scenario.id && (
                <div className="space-y-6 pt-4 border-t border-gray-200">
                  {/* Technical Requirements */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Technical Requirements</h4>
                    <ul className="space-y-2">
                      {scenario.technicalRequirements.map((req, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="text-blue-500 mr-2 mt-0.5">•</span>
                          <span className="text-gray-600">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Implementation Steps */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Implementation Steps</h4>
                    <ol className="space-y-3">
                      {scenario.implementationSteps.map((step, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-gray-600">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Expected Outcomes */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Expected Outcomes</h4>
                    <ul className="space-y-2">
                      {scenario.expectedOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="text-green-500 mr-2 mt-0.5">✓</span>
                          <span className="text-gray-600">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Related Applications */}
                  {scenario.relatedApplications.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Related Sample Applications</h4>
                      <div className="flex flex-wrap gap-2">
                        {scenario.relatedApplications.map((app, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                          >
                            {app}
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

      {filteredScenarios.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">No scenarios found</h3>
            <p>Try adjusting your difficulty filter to see more scenarios.</p>
          </div>
        </Card>
      )}
    </div>
  )
}

// Sample data for use case scenarios
export const useCaseScenarios: UseCaseScenario[] = [
  {
    id: 'microservices-migration',
    title: 'Microservices Migration with Distributed Tracing',
    description: 'Migrate a monolithic e-commerce application to microservices architecture with comprehensive observability',
    businessContext: 'A growing e-commerce company needs to scale their monolithic application by breaking it into microservices while maintaining visibility into system performance and user experience.',
    technicalRequirements: [
      'Existing monolithic application in Java/Spring Boot',
      'AWS infrastructure with ECS or EKS',
      'Database migration strategy',
      'Service mesh implementation (optional)',
      'Load balancer configuration',
      'CI/CD pipeline setup'
    ],
    implementationSteps: [
      'Analyze existing monolith to identify service boundaries',
      'Set up OpenTelemetry instrumentation in the monolith',
      'Extract first microservice (e.g., user service) with APM integration',
      'Implement distributed tracing between monolith and new service',
      'Set up service-to-service communication monitoring',
      'Create dashboards for cross-service visibility',
      'Implement error tracking and alerting',
      'Gradually extract additional services',
      'Monitor performance impact and optimize',
      'Decommission monolith components as services are extracted'
    ],
    expectedOutcomes: [
      'Complete visibility into distributed system performance',
      'Reduced mean time to detection (MTTD) for issues',
      'Improved system scalability and maintainability',
      'Better understanding of service dependencies',
      'Automated alerting for service health issues',
      'Performance baselines for future optimizations'
    ],
    relatedApplications: ['ecommerce-microservices', 'service-mesh-demo'],
    difficulty: 'advanced',
    estimatedTime: 40,
    tags: ['microservices', 'distributed-tracing', 'migration', 'java', 'spring-boot']
  },
  {
    id: 'serverless-monitoring',
    title: 'Serverless Application Monitoring',
    description: 'Implement comprehensive monitoring for a serverless application using AWS Lambda and API Gateway',
    businessContext: 'A startup is building a serverless-first application and needs to ensure reliability and performance visibility across Lambda functions, API Gateway, and other AWS services.',
    technicalRequirements: [
      'AWS Lambda functions in Node.js or Python',
      'API Gateway for REST endpoints',
      'DynamoDB for data storage',
      'S3 for file storage',
      'CloudWatch Logs access',
      'X-Ray tracing enabled'
    ],
    implementationSteps: [
      'Enable X-Ray tracing on API Gateway and Lambda functions',
      'Instrument Lambda functions with OpenTelemetry',
      'Set up custom metrics for business logic',
      'Configure CloudWatch alarms for error rates and latency',
      'Implement structured logging across all functions',
      'Create dashboards for API and function performance',
      'Set up distributed tracing for cross-service calls',
      'Implement cold start monitoring and optimization',
      'Configure automated alerting for critical issues'
    ],
    expectedOutcomes: [
      'Complete visibility into serverless application performance',
      'Proactive alerting for function errors and timeouts',
      'Cold start impact analysis and optimization',
      'Cost optimization through performance insights',
      'Improved debugging capabilities for distributed issues',
      'SLA monitoring and reporting'
    ],
    relatedApplications: ['serverless-api-demo', 'lambda-monitoring-toolkit'],
    difficulty: 'intermediate',
    estimatedTime: 16,
    tags: ['serverless', 'lambda', 'api-gateway', 'nodejs', 'python']
  },
  {
    id: 'legacy-integration',
    title: 'Legacy System Integration Monitoring',
    description: 'Add observability to legacy systems integration without modifying existing applications',
    businessContext: 'An enterprise needs to monitor interactions between modern cloud applications and legacy on-premises systems that cannot be easily modified.',
    technicalRequirements: [
      'Legacy systems with limited modification capability',
      'Network access between cloud and on-premises',
      'Proxy or gateway deployment capability',
      'Log aggregation infrastructure',
      'Network monitoring tools'
    ],
    implementationSteps: [
      'Deploy monitoring proxies at integration points',
      'Set up network-level tracing for legacy system calls',
      'Implement synthetic monitoring for critical legacy endpoints',
      'Configure log parsing for legacy system outputs',
      'Create correlation between modern and legacy system traces',
      'Set up health checks for legacy system availability',
      'Implement performance baselines for legacy integrations',
      'Configure alerting for integration failures'
    ],
    expectedOutcomes: [
      'Visibility into legacy system performance and availability',
      'Early detection of integration issues',
      'Performance impact analysis of legacy dependencies',
      'Improved troubleshooting for cross-system issues',
      'Migration planning insights through usage analytics',
      'SLA monitoring for legacy system dependencies'
    ],
    relatedApplications: ['legacy-integration-proxy', 'hybrid-monitoring-demo'],
    difficulty: 'advanced',
    estimatedTime: 32,
    tags: ['legacy-systems', 'integration', 'hybrid-cloud', 'monitoring']
  }
]