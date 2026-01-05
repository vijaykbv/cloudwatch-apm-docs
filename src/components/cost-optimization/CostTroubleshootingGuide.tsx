import React, { useState } from 'react';

interface CostIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  symptoms: string[];
  causes: string[];
  solutions: string[];
  prevention: string[];
}

export const CostTroubleshootingGuide: React.FC = () => {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const costIssues: CostIssue[] = [
    {
      id: 'transaction-search-spike',
      title: 'Unexpected Cost Spike from Transaction Search',
      description: 'Enabling Transaction Search created hundreds of custom metrics, causing a 10x cost increase',
      severity: 'critical',
      symptoms: [
        'Monthly bill increased by 5-10x after enabling Transaction Search',
        'Hundreds of new custom metrics in ApplicationSignals namespace',
        'No obvious increase in log volume but significant cost spike',
        'Custom metrics appearing without explicit creation'
      ],
      causes: [
        'Transaction Search auto-enables custom span metrics',
        'High-cardinality trace data creates many metric combinations',
        'No cost controls or limits configured',
        'Misleading documentation about cost implications'
      ],
      solutions: [
        'Immediately disable Transaction Search if not needed',
        'Delete the aws/spans log group to stop metric generation',
        'Review and delete unnecessary custom metrics',
        'Implement metric filters to control which metrics are created',
        'Set up billing alerts for early detection'
      ],
      prevention: [
        'Always review cost implications before enabling new features',
        'Start with Transaction Search disabled, enable selectively',
        'Set up cost monitoring and alerts before feature enablement',
        'Test new features in development environment first'
      ]
    },
    {
      id: 'high-cardinality-metrics',
      title: 'High-Cardinality Custom Metrics Explosion',
      description: 'Custom metrics with user IDs or session IDs creating thousands of unique combinations',
      severity: 'high',
      symptoms: [
        'Hundreds or thousands of custom metrics',
        'Metrics with user IDs, session IDs, or timestamps in dimensions',
        'Exponential growth in metric count over time',
        'High CloudWatch custom metrics charges'
      ],
      causes: [
        'Including high-cardinality data in metric dimensions',
        'Not aggregating metrics before sending',
        'Lack of cardinality limits in application code',
        'Automatic metric generation from logs without filtering'
      ],
      solutions: [
        'Remove high-cardinality dimensions (user IDs, session IDs)',
        'Aggregate metrics by business-relevant dimensions only',
        'Implement cardinality limits in application code',
        'Use metric filters to control log-based metrics',
        'Delete unused or problematic metrics'
      ],
      prevention: [
        'Design metrics with low-cardinality dimensions',
        'Implement metric cardinality monitoring',
        'Review metric designs before implementation',
        'Set up alerts for metric count thresholds'
      ]
    },
    {
      id: 'verbose-logging',
      title: 'Excessive Log Volume and Costs',
      description: 'Debug-level logging in production causing high ingestion and storage costs',
      severity: 'medium',
      symptoms: [
        'High CloudWatch Logs ingestion charges',
        'Large log group sizes (>100GB/month)',
        'Debug or trace level logs in production',
        'Logs with sensitive or unnecessary data'
      ],
      causes: [
        'Debug logging enabled in production environment',
        'No log level filtering or structured logging',
        'Long retention periods (never expire)',
        'Logging every request/response in detail'
      ],
      solutions: [
        'Change log level to WARN or ERROR in production',
        'Implement structured logging with appropriate levels',
        'Reduce log retention to 30 days or less',
        'Filter out health checks and monitoring probes',
        'Use log sampling for high-volume applications'
      ],
      prevention: [
        'Environment-specific log level configuration',
        'Regular log volume monitoring and alerts',
        'Structured logging practices',
        'Automated log retention policy management'
      ]
    },
    {
      id: 'sampling-misconfiguration',
      title: 'Inefficient Trace Sampling Configuration',
      description: 'High sampling rates or no sampling causing excessive trace ingestion costs',
      severity: 'medium',
      symptoms: [
        'High X-Ray trace ingestion costs',
        'Sampling rate above 10% for high-traffic applications',
        'All traces being sent without filtering',
        'No differentiation between error and success traces'
      ],
      causes: [
        'Default 100% sampling configuration',
        'No intelligent sampling rules configured',
        'Lack of understanding of sampling impact on costs',
        'No differentiation between trace types'
      ],
      solutions: [
        'Implement probabilistic sampling (1-5% for high traffic)',
        'Configure tail sampling for intelligent trace selection',
        'Always sample errors and slow requests',
        'Exclude health checks and monitoring from tracing',
        'Use service-specific sampling rates'
      ],
      prevention: [
        'Start with low sampling rates and increase as needed',
        'Implement intelligent sampling from the beginning',
        'Monitor trace volume and costs regularly',
        'Document sampling strategy and rationale'
      ]
    }
  ];

  const emergencyActions = [
    {
      title: '🚨 Immediate Cost Control',
      actions: [
        'Set up billing alerts if not already configured',
        'Review current month charges in AWS Billing dashboard',
        'Identify the service causing the cost spike',
        'Disable expensive features temporarily if needed'
      ]
    },
    {
      title: '🔍 Investigation Steps',
      actions: [
        'Check CloudWatch custom metrics count by namespace',
        'Review log group sizes and ingestion rates',
        'Analyze X-Ray trace volume and sampling rates',
        'Identify when the cost increase started'
      ]
    },
    {
      title: '⚡ Quick Fixes',
      actions: [
        'Reduce log retention periods to 7-30 days',
        'Change production log level to WARN or ERROR',
        'Implement basic trace sampling (1-5%)',
        'Delete unnecessary custom metrics'
      ]
    }
  ];

  const filteredIssues = costIssues.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">🔧 Cost Troubleshooting Guide</h2>
        <p className="text-gray-600">
          Diagnose and resolve common APM cost issues quickly
        </p>
      </div>

      {/* Emergency Actions */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-800">
          🚨 Emergency Response Procedures
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {emergencyActions.map((section, index) => (
            <div key={index}>
              <h4 className="font-medium mb-2 text-red-700">{section.title}</h4>
              <ul className="text-sm space-y-1">
                {section.actions.map((action, actionIndex) => (
                  <li key={actionIndex} className="text-red-600">
                    • {action}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search cost issues by symptoms or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Cost Issues */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Common Cost Issues</h3>
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className={`border rounded-lg p-6 ${getSeverityColor(issue.severity)}`}
          >
            <div
              className="cursor-pointer"
              onClick={() => setSelectedIssue(
                selectedIssue === issue.id ? null : issue.id
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-semibold">{issue.title}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                  {issue.severity}
                </span>
              </div>
              <p className="text-sm mb-2">{issue.description}</p>
              <p className="text-xs opacity-75">
                {selectedIssue === issue.id ? 'Click to collapse' : 'Click to expand details'}
              </p>
            </div>

            {selectedIssue === issue.id && (
              <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-4">
                <div>
                  <h5 className="font-medium mb-2">🔍 Symptoms</h5>
                  <ul className="text-sm space-y-1">
                    {issue.symptoms.map((symptom, index) => (
                      <li key={index}>• {symptom}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2">🎯 Root Causes</h5>
                  <ul className="text-sm space-y-1">
                    {issue.causes.map((cause, index) => (
                      <li key={index}>• {cause}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2">✅ Solutions</h5>
                  <ul className="text-sm space-y-1">
                    {issue.solutions.map((solution, index) => (
                      <li key={index}>• {solution}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2">🛡️ Prevention</h5>
                  <ul className="text-sm space-y-1">
                    {issue.prevention.map((prevention, index) => (
                      <li key={index}>• {prevention}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cost Monitoring Commands */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🔧 Diagnostic Commands</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Check Custom Metrics Count</h4>
            <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm">
              aws cloudwatch list-metrics --namespace "ApplicationSignals" --query 'length(Metrics[])'
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Monitor Log Group Sizes</h4>
            <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm">
              aws logs describe-log-groups --query &apos;logGroups[].{'{Name:logGroupName,Size:storedBytes}'}&apos;
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Check Current Month Billing</h4>
            <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm">
              aws cloudwatch get-metric-statistics --namespace AWS/Billing --metric-name EstimatedCharges --dimensions Name=Currency,Value=USD --start-time $(date -d '1 month ago' -u +%Y-%m-%dT%H:%M:%S) --end-time $(date -u +%Y-%m-%dT%H:%M:%S) --period 86400 --statistics Maximum
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Delete Problematic Log Group</h4>
            <code className="block bg-gray-800 text-red-400 p-3 rounded text-sm">
              # ⚠️ Use with caution - this will stop Transaction Search
              <br />
              aws logs delete-log-group --log-group-name &quot;aws/spans&quot;
            </code>
          </div>
        </div>
      </div>

      {/* Cost Escalation Path */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">
          📞 Escalation Path
        </h3>
        <div className="space-y-3 text-blue-700">
          <div>
            <strong>Level 1:</strong> Self-service using this troubleshooting guide
          </div>
          <div>
            <strong>Level 2:</strong> AWS Support (if you have a support plan)
          </div>
          <div>
            <strong>Level 3:</strong> AWS Billing Support for cost disputes
          </div>
          <div>
            <strong>Emergency:</strong> Contact AWS Support immediately for unexpected charges &gt;$1000
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostTroubleshootingGuide;