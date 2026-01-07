import React, { useState, useEffect } from 'react';

interface AIRecommendation {
  id: string;
  type: 'performance' | 'error' | 'cost' | 'security';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  autoImplementable: boolean;
  estimatedSavings?: string;
}

interface InstrumentationInsight {
  metric: string;
  current: number;
  recommended: number;
  improvement: string;
  reasoning: string;
}

export const AgenticInstrumentationGuide: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>('');

  const aiRecommendations: AIRecommendation[] = [
    {
      id: 'db-connection-pool',
      type: 'performance',
      priority: 'high',
      title: 'Optimize Database Connection Pool',
      description: 'AI detected suboptimal connection pool settings causing 23% performance degradation',
      impact: '23% latency reduction',
      effort: 'low',
      autoImplementable: true,
      estimatedSavings: '$1,200/month'
    },
    {
      id: 'memory-leak-detection',
      type: 'error',
      priority: 'high',
      title: 'Memory Leak in User Session Handler',
      description: 'Pattern analysis reveals gradual memory increase in UserSessionHandler.cleanup()',
      impact: 'Prevent OOM crashes',
      effort: 'medium',
      autoImplementable: false
    },
    {
      id: 'unused-metrics',
      type: 'cost',
      priority: 'medium',
      title: 'Remove Unused Metric Collections',
      description: 'AI identified 15 metrics with zero dashboard usage consuming unnecessary resources',
      impact: 'Reduce monitoring costs',
      effort: 'low',
      autoImplementable: true,
      estimatedSavings: '$340/month'
    },
    {
      id: 'security-anomaly',
      type: 'security',
      priority: 'high',
      title: 'Unusual API Access Pattern',
      description: 'ML models detected anomalous access patterns to sensitive endpoints',
      impact: 'Enhanced security monitoring',
      effort: 'low',
      autoImplementable: true
    }
  ];

  const instrumentationInsights: InstrumentationInsight[] = [
    {
      metric: 'Sampling Rate',
      current: 100,
      recommended: 15,
      improvement: '85% cost reduction',
      reasoning: 'AI analysis shows 15% sampling maintains 99.7% issue detection accuracy'
    },
    {
      metric: 'Trace Retention',
      current: 30,
      recommended: 7,
      improvement: '76% storage savings',
      reasoning: 'Historical analysis shows 95% of issues are detected within 7 days'
    },
    {
      metric: 'Custom Metrics',
      current: 847,
      recommended: 234,
      improvement: '72% metric reduction',
      reasoning: 'ML identified 613 metrics with minimal business value or correlation'
    }
  ];

  const startAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
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
            <h1 className="text-2xl font-bold text-gray-900">Agentic Instrumentation</h1>
            <p className="text-gray-600 mt-1">
              AI-powered observability that learns, adapts, and optimizes automatically
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-900">Intelligent Automation</h3>
              <p className="text-sm text-purple-700 mt-1">
                Our AI agent continuously analyzes your application patterns, automatically adjusts instrumentation, 
                and provides intelligent recommendations to optimize performance and reduce costs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h3 className="font-semibold mb-2">Pattern Recognition</h3>
          <p className="text-sm text-gray-600">
            Identifies performance patterns and anomalies across your entire application stack
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h3 className="font-semibold mb-2">Smart Recommendations</h3>
          <p className="text-sm text-gray-600">
            Provides actionable insights with estimated impact and implementation effort
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h3 className="font-semibold mb-2">Auto-Optimization</h3>
          <p className="text-sm text-gray-600">
            Automatically adjusts sampling rates and configurations based on learned patterns
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h3 className="font-semibold mb-2">Predictive Insights</h3>
          <p className="text-sm text-gray-600">
            Forecasts potential issues and suggests proactive instrumentation changes
          </p>
        </div>
      </div>

      {/* AI Analysis Demo */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">AI-Powered Analysis</h2>
          <button
            onClick={startAIAnalysis}
            disabled={isAnalyzing}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                Run AI Analysis
              </>
            )}
          </button>
        </div>

        {isAnalyzing && (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <h3 className="text-lg font-medium mb-2">AI Agent is analyzing your application...</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Scanning application performance patterns</p>
                <p>• Analyzing cost optimization opportunities</p>
                <p>• Detecting potential issues and anomalies</p>
                <p>• Generating intelligent recommendations</p>
              </div>
            </div>
          </div>
        )}

        {analysisComplete && (
          <div className="space-y-6">
            {/* Optimization Insights */}
            <div>
              <h3 className="text-lg font-medium mb-4">Intelligent Optimization Recommendations</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {instrumentationInsights.map((insight, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{insight.metric}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current:</span>
                        <span>{insight.current}{insight.metric.includes('Rate') ? '%' : insight.metric.includes('Retention') ? ' days' : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">AI Recommended:</span>
                        <span className="font-medium text-green-600">{insight.recommended}{insight.metric.includes('Rate') ? '%' : insight.metric.includes('Retention') ? ' days' : ''}</span>
                      </div>
                      <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                        {insight.improvement}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{insight.reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div>
              <h3 className="text-lg font-medium mb-4">AI-Generated Action Items</h3>
              <div className="space-y-3">
                {aiRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedRecommendation === rec.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRecommendation(rec.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="font-medium mr-3">{rec.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                              {rec.priority} priority
                            </span>
                            {rec.autoImplementable && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                Auto-fixable
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Impact: {rec.impact}</span>
                            <span>Effort: {rec.effort}</span>
                            {rec.estimatedSavings && <span>Savings: {rec.estimatedSavings}</span>}
                          </div>
                        </div>
                      </div>
                      {rec.autoImplementable && (
                        <button className="ml-4 bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700">
                          Auto-Fix
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Implementation Guide */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Getting Started with AI Agent</h2>
        
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-sm mr-4">
              1
            </div>
            <div>
              <h3 className="font-medium mb-2">Enable AI Agent</h3>
              <p className="text-gray-600 mb-3">
                Activate the CloudWatch AI agent in your AWS console to begin intelligent analysis of your applications.
              </p>
              <div className="bg-gray-50 rounded-md p-3">
                <code className="text-sm">
                  aws cloudwatch enable-ai-agent --application-name your-app
                </code>
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-sm mr-4">
              2
            </div>
            <div>
              <h3 className="font-medium mb-2">Configure Learning Parameters</h3>
              <p className="text-gray-600 mb-3">
                Set your optimization goals, risk tolerance, and auto-implementation preferences.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-sm mr-4">
              3
            </div>
            <div>
              <h3 className="font-medium mb-2">Monitor and Refine</h3>
              <p className="text-gray-600">
                Review AI recommendations, approve auto-implementations, and provide feedback to improve accuracy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticInstrumentationGuide;