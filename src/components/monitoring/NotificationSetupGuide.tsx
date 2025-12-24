'use client'

import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { NotificationConfiguration } from '../../types/monitoring'

interface NotificationSetupGuideProps {
  onNotificationConfigured?: (config: NotificationConfiguration) => void
}

interface NotificationTemplate {
  id: string
  name: string
  type: NotificationConfiguration['type']
  description: string
  setupSteps: SetupStep[]
  testInstructions: string
  commonIssues: CommonIssue[]
}

interface SetupStep {
  id: string
  title: string
  description: string
  code?: string
  commands?: string[]
  validation: string
}

interface CommonIssue {
  problem: string
  solution: string
}

const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'email',
    name: 'Email Notifications',
    type: 'email',
    description: 'Send alert notifications via email using Amazon SES or SNS',
    setupSteps: [
      {
        id: 'create_sns_topic',
        title: 'Create SNS Topic',
        description: 'Create an SNS topic for email notifications',
        commands: [
          'aws sns create-topic --name cloudwatch-alerts-email',
          'aws sns subscribe --topic-arn arn:aws:sns:region:account:cloudwatch-alerts-email --protocol email --notification-endpoint your-email@example.com'
        ],
        validation: 'Check your email for the subscription confirmation and confirm it'
      },
      {
        id: 'configure_cloudwatch',
        title: 'Configure CloudWatch Alarm',
        description: 'Set up CloudWatch alarm to use the SNS topic',
        code: `{
  "AlarmName": "HighResponseTime",
  "AlarmDescription": "Alert when response time is high",
  "MetricName": "ResponseTime",
  "Namespace": "AWS/ApplicationELB",
  "Statistic": "Average",
  "Period": 300,
  "EvaluationPeriods": 2,
  "Threshold": 1000,
  "ComparisonOperator": "GreaterThanThreshold",
  "AlarmActions": [
    "arn:aws:sns:region:account:cloudwatch-alerts-email"
  ]
}`,
        validation: 'Verify the alarm appears in CloudWatch console with correct SNS topic'
      }
    ],
    testInstructions: 'Use "Test Alarm" feature in CloudWatch console to send a test notification',
    commonIssues: [
      {
        problem: 'Email not received',
        solution: 'Check spam folder and verify email subscription is confirmed'
      },
      {
        problem: 'SNS topic not found',
        solution: 'Ensure SNS topic exists in the same region as your CloudWatch alarm'
      }
    ]
  },
  {
    id: 'slack',
    name: 'Slack Notifications',
    type: 'slack',
    description: 'Send alert notifications to Slack channels using webhooks',
    setupSteps: [
      {
        id: 'create_slack_app',
        title: 'Create Slack App',
        description: 'Create a Slack app and configure incoming webhooks',
        validation: 'Verify you can post test messages to your Slack channel'
      },
      {
        id: 'setup_webhook',
        title: 'Configure Webhook URL',
        description: 'Get the webhook URL from Slack and configure it in your notification system',
        code: `{
  "webhook_url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
  "channel": "#alerts",
  "username": "CloudWatch",
  "icon_emoji": ":warning:"
}`,
        validation: 'Send a test message to verify webhook is working'
      },
      {
        id: 'lambda_integration',
        title: 'Lambda Integration',
        description: 'Create Lambda function to format and send Slack messages',
        code: `import json
import urllib3

def lambda_handler(event, context):
    http = urllib3.PoolManager()
    
    # Parse SNS message
    message = json.loads(event['Records'][0]['Sns']['Message'])
    
    slack_message = {
        "text": f"🚨 CloudWatch Alert: {message['AlarmName']}",
        "attachments": [{
            "color": "danger" if message['NewStateValue'] == 'ALARM' else "good",
            "fields": [
                {"title": "Alarm", "value": message['AlarmName'], "short": True},
                {"title": "State", "value": message['NewStateValue'], "short": True},
                {"title": "Reason", "value": message['NewStateReason'], "short": False}
            ]
        }]
    }
    
    response = http.request('POST', 
        'YOUR_WEBHOOK_URL',
        body=json.dumps(slack_message),
        headers={'Content-Type': 'application/json'})
    
    return {'statusCode': 200}`,
        validation: 'Test the Lambda function with a sample SNS event'
      }
    ],
    testInstructions: 'Trigger a test alarm or use Lambda test feature with sample SNS payload',
    commonIssues: [
      {
        problem: 'Messages not appearing in Slack',
        solution: 'Verify webhook URL is correct and Lambda has internet access'
      },
      {
        problem: 'Lambda timeout errors',
        solution: 'Increase Lambda timeout and ensure proper error handling'
      }
    ]
  },
  {
    id: 'webhook',
    name: 'Custom Webhook',
    type: 'webhook',
    description: 'Send notifications to custom HTTP endpoints',
    setupSteps: [
      {
        id: 'prepare_endpoint',
        title: 'Prepare HTTP Endpoint',
        description: 'Set up your HTTP endpoint to receive webhook notifications',
        code: `// Example Express.js endpoint
app.post('/cloudwatch-webhook', (req, res) => {
  const alert = req.body;
  
  console.log('Received alert:', {
    alarmName: alert.AlarmName,
    state: alert.NewStateValue,
    reason: alert.NewStateReason,
    timestamp: alert.StateChangeTime
  });
  
  // Process the alert (send to monitoring system, create ticket, etc.)
  processAlert(alert);
  
  res.status(200).json({ received: true });
});`,
        validation: 'Test endpoint with curl or Postman to ensure it accepts POST requests'
      },
      {
        id: 'configure_sns_webhook',
        title: 'Configure SNS HTTP Subscription',
        description: 'Set up SNS to send notifications to your webhook',
        commands: [
          'aws sns create-topic --name cloudwatch-webhook-alerts',
          'aws sns subscribe --topic-arn arn:aws:sns:region:account:cloudwatch-webhook-alerts --protocol http --notification-endpoint https://your-domain.com/cloudwatch-webhook'
        ],
        validation: 'Confirm the HTTP subscription in SNS console'
      }
    ],
    testInstructions: 'Use SNS console to publish a test message to your topic',
    commonIssues: [
      {
        problem: 'Webhook not receiving notifications',
        solution: 'Ensure endpoint is publicly accessible and returns 200 status code'
      },
      {
        problem: 'SSL certificate errors',
        solution: 'Use valid SSL certificate or configure SNS to accept self-signed certificates'
      }
    ]
  },
  {
    id: 'sms',
    name: 'SMS Notifications',
    type: 'sms',
    description: 'Send alert notifications via SMS using Amazon SNS',
    setupSteps: [
      {
        id: 'setup_sms_topic',
        title: 'Create SMS Topic',
        description: 'Create SNS topic and add SMS subscriptions',
        commands: [
          'aws sns create-topic --name cloudwatch-sms-alerts',
          'aws sns subscribe --topic-arn arn:aws:sns:region:account:cloudwatch-sms-alerts --protocol sms --notification-endpoint +1234567890'
        ],
        validation: 'Verify SMS subscription is confirmed and active'
      },
      {
        id: 'configure_message_format',
        title: 'Configure Message Format',
        description: 'Set up message formatting for SMS constraints',
        code: `{
  "default": "CloudWatch Alert: {{AlarmName}} is {{NewStateValue}}. {{NewStateReason}}",
  "sms": "ALERT: {{AlarmName}} {{NewStateValue}} - {{NewStateReason}}"
}`,
        validation: 'Test message format to ensure it fits SMS character limits'
      }
    ],
    testInstructions: 'Send test SMS through SNS console to verify delivery',
    commonIssues: [
      {
        problem: 'SMS not delivered',
        solution: 'Check phone number format and SMS spending limits in AWS account'
      },
      {
        problem: 'Messages truncated',
        solution: 'Keep messages under 160 characters or use message splitting'
      }
    ]
  }
]

export function NotificationSetupGuide({ onNotificationConfigured }: NotificationSetupGuideProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [testConfig, setTestConfig] = useState<Partial<NotificationConfiguration>>({})

  const handleTemplateSelect = (template: NotificationTemplate) => {
    setSelectedTemplate(template)
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setTestConfig({ type: template.type, enabled: true, conditions: [] })
  }

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]))
    if (currentStep < selectedTemplate!.setupSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleTestConfiguration = () => {
    if (testConfig.type && testConfig.target) {
      const config: NotificationConfiguration = {
        type: testConfig.type,
        target: testConfig.target,
        enabled: true,
        conditions: [
          { state: 'alarm', enabled: true },
          { state: 'ok', enabled: false }
        ]
      }
      onNotificationConfigured?.(config)
    }
  }

  if (!selectedTemplate) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Setup Guide</h2>
          <p className="text-gray-600">
            Choose a notification method to set up alerts for your CloudWatch monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notificationTemplates.map(template => (
            <Card key={template.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div onClick={() => handleTemplateSelect(template)}>
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    {template.type === 'email' && '📧'}
                    {template.type === 'slack' && '💬'}
                    {template.type === 'webhook' && '🔗'}
                    {template.type === 'sms' && '📱'}
                    {template.type === 'sns' && '📢'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{template.type}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{template.description}</p>
                <div className="mt-4 text-sm text-blue-600 font-medium">
                  {template.setupSteps.length} setup steps →
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-yellow-50">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Best Practices</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>• Set up multiple notification channels for critical alerts</p>
            <p>• Use different notification methods for different severity levels</p>
            <p>• Test your notification setup regularly to ensure reliability</p>
            <p>• Consider notification fatigue - avoid too many low-priority alerts</p>
            <p>• Include relevant context in alert messages for faster resolution</p>
          </div>
        </Card>
      </div>
    )
  }

  const currentStepData = selectedTemplate.setupSteps[currentStep]
  const isStepComplete = completedSteps.has(currentStepData.id)
  const allStepsComplete = selectedTemplate.setupSteps.every(step => completedSteps.has(step.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name} Setup</h2>
          <p className="text-gray-600">{selectedTemplate.description}</p>
        </div>
        <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
          ← Back to Options
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center space-x-4">
        {selectedTemplate.setupSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${completedSteps.has(step.id) 
                ? 'bg-green-600 text-white' 
                : index === currentStep 
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }
            `}>
              {completedSteps.has(step.id) ? '✓' : index + 1}
            </div>
            {index < selectedTemplate.setupSteps.length - 1 && (
              <div className={`
                w-16 h-0.5 mx-2
                ${completedSteps.has(step.id) ? 'bg-green-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Current step */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{currentStepData.title}</h3>
          {isStepComplete && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              ✓ Complete
            </span>
          )}
        </div>
        
        <p className="text-gray-600 mb-4">{currentStepData.description}</p>

        {currentStepData.commands && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Commands to run:</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2">
              {currentStepData.commands.map((command, index) => (
                <div key={index} className="flex items-center justify-between">
                  <code>{command}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(command)}
                    className="ml-2 text-xs"
                  >
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStepData.code && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Configuration:</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{currentStepData.code}</code>
              </pre>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Validation:</h4>
          <p className="text-sm text-blue-700">{currentStepData.validation}</p>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <Button
            onClick={() => markStepComplete(currentStepData.id)}
            disabled={isStepComplete}
          >
            {isStepComplete ? 'Completed' : 'Mark Complete'}
          </Button>
        </div>
      </Card>

      {/* Test configuration */}
      {allStepsComplete && (
        <Card className="p-6 bg-green-50">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Test Your Configuration</h3>
          <p className="text-green-700 mb-4">{selectedTemplate.testInstructions}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target ({selectedTemplate.type === 'email' ? 'Email' : 
                        selectedTemplate.type === 'slack' ? 'Channel' :
                        selectedTemplate.type === 'sms' ? 'Phone' : 'URL'})
              </label>
              <Input
                value={testConfig.target || ''}
                onChange={(e) => setTestConfig(prev => ({ ...prev, target: e.target.value }))}
                placeholder={
                  selectedTemplate.type === 'email' ? 'user@example.com' :
                  selectedTemplate.type === 'slack' ? '#alerts' :
                  selectedTemplate.type === 'sms' ? '+1234567890' :
                  'https://your-webhook-url.com'
                }
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleTestConfiguration} className="w-full">
                Save Configuration
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Common issues */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Issues & Solutions</h3>
        <div className="space-y-3">
          {selectedTemplate.commonIssues.map((issue, index) => (
            <div key={index} className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium text-gray-900">{issue.problem}</h4>
              <p className="text-gray-600 text-sm">{issue.solution}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}