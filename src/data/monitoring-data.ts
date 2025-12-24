// Sample data for monitoring and alerting documentation
import {
  MetricDefinition,
  MetricCategory,
  AlertConfiguration,
  DashboardTemplate,
  MonitoringBestPractice,
  PerformanceMetricCatalog,
  AlertingWizardStep,
  DashboardCategory,
  BestPracticeCategory
} from '../types/monitoring'

export const metricCategories: MetricCategory[] = [
  {
    id: 'application',
    name: 'Application Metrics',
    description: 'Metrics related to application performance and behavior',
    icon: 'application',
    color: '#3B82F6',
    order: 1
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Metrics',
    description: 'System-level metrics for compute, memory, and network',
    icon: 'server',
    color: '#10B981',
    order: 2
  },
  {
    id: 'business',
    name: 'Business Metrics',
    description: 'Business-critical metrics and KPIs',
    icon: 'chart',
    color: '#F59E0B',
    order: 3
  },
  {
    id: 'security',
    name: 'Security Metrics',
    description: 'Security-related monitoring and compliance metrics',
    icon: 'shield',
    color: '#EF4444',
    order: 4
  }
]

export const performanceMetrics: MetricDefinition[] = [
  {
    id: 'response_time',
    name: 'ResponseTime',
    displayName: 'Response Time',
    description: 'Average response time for application requests',
    unit: 'milliseconds',
    namespace: 'AWS/ApplicationELB',
    dimensions: [
      {
        name: 'LoadBalancer',
        description: 'The name of the load balancer',
        required: true
      },
      {
        name: 'TargetGroup',
        description: 'The name of the target group',
        required: false
      }
    ],
    category: metricCategories[0],
    severity: 'high',
    defaultThresholds: [
      {
        condition: 'greater_than',
        value: 1000,
        duration: '5m',
        severity: 'warning',
        description: 'Response time exceeds 1 second',
        rationale: 'Users expect sub-second response times for good experience'
      },
      {
        condition: 'greater_than',
        value: 3000,
        duration: '2m',
        severity: 'critical',
        description: 'Response time exceeds 3 seconds',
        rationale: 'Extended response times indicate serious performance issues'
      }
    ],
    relatedMetrics: ['error_rate', 'throughput'],
    documentation: 'Response time measures the duration between request initiation and response completion. This is a critical user experience metric.',
    examples: [
      {
        id: 'normal_response',
        title: 'Normal Response Time',
        description: 'Typical response time during normal operations',
        scenario: 'Standard web application serving static and dynamic content',
        expectedValue: 200,
        interpretation: 'Response times under 300ms indicate excellent performance'
      },
      {
        id: 'degraded_response',
        title: 'Degraded Response Time',
        description: 'Response time during high load or system stress',
        scenario: 'Application under heavy load or experiencing resource constraints',
        expectedValue: 1500,
        interpretation: 'Response times over 1000ms require investigation and optimization'
      }
    ]
  },
  {
    id: 'error_rate',
    name: 'ErrorRate',
    displayName: 'Error Rate',
    description: 'Percentage of requests resulting in errors',
    unit: 'percent',
    namespace: 'AWS/ApplicationELB',
    dimensions: [
      {
        name: 'LoadBalancer',
        description: 'The name of the load balancer',
        required: true
      },
      {
        name: 'StatusCode',
        description: 'HTTP status code category',
        possibleValues: ['2xx', '3xx', '4xx', '5xx'],
        required: false
      }
    ],
    category: metricCategories[0],
    severity: 'critical',
    defaultThresholds: [
      {
        condition: 'greater_than',
        value: 1,
        duration: '5m',
        severity: 'warning',
        description: 'Error rate exceeds 1%',
        rationale: 'Error rates above 1% indicate potential issues affecting user experience'
      },
      {
        condition: 'greater_than',
        value: 5,
        duration: '2m',
        severity: 'critical',
        description: 'Error rate exceeds 5%',
        rationale: 'High error rates indicate serious system problems requiring immediate attention'
      }
    ],
    relatedMetrics: ['response_time', 'throughput'],
    documentation: 'Error rate tracks the percentage of requests that result in HTTP error responses (4xx, 5xx status codes).',
    examples: [
      {
        id: 'healthy_error_rate',
        title: 'Healthy Error Rate',
        description: 'Normal error rate for a healthy application',
        scenario: 'Well-functioning application with proper error handling',
        expectedValue: 0.1,
        interpretation: 'Error rates below 0.5% indicate healthy application behavior'
      },
      {
        id: 'elevated_error_rate',
        title: 'Elevated Error Rate',
        description: 'Error rate indicating potential issues',
        scenario: 'Application experiencing intermittent failures or resource constraints',
        expectedValue: 2.5,
        interpretation: 'Error rates above 2% require investigation and remediation'
      }
    ]
  },
  {
    id: 'cpu_utilization',
    name: 'CPUUtilization',
    displayName: 'CPU Utilization',
    description: 'Percentage of CPU capacity being used',
    unit: 'percent',
    namespace: 'AWS/EC2',
    dimensions: [
      {
        name: 'InstanceId',
        description: 'The ID of the EC2 instance',
        required: true
      }
    ],
    category: metricCategories[1],
    severity: 'medium',
    defaultThresholds: [
      {
        condition: 'greater_than',
        value: 70,
        duration: '10m',
        severity: 'warning',
        description: 'CPU utilization exceeds 70%',
        rationale: 'High CPU usage may indicate need for scaling or optimization'
      },
      {
        condition: 'greater_than',
        value: 90,
        duration: '5m',
        severity: 'critical',
        description: 'CPU utilization exceeds 90%',
        rationale: 'Very high CPU usage can lead to performance degradation and timeouts'
      }
    ],
    relatedMetrics: ['memory_utilization', 'network_in', 'network_out'],
    documentation: 'CPU utilization measures the percentage of CPU capacity currently in use by the instance.',
    examples: [
      {
        id: 'normal_cpu',
        title: 'Normal CPU Usage',
        description: 'Typical CPU utilization during normal operations',
        scenario: 'Web server handling moderate traffic load',
        expectedValue: 35,
        interpretation: 'CPU usage between 20-50% indicates healthy resource utilization'
      },
      {
        id: 'high_cpu',
        title: 'High CPU Usage',
        description: 'CPU utilization during peak load',
        scenario: 'Application processing high volume of requests or compute-intensive tasks',
        expectedValue: 85,
        interpretation: 'CPU usage above 80% may require scaling or performance optimization'
      }
    ]
  }
]

