import { ConfigurationUseCase } from '../types/configuration'

export const CONFIGURATION_USE_CASES: ConfigurationUseCase[] = [
  {
    id: 'basic-monitoring',
    name: 'Basic Application Monitoring',
    description: 'Essential monitoring setup for production applications with balanced performance and observability',
    scenario: 'You have a production web application and want to start monitoring its performance with CloudWatch APM. You need basic tracing and metrics without significant performance overhead.',
    configuration: {
      serviceName: 'my-web-app',
      serviceVersion: '1.0.0',
      environment: 'production',
      region: 'us-east-1',
      enableTracing: true,
      enableMetrics: true,
      enableLogs: false,
      samplingRate: 0.1,
      batchSize: 100,
      maxQueueSize: 1000,
      exportTimeout: 30000,
      compressionEnabled: true,
      asyncExport: true
    },
    explanation: 'This configuration provides 10% sampling for tracing, which captures enough data for monitoring while minimizing performance impact. Metrics are enabled for performance monitoring, but logs are disabled to reduce data volume. Compression and async export optimize performance.',
    platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    environment: 'production',
    performance: {
      overhead: 'low',
      throughput: '95-98% of baseline',
      latency: '<5ms additional latency',
      memoryUsage: '<50MB additional memory',
      recommendations: [
        'Monitor CPU usage after deployment',
        'Adjust sampling rate based on traffic volume',
        'Use async export to prevent blocking application threads'
      ]
    },
    monitoring: {
      keyMetrics: [
        'request.duration',
        'request.count',
        'error.rate',
        'service.availability'
      ],
      alertThresholds: {
        'error.rate': '> 5%',
        'request.duration.p95': '> 2000ms',
        'service.availability': '< 99%'
      },
      dashboards: [
        'Service Overview Dashboard',
        'Error Rate Monitoring',
        'Performance Metrics'
      ],
      troubleshooting: [
        'Check sampling rate if missing traces',
        'Verify async export is working',
        'Monitor queue size for backpressure'
      ]
    }
  },
  {
    id: 'high-traffic-performance',
    name: 'High-Traffic Performance Optimization',
    description: 'Optimized configuration for high-throughput applications prioritizing minimal performance impact',
    scenario: 'Your application handles millions of requests per day and performance is critical. You need monitoring but cannot afford significant overhead.',
    configuration: {
      serviceName: 'high-traffic-api',
      serviceVersion: '2.1.0',
      environment: 'production',
      region: 'us-east-1',
      enableTracing: true,
      enableMetrics: true,
      enableLogs: false,
      samplingRate: 0.01,
      batchSize: 500,
      maxQueueSize: 5000,
      exportTimeout: 10000,
      compressionEnabled: true,
      asyncExport: true,
      bufferSize: 8192,
      maxSpanAttributes: 32,
      maxSpanEvents: 128
    },
    explanation: 'Ultra-low sampling rate (1%) minimizes overhead while still capturing representative data. Large batch sizes and queues improve export efficiency. Reduced span attributes and events limit memory usage. Fast export timeout prevents data accumulation.',
    platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    environment: 'production',
    performance: {
      overhead: 'low',
      throughput: '98-99% of baseline',
      latency: '<2ms additional latency',
      memoryUsage: '<30MB additional memory',
      recommendations: [
        'Monitor application performance metrics closely',
        'Consider even lower sampling rates if needed',
        'Use dedicated monitoring instances for export processing',
        'Implement circuit breakers for export failures'
      ]
    },
    monitoring: {
      keyMetrics: [
        'request.throughput',
        'request.duration.p99',
        'error.rate',
        'system.cpu.utilization',
        'system.memory.utilization'
      ],
      alertThresholds: {
        'request.throughput': '< 10000 req/min',
        'request.duration.p99': '> 1000ms',
        'error.rate': '> 1%',
        'system.cpu.utilization': '> 80%'
      },
      dashboards: [
        'High-Traffic Performance Dashboard',
        'System Resource Monitoring',
        'Throughput Analysis'
      ],
      troubleshooting: [
        'Increase batch size if export is slow',
        'Reduce sampling rate if overhead is too high',
        'Check queue metrics for bottlenecks'
      ]
    }
  },
  {
    id: 'debugging-detailed',
    name: 'Comprehensive Debugging Setup',
    description: 'Full observability configuration for debugging and troubleshooting issues',
    scenario: 'You are investigating production issues or developing new features and need maximum visibility into application behavior.',
    configuration: {
      serviceName: 'debug-service',
      serviceVersion: '1.0.0-debug',
      environment: 'development',
      region: 'us-east-1',
      enableTracing: true,
      enableMetrics: true,
      enableLogs: true,
      samplingRate: 1.0,
      batchSize: 10,
      maxQueueSize: 100,
      exportTimeout: 5000,
      logLevel: 'DEBUG',
      captureHttpHeaders: true,
      captureHttpBody: true,
      captureExceptions: true,
      maxSpanAttributes: 128,
      maxSpanEvents: 256,
      compressionEnabled: false,
      asyncExport: false
    },
    explanation: '100% sampling captures all requests for complete visibility. Small batch sizes provide immediate data availability. HTTP headers and bodies are captured for detailed debugging. Synchronous export ensures data consistency during debugging.',
    platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    environment: 'development',
    performance: {
      overhead: 'high',
      throughput: '70-80% of baseline',
      latency: '10-20ms additional latency',
      memoryUsage: '100-200MB additional memory',
      recommendations: [
        'Use only in development or staging environments',
        'Monitor system resources closely',
        'Disable body capture for large payloads',
        'Reduce sampling rate if system becomes unstable'
      ]
    },
    monitoring: {
      keyMetrics: [
        'trace.count',
        'span.count',
        'log.count',
        'debug.events',
        'exception.count'
      ],
      alertThresholds: {
        'exception.count': '> 10 per hour',
        'debug.events': '> 1000 per minute',
        'system.memory.utilization': '> 90%'
      },
      dashboards: [
        'Debug Trace Analysis',
        'Exception Tracking',
        'Request Flow Visualization'
      ],
      troubleshooting: [
        'Check log correlation with traces',
        'Verify exception capture is working',
        'Monitor export queue for overflow'
      ]
    }
  },
  {
    id: 'alerting-focused',
    name: 'Proactive Alerting and Monitoring',
    description: 'Configuration optimized for alerting and proactive issue detection',
    scenario: 'You want to detect and alert on issues before they impact users, with focus on business metrics and SLA monitoring.',
    configuration: {
      serviceName: 'monitored-service',
      serviceVersion: '1.2.0',
      environment: 'production',
      region: 'us-east-1',
      enableTracing: true,
      enableMetrics: true,
      enableLogs: true,
      samplingRate: 0.05,
      batchSize: 200,
      maxQueueSize: 2000,
      exportTimeout: 15000,
      customMetrics: true,
      errorSampling: 1.0,
      slowRequestThreshold: 5000,
      captureExceptions: true,
      businessMetrics: true
    },
    explanation: 'Moderate sampling with 100% error sampling ensures all errors are captured. Custom and business metrics enable comprehensive monitoring. Slow request threshold helps identify performance issues early.',
    platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    environment: 'production',
    performance: {
      overhead: 'medium',
      throughput: '90-95% of baseline',
      latency: '<8ms additional latency',
      memoryUsage: '<75MB additional memory',
      recommendations: [
        'Define custom metrics for business KPIs',
        'Set up automated alerting rules',
        'Monitor alert fatigue and tune thresholds',
        'Implement escalation procedures'
      ]
    },
    monitoring: {
      keyMetrics: [
        'business.transactions.count',
        'business.revenue.total',
        'sla.availability',
        'sla.response_time',
        'error.rate.by_type',
        'slow.requests.count'
      ],
      alertThresholds: {
        'sla.availability': '< 99.9%',
        'sla.response_time': '> 2000ms',
        'business.transactions.count': '< expected_volume * 0.8',
        'error.rate.by_type.critical': '> 0.1%'
      },
      dashboards: [
        'SLA Monitoring Dashboard',
        'Business Metrics Overview',
        'Alert Status Dashboard'
      ],
      troubleshooting: [
        'Check error sampling configuration',
        'Verify custom metrics are being collected',
        'Review alert threshold effectiveness'
      ]
    }
  },
  {
    id: 'microservices-distributed',
    name: 'Microservices Distributed Tracing',
    description: 'Configuration for distributed microservices architecture with service mesh integration',
    scenario: 'You have a microservices architecture with multiple services communicating via HTTP/gRPC and need to trace requests across service boundaries.',
    configuration: {
      serviceName: '${SERVICE_NAME}',
      serviceVersion: '${SERVICE_VERSION}',
      environment: 'production',
      region: 'us-east-1',
      enableTracing: true,
      enableMetrics: true,
      enableLogs: true,
      samplingRate: 0.1,
      batchSize: 150,
      maxQueueSize: 1500,
      exportTimeout: 20000,
      propagationFormats: ['tracecontext', 'b3'],
      serviceMapEnabled: true,
      dependencyTracking: true,
      crossServiceCorrelation: true,
      resourceDetection: true
    },
    explanation: 'Multiple propagation formats ensure compatibility across different services. Service map and dependency tracking provide visibility into service interactions. Resource detection automatically identifies service metadata.',
    platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express', 'kubernetes'],
    environment: 'production',
    performance: {
      overhead: 'medium',
      throughput: '88-93% of baseline',
      latency: '<10ms additional latency',
      memoryUsage: '<80MB additional memory',
      recommendations: [
        'Ensure consistent configuration across all services',
        'Use service mesh for automatic instrumentation',
        'Monitor cross-service call patterns',
        'Implement distributed rate limiting'
      ]
    },
    monitoring: {
      keyMetrics: [
        'service.dependencies.count',
        'service.calls.duration',
        'service.calls.error_rate',
        'distributed.trace.completion_rate',
        'service.mesh.latency'
      ],
      alertThresholds: {
        'service.calls.error_rate': '> 3%',
        'service.calls.duration.p95': '> 3000ms',
        'distributed.trace.completion_rate': '< 95%'
      },
      dashboards: [
        'Service Map Visualization',
        'Distributed Trace Analysis',
        'Cross-Service Performance'
      ],
      troubleshooting: [
        'Check trace propagation between services',
        'Verify service discovery is working',
        'Monitor for partial traces'
      ]
    }
  },
  {
    id: 'containerized-kubernetes',
    name: 'Containerized Kubernetes Deployment',
    description: 'Configuration optimized for containerized applications running on Kubernetes',
    scenario: 'Your application runs in Kubernetes pods and you need monitoring that works well with container orchestration and scaling.',
    configuration: {
      serviceName: '${K8S_SERVICE_NAME}',
      serviceVersion: '${K8S_SERVICE_VERSION}',
      environment: '${K8S_ENVIRONMENT}',
      region: '${AWS_REGION}',
      enableTracing: true,
      enableMetrics: true,
      enableLogs: true,
      samplingRate: 0.1,
      batchSize: 100,
      maxQueueSize: 1000,
      exportTimeout: 30000,
      containerMetrics: true,
      resourceDetection: true,
      healthCheck: true,
      kubernetesAttributes: true,
      podMetadata: true
    },
    explanation: 'Environment variables allow dynamic configuration per deployment. Container and Kubernetes-specific metrics provide infrastructure visibility. Resource detection automatically captures pod and node information.',
    platforms: ['docker', 'kubernetes'],
    environment: 'production',
    performance: {
      overhead: 'low',
      throughput: '92-97% of baseline',
      latency: '<6ms additional latency',
      memoryUsage: '<60MB additional memory',
      recommendations: [
        'Use ConfigMaps for environment-specific settings',
        'Set resource limits for APM containers',
        'Monitor pod restart rates',
        'Use horizontal pod autoscaling'
      ]
    },
    monitoring: {
      keyMetrics: [
        'k8s.pod.cpu.utilization',
        'k8s.pod.memory.utilization',
        'k8s.pod.restart.count',
        'k8s.service.request.rate',
        'container.health.status'
      ],
      alertThresholds: {
        'k8s.pod.cpu.utilization': '> 80%',
        'k8s.pod.memory.utilization': '> 85%',
        'k8s.pod.restart.count': '> 5 per hour',
        'container.health.status': '!= healthy'
      },
      dashboards: [
        'Kubernetes Cluster Overview',
        'Pod Performance Monitoring',
        'Container Health Dashboard'
      ],
      troubleshooting: [
        'Check pod logs for APM initialization',
        'Verify service account permissions',
        'Monitor resource quotas and limits'
      ]
    }
  },
  {
    id: 'security-compliance',
    name: 'Security and Compliance Focused',
    description: 'Configuration that prioritizes data security and regulatory compliance',
    scenario: 'Your application handles sensitive data and must comply with regulations like GDPR, HIPAA, or PCI-DSS.',
    configuration: {
      serviceName: 'secure-service',
      serviceVersion: '1.0.0',
      environment: 'production',
      region: 'us-east-1',
      enableTracing: true,
      enableMetrics: true,
      enableLogs: false,
      samplingRate: 0.05,
      batchSize: 50,
      maxQueueSize: 500,
      exportTimeout: 15000,
      captureHttpHeaders: false,
      captureHttpBody: false,
      captureExceptions: false,
      dataRedaction: true,
      encryptionInTransit: true,
      encryptionAtRest: true,
      auditLogging: true
    },
    explanation: 'Minimal data capture with no HTTP headers, bodies, or exceptions to prevent sensitive data leakage. Data redaction and encryption ensure compliance. Audit logging tracks all monitoring activities.',
    platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    environment: 'production',
    performance: {
      overhead: 'low',
      throughput: '94-98% of baseline',
      latency: '<4ms additional latency',
      memoryUsage: '<40MB additional memory',
      recommendations: [
        'Regularly audit data collection practices',
        'Implement data retention policies',
        'Use field-level encryption for sensitive data',
        'Monitor compliance dashboard regularly'
      ]
    },
    monitoring: {
      keyMetrics: [
        'security.events.count',
        'compliance.violations.count',
        'data.access.attempts',
        'encryption.status',
        'audit.log.completeness'
      ],
      alertThresholds: {
        'security.events.count': '> 10 per hour',
        'compliance.violations.count': '> 0',
        'data.access.attempts.unauthorized': '> 5 per hour',
        'encryption.status': '!= enabled'
      },
      dashboards: [
        'Security Compliance Dashboard',
        'Data Access Monitoring',
        'Audit Trail Visualization'
      ],
      troubleshooting: [
        'Verify data redaction is working',
        'Check encryption key rotation',
        'Review audit log completeness'
      ]
    }
  },
  {
    id: 'cost-optimized',
    name: 'Cost-Optimized Configuration',
    description: 'Configuration that minimizes CloudWatch costs while maintaining essential monitoring',
    scenario: 'You need monitoring but want to minimize AWS costs, especially for non-critical environments or cost-sensitive applications.',
    configuration: {
      serviceName: 'cost-optimized-app',
      serviceVersion: '1.0.0',
      environment: 'staging',
      region: 'us-east-1',
      enableTracing: true,
      enableMetrics: false,
      enableLogs: false,
      samplingRate: 0.02,
      batchSize: 300,
      maxQueueSize: 3000,
      exportTimeout: 60000,
      compressionEnabled: true,
      dataRetention: 7,
      metricFiltering: true,
      costOptimization: true
    },
    explanation: 'Very low sampling rate and disabled metrics/logs minimize data volume. Large batches and long export timeouts reduce API calls. Compression and short retention periods further reduce costs.',
    platforms: ['java', 'nodejs', 'python', 'spring-boot', 'express'],
    environment: 'staging',
    performance: {
      overhead: 'low',
      throughput: '97-99% of baseline',
      latency: '<3ms additional latency',
      memoryUsage: '<25MB additional memory',
      recommendations: [
        'Monitor cost metrics regularly',
        'Use reserved capacity for predictable workloads',
        'Implement intelligent sampling strategies',
        'Archive old data to cheaper storage'
      ]
    },
    monitoring: {
      keyMetrics: [
        'cost.monthly.estimate',
        'data.volume.daily',
        'sampling.efficiency',
        'essential.errors.only'
      ],
      alertThresholds: {
        'cost.monthly.estimate': '> budget_limit',
        'data.volume.daily': '> expected_volume * 1.2',
        'essential.errors.only': '> 0'
      },
      dashboards: [
        'Cost Monitoring Dashboard',
        'Data Volume Tracking',
        'Essential Metrics Only'
      ],
      troubleshooting: [
        'Check sampling rate effectiveness',
        'Verify metric filtering is working',
        'Monitor unexpected cost spikes'
      ]
    }
  }
]

