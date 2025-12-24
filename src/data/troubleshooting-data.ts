import { 
  TroubleshootingIssue, 
  DiagnosticTool, 
  EscalationPath, 
  FAQ, 
  ErrorMessage 
} from '../types/troubleshooting'

export const troubleshootingIssues: TroubleshootingIssue[] = [
  {
    id: 'agent-not-starting',
    title: 'CloudWatch Agent Not Starting',
    description: 'The CloudWatch agent fails to start or stops unexpectedly',
    category: 'installation',
    severity: 'high',
    symptoms: [
      'Agent service fails to start',
      'No metrics appearing in CloudWatch console',
      'Agent logs show startup errors',
      'Process not running in system'
    ],
    causes: [
      'Incorrect configuration file',
      'Missing IAM permissions',
      'Port conflicts',
      'Insufficient system resources',
      'Corrupted installation'
    ],
    solutions: [
      {
        id: 'check-config',
        title: 'Verify Configuration File',
        description: 'Check and validate the CloudWatch agent configuration',
        steps: [
          {
            id: 'locate-config',
            title: 'Locate Configuration File',
            description: 'Find the agent configuration file location',
            type: 'command',
            content: 'sudo find /opt/aws/amazon-cloudwatch-agent -name "*.json" -type f',
            expectedResult: 'Should show configuration file path'
          },
          {
            id: 'validate-config',
            title: 'Validate Configuration',
            description: 'Use the agent to validate configuration syntax',
            type: 'command',
            content: 'sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a validate-config -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json',
            expectedResult: 'Configuration validation successful'
          }
        ],
        estimatedTime: 10,
        difficulty: 'easy',
        prerequisites: ['SSH access to instance', 'sudo privileges'],
        verificationSteps: ['Configuration file exists', 'Validation passes without errors']
      }
    ],
    diagnosticSteps: [
      {
        id: 'check-service-status',
        title: 'Check Service Status',
        description: 'Verify the current status of the CloudWatch agent service',
        command: 'sudo systemctl status amazon-cloudwatch-agent',
        expectedOutput: 'Active (running) status',
        interpretation: 'If not active, the service has failed to start or has stopped',
        nextSteps: ['check-logs', 'verify-config']
      }
    ],
    relatedIssues: ['metrics-not-appearing', 'permission-denied'],
    tags: ['agent', 'startup', 'service', 'installation'],
    lastUpdated: new Date('2024-01-15'),
    affectedComponents: ['CloudWatch Agent', 'EC2 Instance', 'System Metrics']
  },
  {
    id: 'metrics-not-appearing',
    title: 'Metrics Not Appearing in CloudWatch',
    description: 'Custom metrics or logs are not showing up in the CloudWatch console',
    category: 'data-collection',
    severity: 'medium',
    symptoms: [
      'No custom metrics in CloudWatch console',
      'Metrics delayed or intermittent',
      'Some metrics missing while others work',
      'Log groups not created'
    ],
    causes: [
      'IAM permission issues',
      'Incorrect metric namespace',
      'Network connectivity problems',
      'Agent configuration errors',
      'Region mismatch'
    ],
    solutions: [
      {
        id: 'check-iam-permissions',
        title: 'Verify IAM Permissions',
        description: 'Ensure the instance has proper CloudWatch permissions',
        steps: [
          {
            id: 'check-instance-profile',
            title: 'Check Instance Profile',
            description: 'Verify EC2 instance has CloudWatch IAM role attached',
            type: 'action',
            content: 'Navigate to EC2 console → Select instance → Actions → Security → Modify IAM role',
            expectedResult: 'IAM role with CloudWatch permissions attached'
          }
        ],
        estimatedTime: 15,
        difficulty: 'medium',
        prerequisites: ['AWS Console access', 'IAM permissions'],
        verificationSteps: ['Instance has IAM role', 'Role has CloudWatch permissions']
      }
    ],
    diagnosticSteps: [
      {
        id: 'check-agent-logs',
        title: 'Check Agent Logs',
        description: 'Review CloudWatch agent logs for errors',
        command: 'sudo tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log',
        expectedOutput: 'No error messages, successful metric publishing',
        interpretation: 'Look for permission errors, network issues, or configuration problems',
        nextSteps: ['fix-permissions', 'check-network']
      }
    ],
    relatedIssues: ['agent-not-starting', 'permission-denied'],
    tags: ['metrics', 'data-collection', 'cloudwatch', 'monitoring'],
    lastUpdated: new Date('2024-01-15'),
    affectedComponents: ['CloudWatch Metrics', 'CloudWatch Agent', 'IAM']
  },
  {
    id: 'invalid-configuration-parameters',
    title: 'Invalid Configuration Parameters',
    description: 'CloudWatch agent configuration contains invalid or unsupported parameters',
    category: 'configuration',
    severity: 'medium',
    symptoms: [
      'Agent fails to start with configuration errors',
      'Warning messages in agent logs',
      'Some metrics not collected as expected',
      'Configuration validation fails'
    ],
    causes: [
      'Typos in parameter names',
      'Invalid parameter values',
      'Deprecated configuration options',
      'Platform-specific parameter conflicts'
    ],
    solutions: [
      {
        id: 'validate-parameters',
        title: 'Validate Configuration Parameters',
        description: 'Check all configuration parameters against documentation',
        steps: [
          {
            id: 'review-config',
            title: 'Review Configuration File',
            description: 'Compare configuration with AWS documentation',
            type: 'action',
            content: 'Review each parameter in configuration file against AWS CloudWatch Agent documentation',
            expectedResult: 'All parameters match documented options'
          }
        ],
        estimatedTime: 20,
        difficulty: 'medium',
        prerequisites: ['Access to configuration file', 'AWS documentation'],
        verificationSteps: ['Configuration validates successfully', 'Agent starts without errors']
      }
    ],
    diagnosticSteps: [
      {
        id: 'validate-config-syntax',
        title: 'Validate Configuration Syntax',
        description: 'Use built-in validation to check configuration',
        command: 'sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a validate-config -c file:/path/to/config.json',
        expectedOutput: 'Configuration validation successful',
        interpretation: 'Any errors indicate invalid parameters or syntax issues',
        nextSteps: ['fix-parameters', 'check-documentation']
      }
    ],
    relatedIssues: ['agent-not-starting'],
    tags: ['configuration', 'parameters', 'validation'],
    lastUpdated: new Date('2024-01-15'),
    affectedComponents: ['CloudWatch Agent', 'Configuration File']
  },
  {
    id: 'high-cpu-usage',
    title: 'High CPU Usage from CloudWatch Agent',
    description: 'CloudWatch agent consuming excessive CPU resources',
    category: 'performance',
    severity: 'medium',
    symptoms: [
      'High CPU usage by amazon-cloudwatch-agent process',
      'System performance degradation',
      'Increased EC2 costs due to higher instance requirements',
      'Agent process consuming more than 10% CPU consistently'
    ],
    causes: [
      'Too frequent metric collection intervals',
      'Large number of custom metrics',
      'Inefficient log parsing patterns',
      'Memory leaks in agent'
    ],
    solutions: [
      {
        id: 'optimize-collection-intervals',
        title: 'Optimize Collection Intervals',
        description: 'Adjust metric collection frequency to reduce CPU load',
        steps: [
          {
            id: 'increase-intervals',
            title: 'Increase Collection Intervals',
            description: 'Change metric collection from 60s to 300s for non-critical metrics',
            type: 'configuration',
            content: 'Update "metrics_collection_interval" in configuration from 60 to 300',
            expectedResult: 'Reduced CPU usage while maintaining monitoring coverage'
          }
        ],
        estimatedTime: 15,
        difficulty: 'easy',
        prerequisites: ['Access to configuration file'],
        verificationSteps: ['CPU usage decreases', 'Metrics still collected properly']
      }
    ],
    diagnosticSteps: [
      {
        id: 'monitor-cpu-usage',
        title: 'Monitor CPU Usage',
        description: 'Check current CPU usage of CloudWatch agent',
        command: 'top -p $(pgrep amazon-cloudwatch-agent)',
        expectedOutput: 'CPU usage percentage for agent process',
        interpretation: 'CPU usage above 10% consistently indicates performance issue',
        nextSteps: ['optimize-configuration', 'check-memory-usage']
      }
    ],
    relatedIssues: ['memory-leaks'],
    tags: ['performance', 'cpu', 'optimization'],
    lastUpdated: new Date('2024-01-15'),
    affectedComponents: ['CloudWatch Agent', 'EC2 Instance']
  },
  {
    id: 'network-connectivity-issues',
    title: 'Network Connectivity Issues',
    description: 'CloudWatch agent unable to connect to AWS endpoints',
    category: 'connectivity',
    severity: 'high',
    symptoms: [
      'Metrics not appearing in CloudWatch',
      'Connection timeout errors in logs',
      'Agent retrying connections repeatedly',
      'Network-related error messages'
    ],
    causes: [
      'Security group blocking outbound traffic',
      'VPC endpoint configuration issues',
      'NAT gateway problems',
      'DNS resolution failures'
    ],
    solutions: [
      {
        id: 'check-security-groups',
        title: 'Verify Security Group Rules',
        description: 'Ensure security groups allow outbound HTTPS traffic',
        steps: [
          {
            id: 'check-outbound-rules',
            title: 'Check Outbound Rules',
            description: 'Verify security group allows HTTPS (443) outbound',
            type: 'action',
            content: 'Check security group outbound rules allow port 443 to 0.0.0.0/0',
            expectedResult: 'HTTPS outbound traffic allowed'
          }
        ],
        estimatedTime: 10,
        difficulty: 'easy',
        prerequisites: ['AWS Console access'],
        verificationSteps: ['Security group rules updated', 'Agent can connect to endpoints']
      }
    ],
    diagnosticSteps: [
      {
        id: 'test-connectivity',
        title: 'Test Connectivity to CloudWatch',
        description: 'Test network connectivity to CloudWatch endpoints',
        command: 'curl -I https://monitoring.us-east-1.amazonaws.com',
        expectedOutput: 'HTTP 200 OK response',
        interpretation: 'Connection failure indicates network connectivity issues',
        nextSteps: ['check-security-groups', 'verify-vpc-endpoints']
      }
    ],
    relatedIssues: ['metrics-not-appearing'],
    tags: ['connectivity', 'network', 'security-groups'],
    lastUpdated: new Date('2024-01-15'),
    affectedComponents: ['CloudWatch Agent', 'VPC', 'Security Groups']
  },
  {
    id: 'authentication-failures',
    title: 'Authentication Failures',
    description: 'CloudWatch agent failing to authenticate with AWS services',
    category: 'authentication',
    severity: 'high',
    symptoms: [
      'Access denied errors in agent logs',
      'Authentication failure messages',
      'Metrics not being published',
      'Credential-related error messages'
    ],
    causes: [
      'Missing or incorrect IAM role',
      'Insufficient IAM permissions',
      'Expired temporary credentials',
      'Incorrect AWS region configuration'
    ],
    solutions: [
      {
        id: 'verify-iam-role',
        title: 'Verify IAM Role and Permissions',
        description: 'Ensure proper IAM role is attached with correct permissions',
        steps: [
          {
            id: 'check-role-attachment',
            title: 'Check Role Attachment',
            description: 'Verify IAM role is attached to EC2 instance',
            type: 'action',
            content: 'Check EC2 instance has IAM role attached in AWS Console',
            expectedResult: 'IAM role attached to instance'
          }
        ],
        estimatedTime: 15,
        difficulty: 'medium',
        prerequisites: ['AWS Console access', 'IAM permissions'],
        verificationSteps: ['IAM role attached', 'Role has CloudWatch permissions']
      }
    ],
    diagnosticSteps: [
      {
        id: 'check-credentials',
        title: 'Check AWS Credentials',
        description: 'Verify AWS credentials are properly configured',
        command: 'aws sts get-caller-identity',
        expectedOutput: 'Account ID and role information',
        interpretation: 'Failure indicates credential configuration issues',
        nextSteps: ['fix-iam-role', 'check-permissions']
      }
    ],
    relatedIssues: ['metrics-not-appearing'],
    tags: ['authentication', 'iam', 'credentials'],
    lastUpdated: new Date('2024-01-15'),
    affectedComponents: ['CloudWatch Agent', 'IAM', 'EC2 Instance']
  },
  {
    id: 'alert-not-triggering',
    title: 'CloudWatch Alarms Not Triggering',
    description: 'CloudWatch alarms not triggering despite meeting threshold conditions',
    category: 'alerting',
    severity: 'medium',
    symptoms: [
      'Alarms remain in OK state when they should trigger',
      'No notifications received despite threshold breaches',
      'Alarm history shows no state changes',
      'Metrics show values exceeding thresholds'
    ],
    causes: [
      'Insufficient data points for evaluation',
      'Incorrect alarm configuration',
      'Missing data in metric stream',
      'Alarm evaluation period too short'
    ],
    solutions: [
      {
        id: 'review-alarm-config',
        title: 'Review Alarm Configuration',
        description: 'Check alarm threshold and evaluation settings',
        steps: [
          {
            id: 'check-thresholds',
            title: 'Check Threshold Settings',
            description: 'Verify alarm threshold and comparison operator',
            type: 'action',
            content: 'Review alarm threshold value and comparison operator in CloudWatch console',
            expectedResult: 'Threshold and operator correctly configured'
          }
        ],
        estimatedTime: 10,
        difficulty: 'easy',
        prerequisites: ['AWS Console access'],
        verificationSteps: ['Alarm configuration verified', 'Test alarm triggers correctly']
      }
    ],
    diagnosticSteps: [
      {
        id: 'check-alarm-history',
        title: 'Check Alarm History',
        description: 'Review alarm state change history',
        command: 'aws cloudwatch describe-alarm-history --alarm-name "YourAlarmName"',
        expectedOutput: 'Alarm state change history',
        interpretation: 'No state changes indicate configuration or data issues',
        nextSteps: ['check-metrics', 'review-configuration']
      }
    ],
    relatedIssues: ['metrics-not-appearing'],
    tags: ['alerting', 'alarms', 'notifications'],
    lastUpdated: new Date('2024-01-15'),
    affectedComponents: ['CloudWatch Alarms', 'SNS', 'Metrics']
  },
  {
    id: 'dashboard-not-loading',
    title: 'CloudWatch Dashboard Not Loading',
    description: 'CloudWatch dashboard fails to load or displays no data',
    category: 'dashboard',
    severity: 'low',
    symptoms: [
      'Dashboard shows blank or empty widgets',
      'Loading errors in dashboard',
      'Widgets display "No data available"',
      'Dashboard takes long time to load'
    ],
    causes: [
      'Incorrect metric names in widgets',
      'Missing permissions for dashboard access',
      'Metrics not being published',
      'Region mismatch in widget configuration'
    ],
    solutions: [
      {
        id: 'verify-widget-config',
        title: 'Verify Widget Configuration',
        description: 'Check widget metric names and configuration',
        steps: [
          {
            id: 'check-metric-names',
            title: 'Check Metric Names',
            description: 'Verify metric names in widgets match published metrics',
            type: 'action',
            content: 'Compare widget metric names with available metrics in CloudWatch',
            expectedResult: 'Metric names match available metrics'
          }
        ],
        estimatedTime: 15,
        difficulty: 'easy',
        prerequisites: ['AWS Console access'],
        verificationSteps: ['Widget configuration correct', 'Dashboard displays data']
      }
    ],
    diagnosticSteps: [
      {
        id: 'check-available-metrics',
        title: 'Check Available Metrics',
        description: 'List available metrics for the namespace',
        command: 'aws cloudwatch list-metrics --namespace "AWS/EC2"',
        expectedOutput: 'List of available metrics',
        interpretation: 'Missing metrics indicate data collection issues',
        nextSteps: ['fix-metric-collection', 'update-widget-config']
      }
    ],
    relatedIssues: ['metrics-not-appearing'],
    tags: ['dashboard', 'widgets', 'visualization'],
    lastUpdated: new Date('2024-01-15'),
    affectedComponents: ['CloudWatch Dashboard', 'Metrics', 'Widgets']
  },
  {
    id: 'third-party-integration-failure',
    title: 'Third-Party Integration Failure',
    description: 'CloudWatch integration with third-party monitoring tools failing',
    category: 'integration',
    severity: 'medium',
    symptoms: [
      'Third-party tool not receiving CloudWatch data',
      'Integration API errors',
      'Authentication failures with external systems',
      'Data sync issues between systems'
    ],
    causes: [
      'API key or credential issues',
      'Network connectivity problems',
      'API rate limiting',
      'Incompatible data formats'
    ],
    solutions: [
      {
        id: 'verify-api-credentials',
        title: 'Verify API Credentials',
        description: 'Check API keys and authentication for third-party integration',
        steps: [
          {
            id: 'test-api-connection',
            title: 'Test API Connection',
            description: 'Test connection to third-party API with current credentials',
            type: 'command',
            content: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.thirdparty.com/test',
            expectedResult: 'Successful API response'
          }
        ],
        estimatedTime: 20,
        difficulty: 'medium',
        prerequisites: ['API credentials', 'Network access'],
        verificationSteps: ['API connection successful', 'Data flows to third-party system']
      }
    ],
    diagnosticSteps: [
      {
        id: 'check-integration-logs',
        title: 'Check Integration Logs',
        description: 'Review logs for integration errors',
        command: 'tail -f /var/log/integration/cloudwatch-integration.log',
        expectedOutput: 'Integration activity logs',
        interpretation: 'Error messages indicate specific integration issues',
        nextSteps: ['fix-credentials', 'check-network']
      }
    ],
    relatedIssues: ['authentication-failures'],
    tags: ['integration', 'third-party', 'api'],
    lastUpdated: new Date('2024-01-15'),
    affectedComponents: ['CloudWatch', 'Third-party Tools', 'API Integration']
  },
  {
    id: 'unexpected-billing-charges',
    title: 'Unexpected CloudWatch Billing Charges',
    description: 'Higher than expected charges for CloudWatch usage',
    category: 'billing',
    severity: 'low',
    symptoms: [
      'CloudWatch charges higher than expected',
      'Sudden increase in monthly bill',
      'High number of API calls or metrics',
      'Unexpected data transfer charges'
    ],
    causes: [
      'High-frequency metric collection',
      'Large number of custom metrics',
      'Excessive log ingestion',
      'Detailed monitoring enabled unnecessarily'
    ],
    solutions: [
      {
        id: 'analyze-usage-patterns',
        title: 'Analyze Usage Patterns',
        description: 'Review CloudWatch usage to identify cost drivers',
        steps: [
          {
            id: 'check-billing-dashboard',
            title: 'Check Billing Dashboard',
            description: 'Review CloudWatch costs in AWS Billing dashboard',
            type: 'action',
            content: 'Navigate to AWS Billing → Cost Explorer → Filter by CloudWatch service',
            expectedResult: 'Detailed breakdown of CloudWatch costs'
          }
        ],
        estimatedTime: 30,
        difficulty: 'easy',
        prerequisites: ['AWS Console access', 'Billing permissions'],
        verificationSteps: ['Cost drivers identified', 'Optimization plan created']
      }
    ],
    diagnosticSteps: [
      {
        id: 'check-metric-count',
        title: 'Check Custom Metric Count',
        description: 'Count number of custom metrics being published',
        command: 'aws cloudwatch list-metrics --namespace "Custom/Application" | jq ".Metrics | length"',
        expectedOutput: 'Number of custom metrics',
        interpretation: 'High metric count indicates potential cost optimization opportunity',
        nextSteps: ['optimize-metrics', 'review-collection-frequency']
      }
    ],
    relatedIssues: ['high-cpu-usage'],
    tags: ['billing', 'costs', 'optimization'],
    lastUpdated: new Date('2024-01-15'),
    affectedComponents: ['CloudWatch Billing', 'Custom Metrics', 'Log Groups']
  }
]

