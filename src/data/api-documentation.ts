// Sample API documentation data for CloudWatch APM
import { 
  OpenAPISpec, 
  AuthenticationGuide, 
  SDKDocumentation,
  RateLimitingInfo 
} from '../types/api'

export const cloudwatchAPMOpenAPISpec: OpenAPISpec = {
  openapi: '3.0.3',
  info: {
    title: 'CloudWatch Application Performance Monitoring API',
    description: 'Comprehensive API for CloudWatch APM service including traces, metrics, and service maps',
    version: '2023-11-27',
    contact: {
      name: 'AWS CloudWatch Team',
      url: 'https://aws.amazon.com/cloudwatch/',
      email: 'cloudwatch-support@amazon.com'
    },
    license: {
      name: 'AWS Customer Agreement',
      url: 'https://aws.amazon.com/agreement/'
    }
  },
  servers: [
    {
      url: 'https://application-insights.{region}.amazonaws.com',
      description: 'CloudWatch APM API endpoint',
      variables: {
        region: {
          default: 'us-east-1',
          enum: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
          description: 'AWS region for the API endpoint'
        }
      }
    }
  ],
  paths: {
    '/applications': {
      get: {
        tags: ['Applications'],
        summary: 'List applications',
        description: 'Retrieve a list of applications monitored by CloudWatch APM',
        operationId: 'listApplications',
        parameters: [
          {
            name: 'MaxResults',
            in: 'query',
            description: 'Maximum number of applications to return',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 50
            }
          },
          {
            name: 'NextToken',
            in: 'query',
            description: 'Token for pagination',
            required: false,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    Applications: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          ApplicationName: {
                            type: 'string',
                            description: 'Name of the application'
                          },
                          ApplicationArn: {
                            type: 'string',
                            description: 'ARN of the application'
                          },
                          CreationTime: {
                            type: 'string',
                            format: 'date-time',
                            description: 'When the application was created'
                          },
                          LastUpdateTime: {
                            type: 'string',
                            format: 'date-time',
                            description: 'When the application was last updated'
                          }
                        }
                      }
                    },
                    NextToken: {
                      type: 'string',
                      description: 'Token for next page of results'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      description: 'Error message'
                    },
                    code: {
                      type: 'string',
                      description: 'Error code'
                    }
                  }
                }
              }
            }
          }
        },
        security: [
          {
            'AWS4-HMAC-SHA256': []
          }
        ]
      },
      post: {
        tags: ['Applications'],
        summary: 'Create application',
        description: 'Create a new application for monitoring with CloudWatch APM',
        operationId: 'createApplication',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['ApplicationName'],
                properties: {
                  ApplicationName: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 256,
                    description: 'Name of the application to create'
                  },
                  Tags: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        Key: {
                          type: 'string',
                          description: 'Tag key'
                        },
                        Value: {
                          type: 'string',
                          description: 'Tag value'
                        }
                      }
                    },
                    description: 'Tags to apply to the application'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Application created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ApplicationArn: {
                      type: 'string',
                      description: 'ARN of the created application'
                    },
                    ApplicationName: {
                      type: 'string',
                      description: 'Name of the created application'
                    }
                  }
                }
              }
            }
          }
        },
        security: [
          {
            'AWS4-HMAC-SHA256': []
          }
        ]
      }
    },
    '/applications/{applicationName}/traces': {
      get: {
        tags: ['Traces'],
        summary: 'Get traces',
        description: 'Retrieve traces for a specific application',
        operationId: 'getTraces',
        parameters: [
          {
            name: 'applicationName',
            in: 'path',
            required: true,
            description: 'Name of the application',
            schema: {
              type: 'string'
            }
          },
          {
            name: 'StartTime',
            in: 'query',
            required: true,
            description: 'Start time for trace query',
            schema: {
              type: 'string',
              format: 'date-time'
            }
          },
          {
            name: 'EndTime',
            in: 'query',
            required: true,
            description: 'End time for trace query',
            schema: {
              type: 'string',
              format: 'date-time'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Traces retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    Traces: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          TraceId: {
                            type: 'string',
                            description: 'Unique identifier for the trace'
                          },
                          Duration: {
                            type: 'number',
                            description: 'Duration of the trace in milliseconds'
                          },
                          Segments: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                Id: {
                                  type: 'string',
                                  description: 'Segment identifier'
                                },
                                Name: {
                                  type: 'string',
                                  description: 'Segment name'
                                },
                                StartTime: {
                                  type: 'number',
                                  description: 'Segment start time'
                                },
                                EndTime: {
                                  type: 'number',
                                  description: 'Segment end time'
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        security: [
          {
            'AWS4-HMAC-SHA256': []
          }
        ]
      }
    }
  },
  components: {
    securitySchemes: {
      'AWS4-HMAC-SHA256': {
        type: 'http',
        scheme: 'AWS4-HMAC-SHA256',
        description: 'AWS Signature Version 4 authentication'
      }
    }
  },
  security: [
    {
      'AWS4-HMAC-SHA256': []
    }
  ],
  tags: [
    {
      name: 'Applications',
      description: 'Operations for managing applications'
    },
    {
      name: 'Traces',
      description: 'Operations for retrieving and analyzing traces'
    },
    {
      name: 'Metrics',
      description: 'Operations for retrieving application metrics'
    },
    {
      name: 'Service Maps',
      description: 'Operations for service topology and dependencies'
    }
  ]
}

export const authenticationGuides: AuthenticationGuide[] = [
  {
    id: 'aws-signature-v4',
    title: 'AWS Signature Version 4',
    description: 'Learn how to authenticate API requests using AWS Signature Version 4',
    type: 'iam',
    steps: [
      {
        id: 'step-1',
        title: 'Configure AWS Credentials',
        description: 'Set up your AWS access key ID and secret access key',
        code: `# Using AWS CLI
aws configure set aws_access_key_id YOUR_ACCESS_KEY
aws configure set aws_secret_access_key YOUR_SECRET_KEY
aws configure set region us-east-1`,
        language: 'bash',
        required: true
      },
      {
        id: 'step-2',
        title: 'Create Canonical Request',
        description: 'Format the HTTP request according to AWS specifications',
        code: `const canonicalRequest = [
  httpMethod,
  canonicalUri,
  canonicalQueryString,
  canonicalHeaders,
  signedHeaders,
  hashedPayload
].join('\\n');`,
        language: 'javascript',
        required: true
      },
      {
        id: 'step-3',
        title: 'Create String to Sign',
        description: 'Create the string that will be signed with your secret key',
        code: `const stringToSign = [
  'AWS4-HMAC-SHA256',
  timestamp,
  credentialScope,
  hash(canonicalRequest)
].join('\\n');`,
        language: 'javascript',
        required: true
      }
    ],
    examples: [
      {
        id: 'nodejs-example',
        title: 'Node.js Authentication Example',
        description: 'Complete example using AWS SDK for JavaScript',
        language: 'javascript',
        code: `const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: 'YOUR_ACCESS_KEY',
  secretAccessKey: 'YOUR_SECRET_KEY',
  region: 'us-east-1'
});

const applicationInsights = new AWS.ApplicationInsights();

// List applications
applicationInsights.listApplications({
  MaxResults: 10
}, (err, data) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Applications:', data.Applications);
  }
});`,
        explanation: 'This example shows how to use the AWS SDK to automatically handle authentication'
      }
    ],
    troubleshooting: [
      {
        id: 'invalid-signature',
        issue: 'SignatureDoesNotMatch error',
        solution: 'Verify your AWS credentials and ensure the system clock is synchronized',
        code: `# Check system time
date
# Sync with NTP if needed
sudo ntpdate -s time.nist.gov`,
        language: 'bash'
      }
    ]
  },
  {
    id: 'iam-roles',
    title: 'IAM Roles for EC2',
    description: 'Use IAM roles for secure authentication from EC2 instances',
    type: 'iam',
    steps: [
      {
        id: 'create-role',
        title: 'Create IAM Role',
        description: 'Create an IAM role with CloudWatch APM permissions',
        required: true
      },
      {
        id: 'attach-policy',
        title: 'Attach Policy',
        description: 'Attach the CloudWatchApplicationInsightsFullAccess policy',
        required: true
      },
      {
        id: 'assign-role',
        title: 'Assign Role to EC2',
        description: 'Assign the IAM role to your EC2 instance',
        required: true
      }
    ],
    examples: [
      {
        id: 'ec2-role-example',
        title: 'Using IAM Role from EC2',
        description: 'Access CloudWatch APM API from EC2 using instance role',
        language: 'python',
        code: `import boto3

# SDK automatically uses instance role
client = boto3.client('application-insights')

# List applications
response = client.list_applications(MaxResults=10)
print(response['Applications'])`,
        explanation: 'When running on EC2 with an IAM role, the SDK automatically uses the instance credentials'
      }
    ],
    troubleshooting: [
      {
        id: 'no-credentials',
        issue: 'Unable to locate credentials',
        solution: 'Ensure the EC2 instance has an IAM role attached with appropriate permissions'
      }
    ]
  }
]

export const rateLimitingInfo: RateLimitingInfo = {
  defaultLimits: [
    {
      operation: 'ListApplications',
      limit: 100,
      window: '1 minute',
      description: 'Maximum 100 requests per minute for listing applications'
    },
    {
      operation: 'GetTraces',
      limit: 50,
      window: '1 minute',
      description: 'Maximum 50 requests per minute for retrieving traces'
    },
    {
      operation: 'CreateApplication',
      limit: 10,
      window: '1 minute',
      description: 'Maximum 10 applications can be created per minute'
    }
  ],
  quotaInformation: [
    {
      resource: 'Applications',
      limit: 1000,
      period: 'per account',
      description: 'Maximum number of applications per AWS account'
    },
    {
      resource: 'Traces',
      limit: 100000,
      period: 'per day',
      description: 'Maximum number of traces that can be stored per day'
    }
  ],
  bestPractices: [
    'Implement exponential backoff for retries',
    'Cache responses when appropriate to reduce API calls',
    'Use batch operations when available',
    'Monitor your API usage through CloudWatch metrics',
    'Consider using AWS SDK built-in retry logic'
  ],
  errorHandling: [
    {
      errorCode: 'ThrottlingException',
      description: 'Request rate exceeded',
      solution: 'Implement exponential backoff and retry logic',
      example: `// JavaScript retry with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 'ThrottlingException' && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
};`
    }
  ]
}

export const sdkDocumentations: SDKDocumentation[] = [
  {
    id: 'javascript-sdk',
    language: 'JavaScript',
    version: '3.0.0',
    title: 'AWS SDK for JavaScript v3 - CloudWatch Application Insights',
    description: 'Official AWS SDK for JavaScript v3 with CloudWatch Application Insights support',
    installation: {
      packageManager: 'npm',
      command: 'npm install @aws-sdk/client-application-insights',
      requirements: ['Node.js 14.x or later', 'npm 6.x or later'],
      additionalSteps: [
        {
          title: 'Configure AWS Credentials',
          description: 'Set up your AWS credentials using AWS CLI or environment variables',
          code: 'aws configure'
        }
      ]
    },
    quickStart: {
      title: 'Quick Start Guide',
      description: 'Get started with CloudWatch Application Insights in just a few steps',
      steps: [
        {
          title: 'Import the Client',
          description: 'Import the ApplicationInsights client from the AWS SDK',
          code: `import { ApplicationInsightsClient } from "@aws-sdk/client-application-insights";`,
          explanation: 'This imports the main client class for interacting with the service'
        },
        {
          title: 'Create Client Instance',
          description: 'Create a new client instance with your AWS region',
          code: `const client = new ApplicationInsightsClient({ region: "us-east-1" });`,
          explanation: 'The client handles authentication and API communication'
        },
        {
          title: 'Make Your First API Call',
          description: 'List all applications in your account',
          code: `import { ListApplicationsCommand } from "@aws-sdk/client-application-insights";

const command = new ListApplicationsCommand({ MaxResults: 10 });
const response = await client.send(command);
console.log(response.Applications);`,
          explanation: 'Commands encapsulate API operations and their parameters'
        }
      ],
      completeExample: `import { 
  ApplicationInsightsClient, 
  ListApplicationsCommand,
  CreateApplicationCommand 
} from "@aws-sdk/client-application-insights";

const client = new ApplicationInsightsClient({ region: "us-east-1" });

async function main() {
  try {
    // List existing applications
    const listCommand = new ListApplicationsCommand({ MaxResults: 10 });
    const listResponse = await client.send(listCommand);
    console.log("Existing applications:", listResponse.Applications);

    // Create a new application
    const createCommand = new CreateApplicationCommand({
      ApplicationName: "my-web-app"
    });
    const createResponse = await client.send(createCommand);
    console.log("Created application:", createResponse.ApplicationArn);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();`
    },
    apiReference: {
      classes: [
        {
          name: 'ApplicationInsightsClient',
          description: 'Main client class for CloudWatch Application Insights',
          constructor: {
            parameters: [
              {
                name: 'config',
                type: 'ApplicationInsightsClientConfig',
                description: 'Configuration object for the client',
                required: true
              }
            ],
            description: 'Creates a new ApplicationInsights client instance',
            example: `const client = new ApplicationInsightsClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: "your-access-key",
    secretAccessKey: "your-secret-key"
  }
});`
          },
          methods: [
            {
              name: 'send',
              description: 'Sends a command to the CloudWatch Application Insights service',
              parameters: [
                {
                  name: 'command',
                  type: 'Command',
                  description: 'The command to send',
                  required: true
                }
              ],
              returnType: 'Promise<CommandOutput>',
              returnDescription: 'Promise that resolves to the command output',
              examples: [
                `const command = new ListApplicationsCommand({});
const response = await client.send(command);`
              ]
            }
          ],
          properties: [
            {
              name: 'config',
              type: 'ApplicationInsightsClientConfig',
              description: 'Client configuration',
              readOnly: true
            }
          ],
          examples: [
            `// Basic client usage
const client = new ApplicationInsightsClient({ region: "us-east-1" });
const command = new ListApplicationsCommand({});
const response = await client.send(command);`
          ]
        }
      ],
      functions: [
        {
          name: 'createApplicationInsightsClient',
          description: 'Factory function to create ApplicationInsights client',
          parameters: [
            {
              name: 'config',
              type: 'ApplicationInsightsClientConfig',
              description: 'Client configuration',
              required: true
            }
          ],
          returnType: 'ApplicationInsightsClient',
          returnDescription: 'Configured ApplicationInsights client',
          examples: [
            `const client = createApplicationInsightsClient({
  region: "us-east-1"
});`
          ]
        }
      ],
      types: [
        {
          name: 'ApplicationInsightsClientConfig',
          description: 'Configuration interface for ApplicationInsights client',
          properties: [
            {
              name: 'region',
              type: 'string',
              description: 'AWS region for the client'
            },
            {
              name: 'credentials',
              type: 'AwsCredentialIdentity',
              description: 'AWS credentials for authentication'
            },
            {
              name: 'endpoint',
              type: 'string',
              description: 'Custom endpoint URL'
            }
          ],
          examples: [
            `const config: ApplicationInsightsClientConfig = {
  region: "us-east-1",
  credentials: {
    accessKeyId: "AKIA...",
    secretAccessKey: "..."
  }
};`
          ]
        }
      ]
    },
    examples: [
      {
        id: 'list-applications',
        title: 'List All Applications',
        description: 'Retrieve all applications with pagination support',
        category: 'Basic Operations',
        code: `import { 
  ApplicationInsightsClient, 
  ListApplicationsCommand 
} from "@aws-sdk/client-application-insights";

const client = new ApplicationInsightsClient({ region: "us-east-1" });

async function listAllApplications() {
  let nextToken;
  const allApplications = [];

  do {
    const command = new ListApplicationsCommand({
      MaxResults: 50,
      NextToken: nextToken
    });
    
    const response = await client.send(command);
    allApplications.push(...response.Applications);
    nextToken = response.NextToken;
  } while (nextToken);

  return allApplications;
}`,
        explanation: 'This example demonstrates pagination to retrieve all applications',
        relatedMethods: ['ListApplicationsCommand']
      },
      {
        id: 'error-handling',
        title: 'Error Handling Best Practices',
        description: 'Proper error handling and retry logic',
        category: 'Error Handling',
        code: `import { 
  ApplicationInsightsClient, 
  CreateApplicationCommand,
  ThrottlingException,
  ValidationException 
} from "@aws-sdk/client-application-insights";

const client = new ApplicationInsightsClient({ region: "us-east-1" });

async function createApplicationWithRetry(applicationName: string) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const command = new CreateApplicationCommand({
        ApplicationName: applicationName
      });
      
      return await client.send(command);
    } catch (error) {
      if (error instanceof ThrottlingException) {
        // Exponential backoff for throttling
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        retryCount++;
        continue;
      } else if (error instanceof ValidationException) {
        // Don't retry validation errors
        throw new Error(\`Invalid application name: \${error.message}\`);
      } else {
        // Re-throw other errors
        throw error;
      }
    }
  }
  
  throw new Error('Max retries exceeded');
}`,
        explanation: 'Shows proper error handling with retry logic for different error types',
        relatedMethods: ['CreateApplicationCommand']
      }
    ],
    rateLimiting: rateLimitingInfo,
    changelog: [
      {
        version: '3.0.0',
        date: '2023-11-27',
        changes: [
          {
            type: 'added',
            description: 'Initial release of CloudWatch Application Insights support'
          },
          {
            type: 'added',
            description: 'Support for all major API operations'
          }
        ]
      }
    ]
  },
  {
    id: 'python-sdk',
    language: 'Python',
    version: '1.29.0',
    title: 'AWS SDK for Python (Boto3) - CloudWatch Application Insights',
    description: 'Official AWS SDK for Python with CloudWatch Application Insights support',
    installation: {
      packageManager: 'pip',
      command: 'pip install boto3',
      requirements: ['Python 3.7 or later', 'pip'],
      additionalSteps: [
        {
          title: 'Configure AWS Credentials',
          description: 'Set up your AWS credentials',
          code: 'aws configure'
        }
      ]
    },
    quickStart: {
      title: 'Python Quick Start',
      description: 'Get started with CloudWatch Application Insights using Python',
      steps: [
        {
          title: 'Import Boto3',
          description: 'Import the boto3 library',
          code: `import boto3`,
          explanation: 'Boto3 is the AWS SDK for Python'
        },
        {
          title: 'Create Client',
          description: 'Create an Application Insights client',
          code: `client = boto3.client('application-insights', region_name='us-east-1')`,
          explanation: 'The client provides access to all API operations'
        },
        {
          title: 'Make API Call',
          description: 'List applications in your account',
          code: `response = client.list_applications(MaxResults=10)
print(response['Applications'])`,
          explanation: 'API responses are returned as Python dictionaries'
        }
      ],
      completeExample: `import boto3
from botocore.exceptions import ClientError

def main():
    # Create client
    client = boto3.client('application-insights', region_name='us-east-1')
    
    try:
        # List applications
        response = client.list_applications(MaxResults=10)
        print("Applications:", response['Applications'])
        
        # Create new application
        create_response = client.create_application(
            ApplicationName='my-python-app'
        )
        print("Created:", create_response['ApplicationArn'])
        
    except ClientError as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()`
    },
    apiReference: {
      classes: [
        {
          name: 'ApplicationInsights.Client',
          description: 'Low-level client for CloudWatch Application Insights',
          constructor: {
            parameters: [
              {
                name: 'region_name',
                type: 'str',
                description: 'AWS region name',
                required: false
              }
            ],
            description: 'Creates a new Application Insights client',
            example: `client = boto3.client('application-insights', region_name='us-east-1')`
          },
          methods: [
            {
              name: 'list_applications',
              description: 'Lists applications monitored by Application Insights',
              parameters: [
                {
                  name: 'MaxResults',
                  type: 'int',
                  description: 'Maximum number of results to return',
                  required: false
                },
                {
                  name: 'NextToken',
                  type: 'str',
                  description: 'Token for pagination',
                  required: false
                }
              ],
              returnType: 'dict',
              returnDescription: 'Dictionary containing Applications list and NextToken',
              examples: [
                `response = client.list_applications(MaxResults=50)`
              ]
            }
          ],
          properties: [],
          examples: [
            `client = boto3.client('application-insights')
response = client.list_applications()`
          ]
        }
      ],
      functions: [],
      types: []
    },
    examples: [
      {
        id: 'python-pagination',
        title: 'Pagination with Python',
        description: 'Handle paginated responses in Python',
        category: 'Basic Operations',
        code: `import boto3

client = boto3.client('application-insights', region_name='us-east-1')

def get_all_applications():
    applications = []
    paginator = client.get_paginator('list_applications')
    
    for page in paginator.paginate(MaxResults=50):
        applications.extend(page['Applications'])
    
    return applications

# Usage
all_apps = get_all_applications()
print(f"Found {len(all_apps)} applications")`,
        explanation: 'Uses boto3 paginator for efficient pagination handling',
        relatedMethods: ['list_applications']
      }
    ],
    rateLimiting: rateLimitingInfo,
    changelog: [
      {
        version: '1.29.0',
        date: '2023-11-27',
        changes: [
          {
            type: 'added',
            description: 'Added CloudWatch Application Insights support'
          }
        ]
      }
    ]
  }
]