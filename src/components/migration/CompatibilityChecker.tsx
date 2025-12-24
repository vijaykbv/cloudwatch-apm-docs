'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { CompatibilityCheck } from '../../types/migration'

interface CompatibilityCheckerProps {
  onCheckComplete?: (results: CompatibilityCheck[]) => void
  className?: string
}

interface ServiceInput {
  name: string
  version?: string
  type: 'aws-service' | 'third-party' | 'database' | 'framework' | 'library'
}

// Predefined AWS services and their CloudWatch APM compatibility
const AWS_SERVICES_COMPATIBILITY: Record<string, CompatibilityCheck> = {
  'lambda': {
    service: 'AWS Lambda',
    compatible: true,
    version: 'All versions',
    notes: 'Native integration through Lambda layers and environment variables'
  },
  'ecs': {
    service: 'Amazon ECS',
    compatible: true,
    version: 'All versions',
    notes: 'Supported through container instrumentation and task definition configuration'
  },
  'eks': {
    service: 'Amazon EKS',
    compatible: true,
    version: 'All versions',
    notes: 'Kubernetes-native deployment with ConfigMaps and environment variables'
  },
  'ec2': {
    service: 'Amazon EC2',
    compatible: true,
    version: 'All versions',
    notes: 'Standard agent installation on EC2 instances'
  },
  'rds': {
    service: 'Amazon RDS',
    compatible: true,
    version: 'All engines',
    notes: 'Database performance monitoring through application-level instrumentation'
  },
  'dynamodb': {
    service: 'Amazon DynamoDB',
    compatible: true,
    version: 'All versions',
    notes: 'Automatic instrumentation of DynamoDB SDK calls'
  },
  'sqs': {
    service: 'Amazon SQS',
    compatible: true,
    version: 'All versions',
    notes: 'Message queue monitoring through SDK instrumentation'
  },
  'sns': {
    service: 'Amazon SNS',
    compatible: true,
    version: 'All versions',
    notes: 'Notification service monitoring through SDK instrumentation'
  },
  's3': {
    service: 'Amazon S3',
    compatible: true,
    version: 'All versions',
    notes: 'S3 operation monitoring through SDK instrumentation'
  },
  'elasticache': {
    service: 'Amazon ElastiCache',
    compatible: true,
    version: 'Redis and Memcached',
    notes: 'Cache performance monitoring through client library instrumentation'
  },
  'api-gateway': {
    service: 'Amazon API Gateway',
    compatible: true,
    version: 'REST and HTTP APIs',
    notes: 'Request/response monitoring and distributed tracing support'
  },
  'cloudfront': {
    service: 'Amazon CloudFront',
    compatible: true,
    version: 'All versions',
    notes: 'CDN performance monitoring through origin request instrumentation'
  },
  'elasticsearch': {
    service: 'Amazon OpenSearch',
    compatible: true,
    version: 'All versions',
    notes: 'Search operation monitoring through client instrumentation'
  },
  'kinesis': {
    service: 'Amazon Kinesis',
    compatible: true,
    version: 'All services',
    notes: 'Stream processing monitoring through SDK instrumentation'
  },
  'step-functions': {
    service: 'AWS Step Functions',
    compatible: true,
    version: 'All versions',
    notes: 'Workflow monitoring through state machine instrumentation'
  }
}

// Common third-party services and frameworks
const THIRD_PARTY_COMPATIBILITY: Record<string, CompatibilityCheck> = {
  'spring-boot': {
    service: 'Spring Boot',
    compatible: true,
    version: '2.5+',
    notes: 'Auto-configuration support with CloudWatch APM starter'
  },
  'express': {
    service: 'Express.js',
    compatible: true,
    version: '4.x+',
    notes: 'Middleware-based instrumentation'
  },
  'django': {
    service: 'Django',
    compatible: true,
    version: '3.0+',
    notes: 'Django middleware and settings configuration'
  },
  'flask': {
    service: 'Flask',
    compatible: true,
    version: '1.0+',
    notes: 'WSGI middleware instrumentation'
  },
  'fastapi': {
    service: 'FastAPI',
    compatible: true,
    version: '0.60+',
    notes: 'ASGI middleware instrumentation'
  },
  'react': {
    service: 'React',
    compatible: true,
    version: '16.8+',
    notes: 'Browser-side monitoring through JavaScript SDK'
  },
  'angular': {
    service: 'Angular',
    compatible: true,
    version: '10+',
    notes: 'Browser-side monitoring through JavaScript SDK'
  },
  'vue': {
    service: 'Vue.js',
    compatible: true,
    version: '2.6+ / 3.0+',
    notes: 'Browser-side monitoring through JavaScript SDK'
  },
  'postgresql': {
    service: 'PostgreSQL',
    compatible: true,
    version: '9.6+',
    notes: 'Database monitoring through application-level instrumentation'
  },
  'mysql': {
    service: 'MySQL',
    compatible: true,
    version: '5.7+',
    notes: 'Database monitoring through application-level instrumentation'
  },
  'mongodb': {
    service: 'MongoDB',
    compatible: true,
    version: '4.0+',
    notes: 'Database monitoring through driver instrumentation'
  },
  'redis': {
    service: 'Redis',
    compatible: true,
    version: '5.0+',
    notes: 'Cache monitoring through client library instrumentation'
  },
  'nginx': {
    service: 'Nginx',
    compatible: true,
    version: '1.16+',
    notes: 'Web server monitoring through upstream application instrumentation',
    alternativeApproach: 'Monitor through application behind Nginx rather than Nginx directly'
  },
  'apache': {
    service: 'Apache HTTP Server',
    compatible: true,
    version: '2.4+',
    notes: 'Web server monitoring through upstream application instrumentation',
    alternativeApproach: 'Monitor through application behind Apache rather than Apache directly'
  },
  'docker': {
    service: 'Docker',
    compatible: true,
    version: '19.03+',
    notes: 'Container monitoring through application instrumentation inside containers'
  },
  'kubernetes': {
    service: 'Kubernetes',
    compatible: true,
    version: '1.16+',
    notes: 'Pod and service monitoring through application instrumentation'
  }
}

