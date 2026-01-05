import React, { useState } from 'react';

interface OptimizationStrategy {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  savings: string;
  implementation: string[];
}

export const CostOptimizationGuide: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const strategies: OptimizationStrategy[] = [
    {
      id: 'sampling',
      title: 'Smart Sampling Strategies',
      description: 'Reduce trace ingestion by 90-99% while maintaining visibility into errors and performance issues',
      impact: 'high',
      difficulty: 'easy',
      savings: '70-90%',
      implementation: [
        'Set probabilistic sampling to 1-5% for high-traffic applications',
        'Always sample errors and slow requests (>2s)',
        'Use tail sampling for intelligent trace selection',
        'Exclude health checks and monitoring probes'
      ]
    },
    {
      id: 'metrics',
      title: 'Custom Metrics Optimization',
      description: 'Reduce high-cardinality custom metrics that can exponentially increase costs',
      impact: 'high',
      difficulty: 'medium',
      savings: '50-80%',
      implementation: [
        'Avoid user IDs, session IDs in metric dimensions',
        'Aggregate metrics instead of individual events',
        'Limit metric combinations to <100 unique combinations',
        'Use metric filters for log-based metrics'
      ]
    },
    {
      id: 'logs',
      title: 'Log Management Optimization',
      description: 'Optimize log levels and retention policies to reduce storage costs',
      impact: 'medium',
      difficulty: 'easy',
      savings: '40-60%',
      implementation: [
        'Use WARN level in production (not DEBUG)',
        'Set retention to 30 days (not never expire)',
        'Use structured logging for better filtering',
        'Separate debug logs with shorter retention'
      ]
    },
    {
      id: 'features',
      title: 'Feature-Specific Controls',
      description: 'Carefully manage Application Signals and Transaction Search features',
      impact: 'high',
      difficulty: 'medium',
      savings: '60-90%',
      implementation: [
        'Disable auto-metrics in Application Signals',
        'Use selective Transaction Search enablement',
        'Monitor custom metrics creation carefully',
        'Review feature costs before enabling'
      ]
    }
  ];

  const configTemplates = [
    {
      name: 'Startup/Personal ($5-15/month)',
      config: {
        sampling: '0.1%',
        customMetrics: 'Disabled',
        logLevel: 'WARN',
        retention: '7 days',
        features: 'Basic only'
      }
    },
    {
      name: 'Production ($50-200/month)',
      config: {
        sampling: '1%',
        customMetrics: 'Selective',
        logLevel: 'INFO',
        retention: '30 days',
        features: 'Controlled enablement'
      }
    },
    {
      name: 'Enterprise ($200+/month)',
      config: {
        sampling: '5%',
        customMetrics: 'Full',
        logLevel: 'DEBUG (non-prod)',
        retention: '90 days',
        features: 'Full suite'
      }
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Wins Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">🎯 Quick Wins Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Immediate Actions (0-1 week)</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Set up billing alerts for APM services</li>
              <li>✅ Review and reduce log retention periods</li>
              <li>✅ Disable debug logging in production</li>
              <li>✅ Implement basic trace sampling (1-5%)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Short-term Actions (1-4 weeks)</h3>
            <ul className="text-sm space-y-1">
              <li>📊 Audit high-cardinality custom metrics</li>
              <li>🎯 Implement intelligent sampling</li>
              <li>📈 Set up cost monitoring dashboard</li>
              <li>⚙️ Create environment-specific configs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Optimization Strategies */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Cost Optimization Strategies</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                selectedStrategy === strategy.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedStrategy(
                selectedStrategy === strategy.id ? null : strategy.id
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold">{strategy.title}</h3>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(strategy.impact)}`}>
                    {strategy.impact} impact
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(strategy.difficulty)}`}>
                    {strategy.difficulty}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-3">{strategy.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600">
                  Potential savings: {strategy.savings}
                </span>
                <span className="text-sm text-gray-500">
                  {selectedStrategy === strategy.id ? 'Click to collapse' : 'Click to expand'}
                </span>
              </div>

              {selectedStrategy === strategy.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Implementation Steps:</h4>
                  <ul className="space-y-1">
                    {strategy.implementation.map((step, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Templates */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Configuration Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {configTemplates.map((template, index) => (
            <div key={index} className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">{template.name}</h3>
              <div className="space-y-3">
                {Object.entries(template.config).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">💡 Pro Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 text-yellow-800">Hidden Cost Traps</h3>
            <ul className="text-sm space-y-1 text-yellow-700">
              <li>• High-cardinality metrics (user IDs, session IDs)</li>
              <li>• Verbose logging in production</li>
              <li>• Auto-enabled expensive features</li>
              <li>• Default &quot;never expire&quot; retention</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-yellow-800">Cost-Effective Alternatives</h3>
            <ul className="text-sm space-y-1 text-yellow-700">
              <li>• 1% smart sampling &gt; 100% basic traces</li>
              <li>• Summary metrics &gt; individual events</li>
              <li>• Critical paths &gt; everything everywhere</li>
              <li>• Tiered storage by data age</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostOptimizationGuide;