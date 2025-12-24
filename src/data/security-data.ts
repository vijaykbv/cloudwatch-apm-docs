// Security and compliance data for CloudWatch APM documentation
import { 
  SecurityConfiguration,
  SecurityRequirement,
  SecurityControl,
  ComplianceMapping,
  DataPrivacyPolicy,
  AuditConfiguration,
  SecurityCategory,
  ComplianceFramework,
  SecuritySeverity,
  SecurityLevel
} from '../types/security'

export const securityConfigurations: SecurityConfiguration[] = [
  {
    id: 'encryption-at-rest',
    name: 'Encryption at Rest',
    description: 'Configure encryption for data stored in CloudWatch APM',
    category: 'encryption',
    severity: 'high',
    requirements: [
      {
        id: 'req-encryption-001',
        title: 'Enable KMS Encryption',
        description: 'All APM data must be encrypted using AWS KMS keys',
        mandatory: true,
        category: 'encryption',
        controls: [
          {
            id: 'ctrl-kms-001',
            name: 'KMS Key Configuration',
            description: 'Configure customer-managed KMS keys for APM data encryption',
            type: 'preventive',
            implementation: 'Configure KMS key policy and enable encryption in APM settings',
            validation: 'Verify encryption status in CloudWatch console',
            automated: true,
            frequency: 'daily'
          }
        ],
        references: [
          {
            id: 'ref-aws-kms',
            title: 'AWS KMS Best Practices',
            url: 'https://docs.aws.amazon.com/kms/latest/developerguide/best-practices.html',
            type: 'documentation',
            description: 'AWS KMS security best practices'
          }
        ]
      }
    ],
    implementation: {
      steps: [
        {
          id: 'step-001',
          title: 'Create KMS Key',
          description: 'Create a customer-managed KMS key for APM encryption',
          order: 1,
          required: true,
          validation: 'Verify key exists and has correct permissions',
          troubleshooting: [
            'Check IAM permissions for KMS key creation',
            'Verify key policy allows CloudWatch APM service access'
          ]
        },
        {
          id: 'step-002',
          title: 'Configure APM Encryption',
          description: 'Enable encryption in CloudWatch APM settings',
          order: 2,
          required: true,
          validation: 'Confirm encryption is enabled in APM console',
          troubleshooting: [
            'Check service permissions for KMS key usage',
            'Verify encryption settings are properly saved'
          ]
        }
      ],
      codeExamples: [
        {
          id: 'code-terraform-kms',
          title: 'Terraform KMS Configuration',
          description: 'Terraform configuration for KMS key and APM encryption',
          language: 'hcl',
          code: `resource "aws_kms_key" "apm_encryption" {
  description             = "KMS key for CloudWatch APM encryption"
  deletion_window_in_days = 7
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable CloudWatch APM access"
        Effect = "Allow"
        Principal = {
          Service = "application-insights.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_kms_alias" "apm_encryption" {
  name          = "alias/cloudwatch-apm-encryption"
  target_key_id = aws_kms_key.apm_encryption.key_id
}`,
          explanation: 'This Terraform configuration creates a KMS key specifically for CloudWatch APM encryption with appropriate service permissions.',
          securityNotes: [
            'Use customer-managed keys for better control',
            'Implement key rotation policies',
            'Restrict key access to necessary services only'
          ],
          platform: 'terraform'
        }
      ],
      configurations: [
        {
          id: 'config-basic-encryption',
          title: 'Basic Encryption Configuration',
          description: 'Minimal encryption setup for development environments',
          configuration: {
            encryption: {
              enabled: true,
              kmsKeyId: 'alias/cloudwatch-apm-encryption',
              encryptionType: 'KMS'
            }
          },
          explanation: 'Basic encryption configuration suitable for development and testing environments.',
          securityLevel: 'standard',
          environment: 'development'
        },
        {
          id: 'config-enhanced-encryption',
          title: 'Enhanced Encryption Configuration',
          description: 'Advanced encryption setup for production environments',
          configuration: {
            encryption: {
              enabled: true,
              kmsKeyId: 'alias/cloudwatch-apm-encryption',
              encryptionType: 'KMS',
              keyRotation: true,
              crossRegionReplication: true,
              auditLogging: true
            }
          },
          explanation: 'Enhanced encryption configuration with key rotation and audit logging for production environments.',
          securityLevel: 'enhanced',
          environment: 'production'
        }
      ],
      bestPractices: [
        'Use customer-managed KMS keys for better control',
        'Enable automatic key rotation',
        'Implement least privilege access to encryption keys',
        'Monitor key usage through CloudTrail',
        'Regularly audit key permissions and policies'
      ],
      commonMistakes: [
        'Using default AWS-managed keys in production',
        'Overly permissive key policies',
        'Not enabling key rotation',
        'Missing audit logging for key usage',
        'Insufficient backup and recovery procedures'
      ]
    },
    validation: {
      checklist: [
        {
          id: 'check-001',
          title: 'KMS Key Created',
          description: 'Verify customer-managed KMS key exists',
          category: 'encryption',
          required: true,
          validation: 'Check KMS console for key existence and status'
        },
        {
          id: 'check-002',
          title: 'Encryption Enabled',
          description: 'Confirm APM encryption is enabled',
          category: 'encryption',
          required: true,
          validation: 'Verify encryption status in CloudWatch APM console'
        }
      ],
      automatedTests: [
        {
          id: 'test-encryption-status',
          name: 'Verify Encryption Status',
          description: 'Automated test to verify APM encryption is enabled',
          type: 'configuration',
          automated: true,
          frequency: 'daily',
          command: 'aws application-insights describe-application --resource-group-name <app-name>',
          expectedResult: 'Encryption should be enabled with specified KMS key',
          troubleshooting: [
            'Check IAM permissions for describe operations',
            'Verify application exists and is properly configured'
          ]
        }
      ],
      manualVerification: [
        {
          id: 'manual-001',
          title: 'Visual Encryption Verification',
          description: 'Manually verify encryption settings in AWS console',
          instructions: [
            'Navigate to CloudWatch APM console',
            'Select your application',
            'Check encryption settings in configuration tab',
            'Verify KMS key is correctly specified'
          ],
          expectedOutcome: 'Encryption should be enabled with customer-managed KMS key',
          documentation: [
            'Screenshot of encryption settings',
            'KMS key ARN documentation'
          ]
        }
      ],
      tools: [
        {
          id: 'tool-aws-cli',
          name: 'AWS CLI',
          description: 'Command-line tool for verifying encryption configuration',
          type: 'validator',
          installation: 'pip install awscli',
          usage: 'aws application-insights describe-application --resource-group-name <app-name>',
          platforms: ['linux', 'macos', 'windows']
        }
      ]
    },
    compliance: [
      {
        framework: 'SOC2',
        controls: [
          {
            id: 'soc2-cc6.1',
            name: 'Logical and Physical Access Controls',
            description: 'Data encryption at rest controls',
            framework: 'SOC2',
            category: 'Security',
            implementation: 'KMS encryption for all APM data',
            validation: 'Automated encryption status checks',
            evidence: ['Encryption configuration', 'KMS key policies', 'Access logs']
          }
        ],
        requirements: [
          {
            id: 'soc2-req-001',
            title: 'Data Encryption Requirement',
            description: 'All sensitive data must be encrypted at rest',
            framework: 'SOC2',
            section: 'CC6.1',
            mandatory: true,
            implementation: 'KMS encryption enabled for CloudWatch APM',
            validation: 'Daily automated checks of encryption status'
          }
        ],
        evidence: [
          {
            id: 'evidence-001',
            type: 'configuration',
            description: 'APM encryption configuration settings',
            location: 'CloudWatch APM console screenshots',
            automated: false,
            frequency: 'quarterly'
          }
        ],
        status: 'compliant'
      }
    ],
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: 'access-control',
    name: 'Access Control and Permissions',
    description: 'Configure IAM roles and policies for CloudWatch APM access',
    category: 'access-control',
    severity: 'high',
    requirements: [
      {
        id: 'req-access-001',
        title: 'Least Privilege Access',
        description: 'Implement least privilege access principles for APM resources',
        mandatory: true,
        category: 'access-control',
        controls: [
          {
            id: 'ctrl-iam-001',
            name: 'IAM Role Configuration',
            description: 'Configure IAM roles with minimal required permissions',
            type: 'preventive',
            implementation: 'Create specific IAM roles for different APM access levels',
            validation: 'Review IAM policies and permissions regularly',
            automated: true,
            frequency: 'weekly'
          }
        ],
        references: [
          {
            id: 'ref-iam-best-practices',
            title: 'IAM Best Practices',
            url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html',
            type: 'documentation',
            description: 'AWS IAM security best practices'
          }
        ]
      }
    ],
    implementation: {
      steps: [
        {
          id: 'step-iam-001',
          title: 'Create APM Read-Only Role',
          description: 'Create IAM role for read-only access to APM data',
          order: 1,
          required: true,
          validation: 'Verify role has only read permissions',
          troubleshooting: [
            'Check policy syntax and permissions',
            'Verify trust relationships are correct'
          ]
        }
      ],
      codeExamples: [
        {
          id: 'code-iam-readonly',
          title: 'IAM Read-Only Policy',
          description: 'IAM policy for read-only access to CloudWatch APM',
          language: 'json',
          code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "application-insights:Describe*",
        "application-insights:List*",
        "cloudwatch:GetMetricData",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics"
      ],
      "Resource": "*"
    }
  ]
}`,
          explanation: 'This policy provides read-only access to CloudWatch APM resources and related CloudWatch metrics.',
          securityNotes: [
            'Restricts access to read-only operations',
            'Does not allow configuration changes',
            'Suitable for monitoring and reporting roles'
          ]
        }
      ],
      configurations: [
        {
          id: 'config-role-readonly',
          title: 'Read-Only Role Configuration',
          description: 'IAM role configuration for read-only APM access',
          configuration: {
            roleName: 'CloudWatchAPMReadOnly',
            policies: ['CloudWatchAPMReadOnlyPolicy'],
            trustPolicy: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Principal: {
                    AWS: 'arn:aws:iam::ACCOUNT-ID:root'
                  },
                  Action: 'sts:AssumeRole',
                  Condition: {
                    StringEquals: {
                      'sts:ExternalId': 'unique-external-id'
                    }
                  }
                }
              ]
            }
          },
          explanation: 'Basic read-only role configuration with external ID for additional security.',
          securityLevel: 'standard',
          environment: 'production'
        }
      ],
      bestPractices: [
        'Use separate roles for different access levels',
        'Implement external IDs for cross-account access',
        'Regularly review and audit role permissions',
        'Use temporary credentials when possible',
        'Enable CloudTrail logging for all role assumptions'
      ],
      commonMistakes: [
        'Using overly broad permissions',
        'Not implementing external IDs for cross-account roles',
        'Missing regular permission reviews',
        'Using long-term access keys instead of roles',
        'Not enabling CloudTrail for audit logging'
      ]
    },
    validation: {
      checklist: [
        {
          id: 'check-iam-001',
          title: 'IAM Roles Created',
          description: 'Verify all required IAM roles exist',
          category: 'access-control',
          required: true,
          validation: 'Check IAM console for role existence'
        }
      ],
      automatedTests: [
        {
          id: 'test-iam-permissions',
          name: 'Verify IAM Permissions',
          description: 'Test IAM role permissions are correctly configured',
          type: 'access-control',
          automated: true,
          frequency: 'weekly',
          expectedResult: 'Roles should have minimal required permissions',
          troubleshooting: [
            'Check policy attachments',
            'Verify trust relationships'
          ]
        }
      ],
      manualVerification: [
        {
          id: 'manual-iam-001',
          title: 'Manual Permission Review',
          description: 'Manually review IAM permissions and policies',
          instructions: [
            'Navigate to IAM console',
            'Review each APM-related role',
            'Check attached policies',
            'Verify trust relationships'
          ],
          expectedOutcome: 'All roles should follow least privilege principle',
          documentation: [
            'Role permission matrix',
            'Policy review checklist'
          ]
        }
      ],
      tools: [
        {
          id: 'tool-iam-analyzer',
          name: 'IAM Access Analyzer',
          description: 'AWS service for analyzing IAM permissions',
          type: 'analyzer',
          installation: 'Available in AWS console',
          usage: 'Navigate to IAM Access Analyzer in AWS console',
          platforms: ['web']
        }
      ]
    },
    compliance: [
      {
        framework: 'SOC2',
        controls: [
          {
            id: 'soc2-cc6.2',
            name: 'Logical Access Controls',
            description: 'User access management and authorization',
            framework: 'SOC2',
            category: 'Security',
            implementation: 'IAM roles and policies for APM access control',
            validation: 'Regular access reviews and permission audits',
            evidence: ['IAM policies', 'Access logs', 'Permission reviews']
          }
        ],
        requirements: [
          {
            id: 'soc2-req-002',
            title: 'Access Control Requirement',
            description: 'Access to systems must be restricted to authorized users',
            framework: 'SOC2',
            section: 'CC6.2',
            mandatory: true,
            implementation: 'IAM-based access control for CloudWatch APM',
            validation: 'Weekly automated permission checks'
          }
        ],
        evidence: [
          {
            id: 'evidence-002',
            type: 'log',
            description: 'CloudTrail logs showing access patterns',
            location: 'CloudTrail log analysis reports',
            automated: true,
            frequency: 'weekly'
          }
        ],
        status: 'compliant'
      }
    ],
    lastUpdated: new Date('2024-01-15')
  }
]

export const complianceFrameworks: ComplianceMapping[] = [
  {
    framework: 'SOC2',
    controls: [
      {
        id: 'soc2-cc6.1',
        name: 'Logical and Physical Access Controls',
        description: 'Controls to restrict logical and physical access',
        framework: 'SOC2',
        category: 'Security',
        implementation: 'IAM roles, KMS encryption, network security groups',
        validation: 'Automated testing and manual reviews',
        evidence: ['IAM policies', 'Encryption configs', 'Network ACLs']
      },
      {
        id: 'soc2-cc6.7',
        name: 'Data Transmission and Disposal',
        description: 'Controls for data transmission and disposal',
        framework: 'SOC2',
        category: 'Security',
        implementation: 'TLS encryption, secure data deletion procedures',
        validation: 'Network traffic analysis and data lifecycle audits',
        evidence: ['TLS certificates', 'Data retention policies', 'Deletion logs']
      }
    ],
    requirements: [
      {
        id: 'soc2-req-security',
        title: 'Security Requirements',
        description: 'Comprehensive security controls for data protection',
        framework: 'SOC2',
        section: 'Security',
        mandatory: true,
        implementation: 'Multi-layered security approach with encryption, access controls, and monitoring',
        validation: 'Continuous monitoring and quarterly assessments'
      }
    ],
    evidence: [
      {
        id: 'evidence-security-config',
        type: 'configuration',
        description: 'Security configuration documentation',
        location: 'Security configuration repository',
        automated: false,
        frequency: 'quarterly'
      }
    ],
    status: 'compliant'
  },
  {
    framework: 'GDPR',
    controls: [
      {
        id: 'gdpr-art32',
        name: 'Security of Processing',
        description: 'Technical and organizational measures for data security',
        framework: 'GDPR',
        category: 'Data Protection',
        implementation: 'Encryption, access controls, data minimization',
        validation: 'Regular security assessments and audits',
        evidence: ['Security policies', 'Encryption evidence', 'Access logs']
      }
    ],
    requirements: [
      {
        id: 'gdpr-req-security',
        title: 'Data Security Requirements',
        description: 'Appropriate technical and organizational measures',
        framework: 'GDPR',
        section: 'Article 32',
        mandatory: true,
        implementation: 'Comprehensive data protection measures',
        validation: 'Annual data protection impact assessments'
      }
    ],
    evidence: [
      {
        id: 'evidence-gdpr-dpia',
        type: 'documentation',
        description: 'Data Protection Impact Assessment',
        location: 'Legal compliance documentation',
        automated: false,
        frequency: 'annually'
      }
    ],
    status: 'compliant'
  }
]

export const dataPrivacyPolicies: DataPrivacyPolicy[] = [
  {
    id: 'apm-data-privacy',
    name: 'CloudWatch APM Data Privacy Policy',
    description: 'Data privacy policy for CloudWatch APM monitoring data',
    scope: ['application-metrics', 'trace-data', 'log-data', 'configuration-data'],
    dataTypes: [
      {
        id: 'metrics-data',
        name: 'Application Metrics',
        description: 'Performance metrics and measurements',
        category: 'internal',
        sensitivity: 'low',
        retention: 90,
        encryption: true,
        anonymization: false
      },
      {
        id: 'trace-data',
        name: 'Distributed Traces',
        description: 'Request tracing and performance data',
        category: 'internal',
        sensitivity: 'medium',
        retention: 30,
        encryption: true,
        anonymization: true
      }
    ],
    retention: {
      defaultPeriod: 90,
      categories: [
        {
          dataType: 'metrics-data',
          period: 90,
          reason: 'Performance analysis and trending',
          exceptions: ['critical-incidents']
        },
        {
          dataType: 'trace-data',
          period: 30,
          reason: 'Troubleshooting and debugging',
          exceptions: ['security-incidents']
        }
      ],
      deletion: {
        automated: true,
        frequency: 'daily',
        verification: 'Automated deletion confirmation logs',
        documentation: ['Deletion schedules', 'Verification reports']
      },
      archival: {
        enabled: true,
        criteria: ['regulatory-requirements', 'long-term-analysis'],
        location: 'AWS Glacier',
        encryption: true,
        access: ['compliance-team', 'legal-team']
      }
    },
    processing: [
      {
        id: 'monitoring-processing',
        name: 'Application Monitoring',
        description: 'Processing of application performance data',
        purpose: ['performance-monitoring', 'troubleshooting', 'capacity-planning'],
        dataTypes: ['metrics-data', 'trace-data'],
        legalBasis: 'Legitimate interest',
        retention: 90,
        sharing: [
          {
            recipient: 'AWS CloudWatch',
            purpose: 'Metrics storage and analysis',
            dataTypes: ['metrics-data'],
            safeguards: ['encryption', 'access-controls'],
            agreement: 'AWS Data Processing Agreement'
          }
        ]
      }
    ],
    rights: [
      {
        right: 'access',
        description: 'Right to access personal data',
        process: ['Submit access request', 'Identity verification', 'Data extraction', 'Secure delivery'],
        timeline: 30,
        automation: false
      },
      {
        right: 'erasure',
        description: 'Right to erasure of personal data',
        process: ['Submit erasure request', 'Legal basis review', 'Data deletion', 'Confirmation'],
        timeline: 30,
        automation: true
      }
    ],
    compliance: ['GDPR', 'HIPAA']
  }
]

export const auditConfigurations: AuditConfiguration[] = [
  {
    id: 'apm-audit-config',
    name: 'CloudWatch APM Audit Configuration',
    description: 'Comprehensive audit logging for CloudWatch APM',
    scope: [
      {
        component: 'application-insights',
        events: ['create', 'update', 'delete', 'access'],
        level: 'detailed',
        required: true
      },
      {
        component: 'cloudwatch-metrics',
        events: ['put-metric-data', 'get-metric-data'],
        level: 'basic',
        required: true
      }
    ],
    events: [
      {
        id: 'app-config-change',
        name: 'Application Configuration Change',
        description: 'Changes to APM application configuration',
        category: 'configuration',
        level: 'detailed',
        fields: [
          {
            name: 'userId',
            type: 'string',
            required: true,
            sensitive: false,
            description: 'User who made the change'
          },
          {
            name: 'applicationName',
            type: 'string',
            required: true,
            sensitive: false,
            description: 'Name of the application'
          },
          {
            name: 'changeDetails',
            type: 'object',
            required: true,
            sensitive: false,
            description: 'Details of the configuration change'
          }
        ],
        retention: 2555 // 7 years
      }
    ],
    retention: 2555, // 7 years default
    storage: {
      location: 'CloudTrail',
      encryption: true,
      backup: true,
      retention: 2555,
      access: [
        {
          role: 'security-admin',
          permissions: ['read', 'export'],
          conditions: ['mfa-required'],
          approval: true
        },
        {
          role: 'compliance-auditor',
          permissions: ['read'],
          conditions: ['time-restricted'],
          approval: false
        }
      ]
    },
    monitoring: {
      realTime: true,
      alerts: [
        {
          id: 'suspicious-access',
          name: 'Suspicious Access Pattern',
          description: 'Unusual access patterns detected',
          condition: 'failed_logins > 5 in 10 minutes',
          severity: 'critical',
          notification: ['security-team', 'soc']
        }
      ],
      dashboards: ['security-dashboard', 'compliance-dashboard'],
      reports: ['weekly-access-report', 'monthly-compliance-report']
    },
    reporting: {
      automated: true,
      frequency: 'weekly',
      recipients: ['security-team', 'compliance-team'],
      format: ['pdf', 'csv'],
      retention: 365
    }
  }
]

export const securityCategories: SecurityCategory[] = [
  'authentication',
  'authorization',
  'encryption',
  'network',
  'data-protection',
  'audit-logging',
  'access-control',
  'compliance',
  'incident-response'
]

export const complianceFrameworksList: ComplianceFramework[] = [
  'SOC2',
  'ISO27001',
  'GDPR',
  'HIPAA',
  'PCI-DSS',
  'FedRAMP',
  'NIST',
  'CIS'
]

export const securitySeverityLevels: SecuritySeverity[] = [
  'low',
  'medium', 
  'high',
  'critical'
]

export const securityLevels: SecurityLevel[] = [
  'basic',
  'standard',
  'enhanced',
  'maximum'
]