import { APMSolution, IntegrationPattern } from '../types/migration'

export const APM_SOLUTIONS: APMSolution[] = [
  {
    id: 'new-relic',
    name: 'New Relic',
    vendor: 'New Relic Inc.',
    description: 'Full-stack observability platform with APM, infrastructure monitoring, and digital experience monitoring',
    icon: '🔍',
    commonFeatures: [
      'Application Performance Monitoring',
      'Real User Monitoring',
      'Infrastructure Monitoring',
      'Custom Dashboards',
      'Alerting',
      'Distributed Tracing',
      'Error Tracking',
      'Database Monitoring'
    ],
    migrationComplexity: 'medium',
    estimatedMigrationTime: '2-4 weeks',
    supportedLanguages: ['Java', 'Node.js', 'Python', '.NET', 'Ruby', 'PHP', 'Go'],
    architecturePatterns: ['monolith', 'microservices', 'serverless']
  },
  {
    id: 'datadog',
    name: 'Datadog',
    vendor: 'Datadog Inc.',
    description: 'Cloud monitoring and analytics platform with APM, logs, and infrastructure monitoring',
    icon: '🐕',
    commonFeatures: [
      'APM and Distributed Tracing',
      'Log Management',
      'Infrastructure Monitoring',
      'Synthetic Monitoring',
      'Real User Monitoring',
      'Security Monitoring',
      'Custom Metrics',
      'Alerting and Notifications'
    ],
    migrationComplexity: 'medium',
    estimatedMigrationTime: '2-3 weeks',
    supportedLanguages: ['Java', 'Node.js', 'Python', '.NET', 'Ruby', 'PHP', 'Go', 'C++'],
    architecturePatterns: ['monolith', 'microservices', 'serverless', 'hybrid']
  },
  {
    id: 'dynatrace',
    name: 'Dynatrace',
    vendor: 'Dynatrace LLC',
    description: 'AI-powered full-stack monitoring platform with automatic discovery and root cause analysis',
    icon: '🤖',
    commonFeatures: [
      'Automatic Discovery',
      'AI-powered Root Cause Analysis',
      'Full-stack Monitoring',
      'User Experience Monitoring',
      'Cloud Infrastructure Monitoring',
      'Application Security',
      'Business Analytics',
      'Automated Alerting'
    ],
    migrationComplexity: 'high',
    estimatedMigrationTime: '3-6 weeks',
    supportedLanguages: ['Java', 'Node.js', 'Python', '.NET', 'PHP', 'Go', 'C/C++'],
    architecturePatterns: ['monolith', 'microservices', 'hybrid']
  },
  {
    id: 'appdynamics',
    name: 'AppDynamics',
    vendor: 'Cisco Systems',
    description: 'Application performance monitoring with business impact correlation and code-level diagnostics',
    icon: '📊',
    commonFeatures: [
      'Code-level Diagnostics',
      'Business Transaction Monitoring',
      'Infrastructure Monitoring',
      'Database Monitoring',
      'End User Monitoring',
      'Mobile Monitoring',
      'Analytics and Reporting',
      'Alerting and Notifications'
    ],
    migrationComplexity: 'high',
    estimatedMigrationTime: '4-8 weeks',
    supportedLanguages: ['Java', '.NET', 'Node.js', 'Python', 'PHP'],
    architecturePatterns: ['monolith', 'microservices']
  },
  {
    id: 'splunk-apm',
    name: 'Splunk APM',
    vendor: 'Splunk Inc.',
    description: 'Application performance monitoring with real-time troubleshooting and NoSample distributed tracing',
    icon: '🔎',
    commonFeatures: [
      'NoSample Distributed Tracing',
      'Real-time Troubleshooting',
      'Service Map',
      'Custom Metrics',
      'Alerting',
      'Infrastructure Monitoring',
      'Log Correlation',
      'Business Workflows'
    ],
    migrationComplexity: 'medium',
    estimatedMigrationTime: '2-4 weeks',
    supportedLanguages: ['Java', 'Node.js', 'Python', '.NET', 'Go', 'Ruby'],
    architecturePatterns: ['monolith', 'microservices', 'serverless']
  },
  {
    id: 'elastic-apm',
    name: 'Elastic APM',
    vendor: 'Elastic N.V.',
    description: 'Open source APM solution built on the Elastic Stack with distributed tracing and error tracking',
    icon: '🔍',
    commonFeatures: [
      'Distributed Tracing',
      'Error Tracking',
      'Metrics Collection',
      'Service Maps',
      'Custom Dashboards',
      'Alerting',
      'Log Correlation',
      'Machine Learning Anomaly Detection'
    ],
    migrationComplexity: 'low',
    estimatedMigrationTime: '1-2 weeks',
    supportedLanguages: ['Java', 'Node.js', 'Python', '.NET', 'Ruby', 'Go', 'PHP'],
    architecturePatterns: ['monolith', 'microservices', 'serverless']
  },
  {
    id: 'jaeger',
    name: 'Jaeger',
    vendor: 'CNCF',
    description: 'Open source distributed tracing system for monitoring and troubleshooting microservices',
    icon: '🕸️',
    commonFeatures: [
      'Distributed Tracing',
      'Service Dependency Analysis',
      'Performance Optimization',
      'Root Cause Analysis',
      'Sampling Strategies',
      'Multiple Storage Backends',
      'Web UI',
      'OpenTracing Compatible'
    ],
    migrationComplexity: 'low',
    estimatedMigrationTime: '1-3 weeks',
    supportedLanguages: ['Java', 'Node.js', 'Python', 'Go', 'C++', 'C#'],
    architecturePatterns: ['microservices', 'serverless']
  },
  {
    id: 'zipkin',
    name: 'Zipkin',
    vendor: 'Apache Software Foundation',
    description: 'Distributed tracing system for gathering timing data and troubleshooting latency problems',
    icon: '📍',
    commonFeatures: [
      'Distributed Tracing',
      'Latency Analysis',
      'Service Dependencies',
      'Search and Filter Traces',
      'Multiple Transport Options',
      'Storage Flexibility',
      'Web UI',
      'OpenTracing Support'
    ],
    migrationComplexity: 'low',
    estimatedMigrationTime: '1-2 weeks',
    supportedLanguages: ['Java', 'Node.js', 'Python', 'Go', 'C#', 'Ruby'],
    architecturePatterns: ['microservices', 'serverless']
  }
]