export const CompatibilityChecker: React.FC<CompatibilityCheckerProps> = ({
  onCheckComplete,
  className = ''
}) => {
  const [services, setServices] = useState<ServiceInput[]>([])
  const [currentService, setCurrentService] = useState<ServiceInput>({
    name: '',
    type: 'aws-service'
  })
  const [results, setResults] = useState<CompatibilityCheck[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const addService = useCallback(() => {
    if (currentService.name.trim()) {
      setServices(prev => [...prev, { ...currentService }])
      setCurrentService({ name: '', version: '', type: 'aws-service' })
    }
  }, [currentService])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addService()
    }
  }, [addService])

  const removeService = useCallback((index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index))
  }, [])

  const checkCompatibility = useCallback(async () => {
    setIsChecking(true)
    setShowResults(false)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const compatibilityResults: CompatibilityCheck[] = services.map(service => {
      const serviceName = service.name.toLowerCase().replace(/\s+/g, '-')
      
      // Check AWS services first
      if (service.type === 'aws-service' && AWS_SERVICES_COMPATIBILITY[serviceName]) {
        return AWS_SERVICES_COMPATIBILITY[serviceName]
      }
      
      // Check third-party services
      if (THIRD_PARTY_COMPATIBILITY[serviceName]) {
        return THIRD_PARTY_COMPATIBILITY[serviceName]
      }
      
      // Default compatibility check for unknown services
      return {
        service: service.name,
        compatible: true,
        notes: 'Compatibility depends on specific implementation. Manual verification recommended.',
        migrationRequired: true,
        alternativeApproach: 'Consider using CloudWatch APM SDK or agent instrumentation'
      }
    })

    setResults(compatibilityResults)
    setIsChecking(false)
    setShowResults(true)
    onCheckComplete?.(compatibilityResults)
  }, [services, onCheckComplete])

  const getCompatibilityIcon = (compatible: boolean) => {
    return compatible ? '✅' : '❌'
  }

  const getCompatibilityColor = (compatible: boolean) => {
    return compatible ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">AWS Service Compatibility Checker</h2>
          <p className="text-gray-600">
            Check the compatibility of your current services and infrastructure with CloudWatch APM.
            This will help identify any potential migration challenges or required changes.
          </p>
        </div>

        {/* Add Service Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-4">Add Services to Check</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Service name (e.g., Lambda, Spring Boot, PostgreSQL)"
                value={currentService.name}
                onChange={(e) => setCurrentService(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                onKeyDown={handleKeyPress}
              />
            </div>
            <div>
              <select
                value={currentService.type}
                onChange={(e) => setCurrentService(prev => ({ 
                  ...prev, 
                  type: e.target.value as ServiceInput['type']
                }))}
                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="aws-service">AWS Service</option>
                <option value="third-party">Third Party</option>
                <option value="database">Database</option>
                <option value="framework">Framework</option>
                <option value="library">Library</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                placeholder="Version (optional)"
                value={currentService.version || ''}
                onChange={(e) => setCurrentService(prev => ({ ...prev, version: e.target.value }))}
                className="w-full sm:w-32 border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <button
              onClick={addService}
              disabled={!currentService.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>

        {/* Services List */}
        {services.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-3">Services to Check ({services.length})</h3>
            <div className="space-y-2">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-sm text-gray-500 capitalize">{service.type.replace('-', ' ')}</span>
                    {service.version && (
                      <span className="text-sm text-gray-500">v{service.version}</span>
                    )}
                  </div>
                  <button
                    onClick={() => removeService(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check Button */}
        {services.length > 0 && (
          <div className="mb-6">
            <button
              onClick={checkCompatibility}
              disabled={isChecking}
              className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isChecking ? 'Checking Compatibility...' : 'Check Compatibility'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {isChecking && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Analyzing service compatibility...</p>
          </div>
        )}

        {/* Results */}
        {showResults && results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Compatibility Results</h3>
            
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.compatible).length}
                </div>
                <div className="text-sm text-green-800">Compatible</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {results.filter(r => !r.compatible).length}
                </div>
                <div className="text-sm text-red-800">Incompatible</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {results.filter(r => r.migrationRequired).length}
                </div>
                <div className="text-sm text-yellow-800">Need Migration</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getCompatibilityIcon(result.compatible)}</span>
                      <div>
                        <h4 className={`font-medium ${getCompatibilityColor(result.compatible)}`}>
                          {result.service}
                        </h4>
                        {result.version && (
                          <p className="text-sm text-gray-500">Version: {result.version}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        result.compatible 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.compatible ? 'Compatible' : 'Incompatible'}
                      </span>
                    </div>
                  </div>
                  
                  {result.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">{result.notes}</p>
                    </div>
                  )}
                  
                  {result.migrationRequired && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Migration steps required for full compatibility
                      </p>
                    </div>
                  )}
                  
                  {result.alternativeApproach && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        💡 Alternative approach: {result.alternativeApproach}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Next Steps */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Review any incompatible services and plan necessary changes</li>
                <li>• Consider alternative approaches for services requiring migration</li>
                <li>• Proceed with the migration wizard to create a detailed plan</li>
                <li>• Consult CloudWatch APM documentation for specific integration guides</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}