import { ConfigurationSchema, ConfigurationParameter, ConfigurationCategory } from '../types/configuration'

// Configuration categories
export const CONFIGURATION_CATEGORIES: ConfigurationCategory[] = [
  {
    id: 'basic',
    name: 'Basic Configuration',
    description: 'Essential settings required for CloudWatch APM to function',
    icon: '⚙️',
    order: 1
  },
  {
    id: 'tracing',
    name: 'Tracing Configuration',
    description: 'Settings for distributed tracing and span collection',
    icon: '🔍',
    order: 2
  },
  {
    id: 'metrics',
    name: 'Metrics Configuration',
    description: 'Configuration for custom metrics and performance monitoring',
    icon: '📊',
    order: 3
  },
  {
    id: 'logging',
    name: 'Logging Configuration',
    description: 'Log collection and correlation settings',
    icon: '📝',
    order: 4
  },
  {
    id: 'performance',
    name: 'Performance Configuration',
    description: 'Settings for optimizing APM performance and resource usage',
    icon: '⚡',
    order: 5
  },
  {
    id: 'security',
    name: 'Security Configuration',
    description: 'Authentication, authorization, and data privacy settings',
    icon: '🔒',
    order: 6
  },
  {
    id: 'advanced',
    name: 'Advanced Configuration',
    description: 'Advanced settings for specialized use cases',
    icon: '🔧',
    order: 7
  }
]

// Configuration parameters
export const CONFIGURATION_PARAMETERS: ConfigurationParameter[] = [
  // Basic Configuration
  {
    id: 'service-name',
    name: 'serviceName',
    type: 'string',
    description: 'The name of your service as it will appear in CloudWatch APM',
    required: true,
    validationRules: [
      {
        type: 'pattern',
        value: '^[a-z0-9-]+$',
        message: 'Service name must contain only lowercase letters, numbers, and hyphens'
      },
      {
        type: 'min',
        value: 1,
        message: 'Service name cannot be empty'
      },
      {
        type: 'max',
        value: 255,
        message: 'Service name cannot exceed 255 characters'
      }
    ],
    examples: [
      {
        id: 'basic-service',
        title: 'Basic Service Name',
        description: 'Simple service name for a web application',
        value: 'my-web-app',
        useCase: 'monitoring'
      },
      {
        id: 'microservice',
        title: 'Microservice Name',
        description: 'Service name for a microservice architecture',
        value: 'user-authentication-service',
        useCase: 'monitoring'
      }
    ],
    category: CONFIGURATION_CATEGORIES[0],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express']
  },
  {
    id: 'service-version',
    name: 'serviceVersion',
    type: 'string',
    description: 'The version of your service for tracking deployments and changes',
    required: true,
    defaultValue: '1.0.0',
    validationRules: [
      {
        type: 'pattern',
        value: '^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9-]+)?$',
        message: 'Service version should follow semantic versioning (e.g., 1.0.0, 1.2.3-beta)'
      }
    ],
    examples: [
      {
        id: 'semantic-version',
        title: 'Semantic Version',
        description: 'Standard semantic versioning format',
        value: '1.2.3',
        useCase: 'monitoring'
      },
      {
        id: 'pre-release',
        title: 'Pre-release Version',
        description: 'Version with pre-release identifier',
        value: '2.0.0-beta.1',
        useCase: 'debugging'
      }
    ],
    category: CONFIGURATION_CATEGORIES[0],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express']
  },
  {
    id: 'environment',
    name: 'environment',
    type: 'string',
    description: 'The deployment environment (development, staging, production)',
    required: true,
    defaultValue: 'production',
    validValues: ['development', 'staging', 'production', 'test'],
    examples: [
      {
        id: 'prod-env',
        title: 'Production Environment',
        description: 'Configuration for production deployment',
        value: 'production',
        useCase: 'monitoring'
      },
      {
        id: 'dev-env',
        title: 'Development Environment',
        description: 'Configuration for local development',
        value: 'development',
        useCase: 'debugging'
      }
    ],
    category: CONFIGURATION_CATEGORIES[0],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express']
  },
  {
    id: 'region',
    name: 'region',
    type: 'string',
    description: 'AWS region where CloudWatch APM data will be sent',
    required: true,
    defaultValue: 'us-east-1',
    validValues: [
      'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
      'eu-west-1', 'eu-west-2', 'eu-central-1',
      'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1'
    ],
    examples: [
      {
        id: 'us-east',
        title: 'US East Region',
        description: 'Default US East region',
        value: 'us-east-1',
        useCase: 'monitoring'
      },
      {
        id: 'eu-west',
        title: 'Europe West Region',
        description: 'European deployment region',
        value: 'eu-west-1',
        useCase: 'monitoring'
      }
    ],
    category: CONFIGURATION_CATEGORIES[0],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express']
  },

  // Tracing Configuration
  {
    id: 'enable-tracing',
    name: 'enableTracing',
    type: 'boolean',
    description: 'Enable or disable distributed tracing collection',
    required: false,
    defaultValue: true,
    examples: [
      {
        id: 'tracing-enabled',
        title: 'Tracing Enabled',
        description: 'Enable tracing for full observability',
        value: true,
        useCase: 'monitoring'
      },
      {
        id: 'tracing-disabled',
        title: 'Tracing Disabled',
        description: 'Disable tracing to reduce overhead',
        value: false,
        useCase: 'performance'
      }
    ],
    category: CONFIGURATION_CATEGORIES[1],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express']
  },
  {
    id: 'sampling-rate',
    name: 'samplingRate',
    type: 'number',
    description: 'Percentage of requests to trace (0.0 to 1.0)',
    required: false,
    defaultValue: 0.1,
    validationRules: [
      {
        type: 'min',
        value: 0.0,
        message: 'Sampling rate cannot be negative'
      },
      {
        type: 'max',
        value: 1.0,
        message: 'Sampling rate cannot exceed 1.0 (100%)'
      }
    ],
    examples: [
      {
        id: 'low-sampling',
        title: 'Low Sampling Rate',
        description: 'Sample 1% of requests for high-traffic applications',
        value: 0.01,
        useCase: 'performance'
      },
      {
        id: 'full-sampling',
        title: 'Full Sampling',
        description: 'Sample 100% of requests for debugging',
        value: 1.0,
        useCase: 'debugging'
      }
    ],
    category: CONFIGURATION_CATEGORIES[1],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    relatedParameters: ['enable-tracing']
  },
  {
    id: 'max-span-attributes',
    name: 'maxSpanAttributes',
    type: 'number',
    description: 'Maximum number of attributes per span',
    required: false,
    defaultValue: 128,
    validationRules: [
      {
        type: 'min',
        value: 1,
        message: 'Must have at least 1 span attribute'
      },
      {
        type: 'max',
        value: 1000,
        message: 'Cannot exceed 1000 span attributes'
      }
    ],
    examples: [
      {
        id: 'default-attributes',
        title: 'Default Attributes',
        description: 'Standard number of span attributes',
        value: 128,
        useCase: 'monitoring'
      },
      {
        id: 'minimal-attributes',
        title: 'Minimal Attributes',
        description: 'Reduced attributes for performance',
        value: 32,
        useCase: 'performance'
      }
    ],
    category: CONFIGURATION_CATEGORIES[1],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express']
  },

  // Metrics Configuration
  {
    id: 'enable-metrics',
    name: 'enableMetrics',
    type: 'boolean',
    description: 'Enable or disable custom metrics collection',
    required: false,
    defaultValue: true,
    examples: [
      {
        id: 'metrics-enabled',
        title: 'Metrics Enabled',
        description: 'Enable metrics for performance monitoring',
        value: true,
        useCase: 'monitoring'
      },
      {
        id: 'metrics-disabled',
        title: 'Metrics Disabled',
        description: 'Disable metrics to reduce overhead',
        value: false,
        useCase: 'performance'
      }
    ],
    category: CONFIGURATION_CATEGORIES[2],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express']
  },
  {
    id: 'custom-metrics',
    name: 'customMetrics',
    type: 'boolean',
    description: 'Enable collection of custom business metrics',
    required: false,
    defaultValue: false,
    examples: [
      {
        id: 'custom-enabled',
        title: 'Custom Metrics Enabled',
        description: 'Enable custom business metrics',
        value: true,
        useCase: 'alerting'
      }
    ],
    category: CONFIGURATION_CATEGORIES[2],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    relatedParameters: ['enable-metrics']
  },

  // Logging Configuration
  {
    id: 'enable-logs',
    name: 'enableLogs',
    type: 'boolean',
    description: 'Enable or disable log correlation with traces',
    required: false,
    defaultValue: false,
    examples: [
      {
        id: 'logs-enabled',
        title: 'Logs Enabled',
        description: 'Enable log correlation for debugging',
        value: true,
        useCase: 'debugging'
      },
      {
        id: 'logs-disabled',
        title: 'Logs Disabled',
        description: 'Disable logs to reduce data volume',
        value: false,
        useCase: 'performance'
      }
    ],
    category: CONFIGURATION_CATEGORIES[3],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express']
  },
  {
    id: 'log-level',
    name: 'logLevel',
    type: 'string',
    description: 'Minimum log level for APM internal logging',
    required: false,
    defaultValue: 'INFO',
    validValues: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
    examples: [
      {
        id: 'debug-logging',
        title: 'Debug Logging',
        description: 'Verbose logging for troubleshooting',
        value: 'DEBUG',
        useCase: 'debugging'
      },
      {
        id: 'error-logging',
        title: 'Error Logging',
        description: 'Only log errors to reduce noise',
        value: 'ERROR',
        useCase: 'performance'
      }
    ],
    category: CONFIGURATION_CATEGORIES[3],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    relatedParameters: ['enable-logs']
  },

  // Performance Configuration
  {
    id: 'batch-size',
    name: 'batchSize',
    type: 'number',
    description: 'Number of spans to batch before sending to CloudWatch',
    required: false,
    defaultValue: 100,
    validationRules: [
      {
        type: 'min',
        value: 1,
        message: 'Batch size must be at least 1'
      },
      {
        type: 'max',
        value: 1000,
        message: 'Batch size cannot exceed 1000'
      }
    ],
    examples: [
      {
        id: 'small-batch',
        title: 'Small Batch Size',
        description: 'Small batches for low latency',
        value: 10,
        useCase: 'debugging'
      },
      {
        id: 'large-batch',
        title: 'Large Batch Size',
        description: 'Large batches for high throughput',
        value: 500,
        useCase: 'performance'
      }
    ],
    category: CONFIGURATION_CATEGORIES[4],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express']
  },
  {
    id: 'max-queue-size',
    name: 'maxQueueSize',
    type: 'number',
    description: 'Maximum number of spans to queue before dropping',
    required: false,
    defaultValue: 1000,
    validationRules: [
      {
        type: 'min',
        value: 100,
        message: 'Queue size must be at least 100'
      },
      {
        type: 'max',
        value: 10000,
        message: 'Queue size cannot exceed 10000'
      }
    ],
    examples: [
      {
        id: 'standard-queue',
        title: 'Standard Queue Size',
        description: 'Standard queue for most applications',
        value: 1000,
        useCase: 'monitoring'
      },
      {
        id: 'large-queue',
        title: 'Large Queue Size',
        description: 'Large queue for high-traffic applications',
        value: 5000,
        useCase: 'performance'
      }
    ],
    category: CONFIGURATION_CATEGORIES[4],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    relatedParameters: ['batch-size']
  },
  {
    id: 'export-timeout',
    name: 'exportTimeout',
    type: 'number',
    description: 'Timeout in milliseconds for exporting spans to CloudWatch',
    required: false,
    defaultValue: 30000,
    validationRules: [
      {
        type: 'min',
        value: 1000,
        message: 'Export timeout must be at least 1000ms'
      },
      {
        type: 'max',
        value: 300000,
        message: 'Export timeout cannot exceed 300000ms (5 minutes)'
      }
    ],
    examples: [
      {
        id: 'fast-timeout',
        title: 'Fast Timeout',
        description: 'Quick timeout for low latency',
        value: 5000,
        useCase: 'debugging'
      },
      {
        id: 'long-timeout',
        title: 'Long Timeout',
        description: 'Extended timeout for reliability',
        value: 60000,
        useCase: 'monitoring'
      }
    ],
    category: CONFIGURATION_CATEGORIES[4],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express']
  },

  // Security Configuration
  {
    id: 'capture-http-headers',
    name: 'captureHttpHeaders',
    type: 'boolean',
    description: 'Capture HTTP headers in spans (may contain sensitive data)',
    required: false,
    defaultValue: false,
    examples: [
      {
        id: 'headers-enabled',
        title: 'Headers Enabled',
        description: 'Capture headers for debugging',
        value: true,
        useCase: 'debugging'
      },
      {
        id: 'headers-disabled',
        title: 'Headers Disabled',
        description: 'Disable headers for security',
        value: false,
        useCase: 'monitoring'
      }
    ],
    category: CONFIGURATION_CATEGORIES[5],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express']
  },
  {
    id: 'capture-http-body',
    name: 'captureHttpBody',
    type: 'boolean',
    description: 'Capture HTTP request/response bodies (may contain sensitive data)',
    required: false,
    defaultValue: false,
    examples: [
      {
        id: 'body-enabled',
        title: 'Body Capture Enabled',
        description: 'Capture bodies for detailed debugging',
        value: true,
        useCase: 'debugging'
      },
      {
        id: 'body-disabled',
        title: 'Body Capture Disabled',
        description: 'Disable body capture for security',
        value: false,
        useCase: 'monitoring'
      }
    ],
    category: CONFIGURATION_CATEGORIES[5],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    relatedParameters: ['capture-http-headers']
  },

  // Advanced Configuration
  {
    id: 'compression-enabled',
    name: 'compressionEnabled',
    type: 'boolean',
    description: 'Enable compression for data sent to CloudWatch',
    required: false,
    defaultValue: true,
    examples: [
      {
        id: 'compression-on',
        title: 'Compression Enabled',
        description: 'Enable compression to reduce bandwidth',
        value: true,
        useCase: 'performance'
      },
      {
        id: 'compression-off',
        title: 'Compression Disabled',
        description: 'Disable compression for debugging',
        value: false,
        useCase: 'debugging'
      }
    ],
    category: CONFIGURATION_CATEGORIES[6],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express']
  },
  {
    id: 'async-export',
    name: 'asyncExport',
    type: 'boolean',
    description: 'Export spans asynchronously to avoid blocking application threads',
    required: false,
    defaultValue: true,
    examples: [
      {
        id: 'async-enabled',
        title: 'Async Export Enabled',
        description: 'Non-blocking export for better performance',
        value: true,
        useCase: 'performance'
      },
      {
        id: 'sync-export',
        title: 'Synchronous Export',
        description: 'Synchronous export for debugging',
        value: false,
        useCase: 'debugging'
      }
    ],
    category: CONFIGURATION_CATEGORIES[6],
    platform: ['java', 'nodejs', 'python', 'spring-boot', 'express']
  }
]

// Main configuration schema
export const CLOUDWATCH_APM_SCHEMA: ConfigurationSchema = {
  id: 'cloudwatch-apm',
  name: 'CloudWatch APM Configuration',
  description: 'Complete configuration schema for CloudWatch Application Performance Monitoring',
  version: '1.0.0',
  parameters: CONFIGURATION_PARAMETERS,
  categories: CONFIGURATION_CATEGORIES,
  platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express', 'docker', 'kubernetes'],
  lastUpdated: new Date()
}