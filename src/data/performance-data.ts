import {
  PerformanceBenchmark,
  ScalingRecommendation,
  CapacityPlan,
  CostOptimization,
  ArchitecturePattern,
  BenchmarkCategory,
  MetricUnit,
  MetricContext,
  ScalingCategory,
  RecommendationType,
  Priority,
  Complexity,
  TimeFrame,
  TrendDirection,
  CapacityAction,
  RiskCategory,
  CostCategory,
  CostOptimizationType,
  RiskLevel,
  ArchitectureCategory,
  ScaleLevel,
  ComponentType
} from '../types/performance'

// Performance Benchmarks Data
export const performanceBenchmarks: PerformanceBenchmark[] = [
  {
    id: 'throughput-baseline',
    name: 'CloudWatch APM Throughput Baseline',
    description: 'Baseline throughput measurements for CloudWatch APM ingestion',
    category: 'throughput' as BenchmarkCategory,
    metrics: [
      {
        id: 'requests-per-second',
        name: 'Requests Per Second',
        description: 'Number of trace requests processed per second',
        unit: 'requests/second' as MetricUnit,
        value: 10000,
        timestamp: new Date('2024-01-01'),
        tags: { environment: 'production', region: 'us-east-1' },
        context: 'production' as MetricContext
      },
      {
        id: 'spans-per-second',
        name: 'Spans Per Second',
        description: 'Number of spans processed per second',
        unit: 'requests/second' as MetricUnit,
        value: 50000,
        timestamp: new Date('2024-01-01'),
        tags: { environment: 'production', region: 'us-east-1' },
        context: 'production' as MetricContext
      }
    ],
    baseline: {
      value: 10000,
      confidence: 0.95,
      sampleSize: 1000,
      environment: 'production',
      version: '1.0.0',
      date: new Date('2024-01-01')
    },
    thresholds: [
      {
        metric: 'requests-per-second',
        warning: 8000,
        critical: 5000,
        direction: 'below',
        description: 'Throughput degradation threshold'
      }
    ],
    testConfiguration: {
      environment: 'production',
      instanceType: 'm5.xlarge',
      region: 'us-east-1',
      duration: 3600,
      concurrency: 100,
      dataSize: '1MB',
      parameters: {
        traceSize: 'medium',
        spanCount: 10
      }
    },
    lastUpdated: new Date('2024-01-01')
  },
  {
    id: 'latency-p99',
    name: 'CloudWatch APM P99 Latency',
    description: '99th percentile latency measurements for trace ingestion',
    category: 'latency' as BenchmarkCategory,
    metrics: [
      {
        id: 'ingestion-latency-p99',
        name: 'Ingestion Latency P99',
        description: '99th percentile latency for trace ingestion',
        unit: 'milliseconds' as MetricUnit,
        value: 250,
        timestamp: new Date('2024-01-01'),
        tags: { percentile: 'p99', operation: 'ingestion' },
        context: 'production' as MetricContext
      }
    ],
    baseline: {
      value: 250,
      confidence: 0.90,
      sampleSize: 10000,
      environment: 'production',
      version: '1.0.0',
      date: new Date('2024-01-01')
    },
    thresholds: [
      {
        metric: 'ingestion-latency-p99',
        warning: 500,
        critical: 1000,
        direction: 'above',
        description: 'Latency degradation threshold'
      }
    ],
    testConfiguration: {
      environment: 'production',
      instanceType: 'm5.xlarge',
      region: 'us-east-1',
      duration: 1800,
      concurrency: 50,
      dataSize: '500KB',
      parameters: {
        measurementInterval: 1
      }
    },
    lastUpdated: new Date('2024-01-01')
  }
]

// Scaling Recommendations Data
export const scalingRecommendations: ScalingRecommendation[] = [
  {
    id: 'horizontal-scaling-high-throughput',
    title: 'Horizontal Scaling for High Throughput',
    description: 'Scale out APM collectors to handle increased trace volume',
    category: 'horizontal' as ScalingCategory,
    currentMetrics: [
      {
        id: 'cpu-utilization',
        name: 'CPU Utilization',
        description: 'Current CPU utilization across collectors',
        unit: 'percentage' as MetricUnit,
        value: 85,
        timestamp: new Date(),
        tags: { component: 'collector' },
        context: 'production' as MetricContext
      }
    ],
    recommendations: [
      {
        id: 'add-collectors',
        title: 'Add Additional Collectors',
        description: 'Deploy 3 additional collector instances',
        type: 'infrastructure' as RecommendationType,
        configuration: {
          instanceCount: 3,
          instanceType: 'm5.large',
          autoScalingEnabled: true
        },
        estimatedCost: {
          setup: 0,
          monthly: 450,
          annual: 5400,
          currency: 'USD',
          confidence: 0.9
        },
        complexity: 'medium' as Complexity
      }
    ],
    estimatedImpact: {
      performance: 40,
      cost: -15,
      reliability: 25,
      maintainability: 10,
      confidence: 0.85
    },
    implementation: {
      steps: [
        {
          id: 'deploy-instances',
          title: 'Deploy New Collector Instances',
          description: 'Launch additional EC2 instances for collectors',
          commands: [
            'aws ec2 run-instances --image-id ami-12345 --count 3 --instance-type m5.large',
            'aws elbv2 register-targets --target-group-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/collectors/1234567890123456'
          ],
          validation: 'Check instance health in load balancer',
          rollback: 'Terminate new instances and remove from target group'
        }
      ],
      prerequisites: ['Load balancer configured', 'AMI available'],
      estimatedTime: 120,
      rollbackPlan: ['Terminate new instances', 'Update load balancer configuration'],
      validationSteps: ['Check collector health', 'Verify trace processing']
    },
    priority: 'high' as Priority
  }
]

// Capacity Planning Data
export const capacityPlans: CapacityPlan[] = [
  {
    id: 'q1-2024-capacity',
    name: 'Q1 2024 Capacity Plan',
    description: 'Capacity planning for expected Q1 2024 growth',
    timeframe: '3-months' as TimeFrame,
    currentCapacity: {
      cpu: {
        current: 65,
        peak: 85,
        average: 60,
        unit: 'percentage',
        utilization: 0.65,
        trend: 'increasing' as TrendDirection
      },
      memory: {
        current: 70,
        peak: 90,
        average: 65,
        unit: 'percentage',
        utilization: 0.70,
        trend: 'stable' as TrendDirection
      },
      storage: {
        current: 2048,
        peak: 3072,
        average: 1800,
        unit: 'GB',
        utilization: 0.67,
        trend: 'increasing' as TrendDirection
      },
      network: {
        current: 500,
        peak: 800,
        average: 450,
        unit: 'Mbps',
        utilization: 0.63,
        trend: 'increasing' as TrendDirection
      },
      requests: {
        current: 8000,
        peak: 12000,
        average: 7500,
        unit: 'requests/second',
        utilization: 0.67,
        trend: 'increasing' as TrendDirection
      },
      custom: {}
    },
    projectedCapacity: {
      cpu: {
        current: 80,
        peak: 95,
        average: 75,
        unit: 'percentage',
        utilization: 0.80,
        trend: 'increasing' as TrendDirection
      },
      memory: {
        current: 85,
        peak: 95,
        average: 80,
        unit: 'percentage',
        utilization: 0.85,
        trend: 'increasing' as TrendDirection
      },
      storage: {
        current: 3072,
        peak: 4096,
        average: 2800,
        unit: 'GB',
        utilization: 0.75,
        trend: 'increasing' as TrendDirection
      },
      network: {
        current: 750,
        peak: 1200,
        average: 700,
        unit: 'Mbps',
        utilization: 0.75,
        trend: 'increasing' as TrendDirection
      },
      requests: {
        current: 12000,
        peak: 18000,
        average: 11000,
        unit: 'requests/second',
        utilization: 0.75,
        trend: 'increasing' as TrendDirection
      },
      custom: {}
    },
    recommendations: [
      {
        id: 'scale-compute',
        resource: 'compute',
        action: 'scale-out' as CapacityAction,
        magnitude: 50,
        timeline: '2 weeks',
        justification: 'CPU utilization approaching critical thresholds',
        cost: {
          setup: 0,
          monthly: 800,
          annual: 9600,
          currency: 'USD',
          confidence: 0.9
        }
      }
    ],
    assumptions: [
      'Traffic growth continues at current 15% monthly rate',
      'No major architectural changes',
      'Current efficiency levels maintained'
    ],
    risks: [
      {
        id: 'traffic-spike',
        description: 'Unexpected traffic spike beyond projections',
        probability: 0.3,
        impact: 8,
        mitigation: 'Implement auto-scaling with higher thresholds',
        category: 'performance' as RiskCategory
      }
    ]
  }
]

// Cost Optimization Data
export const costOptimizations: CostOptimization[] = [
  {
    id: 'rightsizing-collectors',
    title: 'Right-size Collector Instances',
    description: 'Optimize collector instance types based on actual usage patterns',
    category: 'compute' as CostCategory,
    currentCost: {
      total: 2400,
      compute: 1800,
      storage: 300,
      network: 200,
      monitoring: 100,
      other: 0,
      currency: 'USD',
      period: 'monthly'
    },
    optimizedCost: {
      total: 1920,
      compute: 1440,
      storage: 300,
      network: 180,
      monitoring: 100,
      other: 0,
      currency: 'USD',
      period: 'monthly'
    },
    savings: {
      amount: 480,
      percentage: 20,
      timeframe: 'monthly',
      confidence: 0.85,
      recurring: true
    },
    recommendations: [
      {
        id: 'downsize-instances',
        title: 'Downsize Over-provisioned Instances',
        description: 'Move from m5.xlarge to m5.large for low-utilization collectors',
        type: 'rightsizing' as CostOptimizationType,
        savings: 360,
        effort: 'low' as Complexity,
        risk: 'low' as RiskLevel,
        timeline: '1 week'
      },
      {
        id: 'reserved-instances',
        title: 'Purchase Reserved Instances',
        description: 'Convert on-demand instances to 1-year reserved instances',
        type: 'reserved-instances' as CostOptimizationType,
        savings: 120,
        effort: 'low' as Complexity,
        risk: 'low' as RiskLevel,
        timeline: '1 day'
      }
    ],
    implementation: {
      steps: [
        {
          id: 'analyze-utilization',
          title: 'Analyze Current Utilization',
          description: 'Review CloudWatch metrics for instance utilization',
          commands: [
            'aws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization'
          ],
          validation: 'Confirm utilization patterns',
          rollback: 'N/A - analysis only'
        }
      ],
      prerequisites: ['CloudWatch metrics enabled', 'Cost analysis tools configured'],
      estimatedTime: 240,
      rollbackPlan: ['Revert instance types if performance degrades'],
      validationSteps: ['Monitor performance post-change', 'Validate cost savings']
    }
  }
]

// Architecture Patterns Data
export const architecturePatterns: ArchitecturePattern[] = [
  {
    id: 'microservices-apm',
    name: 'Microservices APM Pattern',
    description: 'Distributed APM architecture for microservices environments',
    category: 'microservices' as ArchitectureCategory,
    scale: 'large' as ScaleLevel,
    components: [
      {
        id: 'api-gateway',
        name: 'API Gateway',
        type: 'network' as ComponentType,
        description: 'Central entry point for all microservice requests',
        configuration: {
          throttling: true,
          caching: true,
          authentication: 'JWT'
        },
        dependencies: ['load-balancer'],
        scalingProperties: {
          horizontal: true,
          vertical: false,
          autoScaling: true,
          maxInstances: 10,
          minInstances: 2,
          scalingMetrics: ['RequestCount', 'Latency']
        }
      },
      {
        id: 'trace-collector',
        name: 'Trace Collector',
        type: 'compute' as ComponentType,
        description: 'Collects and processes distributed traces',
        configuration: {
          batchSize: 1000,
          flushInterval: 5,
          compression: true
        },
        dependencies: ['storage', 'queue'],
        scalingProperties: {
          horizontal: true,
          vertical: true,
          autoScaling: true,
          maxInstances: 20,
          minInstances: 3,
          scalingMetrics: ['CPUUtilization', 'QueueDepth']
        }
      }
    ],
    benefits: [
      'Independent scaling of components',
      'Fault isolation',
      'Technology diversity support',
      'Distributed tracing visibility'
    ],
    tradeoffs: [
      'Increased complexity',
      'Network latency overhead',
      'Distributed system challenges',
      'Higher operational overhead'
    ],
    useCases: [
      'Large-scale distributed systems',
      'Multi-team development',
      'Polyglot architectures',
      'Cloud-native applications'
    ],
    implementation: {
      steps: [
        {
          id: 'setup-gateway',
          title: 'Deploy API Gateway',
          description: 'Set up API Gateway with tracing enabled',
          commands: [
            'aws apigateway create-rest-api --name microservices-apm',
            'aws apigateway put-integration --rest-api-id <api-id> --resource-id <resource-id> --http-method GET --type HTTP'
          ],
          validation: 'Test API Gateway endpoints',
          rollback: 'Delete API Gateway'
        }
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Express.js Tracing Setup',
          description: 'Configure distributed tracing in Express.js microservice',
          code: `
const express = require('express');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(3000);
          `,
          dependencies: ['@opentelemetry/sdk-node', '@opentelemetry/auto-instrumentations-node']
        }
      ],
      configurations: [
        {
          name: 'Collector Configuration',
          description: 'OpenTelemetry Collector configuration for microservices',
          format: 'yaml',
          content: `
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024

exporters:
  awsxray:
    region: us-east-1

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [awsxray]
          `,
          variables: {
            region: 'us-east-1',
            endpoint: '0.0.0.0:4317'
          }
        }
      ],
      monitoring: {
        metrics: [
          'RequestCount',
          'ErrorRate',
          'Latency',
          'TraceCount'
        ],
        alerts: [
          {
            name: 'High Error Rate',
            condition: 'ErrorRate > 5%',
            threshold: 5,
            severity: 'warning'
          }
        ],
        dashboards: [
          {
            name: 'Microservices Overview',
            widgets: [
              {
                type: 'line-chart',
                title: 'Request Rate',
                metrics: ['RequestCount'],
                configuration: {
                  period: 300,
                  stat: 'Sum'
                }
              }
            ]
          }
        ]
      }
    }
  }
]

// Performance tuning guides data
export const performanceTuningGuides = [
  {
    id: 'collector-tuning',
    title: 'Collector Performance Tuning',
    description: 'Optimize OpenTelemetry Collector performance for high-throughput environments',
    category: 'configuration',
    recommendations: [
      {
        parameter: 'batch.timeout',
        description: 'Reduce batch timeout for lower latency',
        defaultValue: '1s',
        recommendedValue: '200ms',
        impact: 'Reduces end-to-end latency by 15-20%'
      },
      {
        parameter: 'batch.send_batch_size',
        description: 'Increase batch size for higher throughput',
        defaultValue: '512',
        recommendedValue: '2048',
        impact: 'Increases throughput by 25-30%'
      }
    ]
  }
]

export const benchmarkCategories: BenchmarkCategory[] = [
  'throughput',
  'latency',
  'resource-usage',
  'scalability',
  'reliability'
]

export const scalingCategories: ScalingCategory[] = [
  'horizontal',
  'vertical',
  'auto-scaling',
  'load-balancing',
  'caching'
]

export const architectureCategories: ArchitectureCategory[] = [
  'microservices',
  'serverless',
  'container',
  'hybrid',
  'edge'
]