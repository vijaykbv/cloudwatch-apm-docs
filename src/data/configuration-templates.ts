import { ConfigurationTemplate } from '../types/quickstart'

export const CONFIGURATION_TEMPLATES: ConfigurationTemplate[] = [
  {
    id: 'basic-monitoring',
    name: 'Basic Application Monitoring',
    description: 'Essential monitoring setup for getting started with CloudWatch APM',
    platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    useCase: 'monitoring',
    configuration: {
      serviceName: '${SERVICE_NAME}',
      serviceVersion: '${SERVICE_VERSION}',
      environment: '${ENVIRONMENT}',
      samplingRate: 0.1,
      enableTracing: true,
      enableMetrics: true,
      enableLogs: false,
      region: '${AWS_REGION}',
      batchSize: 100,
      maxQueueSize: 1000,
      exportTimeout: 30000
    },
    examples: [
      {
        id: 'java-basic',
        title: 'Java Application Properties',
        description: 'Basic configuration for Java applications',
        code: `# application.properties
cloudwatch.apm.service.name=my-java-app
cloudwatch.apm.service.version=1.0.0
cloudwatch.apm.environment=production
cloudwatch.apm.sampling.rate=0.1
cloudwatch.apm.tracing.enabled=true
cloudwatch.apm.metrics.enabled=true
cloudwatch.apm.logs.enabled=false
cloudwatch.apm.region=us-east-1
cloudwatch.apm.batch.size=100
cloudwatch.apm.queue.max-size=1000
cloudwatch.apm.export.timeout=30000`,
        language: 'properties',
        notes: [
          'Replace my-java-app with your actual service name',
          'Adjust sampling rate based on traffic volume',
          'Set environment to match your deployment stage'
        ]
      },
      {
        id: 'nodejs-basic',
        title: 'Node.js Configuration',
        description: 'Basic configuration for Node.js applications',
        code: `// apm-config.js
module.exports = {
  serviceName: 'my-nodejs-app',
  serviceVersion: '1.0.0',
  environment: 'production',
  samplingRate: 0.1,
  enableTracing: true,
  enableMetrics: true,
  enableLogs: false,
  region: 'us-east-1',
  batchSize: 100,
  maxQueueSize: 1000,
  exportTimeout: 30000
};`,
        language: 'javascript',
        notes: [
          'Import this configuration in your main application file',
          'Consider using environment variables for sensitive values'
        ]
      },
      {
        id: 'python-basic',
        title: 'Python Configuration',
        description: 'Basic configuration for Python applications',
        code: `# apm_config.py
CLOUDWATCH_APM_CONFIG = {
    'service_name': 'my-python-app',
    'service_version': '1.0.0',
    'environment': 'production',
    'sampling_rate': 0.1,
    'enable_tracing': True,
    'enable_metrics': True,
    'enable_logs': False,
    'region': 'us-east-1',
    'batch_size': 100,
    'max_queue_size': 1000,
    'export_timeout': 30000
}`,
        language: 'python',
        notes: [
          'Import this configuration when initializing the APM client',
          'Use environment variables for deployment-specific values'
        ]
      }
    ]
  },
  {
    id: 'high-performance',
    name: 'High Performance Configuration',
    description: 'Optimized configuration for high-traffic applications',
    platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    useCase: 'performance',
    configuration: {
      serviceName: '${SERVICE_NAME}',
      serviceVersion: '${SERVICE_VERSION}',
      environment: '${ENVIRONMENT}',
      samplingRate: 0.01,
      enableTracing: true,
      enableMetrics: true,
      enableLogs: false,
      region: '${AWS_REGION}',
      batchSize: 500,
      maxQueueSize: 5000,
      exportTimeout: 10000,
      compressionEnabled: true,
      asyncExport: true,
      bufferSize: 8192,
      maxSpanAttributes: 32,
      maxSpanEvents: 128
    },
    examples: [
      {
        id: 'java-performance',
        title: 'Java High Performance',
        description: 'Performance-optimized configuration for Java',
        code: `# application.properties
cloudwatch.apm.service.name=high-traffic-java-app
cloudwatch.apm.service.version=2.1.0
cloudwatch.apm.environment=production
cloudwatch.apm.sampling.rate=0.01
cloudwatch.apm.tracing.enabled=true
cloudwatch.apm.metrics.enabled=true
cloudwatch.apm.logs.enabled=false
cloudwatch.apm.region=us-east-1
cloudwatch.apm.batch.size=500
cloudwatch.apm.queue.max-size=5000
cloudwatch.apm.export.timeout=10000
cloudwatch.apm.compression.enabled=true
cloudwatch.apm.export.async=true
cloudwatch.apm.buffer.size=8192
cloudwatch.apm.span.max-attributes=32
cloudwatch.apm.span.max-events=128`,
        language: 'properties',
        notes: [
          'Lower sampling rate reduces overhead',
          'Larger batch sizes improve throughput',
          'Async export prevents blocking application threads'
        ]
      }
    ]
  },
  {
    id: 'debugging-detailed',
    name: 'Detailed Debugging Configuration',
    description: 'Comprehensive configuration for debugging and troubleshooting',
    platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    useCase: 'debugging',
    configuration: {
      serviceName: '${SERVICE_NAME}',
      serviceVersion: '${SERVICE_VERSION}',
      environment: 'development',
      samplingRate: 1.0,
      enableTracing: true,
      enableMetrics: true,
      enableLogs: true,
      region: '${AWS_REGION}',
      batchSize: 10,
      maxQueueSize: 100,
      exportTimeout: 5000,
      logLevel: 'DEBUG',
      captureHttpHeaders: true,
      captureHttpBody: true,
      captureExceptions: true,
      maxSpanAttributes: 128,
      maxSpanEvents: 256
    },
    examples: [
      {
        id: 'java-debug',
        title: 'Java Debug Configuration',
        description: 'Detailed configuration for debugging Java applications',
        code: `# application.properties
cloudwatch.apm.service.name=debug-java-app
cloudwatch.apm.service.version=1.0.0-SNAPSHOT
cloudwatch.apm.environment=development
cloudwatch.apm.sampling.rate=1.0
cloudwatch.apm.tracing.enabled=true
cloudwatch.apm.metrics.enabled=true
cloudwatch.apm.logs.enabled=true
cloudwatch.apm.region=us-east-1
cloudwatch.apm.batch.size=10
cloudwatch.apm.queue.max-size=100
cloudwatch.apm.export.timeout=5000
cloudwatch.apm.log.level=DEBUG
cloudwatch.apm.capture.http-headers=true
cloudwatch.apm.capture.http-body=true
cloudwatch.apm.capture.exceptions=true
cloudwatch.apm.span.max-attributes=128
cloudwatch.apm.span.max-events=256`,
        language: 'properties',
        notes: [
          '100% sampling captures all requests',
          'Small batch sizes provide immediate feedback',
          'Enable all capture options for maximum visibility'
        ]
      }
    ]
  },
  {
    id: 'alerting-focused',
    name: 'Alerting and Monitoring Focus',
    description: 'Configuration optimized for alerting and proactive monitoring',
    platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    useCase: 'alerting',
    configuration: {
      serviceName: '${SERVICE_NAME}',
      serviceVersion: '${SERVICE_VERSION}',
      environment: '${ENVIRONMENT}',
      samplingRate: 0.05,
      enableTracing: true,
      enableMetrics: true,
      enableLogs: true,
      region: '${AWS_REGION}',
      batchSize: 200,
      maxQueueSize: 2000,
      exportTimeout: 15000,
      customMetrics: true,
      errorSampling: 1.0,
      slowRequestThreshold: 5000,
      captureExceptions: true,
      businessMetrics: true
    },
    examples: [
      {
        id: 'java-alerting',
        title: 'Java Alerting Configuration',
        description: 'Configuration focused on alerting and monitoring',
        code: `# application.properties
cloudwatch.apm.service.name=monitored-java-app
cloudwatch.apm.service.version=1.2.0
cloudwatch.apm.environment=production
cloudwatch.apm.sampling.rate=0.05
cloudwatch.apm.tracing.enabled=true
cloudwatch.apm.metrics.enabled=true
cloudwatch.apm.logs.enabled=true
cloudwatch.apm.region=us-east-1
cloudwatch.apm.batch.size=200
cloudwatch.apm.queue.max-size=2000
cloudwatch.apm.export.timeout=15000
cloudwatch.apm.custom-metrics.enabled=true
cloudwatch.apm.error-sampling.rate=1.0
cloudwatch.apm.slow-request.threshold=5000
cloudwatch.apm.capture.exceptions=true
cloudwatch.apm.business-metrics.enabled=true`,
        language: 'properties',
        notes: [
          'Error sampling at 100% ensures all errors are captured',
          'Custom metrics enable business-specific monitoring',
          'Slow request threshold helps identify performance issues'
        ]
      }
    ]
  },
  {
    id: 'docker-containerized',
    name: 'Docker Container Configuration',
    description: 'Configuration optimized for containerized deployments',
    platforms: ['docker', 'kubernetes'],
    useCase: 'monitoring',
    configuration: {
      serviceName: '${SERVICE_NAME}',
      serviceVersion: '${SERVICE_VERSION}',
      environment: '${ENVIRONMENT}',
      samplingRate: 0.1,
      enableTracing: true,
      enableMetrics: true,
      enableLogs: true,
      region: '${AWS_REGION}',
      batchSize: 100,
      maxQueueSize: 1000,
      exportTimeout: 30000,
      containerMetrics: true,
      resourceDetection: true,
      healthCheck: true
    },
    examples: [
      {
        id: 'docker-compose',
        title: 'Docker Compose Configuration',
        description: 'Environment variables for Docker Compose',
        code: `# docker-compose.yml
version: '3.8'
services:
  app:
    image: my-app:latest
    environment:
      - CLOUDWATCH_APM_SERVICE_NAME=containerized-app
      - CLOUDWATCH_APM_SERVICE_VERSION=1.0.0
      - CLOUDWATCH_APM_ENVIRONMENT=production
      - CLOUDWATCH_APM_SAMPLING_RATE=0.1
      - CLOUDWATCH_APM_TRACING_ENABLED=true
      - CLOUDWATCH_APM_METRICS_ENABLED=true
      - CLOUDWATCH_APM_LOGS_ENABLED=true
      - AWS_REGION=us-east-1
      - CLOUDWATCH_APM_BATCH_SIZE=100
      - CLOUDWATCH_APM_QUEUE_MAX_SIZE=1000
      - CLOUDWATCH_APM_EXPORT_TIMEOUT=30000
      - CLOUDWATCH_APM_CONTAINER_METRICS=true
      - CLOUDWATCH_APM_RESOURCE_DETECTION=true
      - CLOUDWATCH_APM_HEALTH_CHECK=true`,
        language: 'yaml',
        notes: [
          'Use environment variables for container configuration',
          'Enable resource detection for automatic container metadata',
          'Health check endpoint helps with container orchestration'
        ]
      },
      {
        id: 'kubernetes-configmap',
        title: 'Kubernetes ConfigMap',
        description: 'ConfigMap for Kubernetes deployments',
        code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: cloudwatch-apm-config
  namespace: default
data:
  CLOUDWATCH_APM_SERVICE_NAME: "k8s-app"
  CLOUDWATCH_APM_SERVICE_VERSION: "1.0.0"
  CLOUDWATCH_APM_ENVIRONMENT: "production"
  CLOUDWATCH_APM_SAMPLING_RATE: "0.1"
  CLOUDWATCH_APM_TRACING_ENABLED: "true"
  CLOUDWATCH_APM_METRICS_ENABLED: "true"
  CLOUDWATCH_APM_LOGS_ENABLED: "true"
  AWS_REGION: "us-east-1"
  CLOUDWATCH_APM_BATCH_SIZE: "100"
  CLOUDWATCH_APM_QUEUE_MAX_SIZE: "1000"
  CLOUDWATCH_APM_EXPORT_TIMEOUT: "30000"
  CLOUDWATCH_APM_CONTAINER_METRICS: "true"
  CLOUDWATCH_APM_RESOURCE_DETECTION: "true"
  CLOUDWATCH_APM_HEALTH_CHECK: "true"`,
        language: 'yaml',
        notes: [
          'Apply this ConfigMap before deploying your application',
          'Reference this ConfigMap in your deployment manifest',
          'Consider using Secrets for sensitive configuration'
        ]
      }
    ]
  },
  {
    id: 'development-local',
    name: 'Local Development Configuration',
    description: 'Configuration for local development and testing',
    platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    useCase: 'debugging',
    configuration: {
      serviceName: '${SERVICE_NAME}-dev',
      serviceVersion: 'dev',
      environment: 'development',
      samplingRate: 1.0,
      enableTracing: true,
      enableMetrics: false,
      enableLogs: true,
      region: 'us-east-1',
      batchSize: 1,
      maxQueueSize: 10,
      exportTimeout: 1000,
      logLevel: 'DEBUG',
      consoleExporter: true,
      fileExporter: false,
      remoteExporter: false
    },
    examples: [
      {
        id: 'local-dev',
        title: 'Local Development Setup',
        description: 'Configuration for local development',
        code: `# .env.development
CLOUDWATCH_APM_SERVICE_NAME=my-app-dev
CLOUDWATCH_APM_SERVICE_VERSION=dev
CLOUDWATCH_APM_ENVIRONMENT=development
CLOUDWATCH_APM_SAMPLING_RATE=1.0
CLOUDWATCH_APM_TRACING_ENABLED=true
CLOUDWATCH_APM_METRICS_ENABLED=false
CLOUDWATCH_APM_LOGS_ENABLED=true
AWS_REGION=us-east-1
CLOUDWATCH_APM_BATCH_SIZE=1
CLOUDWATCH_APM_QUEUE_MAX_SIZE=10
CLOUDWATCH_APM_EXPORT_TIMEOUT=1000
CLOUDWATCH_APM_LOG_LEVEL=DEBUG
CLOUDWATCH_APM_CONSOLE_EXPORTER=true
CLOUDWATCH_APM_FILE_EXPORTER=false
CLOUDWATCH_APM_REMOTE_EXPORTER=false`,
        language: 'bash',
        notes: [
          'Use console exporter to see traces in terminal',
          'Disable remote export to avoid AWS costs during development',
          'Single item batches provide immediate feedback'
        ]
      }
    ]
  }
]