export const INTEGRATION_PATTERNS: IntegrationPattern[] = [
  {
    id: 'monolith-gradual-migration',
    name: 'Monolithic Application Gradual Migration',
    description: 'Gradually migrate a monolithic application to CloudWatch APM while maintaining existing monitoring',
    architecture: 'monolith',
    complexity: 'moderate',
    components: [
      {
        name: 'Web Application',
        type: 'application',
        description: 'Main monolithic application server',
        apmIntegration: 'Auto-instrumentation with CloudWatch APM agent'
      },
      {
        name: 'Database',
        type: 'database',
        description: 'Primary application database',
        apmIntegration: 'Database query monitoring and connection pool metrics'
      },
      {
        name: 'Load Balancer',
        type: 'load-balancer',
        description: 'Application load balancer',
        apmIntegration: 'HTTP request/response monitoring and health checks'
      }
    ],
    implementation: {
      overview: 'This pattern allows for a gradual migration from existing APM solutions to CloudWatch APM by running both systems in parallel during the transition period.',
      steps: [
        {
          id: 'parallel-setup',
          title: 'Set up parallel monitoring',
          description: 'Install CloudWatch APM alongside existing APM solution',
          category: 'preparation',
          estimatedTime: '2-4 hours',
          prerequisites: ['Existing APM solution running', 'AWS credentials configured'],
          instructions: [
            'Install CloudWatch APM agent without removing existing APM',
            'Configure CloudWatch APM with different service name suffix (e.g., "myapp-cw")',
            'Set sampling rate to low initially (e.g., 0.1) to minimize overhead',
            'Verify both APM solutions are collecting data'
          ],
          codeExamples: [
            {
              language: 'java',
              title: 'Java parallel configuration',
              after: `// application.properties
# Existing APM (e.g., New Relic)
newrelic.config.app_name=MyApp

# CloudWatch APM
cloudwatch.apm.service.name=MyApp-CW
cloudwatch.apm.sampling.rate=0.1
cloudwatch.apm.enabled=true`,
              description: 'Configure both APM solutions to run in parallel'
            }
          ],
          warnings: [
            'Monitor application performance for any degradation',
            'Ensure sufficient resources for dual monitoring overhead'
          ]
        },
        {
          id: 'data-comparison',
          title: 'Compare monitoring data',
          description: 'Validate that CloudWatch APM captures equivalent data',
          category: 'validation',
          estimatedTime: '1-2 weeks',
          prerequisites: ['Both APM solutions collecting data for at least 24 hours'],
          instructions: [
            'Compare key metrics between both APM solutions',
            'Validate transaction traces and error reporting',
            'Check alert coverage and notification accuracy',
            'Document any gaps or differences in monitoring coverage'
          ],
          tips: [
            'Focus on business-critical transactions first',
            'Use load testing to generate consistent traffic for comparison'
          ]
        },
        {
          id: 'gradual-cutover',
          title: 'Gradually increase CloudWatch APM coverage',
          description: 'Increase sampling rate and monitoring coverage over time',
          category: 'implementation',
          estimatedTime: '1-2 weeks',
          prerequisites: ['Data validation completed successfully'],
          instructions: [
            'Increase CloudWatch APM sampling rate gradually (0.1 → 0.5 → 1.0)',
            'Migrate alerting rules to CloudWatch one by one',
            'Update dashboards to include CloudWatch APM data',
            'Train team on CloudWatch APM interface and features'
          ]
        },
        {
          id: 'legacy-removal',
          title: 'Remove legacy APM solution',
          description: 'Safely remove the old APM solution after full migration',
          category: 'cleanup',
          estimatedTime: '4-8 hours',
          prerequisites: ['CloudWatch APM fully operational', 'Team trained on new system'],
          instructions: [
            'Disable legacy APM agent configuration',
            'Remove legacy APM dependencies from build files',
            'Update deployment scripts and infrastructure as code',
            'Archive legacy APM data according to retention policies'
          ]
        }
      ],
      configurationExamples: [
        {
          title: 'Spring Boot parallel configuration',
          description: 'Configuration for running CloudWatch APM alongside existing APM',
          language: 'yaml',
          configuration: `# application.yml
cloudwatch:
  apm:
    enabled: true
    service-name: \${spring.application.name}-cw
    sampling-rate: 0.1
    
# Keep existing APM configuration
newrelic:
  config:
    app_name: \${spring.application.name}`,
          notes: [
            'Use different service names to distinguish between APM solutions',
            'Start with low sampling rate to minimize performance impact'
          ]
        }
      ],
      testingStrategy: [
        'Load testing to verify performance impact',
        'Functional testing to ensure all features work correctly',
        'Monitoring validation to confirm data accuracy',
        'Rollback testing to ensure safe fallback procedures'
      ]
    },
    benefits: [
      'Zero-downtime migration',
      'Risk mitigation through parallel operation',
      'Data validation and comparison capabilities',
      'Gradual team training and adoption'
    ],
    considerations: [
      'Temporary increase in monitoring overhead',
      'Additional complexity during transition period',
      'Need for careful data comparison and validation',
      'Potential licensing costs for running both systems'
    ]
  },
  {
    id: 'microservices-service-by-service',
    name: 'Microservices Service-by-Service Migration',
    description: 'Migrate microservices to CloudWatch APM one service at a time',
    architecture: 'microservices',
    complexity: 'complex',
    components: [
      {
        name: 'API Gateway',
        type: 'gateway',
        description: 'Central API gateway routing requests',
        apmIntegration: 'Request routing and response time monitoring'
      },
      {
        name: 'Individual Microservices',
        type: 'application',
        description: 'Independent microservices',
        apmIntegration: 'Service-specific monitoring and distributed tracing'
      },
      {
        name: 'Message Queue',
        type: 'queue',
        description: 'Inter-service communication queue',
        apmIntegration: 'Message processing and queue depth monitoring'
      },
      {
        name: 'Shared Database',
        type: 'database',
        description: 'Shared data storage',
        apmIntegration: 'Database performance and connection monitoring'
      }
    ],
    implementation: {
      overview: 'This pattern enables migration of microservices architecture by migrating one service at a time, maintaining distributed tracing across mixed APM environments.',
      steps: [
        {
          id: 'service-prioritization',
          title: 'Prioritize services for migration',
          description: 'Identify and prioritize services based on criticality and complexity',
          category: 'preparation',
          estimatedTime: '4-8 hours',
          prerequisites: ['Complete service inventory', 'Service dependency mapping'],
          instructions: [
            'List all microservices and their dependencies',
            'Assess business criticality of each service',
            'Evaluate technical complexity and current APM integration',
            'Create migration priority matrix (low-risk, high-value services first)'
          ]
        },
        {
          id: 'pilot-service-migration',
          title: 'Migrate pilot service',
          description: 'Select and migrate a low-risk service as a pilot',
          category: 'implementation',
          estimatedTime: '1-2 days',
          prerequisites: ['Pilot service selected', 'CloudWatch APM configured'],
          instructions: [
            'Choose a non-critical service with minimal dependencies',
            'Install CloudWatch APM agent on pilot service',
            'Configure distributed tracing to work with existing APM',
            'Validate cross-service tracing functionality'
          ],
          codeExamples: [
            {
              language: 'javascript',
              title: 'Node.js service with mixed tracing',
              after: `const apm = require('@aws/cloudwatch-apm-nodejs');

// Initialize CloudWatch APM
apm.start({
  serviceName: 'user-service',
  environment: 'production',
  // Enable cross-APM tracing
  propagateTraceHeader: true
});

const express = require('express');
const app = express();

app.get('/users/:id', async (req, res) => {
  // This will be traced by CloudWatch APM
  const user = await getUserById(req.params.id);
  res.json(user);
});`,
              description: 'Configure service to use CloudWatch APM while maintaining trace propagation'
            }
          ]
        },
        {
          id: 'incremental-rollout',
          title: 'Roll out to additional services',
          description: 'Gradually migrate additional services based on lessons learned',
          category: 'implementation',
          estimatedTime: '2-4 weeks',
          prerequisites: ['Pilot service successfully migrated'],
          instructions: [
            'Apply lessons learned from pilot to migration process',
            'Migrate services in dependency order (upstream services first)',
            'Maintain distributed tracing across mixed APM environment',
            'Monitor for any service communication issues'
          ]
        }
      ],
      configurationExamples: [
        {
          title: 'Kubernetes service configuration',
          description: 'ConfigMap for microservice with CloudWatch APM',
          language: 'yaml',
          configuration: `apiVersion: v1
kind: ConfigMap
metadata:
  name: user-service-config
data:
  CLOUDWATCH_APM_SERVICE_NAME: "user-service"
  CLOUDWATCH_APM_ENVIRONMENT: "production"
  CLOUDWATCH_APM_PROPAGATE_TRACE_HEADER: "true"
  # Maintain existing APM config for other services
  NEW_RELIC_APP_NAME: "user-service-nr"`,
          notes: [
            'Enable trace header propagation for cross-APM tracing',
            'Use consistent service naming across environments'
          ]
        }
      ],
      testingStrategy: [
        'End-to-end testing across service boundaries',
        'Distributed tracing validation',
        'Performance impact assessment',
        'Service communication monitoring'
      ]
    },
    benefits: [
      'Reduced migration risk through incremental approach',
      'Maintained service independence',
      'Preserved distributed tracing capabilities',
      'Faster rollback capabilities per service'
    ],
    considerations: [
      'Complex distributed tracing across mixed APM solutions',
      'Need for careful service dependency management',
      'Potential temporary monitoring gaps',
      'Increased operational complexity during transition'
    ]
  },
  {
    id: 'serverless-function-migration',
    name: 'Serverless Function Migration',
    description: 'Migrate serverless functions and event-driven architectures to CloudWatch APM',
    architecture: 'serverless',
    complexity: 'simple',
    components: [
      {
        name: 'Lambda Functions',
        type: 'application',
        description: 'AWS Lambda functions',
        apmIntegration: 'Function execution monitoring and distributed tracing'
      },
      {
        name: 'API Gateway',
        type: 'gateway',
        description: 'AWS API Gateway',
        apmIntegration: 'Request/response monitoring and error tracking'
      },
      {
        name: 'Event Sources',
        type: 'queue',
        description: 'SQS, SNS, EventBridge',
        apmIntegration: 'Event processing and latency monitoring'
      }
    ],
    implementation: {
      overview: 'Serverless migration is typically simpler due to the stateless nature of functions and native AWS integration capabilities.',
      steps: [
        {
          id: 'lambda-layer-setup',
          title: 'Set up CloudWatch APM Lambda layer',
          description: 'Configure CloudWatch APM layer for Lambda functions',
          category: 'preparation',
          estimatedTime: '1-2 hours',
          prerequisites: ['AWS Lambda functions deployed', 'IAM permissions configured'],
          instructions: [
            'Create or use existing CloudWatch APM Lambda layer',
            'Update Lambda function configuration to include the layer',
            'Set required environment variables for APM configuration',
            'Test with a single function first'
          ]
        }
      ],
      configurationExamples: [
        {
          title: 'Lambda function with CloudWatch APM',
          description: 'Serverless framework configuration',
          language: 'yaml',
          configuration: `# serverless.yml
service: my-serverless-app

provider:
  name: aws
  runtime: nodejs18.x
  environment:
    CLOUDWATCH_APM_SERVICE_NAME: \${self:service}
    CLOUDWATCH_APM_ENVIRONMENT: \${opt:stage, 'dev'}

functions:
  api:
    handler: src/handler.api
    layers:
      - arn:aws:lambda:us-east-1:123456789:layer:cloudwatch-apm-nodejs:1
    events:
      - http:
          path: /{proxy+}
          method: ANY`,
          notes: [
            'Use Lambda layers for easy APM integration',
            'Configure environment variables for service identification'
          ]
        }
      ],
      testingStrategy: [
        'Function execution testing',
        'Event source integration testing',
        'Cold start performance impact assessment',
        'Distributed tracing validation across functions'
      ]
    },
    benefits: [
      'Native AWS integration',
      'Simplified deployment through layers',
      'Automatic scaling with function execution',
      'Built-in AWS service correlation'
    ],
    considerations: [
      'Cold start performance impact',
      'Lambda layer version management',
      'Event source configuration requirements',
      'Cost implications of detailed monitoring'
    ]
  }
]