export const alertingWizardSteps: AlertingWizardStep[] = [
  {
    id: 'metric_selection',
    title: 'Select Metric',
    description: 'Choose the metric you want to monitor and create alerts for',
    component: 'MetricSelector',
    validation: [
      {
        field: 'metric',
        type: 'required',
        message: 'Please select a metric to monitor'
      }
    ],
    nextStep: 'threshold_configuration'
  },
  {
    id: 'threshold_configuration',
    title: 'Configure Thresholds',
    description: 'Set the threshold values and conditions that will trigger the alert',
    component: 'ThresholdConfiguration',
    validation: [
      {
        field: 'threshold.value',
        type: 'required',
        message: 'Please specify a threshold value'
      },
      {
        field: 'threshold.condition',
        type: 'required',
        message: 'Please select a threshold condition'
      },
      {
        field: 'threshold.duration',
        type: 'required',
        message: 'Please specify the evaluation duration'
      }
    ],
    previousStep: 'metric_selection',
    nextStep: 'notification_setup'
  },
  {
    id: 'notification_setup',
    title: 'Setup Notifications',
    description: 'Configure how and where you want to be notified when the alert triggers',
    component: 'NotificationSetup',
    validation: [
      {
        field: 'notifications',
        type: 'custom',
        message: 'Please configure at least one notification method',
        validator: (value: unknown) => Array.isArray(value) && value.length > 0
      }
    ],
    previousStep: 'threshold_configuration',
    nextStep: 'review_and_create'
  },
  {
    id: 'review_and_create',
    title: 'Review & Create',
    description: 'Review your alert configuration and create the alert',
    component: 'AlertReview',
    validation: [
      {
        field: 'name',
        type: 'required',
        message: 'Please provide a name for the alert'
      }
    ],
    previousStep: 'notification_setup'
  }
]

export const dashboardCategories: DashboardCategory[] = [
  {
    id: 'application_overview',
    name: 'Application Overview',
    description: 'High-level application performance and health dashboards',
    icon: 'dashboard',
    order: 1
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Monitoring',
    description: 'System-level monitoring dashboards for compute and network resources',
    icon: 'server',
    order: 2
  },
  {
    id: 'business_metrics',
    name: 'Business Metrics',
    description: 'Business KPI and revenue-focused monitoring dashboards',
    icon: 'trending-up',
    order: 3
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Detailed diagnostic and troubleshooting dashboards',
    icon: 'search',
    order: 4
  }
]

export const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'application_health',
    name: 'Application Health Overview',
    description: 'Comprehensive dashboard showing application performance, errors, and availability',
    category: dashboardCategories[0],
    widgets: [
      {
        id: 'response_time_widget',
        type: 'metric',
        title: 'Average Response Time',
        description: 'Application response time over time',
        configuration: {
          metrics: ['response_time'],
          timeRange: '1h',
          refreshInterval: '1m',
          visualization: 'line',
          thresholds: [
            { value: 1000, color: '#FFA500', label: 'Warning' },
            { value: 3000, color: '#FF0000', label: 'Critical' }
          ]
        },
        position: { x: 0, y: 0 },
        size: { width: 6, height: 4 }
      },
      {
        id: 'error_rate_widget',
        type: 'metric',
        title: 'Error Rate',
        description: 'Percentage of requests resulting in errors',
        configuration: {
          metrics: ['error_rate'],
          timeRange: '1h',
          refreshInterval: '1m',
          visualization: 'line',
          thresholds: [
            { value: 1, color: '#FFA500', label: 'Warning' },
            { value: 5, color: '#FF0000', label: 'Critical' }
          ]
        },
        position: { x: 6, y: 0 },
        size: { width: 6, height: 4 }
      },
      {
        id: 'throughput_widget',
        type: 'metric',
        title: 'Request Throughput',
        description: 'Number of requests per minute',
        configuration: {
          metrics: ['request_count'],
          timeRange: '1h',
          refreshInterval: '1m',
          visualization: 'bar'
        },
        position: { x: 0, y: 4 },
        size: { width: 12, height: 4 }
      }
    ],
    layout: {
      columns: 12,
      rows: 8,
      responsive: true
    },
    variables: [
      {
        name: 'environment',
        type: 'constant',
        label: 'Environment',
        defaultValue: 'production',
        options: ['production', 'staging', 'development']
      }
    ],
    tags: ['application', 'performance', 'health'],
    useCase: 'Monitor overall application health and performance metrics',
    difficulty: 'beginner',
    estimatedSetupTime: '15 minutes'
  },
  {
    id: 'infrastructure_monitoring',
    name: 'Infrastructure Monitoring',
    description: 'System-level monitoring dashboard for CPU, memory, and network metrics',
    category: dashboardCategories[1],
    widgets: [
      {
        id: 'cpu_widget',
        type: 'metric',
        title: 'CPU Utilization',
        configuration: {
          metrics: ['cpu_utilization'],
          timeRange: '4h',
          refreshInterval: '5m',
          visualization: 'line',
          thresholds: [
            { value: 70, color: '#FFA500', label: 'Warning' },
            { value: 90, color: '#FF0000', label: 'Critical' }
          ]
        },
        position: { x: 0, y: 0 },
        size: { width: 6, height: 4 }
      },
      {
        id: 'memory_widget',
        type: 'metric',
        title: 'Memory Utilization',
        configuration: {
          metrics: ['memory_utilization'],
          timeRange: '4h',
          refreshInterval: '5m',
          visualization: 'line',
          thresholds: [
            { value: 80, color: '#FFA500', label: 'Warning' },
            { value: 95, color: '#FF0000', label: 'Critical' }
          ]
        },
        position: { x: 6, y: 0 },
        size: { width: 6, height: 4 }
      }
    ],
    layout: {
      columns: 12,
      rows: 8,
      responsive: true
    },
    variables: [
      {
        name: 'instance_id',
        type: 'query',
        label: 'Instance ID',
        query: 'SELECT DISTINCT InstanceId FROM AWS/EC2'
      }
    ],
    tags: ['infrastructure', 'system', 'monitoring'],
    useCase: 'Monitor system-level resource utilization and capacity',
    difficulty: 'intermediate',
    estimatedSetupTime: '20 minutes'
  }
]

export const bestPracticeCategories: BestPracticeCategory[] = [
  {
    id: 'alerting',
    name: 'Alerting Strategy',
    description: 'Best practices for effective alerting and notification strategies',
    icon: 'bell'
  },
  {
    id: 'dashboard_design',
    name: 'Dashboard Design',
    description: 'Guidelines for creating effective and actionable dashboards',
    icon: 'layout'
  },
  {
    id: 'metric_selection',
    name: 'Metric Selection',
    description: 'Choosing the right metrics to monitor for your applications',
    icon: 'target'
  },
  {
    id: 'performance_optimization',
    name: 'Performance Optimization',
    description: 'Using monitoring data to optimize application performance',
    icon: 'zap'
  }
]

export const monitoringBestPractices: MonitoringBestPractice[] = [
  {
    id: 'golden_signals',
    title: 'Monitor the Four Golden Signals',
    description: 'Focus on the four key metrics that matter most for service reliability: latency, traffic, errors, and saturation',
    category: bestPracticeCategories[2],
    importance: 'critical',
    implementation: {
      overview: 'The Four Golden Signals provide a comprehensive view of service health and should be the foundation of any monitoring strategy.',
      steps: [
        {
          id: 'latency_monitoring',
          title: 'Set up Latency Monitoring',
          description: 'Monitor request latency including both successful and failed requests',
          code: `// Example CloudWatch metric for latency
{
  "MetricName": "ResponseTime",
  "Namespace": "MyApp/Performance",
  "Dimensions": [
    {"Name": "Service", "Value": "WebAPI"}
  ],
  "Value": responseTime,
  "Unit": "Milliseconds"
}`,
          validation: 'Verify latency metrics are being collected and displayed in dashboards',
          troubleshooting: [
            'Check that timing code is properly instrumented',
            'Ensure metrics are being published to CloudWatch',
            'Verify dashboard queries are correct'
          ]
        },
        {
          id: 'traffic_monitoring',
          title: 'Monitor Traffic Volume',
          description: 'Track the volume of requests hitting your service',
          code: `// Example traffic metric
{
  "MetricName": "RequestCount",
  "Namespace": "MyApp/Traffic",
  "Value": 1,
  "Unit": "Count"
}`,
          validation: 'Confirm traffic metrics show expected patterns and volumes',
          troubleshooting: [
            'Verify request counting is accurate',
            'Check for missing or duplicate counts',
            'Ensure proper aggregation in dashboards'
          ]
        }
      ],
      prerequisites: [
        'CloudWatch agent or SDK integration',
        'Application instrumentation',
        'Proper IAM permissions for metric publishing'
      ],
      estimatedTime: '2-4 hours',
      difficulty: 'intermediate'
    },
    examples: [
      {
        id: 'web_service_golden_signals',
        title: 'Web Service Golden Signals',
        description: 'Implementation of golden signals for a web service',
        scenario: 'REST API service handling user requests',
        implementation: 'Monitor response time, request rate, error percentage, and CPU/memory utilization',
        benefits: [
          'Early detection of performance issues',
          'Clear understanding of service health',
          'Actionable alerts based on user impact'
        ],
        metrics: ['response_time', 'request_rate', 'error_rate', 'cpu_utilization']
      }
    ],
    relatedPractices: ['effective_alerting', 'dashboard_design'],
    tags: ['monitoring', 'reliability', 'performance', 'golden-signals']
  },
  {
    id: 'effective_alerting',
    title: 'Design Effective Alert Strategies',
    description: 'Create alerts that are actionable, relevant, and minimize false positives while ensuring critical issues are caught',
    category: bestPracticeCategories[0],
    importance: 'critical',
    implementation: {
      overview: 'Effective alerting balances sensitivity with specificity to ensure teams are notified of real issues without alert fatigue.',
      steps: [
        {
          id: 'alert_severity_levels',
          title: 'Define Alert Severity Levels',
          description: 'Establish clear severity levels with appropriate response expectations',
          validation: 'Verify alert severity levels are consistently applied across all alerts',
          troubleshooting: [
            'Review alert history for misclassified alerts',
            'Adjust thresholds based on historical data',
            'Ensure escalation procedures match severity levels'
          ]
        },
        {
          id: 'threshold_tuning',
          title: 'Tune Alert Thresholds',
          description: 'Set thresholds based on historical data and business impact',
          validation: 'Monitor alert frequency and false positive rates',
          troubleshooting: [
            'Analyze historical metric data to set appropriate thresholds',
            'Use statistical methods to determine normal operating ranges',
            'Implement dynamic thresholds for metrics with cyclical patterns'
          ]
        }
      ],
      prerequisites: [
        'Historical metric data for threshold analysis',
        'Clear incident response procedures',
        'Notification channels configured'
      ],
      estimatedTime: '4-6 hours',
      difficulty: 'advanced'
    },
    examples: [
      {
        id: 'tiered_alerting',
        title: 'Tiered Alerting Strategy',
        description: 'Multi-level alerting with escalation based on severity',
        scenario: 'E-commerce platform with different alert priorities',
        implementation: 'Warning alerts for performance degradation, critical alerts for service outages',
        benefits: [
          'Appropriate response urgency',
          'Reduced alert fatigue',
          'Clear escalation paths'
        ],
        metrics: ['error_rate', 'response_time', 'availability']
      }
    ],
    relatedPractices: ['golden_signals', 'dashboard_design'],
    tags: ['alerting', 'incident-response', 'reliability']
  }
]

export const performanceMetricCatalog: PerformanceMetricCatalog = {
  categories: metricCategories,
  metrics: performanceMetrics,
  relationships: [
    {
      primary: 'response_time',
      related: ['cpu_utilization', 'memory_utilization', 'error_rate'],
      type: 'correlation',
      description: 'Response time often correlates with resource utilization and error rates'
    },
    {
      primary: 'error_rate',
      related: ['response_time', 'throughput'],
      type: 'causation',
      description: 'High error rates can cause increased response times and reduced throughput'
    }
  ],
  useCases: [
    {
      id: 'web_application_monitoring',
      name: 'Web Application Monitoring',
      description: 'Comprehensive monitoring setup for web applications',
      scenario: 'Monitor a web application for performance, availability, and user experience',
      metrics: ['response_time', 'error_rate', 'cpu_utilization'],
      dashboards: ['application_health'],
      alerts: ['high_response_time', 'elevated_error_rate'],
      interpretation: 'Focus on user-facing metrics while monitoring underlying infrastructure health'
    }
  ]
}

export const sampleAlertConfigurations: AlertConfiguration[] = [
  {
    id: 'high_response_time',
    name: 'High Response Time Alert',
    description: 'Alert when application response time exceeds acceptable thresholds',
    metric: 'response_time',
    threshold: {
      condition: 'greater_than',
      value: 1000,
      duration: '5m',
      evaluationPeriods: 2,
      datapointsToAlarm: 2,
      treatMissingData: 'notBreaching'
    },
    notifications: [
      {
        type: 'email',
        target: 'ops-team@company.com',
        enabled: true,
        conditions: [
          { state: 'alarm', enabled: true },
          { state: 'ok', enabled: true }
        ]
      },
      {
        type: 'slack',
        target: '#alerts-channel',
        enabled: true,
        conditions: [
          { state: 'alarm', enabled: true }
        ]
      }
    ],
    actions: [],
    tags: {
      'Environment': 'production',
      'Service': 'web-api',
      'Team': 'platform'
    },
    enabled: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]