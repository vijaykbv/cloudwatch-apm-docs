import React, { useState } from 'react';
import { PlayIcon, StopIcon, CogIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface InstrumentationTarget {
  id: string;
  name: string;
  type: 'method' | 'class' | 'endpoint' | 'database';
  status: 'active' | 'inactive' | 'pending';
  metrics: {
    requests: number;
    avgLatency: number;
    errorRate: number;
  };
}

export const DynamicInstrumentationGuide: React.FC = () => {
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [isInstrumenting, setIsInstrumenting] = useState(false);

  const instrumentationTargets: InstrumentationTarget[] = [
    {
      id: 'user-service-login',
      name: 'UserService.login()',
      type: 'method',
      status: 'active',
      metrics: { requests: 1250, avgLatency: 45, errorRate: 2.1 }
    },
    {
      id: 'payment-controller',
      name: 'PaymentController',
      type: 'class',
      status: 'inactive',
      metrics: { requests: 0, avgLatency: 0, errorRate: 0 }
    },
    {
      id: 'api-orders',
      name: '/api/orders',
      type: 'endpoint',
      status: 'active',
      metrics: { requests: 890, avgLatency: 120, errorRate: 0.5 }
    },
    {
      id: 'db-user-queries',
      name: 'User Database Queries',
      type: 'database',
      status: 'pending',
      metrics: { requests: 0, avgLatency: 0, errorRate: 0 }
    }
  ];

  const handleInstrument = async (targetId: string) => {
    setIsInstrumenting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsInstrumenting(false);
    // Update target status logic would go here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    return null; // Remove all icons
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dynamic Instrumentation</h1>
            <p className="text-gray-600 mt-1">
              Add observability to your applications without code changes or deployments
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">Zero-Code Observability</h3>
              <p className="text-sm text-blue-700 mt-1">
                Dynamic instrumentation allows you to add tracing, metrics, and logs to running applications 
                without modifying source code or restarting services.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <PlayIcon className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold">Instant Activation</h3>
          </div>
          <p className="text-gray-600">
            Start collecting metrics and traces immediately without code changes or deployments.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <CogIcon className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Runtime Control</h3>
          </div>
          <p className="text-gray-600">
            Enable, disable, and configure instrumentation on running applications in real-time.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <ChartBarIcon className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold">Targeted Insights</h3>
          </div>
          <p className="text-gray-600">
            Focus on specific methods, classes, or endpoints that matter most to your application.
          </p>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Interactive Instrumentation Demo</h2>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Target Selection */}
          <div>
            <h3 className="text-lg font-medium mb-3">Select Instrumentation Target</h3>
            <div className="space-y-3">
              {instrumentationTargets.map((target) => (
                <div
                  key={target.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTarget === target.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTarget(target.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div>
                        <h4 className="font-medium">{target.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{target.type}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(target.status)}`}>
                      {target.status}
                    </span>
                  </div>
                  
                  {target.status === 'active' && (
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Requests</span>
                        <p className="font-medium">{target.metrics.requests.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Latency</span>
                        <p className="font-medium">{target.metrics.avgLatency}ms</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Error Rate</span>
                        <p className="font-medium">{target.metrics.errorRate}%</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Panel */}
          <div>
            <h3 className="text-lg font-medium mb-3">Instrumentation Configuration</h3>
            {selectedTarget ? (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metrics to Collect
                    </label>
                    <div className="space-y-2">
                      {['Execution Time', 'Request Count', 'Error Rate', 'Memory Usage'].map((metric) => (
                        <label key={metric} className="flex items-center">
                          <input type="checkbox" defaultChecked className="mr-2" />
                          <span className="text-sm">{metric}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sampling Rate
                    </label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>100% (All requests)</option>
                      <option>50% (Every other request)</option>
                      <option>10% (1 in 10 requests)</option>
                      <option>1% (1 in 100 requests)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>Continuous</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                      <option>24 hours</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleInstrument(selectedTarget)}
                    disabled={isInstrumenting}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isInstrumenting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Instrumenting...
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-4 h-4 mr-2" />
                        Start Instrumentation
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                <CogIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Select a target to configure instrumentation</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Implementation Steps</h2>
        
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-4">
              1
            </div>
            <div>
              <h3 className="font-medium mb-2">Install the CloudWatch Agent</h3>
              <p className="text-gray-600 mb-3">
                Deploy the CloudWatch agent with dynamic instrumentation capabilities to your application servers.
              </p>
              <div className="bg-gray-50 rounded-md p-3">
                <code className="text-sm">
                  wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
                </code>
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-4">
              2
            </div>
            <div>
              <h3 className="font-medium mb-2">Configure Target Applications</h3>
              <p className="text-gray-600 mb-3">
                Identify and register applications for dynamic instrumentation through the CloudWatch console.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-4">
              3
            </div>
            <div>
              <h3 className="font-medium mb-2">Start Collecting Insights</h3>
              <p className="text-gray-600">
                Use the CloudWatch console or API to enable instrumentation on specific methods, classes, or endpoints.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicInstrumentationGuide;