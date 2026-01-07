'use client'

import React, { useEffect, useState } from 'react';
import { APMLayout } from '@/components/layout/APMLayout';
import { CostOptimizationCenter } from '@/components/cost-optimization/CostOptimizationCenter';
import QuickStartWizard from '@/components/quickstart/QuickStartWizard';
import TroubleshootingCenter from '@/components/troubleshooting/TroubleshootingCenter';
import { MonitoringBestPractices } from '@/components/monitoring/MonitoringBestPractices';
import SecurityChecklist from '@/components/security/SecurityChecklist';
import PerformanceMetricsDisplay from '@/components/performance/PerformanceMetricsDisplay';
import { InteractiveAPIExplorer } from '@/components/api/InteractiveAPIExplorer';
import { MigrationWizard } from '@/components/migration/MigrationWizard';
import { CodeExampleBrowser } from '@/components/examples/CodeExampleBrowser';
import { ArrowRightIcon, PlayIcon, SparklesIcon } from '@heroicons/react/24/outline';

type APMSection = 
  | 'overview'
  | 'getting-started'
  | 'instrumentation'
  | 'dynamic-instrumentation'
  | 'agentic-instrumentation'
  | 'examples'
  | 'monitoring'
  | 'troubleshooting'
  | 'cost-optimization'
  | 'performance'
  | 'security'
  | 'api-reference'
  | 'migration'
  | 'best-practices';

// Simple Navigation Component - REMOVED (using APMLayout instead)

// Dynamic Instrumentation Component
const DynamicInstrumentationGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <PlayIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dynamic Instrumentation</h1>
            <p className="text-gray-600 mt-1">
              Add observability to your applications without code changes or deployments
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">💡</span>
              </div>
            </div>
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

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <PlayIcon className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Instant Activation</h3>
          </div>
          <p className="text-gray-600">
            Start collecting metrics and traces immediately without code changes or deployments.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-600 text-sm">⚙️</span>
            </div>
            <h3 className="text-lg font-semibold">Runtime Control</h3>
          </div>
          <p className="text-gray-600">
            Enable, disable, and configure instrumentation on running applications in real-time.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-purple-600 text-sm">📊</span>
            </div>
            <h3 className="text-lg font-semibold">Targeted Insights</h3>
          </div>
          <p className="text-gray-600">
            Focus on specific methods, classes, or endpoints that matter most to your application.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="space-y-4">
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
              <p className="text-gray-600">
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

// Agentic Instrumentation Component
const AgenticInstrumentationGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agentic Instrumentation</h1>
            <p className="text-gray-600 mt-1">
              AI-powered observability that learns, adapts, and optimizes automatically
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-purple-600" />
              </div>
            </div>
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

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-blue-600 text-lg">🧠</span>
          </div>
          <h3 className="font-semibold mb-2">Pattern Recognition</h3>
          <p className="text-sm text-gray-600">
            Identifies performance patterns and anomalies across your entire application stack
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-yellow-600 text-lg">💡</span>
          </div>
          <h3 className="font-semibold mb-2">Smart Recommendations</h3>
          <p className="text-sm text-gray-600">
            Provides actionable insights with estimated impact and implementation effort
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">Auto-Optimization</h3>
          <p className="text-sm text-gray-600">
            Automatically adjusts sampling rates and configurations based on learned patterns
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-green-600 text-lg">📈</span>
          </div>
          <h3 className="font-semibold mb-2">Predictive Insights</h3>
          <p className="text-sm text-gray-600">
            Forecasts potential issues and suggests proactive instrumentation changes
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">AI-Powered Benefits</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">Cost Optimization</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Reduce monitoring costs by up to 90%</li>
              <li>• Intelligent sampling rate optimization</li>
              <li>• Automatic cleanup of unused metrics</li>
              <li>• ROI-based feature recommendations</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3">Performance Enhancement</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Proactive issue detection</li>
              <li>• Automated performance tuning</li>
              <li>• Predictive scaling recommendations</li>
              <li>• Real-time optimization adjustments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// APM Overview Component
const APMOverview: React.FC<{ onSectionChange: (section: APMSection) => void }> = ({ onSectionChange }) => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">📊</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          CloudWatch Application Performance Monitoring
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Gain deep insights into your applications with intelligent instrumentation, 
          cost-optimized monitoring, and AI-powered recommendations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onSectionChange('dynamic-instrumentation')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            Start with Dynamic Instrumentation
          </button>
          <button
            onClick={() => onSectionChange('agentic-instrumentation')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Try AI-Powered APM
          </button>
        </div>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div 
          className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSectionChange('dynamic-instrumentation')}
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <PlayIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3">Dynamic Instrumentation</h3>
          <p className="text-gray-600 mb-4">
            Add observability to running applications without code changes or deployments. 
            Start collecting metrics instantly.
          </p>
          <div className="flex items-center text-blue-600 font-medium">
            Learn more <ArrowRightIcon className="w-4 h-4 ml-1" />
          </div>
        </div>

        <div 
          className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSectionChange('agentic-instrumentation')}
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3">AI-Powered Optimization</h3>
          <p className="text-gray-600 mb-4">
            Let AI automatically optimize your instrumentation, reduce costs, and identify 
            performance issues before they impact users.
          </p>
          <div className="flex items-center text-purple-600 font-medium">
            Explore AI features <ArrowRightIcon className="w-4 h-4 ml-1" />
          </div>
        </div>

        <div 
          className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSectionChange('cost-optimization')}
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-green-600 text-xl">💰</span>
          </div>
          <h3 className="text-xl font-semibold mb-3">Cost Optimization</h3>
          <p className="text-gray-600 mb-4">
            Reduce monitoring costs by up to 90% with intelligent sampling, automated 
            cleanup, and cost-aware configurations.
          </p>
          <div className="flex items-center text-green-600 font-medium">
            Calculate savings <ArrowRightIcon className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>

      {/* Getting Started Journey */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Your APM Implementation Journey
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
              1
            </div>
            <h3 className="font-semibold mb-2">Choose Your Path</h3>
            <p className="text-sm text-gray-600">
              Start with Dynamic Instrumentation for immediate insights or AI-powered for intelligent automation
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
              2
            </div>
            <h3 className="font-semibold mb-2">Instrument Applications</h3>
            <p className="text-sm text-gray-600">
              Add observability to your applications with zero-code or AI-guided instrumentation
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
              3
            </div>
            <h3 className="font-semibold mb-2">Optimize & Monitor</h3>
            <p className="text-sm text-gray-600">
              Use cost optimization tools and performance insights to maximize value
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
              4
            </div>
            <h3 className="font-semibold mb-2">Scale & Improve</h3>
            <p className="text-sm text-gray-600">
              Leverage examples, best practices, and advanced features for enterprise scale
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onSectionChange('examples')}
          className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-md transition-shadow"
        >
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
            <span className="text-lg">💻</span>
          </div>
          <h3 className="font-semibold mb-1">Code Examples</h3>
          <p className="text-sm text-gray-600">Ready-to-use implementation examples</p>
        </button>

        <button
          onClick={() => onSectionChange('troubleshooting')}
          className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-md transition-shadow"
        >
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
            <span className="text-lg">🔧</span>
          </div>
          <h3 className="font-semibold mb-1">Troubleshooting</h3>
          <p className="text-sm text-gray-600">Solve common APM issues quickly</p>
        </button>

        <button
          onClick={() => onSectionChange('api-reference')}
          className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-md transition-shadow"
        >
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
            <span className="text-lg">📚</span>
          </div>
          <h3 className="font-semibold mb-1">API Reference</h3>
          <p className="text-sm text-gray-600">Complete API documentation</p>
        </button>

        <button
          onClick={() => onSectionChange('migration')}
          className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-md transition-shadow"
        >
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
            <span className="text-lg">🔄</span>
          </div>
          <h3 className="font-semibold mb-1">Migration Guide</h3>
          <p className="text-sm text-gray-600">Migrate from other APM solutions</p>
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [currentSection, setCurrentSection] = useState<APMSection>('overview');

  const initializeSystems = async () => {
    console.log('APM Documentation systems initialized');
  };

  useEffect(() => {
    initializeSystems();
  }, []);

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'overview':
        return <APMOverview onSectionChange={setCurrentSection} />;
      case 'getting-started':
      case 'instrumentation':
        return <QuickStartWizard 
          platforms={[
            {
              id: 'java',
              name: 'Java',
              description: 'Java applications with Spring Boot, Tomcat, or standalone',
              icon: '☕',
              category: 'language',
              prerequisites: ['Java 8 or higher', 'Maven or Gradle build system', 'AWS credentials configured'],
              installationSteps: [],
              verificationSteps: []
            },
            {
              id: 'python',
              name: 'Python',
              description: 'Python applications with Django, Flask, FastAPI, or other frameworks',
              icon: '🐍',
              category: 'language',
              prerequisites: ['Python 3.7 or higher', 'pip package manager', 'boto3 library installed'],
              installationSteps: [],
              verificationSteps: []
            },
            {
              id: 'nodejs',
              name: 'Node.js',
              description: 'Node.js applications with Express, Fastify, or other frameworks',
              icon: '🟢',
              category: 'language',
              prerequisites: ['Node.js 14 or higher', 'npm or yarn package manager', 'AWS SDK configured'],
              installationSteps: [],
              verificationSteps: []
            }
          ]}
          onComplete={() => console.log('Quick start completed')} 
        />;
      case 'dynamic-instrumentation':
        return <DynamicInstrumentationGuide />;
      case 'agentic-instrumentation':
        return <AgenticInstrumentationGuide />;
      case 'examples':
        return <CodeExampleBrowser 
          examples={[
            {
              id: 'dynamic-instrumentation-java',
              title: 'Dynamic Instrumentation - Java',
              description: 'Enable dynamic instrumentation for Java applications',
              language: 'java',
              code: `// Enable CloudWatch APM Dynamic Instrumentation
import com.amazonaws.services.cloudwatch.apm.DynamicInstrumentation;

public class Application {
    public static void main(String[] args) {
        // Initialize dynamic instrumentation
        DynamicInstrumentation.enable();
        
        // Your application code
        processUserRequest();
    }
    
    public static void processUserRequest() {
        // This method will be automatically instrumented
        System.out.println("Processing user request...");
    }
}`,
              category: 'getting-started',
              difficulty: 'beginner',
              tags: ['java', 'dynamic-instrumentation', 'setup'],
              relatedExamples: ['dynamic-instrumentation-python'],
              lastUpdated: new Date(),
              metadata: {
                filename: 'Application.java',
                runnable: true,
                testable: true
              }
            },
            {
              id: 'dynamic-instrumentation-python',
              title: 'Dynamic Instrumentation - Python',
              description: 'Enable dynamic instrumentation for Python applications',
              language: 'python',
              code: `# Enable CloudWatch APM Dynamic Instrumentation
import boto3
from aws_cloudwatch_apm import DynamicInstrumentation

def main():
    # Initialize dynamic instrumentation
    instrumentation = DynamicInstrumentation()
    instrumentation.enable()
    
    # Your application code
    process_user_request()

def process_user_request():
    # This function will be automatically instrumented
    print("Processing user request...")

if __name__ == "__main__":
    main()`,
              category: 'getting-started',
              difficulty: 'beginner',
              tags: ['python', 'dynamic-instrumentation', 'setup'],
              relatedExamples: ['dynamic-instrumentation-java'],
              lastUpdated: new Date(),
              metadata: {
                filename: 'app.py',
                runnable: true,
                testable: true
              }
            },
            {
              id: 'agentic-instrumentation-config',
              title: 'AI-Powered Instrumentation Configuration',
              description: 'Configure AI agent for automatic optimization',
              language: 'yaml',
              code: `# CloudWatch APM AI Agent Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: apm-ai-agent-config
data:
  config.yaml: |
    ai_agent:
      enabled: true
      optimization_goals:
        - cost_reduction
        - performance_improvement
        - error_detection
      
      auto_implementation:
        enabled: true
        risk_tolerance: medium
        approval_required: false
      
      learning_parameters:
        sampling_optimization: true
        metric_cleanup: true
        anomaly_detection: true
      
      cost_optimization:
        target_reduction: 50
        maintain_accuracy: 95
        
    instrumentation:
      dynamic_targets:
        - type: method
          pattern: "*.service.*"
        - type: endpoint
          pattern: "/api/*"
        - type: database
          pattern: "SELECT|INSERT|UPDATE"`,
              category: 'configuration',
              difficulty: 'intermediate',
              tags: ['ai', 'configuration', 'optimization'],
              relatedExamples: ['cost-optimization-config'],
              lastUpdated: new Date(),
              metadata: {
                filename: 'apm-config.yaml',
                runnable: false,
                testable: false
              }
            }
          ]}
        />;
      case 'cost-optimization':
        return <CostOptimizationCenter />;
      case 'troubleshooting':
        return <TroubleshootingCenter />;
      case 'monitoring':
        return <MonitoringBestPractices />;
      case 'security':
        return <SecurityChecklist />;
      case 'performance':
        return <PerformanceMetricsDisplay />;
      case 'api-reference':
        return <InteractiveAPIExplorer />;
      case 'migration':
        return <MigrationWizard />;
      default:
        return <APMOverview onSectionChange={setCurrentSection} />;
    }
  };

  return (
    <APMLayout
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      {renderCurrentSection()}
    </APMLayout>
  );
}