// Performance tuning recommendations by use case
export const PERFORMANCE_TUNING_RECOMMENDATIONS = {
  'high-traffic': {
    title: 'High-Traffic Performance Tuning',
    recommendations: [
      {
        parameter: 'samplingRate',
        recommendation: 'Use 0.001-0.01 for very high traffic (>1M requests/day)',
        reason: 'Reduces overhead while maintaining statistical significance'
      },
      {
        parameter: 'batchSize',
        recommendation: 'Increase to 500-1000 for high throughput',
        reason: 'Reduces export frequency and improves efficiency'
      },
      {
        parameter: 'asyncExport',
        recommendation: 'Always enable for production high-traffic applications',
        reason: 'Prevents blocking application threads during export'
      },
      {
        parameter: 'maxSpanAttributes',
        recommendation: 'Reduce to 16-32 for memory optimization',
        reason: 'Limits memory usage per span in high-volume scenarios'
      }
    ]
  },
  'debugging': {
    title: 'Debugging Configuration Tuning',
    recommendations: [
      {
        parameter: 'samplingRate',
        recommendation: 'Use 1.0 for complete visibility during debugging',
        reason: 'Captures all requests to ensure no issues are missed'
      },
      {
        parameter: 'batchSize',
        recommendation: 'Use small batches (1-10) for immediate data availability',
        reason: 'Provides faster feedback during debugging sessions'
      },
      {
        parameter: 'captureHttpHeaders',
        recommendation: 'Enable for detailed request analysis',
        reason: 'Helps identify issues related to headers and authentication'
      },
      {
        parameter: 'logLevel',
        recommendation: 'Set to DEBUG for maximum internal visibility',
        reason: 'Provides detailed information about APM operation'
      }
    ]
  },
  'cost-optimization': {
    title: 'Cost Optimization Strategies',
    recommendations: [
      {
        parameter: 'samplingRate',
        recommendation: 'Use 0.01-0.05 based on traffic volume',
        reason: 'Balances cost with adequate monitoring coverage'
      },
      {
        parameter: 'enableMetrics',
        recommendation: 'Disable if not essential for cost savings',
        reason: 'Metrics can be expensive at high volumes'
      },
      {
        parameter: 'dataRetention',
        recommendation: 'Use shortest acceptable retention period',
        reason: 'Reduces long-term storage costs'
      },
      {
        parameter: 'compressionEnabled',
        recommendation: 'Always enable to reduce data transfer costs',
        reason: 'Significantly reduces bandwidth usage'
      }
    ]
  },
  'security': {
    title: 'Security-Focused Configuration',
    recommendations: [
      {
        parameter: 'captureHttpHeaders',
        recommendation: 'Disable to prevent sensitive data capture',
        reason: 'Headers may contain authentication tokens or PII'
      },
      {
        parameter: 'captureHttpBody',
        recommendation: 'Disable to prevent sensitive payload capture',
        reason: 'Request/response bodies often contain sensitive data'
      },
      {
        parameter: 'dataRedaction',
        recommendation: 'Enable automatic PII redaction',
        reason: 'Helps maintain compliance with data protection regulations'
      },
      {
        parameter: 'encryptionInTransit',
        recommendation: 'Always enable for production environments',
        reason: 'Protects data during transmission to CloudWatch'
      }
    ]
  }
}