export const diagnosticTools: DiagnosticTool[] = [
  {
    id: 'agent-status-checker',
    name: 'CloudWatch Agent Status Checker',
    description: 'Comprehensive tool to check CloudWatch agent installation and status',
    category: 'system',
    command: 'aws cloudwatch-agent-status-check',
    parameters: [
      {
        name: 'instance-id',
        description: 'EC2 instance ID to check',
        type: 'string',
        required: false
      },
      {
        name: 'verbose',
        description: 'Enable verbose output',
        type: 'boolean',
        required: false,
        defaultValue: false
      }
    ],
    outputFormat: 'json',
    interpretation: [
      {
        condition: 'status === "running"',
        meaning: 'Agent is running normally',
        severity: 'low',
        recommendedActions: ['Continue monitoring', 'Check metrics flow']
      },
      {
        condition: 'status === "stopped"',
        meaning: 'Agent is not running',
        severity: 'high',
        recommendedActions: ['Check configuration', 'Restart agent', 'Review logs']
      }
    ]
  },
  {
    id: 'connectivity-tester',
    name: 'CloudWatch Connectivity Tester',
    description: 'Test network connectivity to CloudWatch endpoints',
    category: 'connectivity',
    command: 'aws cloudwatch-connectivity-test',
    parameters: [
      {
        name: 'region',
        description: 'AWS region to test',
        type: 'string',
        required: true
      },
      {
        name: 'endpoint-type',
        description: 'Type of endpoint to test',
        type: 'select',
        required: false,
        defaultValue: 'all',
        options: ['metrics', 'logs', 'events', 'all']
      }
    ],
    outputFormat: 'table',
    interpretation: [
      {
        condition: 'all_endpoints_reachable === true',
        meaning: 'Network connectivity is working properly',
        severity: 'low',
        recommendedActions: ['Check other potential issues']
      },
      {
        condition: 'any_endpoint_unreachable === true',
        meaning: 'Network connectivity issues detected',
        severity: 'high',
        recommendedActions: ['Check security groups', 'Verify VPC configuration', 'Check NAT gateway']
      }
    ]
  }
]

export const escalationPaths: EscalationPath[] = [
  {
    id: 'technical-support',
    name: 'AWS Technical Support',
    description: 'Escalate to AWS Technical Support for complex issues',
    triggerConditions: [
      'Issue persists after following all troubleshooting steps',
      'Suspected AWS service issue',
      'Critical production impact',
      'Need assistance with advanced configuration'
    ],
    steps: [
      {
        id: 'gather-info',
        title: 'Gather Required Information',
        description: 'Collect all necessary information before contacting support',
        contact: {
          type: 'ticket',
          value: 'AWS Support Console',
          availability: '24/7',
          responseTime: 'Based on support plan'
        },
        requiredDocumentation: [
          'CloudWatch agent configuration file',
          'Agent logs from the last 24 hours',
          'Instance details (ID, type, region)',
          'IAM role and policy details',
          'Network configuration (VPC, security groups)',
          'Timeline of when issue started'
        ],
        escalationCriteria: [
          'Business impact assessment',
          'Troubleshooting steps already attempted',
          'Urgency level determination'
        ]
      }
    ],
    estimatedResponseTime: '1-24 hours depending on support plan',
    requiredInformation: [
      'AWS Account ID',
      'Affected resources',
      'Business impact',
      'Troubleshooting steps attempted'
    ]
  },
  {
    id: 'community-support',
    name: 'AWS Community Support',
    description: 'Get help from the AWS community for general questions',
    triggerConditions: [
      'General configuration questions',
      'Best practices inquiries',
      'Non-critical issues',
      'Learning and exploration'
    ],
    steps: [
      {
        id: 'post-question',
        title: 'Post Question to Community',
        description: 'Post detailed question to AWS community forums',
        contact: {
          type: 'email',
          value: 'AWS re:Post Community',
          availability: 'Community-driven',
          responseTime: 'Variable'
        },
        requiredDocumentation: [
          'Clear problem description',
          'Configuration details (sanitized)',
          'Steps already attempted',
          'Expected vs actual behavior'
        ],
        escalationCriteria: [
          'Question complexity',
          'Community engagement level',
          'Time sensitivity'
        ]
      }
    ],
    estimatedResponseTime: '1-7 days',
    requiredInformation: [
      'Problem description',
      'Configuration context',
      'Attempted solutions'
    ]
  }
]

export const faqs: FAQ[] = [
  {
    id: 'agent-installation-location',
    question: 'Where is the CloudWatch agent installed on my system?',
    answer: 'The CloudWatch agent is typically installed in `/opt/aws/amazon-cloudwatch-agent/` on Linux systems and `C:\\Program Files\\Amazon\\AmazonCloudWatchAgent\\` on Windows systems. Configuration files are usually stored in the `etc` subdirectory.',
    category: 'setup',
    tags: ['installation', 'location', 'configuration'],
    relatedIssues: ['agent-not-starting'],
    popularity: 95,
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: 'metric-delay',
    question: 'Why are my custom metrics delayed in CloudWatch?',
    answer: 'Custom metrics can have a delay of 1-5 minutes due to CloudWatch\'s processing pipeline. This is normal behavior. If delays exceed 15 minutes, check your agent configuration, network connectivity, and IAM permissions.',
    category: 'troubleshooting',
    tags: ['metrics', 'delay', 'performance'],
    relatedIssues: ['metrics-not-appearing'],
    popularity: 87,
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: 'cost-optimization',
    question: 'How can I optimize CloudWatch costs?',
    answer: 'To optimize costs: 1) Use metric filters instead of custom metrics where possible, 2) Adjust metric resolution (use 5-minute instead of 1-minute for non-critical metrics), 3) Set up log retention policies, 4) Use CloudWatch Insights sparingly, 5) Monitor your CloudWatch bill regularly.',
    category: 'billing',
    tags: ['cost', 'optimization', 'billing'],
    relatedIssues: [],
    popularity: 78,
    lastUpdated: new Date('2024-01-15')
  }
]

export const errorMessages: ErrorMessage[] = [
  {
    id: 'access-denied-error',
    code: 'AccessDenied',
    message: 'User: arn:aws:sts::123456789012:assumed-role/EC2-CloudWatch-Role/i-1234567890abcdef0 is not authorized to perform: cloudwatch:PutMetricData',
    description: 'The IAM role or user lacks the necessary permissions to publish metrics to CloudWatch',
    category: 'authentication',
    severity: 'high',
    commonCauses: [
      'Missing CloudWatch permissions in IAM role',
      'Incorrect IAM role attached to EC2 instance',
      'Policy restrictions preventing metric publishing',
      'Resource-based policy conflicts'
    ],
    solutions: [
      'Add CloudWatchAgentServerPolicy to the IAM role',
      'Verify the correct IAM role is attached to the instance',
      'Check for deny policies that might override permissions',
      'Ensure the role has trust relationship with EC2 service'
    ],
    relatedErrors: ['invalid-credentials', 'forbidden-operation'],
    documentationLinks: [
      '/docs/iam-permissions',
      '/docs/troubleshooting/access-denied'
    ]
  },
  {
    id: 'invalid-config-error',
    code: 'InvalidConfiguration',
    message: 'Configuration file contains invalid JSON syntax at line 45',
    description: 'The CloudWatch agent configuration file has syntax errors or invalid structure',
    category: 'configuration',
    severity: 'medium',
    commonCauses: [
      'JSON syntax errors (missing commas, brackets)',
      'Invalid configuration parameters',
      'Incorrect file encoding',
      'Corrupted configuration file'
    ],
    solutions: [
      'Validate JSON syntax using online JSON validator',
      'Check configuration against AWS documentation',
      'Regenerate configuration using CloudWatch agent wizard',
      'Compare with working configuration examples'
    ],
    relatedErrors: ['config-not-found', 'parsing-error'],
    documentationLinks: [
      '/docs/configuration/reference',
      '/docs/troubleshooting/configuration-errors'
    ]
  },
  {
    id: 'client-timeout-error',
    code: 'RequestTimeout',
    message: 'Request to CloudWatch API timed out after 30 seconds',
    description: 'Client request to CloudWatch API exceeded the timeout limit',
    category: 'client',
    severity: 'medium',
    commonCauses: [
      'Slow network connection',
      'Client-side timeout settings too low',
      'Large payload size causing delays',
      'Client resource constraints'
    ],
    solutions: [
      'Increase client timeout settings',
      'Reduce batch size for metric publishing',
      'Check network connectivity and latency',
      'Implement retry logic with exponential backoff'
    ],
    relatedErrors: ['network-error', 'connection-refused'],
    documentationLinks: [
      '/docs/api/timeout-handling',
      '/docs/troubleshooting/client-errors'
    ]
  },
  {
    id: 'server-internal-error',
    code: 'InternalServerError',
    message: 'An internal server error occurred while processing the request',
    description: 'CloudWatch service encountered an internal error while processing the request',
    category: 'server',
    severity: 'high',
    commonCauses: [
      'Temporary service outage',
      'High service load',
      'Backend system failures',
      'Data processing errors'
    ],
    solutions: [
      'Retry the request after a delay',
      'Check AWS Service Health Dashboard',
      'Implement exponential backoff retry strategy',
      'Contact AWS Support if issue persists'
    ],
    relatedErrors: ['service-unavailable', 'throttling-error'],
    documentationLinks: [
      '/docs/troubleshooting/server-errors',
      '/docs/api/error-handling'
    ]
  },
  {
    id: 'network-connection-error',
    code: 'NetworkError',
    message: 'Unable to establish connection to monitoring.us-east-1.amazonaws.com',
    description: 'Network connectivity issue preventing connection to CloudWatch endpoints',
    category: 'network',
    severity: 'high',
    commonCauses: [
      'Internet connectivity issues',
      'DNS resolution failures',
      'Firewall blocking outbound connections',
      'VPC endpoint configuration problems'
    ],
    solutions: [
      'Check internet connectivity',
      'Verify DNS resolution for AWS endpoints',
      'Review security group and NACL rules',
      'Configure VPC endpoints for CloudWatch'
    ],
    relatedErrors: ['dns-resolution-error', 'connection-refused'],
    documentationLinks: [
      '/docs/networking/connectivity',
      '/docs/troubleshooting/network-issues'
    ]
  },
  {
    id: 'authorization-forbidden-error',
    code: 'Forbidden',
    message: 'Access to the requested resource is forbidden',
    description: 'User has valid credentials but lacks authorization for the requested operation',
    category: 'authorization',
    severity: 'high',
    commonCauses: [
      'Insufficient IAM permissions for specific action',
      'Resource-based policies denying access',
      'Cross-account access not properly configured',
      'Condition-based policy restrictions'
    ],
    solutions: [
      'Review and update IAM policies',
      'Check resource-based policies',
      'Verify cross-account trust relationships',
      'Review policy conditions and constraints'
    ],
    relatedErrors: ['access-denied-error', 'invalid-credentials'],
    documentationLinks: [
      '/docs/iam/authorization',
      '/docs/troubleshooting/permission-errors'
    ]
  },
  {
    id: 'data-validation-error',
    code: 'InvalidParameterValue',
    message: 'The parameter MetricData.member.1.Value is not valid',
    description: 'Data validation failed due to invalid parameter values or format',
    category: 'data',
    severity: 'medium',
    commonCauses: [
      'Invalid metric values (NaN, infinity)',
      'Incorrect data types',
      'Values outside acceptable ranges',
      'Invalid timestamp formats'
    ],
    solutions: [
      'Validate metric values before sending',
      'Check data type requirements',
      'Ensure values are within acceptable ranges',
      'Use proper timestamp format (Unix epoch)'
    ],
    relatedErrors: ['invalid-config-error', 'parsing-error'],
    documentationLinks: [
      '/docs/api/data-validation',
      '/docs/troubleshooting/data-errors'
    ]
  }
]

// Helper functions for searching and filtering
export function searchTroubleshootingIssues(query: string): TroubleshootingIssue[] {
  const lowercaseQuery = query.toLowerCase()
  return troubleshootingIssues.filter(issue => 
    issue.title.toLowerCase().includes(lowercaseQuery) ||
    issue.description.toLowerCase().includes(lowercaseQuery) ||
    issue.symptoms.some(symptom => symptom.toLowerCase().includes(lowercaseQuery)) ||
    issue.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

export function getTroubleshootingIssuesByCategory(category: string): TroubleshootingIssue[] {
  return troubleshootingIssues.filter(issue => issue.category === category)
}

export function getTroubleshootingIssuesBySeverity(severity: string): TroubleshootingIssue[] {
  return troubleshootingIssues.filter(issue => issue.severity === severity)
}

export function searchFAQs(query: string): FAQ[] {
  const lowercaseQuery = query.toLowerCase()
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(lowercaseQuery) ||
    faq.answer.toLowerCase().includes(lowercaseQuery) ||
    faq.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  ).sort((a, b) => b.popularity - a.popularity)
}

export function getFAQsByCategory(category: string): FAQ[] {
  return faqs.filter(faq => faq.category === category)
    .sort((a, b) => b.popularity - a.popularity)
}

export function searchErrorMessages(query: string): ErrorMessage[] {
  const lowercaseQuery = query.toLowerCase()
  return errorMessages.filter(error => 
    error.code.toLowerCase().includes(lowercaseQuery) ||
    error.message.toLowerCase().includes(lowercaseQuery) ||
    error.description.toLowerCase().includes(lowercaseQuery)
  )
}

export function getErrorMessagesByCategory(category: string): ErrorMessage[] {
  return errorMessages.filter(error => error.category === category)
}