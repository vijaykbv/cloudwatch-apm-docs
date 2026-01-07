import React, { useState } from 'react';

type APMSection = 
  | 'home'
  | 'getting-started'
  | 'concepts-fundamentals'
  | 'implementation-guides'
  | 'features-capabilities'
  | 'use-cases-patterns'
  | 'tutorials-workshops'
  | 'examples-code-samples'
  | 'api-reference'
  | 'best-practices'
  | 'troubleshooting'
  | 'security-compliance'
  | 'integrations'
  | 'dashboards-visualization'
  | 'learning-resources'
  | 'support-resources'
  | 'reference'
  | 'whats-new'
  | 'related-services';

interface NavigationItem {
  id: APMSection;
  title: string;
  children?: NavigationItem[];
  badge?: string;
  isNew?: boolean;
}

interface APMSidebarProps {
  currentSection: APMSection;
  onSectionChange: (section: APMSection) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigationStructure: NavigationItem[] = [
  {
    id: 'home',
    title: 'HOME',
    children: [
      { id: 'home', title: 'Overview' },
      { id: 'home', title: "What's New" },
      { id: 'home', title: 'Release Notes' }
    ]
  },
  {
    id: 'getting-started',
    title: 'GETTING STARTED',
    children: [
      {
        id: 'getting-started',
        title: 'Introduction',
        children: [
          { id: 'getting-started', title: 'What is CloudWatch APM?' },
          { id: 'getting-started', title: 'Key Concepts' },
          { id: 'getting-started', title: 'How It Works' },
          { id: 'getting-started', title: 'Architecture Overview' },
          { id: 'getting-started', title: 'Pricing' }
        ]
      },
      {
        id: 'getting-started',
        title: 'Quick Start Guides',
        children: [
          { id: 'getting-started', title: '5-Minute Quick Start' },
          { id: 'getting-started', title: 'Choose Your Path' },
          { id: 'getting-started', title: 'For Developers' },
          { id: 'getting-started', title: 'For DevOps Engineers' },
          { id: 'getting-started', title: 'For Architects' }
        ]
      },
      {
        id: 'getting-started',
        title: 'Setup by Compute Type',
        children: [
          { id: 'getting-started', title: 'AWS Lambda' },
          { id: 'getting-started', title: 'Amazon ECS' },
          { id: 'getting-started', title: 'Amazon EKS' },
          { id: 'getting-started', title: 'AWS App Runner' },
          { id: 'getting-started', title: 'Amazon EC2' },
          { id: 'getting-started', title: 'Elastic Beanstalk' },
          { id: 'getting-started', title: 'On-Premises / Hybrid' }
        ]
      },
      {
        id: 'getting-started',
        title: 'Setup by Language',
        children: [
          { id: 'getting-started', title: 'Java' },
          { id: 'getting-started', title: 'Python' },
          { id: 'getting-started', title: 'Node.js' },
          { id: 'getting-started', title: '.NET' },
          { id: 'getting-started', title: 'Go' },
          { id: 'getting-started', title: 'Ruby' },
          { id: 'getting-started', title: 'PHP' }
        ]
      }
    ]
  },
  {
    id: 'concepts-fundamentals',
    title: 'CONCEPTS & FUNDAMENTALS',
    children: [
      {
        id: 'concepts-fundamentals',
        title: 'Core Concepts',
        children: [
          { id: 'concepts-fundamentals', title: 'Distributed Tracing' },
          { id: 'concepts-fundamentals', title: 'Traces, Spans, and Segments' },
          { id: 'concepts-fundamentals', title: 'Service Maps' },
          { id: 'concepts-fundamentals', title: 'Sampling Strategies' },
          { id: 'concepts-fundamentals', title: 'Context Propagation' }
        ]
      },
      {
        id: 'concepts-fundamentals',
        title: 'Instrumentation',
        children: [
          { id: 'concepts-fundamentals', title: 'Automatic vs Manual Instrumentation' },
          { id: 'concepts-fundamentals', title: 'OpenTelemetry Overview' },
          { id: 'concepts-fundamentals', title: 'AWS Distro for OpenTelemetry (ADOT)' },
          { id: 'concepts-fundamentals', title: 'Custom Spans and Attributes' },
          { id: 'concepts-fundamentals', title: 'Trace Annotations' }
        ]
      },
      {
        id: 'concepts-fundamentals',
        title: 'Data Model',
        children: [
          { id: 'concepts-fundamentals', title: 'Trace Structure' },
          { id: 'concepts-fundamentals', title: 'Span Attributes' },
          { id: 'concepts-fundamentals', title: 'Metadata and Tags' },
          { id: 'concepts-fundamentals', title: 'Trace Context' },
          { id: 'concepts-fundamentals', title: 'Baggage' }
        ]
      }
    ]
  },
  {
    id: 'implementation-guides',
    title: 'IMPLEMENTATION GUIDES',
    children: [
      {
        id: 'implementation-guides',
        title: 'Instrumentation',
        children: [
          {
            id: 'implementation-guides',
            title: 'Automatic Instrumentation',
            children: [
              { id: 'implementation-guides', title: 'AWS Lambda' },
              { id: 'implementation-guides', title: 'AWS SDK' },
              { id: 'implementation-guides', title: 'HTTP Clients' },
              { id: 'implementation-guides', title: 'Database Clients' },
              { id: 'implementation-guides', title: 'Message Queues' }
            ]
          },
          {
            id: 'implementation-guides',
            title: 'Manual Instrumentation',
            children: [
              { id: 'implementation-guides', title: 'Creating Custom Spans' },
              { id: 'implementation-guides', title: 'Adding Attributes' },
              { id: 'implementation-guides', title: 'Recording Events' },
              { id: 'implementation-guides', title: 'Setting Span Status' },
              { id: 'implementation-guides', title: 'Error Handling' }
            ]
          }
        ]
      },
      {
        id: 'implementation-guides',
        title: 'Language-Specific Guides',
        children: [
          { id: 'implementation-guides', title: 'Java' },
          { id: 'implementation-guides', title: 'Python' },
          { id: 'implementation-guides', title: 'Node.js' },
          { id: 'implementation-guides', title: '.NET' },
          { id: 'implementation-guides', title: 'Go' },
          { id: 'implementation-guides', title: 'Ruby' },
          { id: 'implementation-guides', title: 'PHP' }
        ]
      },
      {
        id: 'implementation-guides',
        title: 'Service Integration',
        children: [
          { id: 'implementation-guides', title: 'AWS Services' },
          { id: 'implementation-guides', title: 'Container Platforms' },
          { id: 'implementation-guides', title: 'Service Mesh' }
        ]
      },
      {
        id: 'implementation-guides',
        title: 'Configuration',
        children: [
          { id: 'implementation-guides', title: 'Agent Configuration' },
          { id: 'implementation-guides', title: 'ADOT Collector' },
          { id: 'implementation-guides', title: 'Sampling Configuration' }
        ]
      }
    ]
  },
  {
    id: 'features-capabilities',
    title: 'FEATURES & CAPABILITIES',
    children: [
      { id: 'features-capabilities', title: 'Distributed Tracing' },
      { id: 'features-capabilities', title: 'Service Map' },
      { id: 'features-capabilities', title: 'Application Insights' },
      { id: 'features-capabilities', title: 'Performance Analytics' },
      { id: 'features-capabilities', title: 'Log Correlation' },
      { id: 'features-capabilities', title: 'Alerting & Monitoring' }
    ]
  },
  {
    id: 'use-cases-patterns',
    title: 'USE CASES & PATTERNS',
    children: [
      { id: 'use-cases-patterns', title: 'Architecture Patterns' },
      { id: 'use-cases-patterns', title: 'Common Scenarios' },
      { id: 'use-cases-patterns', title: 'Industry Solutions' }
    ]
  },
  {
    id: 'tutorials-workshops',
    title: 'TUTORIALS & WORKSHOPS',
    children: [
      { id: 'tutorials-workshops', title: 'Step-by-Step Tutorials' },
      { id: 'tutorials-workshops', title: 'Hands-On Workshops' },
      { id: 'tutorials-workshops', title: 'Video Tutorials' }
    ]
  },
  {
    id: 'examples-code-samples',
    title: 'EXAMPLES & CODE SAMPLES',
    children: [
      { id: 'examples-code-samples', title: 'Complete Examples' },
      { id: 'examples-code-samples', title: 'Code Snippets' },
      { id: 'examples-code-samples', title: 'Sample Applications' },
      { id: 'examples-code-samples', title: 'CloudFormation / IaC Templates' }
    ]
  },
  {
    id: 'api-reference',
    title: 'API REFERENCE',
    children: [
      { id: 'api-reference', title: 'REST APIs' },
      { id: 'api-reference', title: 'SDK Reference' },
      { id: 'api-reference', title: 'CLI Reference' },
      { id: 'api-reference', title: 'CloudFormation Reference' }
    ]
  },
  {
    id: 'best-practices',
    title: 'BEST PRACTICES',
    children: [
      { id: 'best-practices', title: 'Instrumentation Best Practices' },
      { id: 'best-practices', title: 'Sampling Strategies' },
      { id: 'best-practices', title: 'Performance Optimization' },
      { id: 'best-practices', title: 'Security Best Practices' },
      { id: 'best-practices', title: 'Cost Optimization', badge: 'Popular' },
      { id: 'best-practices', title: 'Operational Excellence' }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'TROUBLESHOOTING',
    children: [
      { id: 'troubleshooting', title: 'Common Issues' },
      { id: 'troubleshooting', title: 'Debugging Guides' },
      { id: 'troubleshooting', title: 'Error Messages' },
      { id: 'troubleshooting', title: 'Performance Issues' },
      { id: 'troubleshooting', title: 'FAQ' }
    ]
  },
  {
    id: 'security-compliance',
    title: 'SECURITY & COMPLIANCE',
    children: [
      { id: 'security-compliance', title: 'Security' },
      { id: 'security-compliance', title: 'Data Privacy' },
      { id: 'security-compliance', title: 'Compliance' },
      { id: 'security-compliance', title: 'Audit & Governance' }
    ]
  },
  {
    id: 'integrations',
    title: 'INTEGRATIONS',
    children: [
      { id: 'integrations', title: 'AWS Service Integrations' },
      { id: 'integrations', title: 'Third-Party Integrations' },
      { id: 'integrations', title: 'CI/CD Integration' },
      { id: 'integrations', title: 'Observability Platforms' }
    ]
  },
  {
    id: 'dashboards-visualization',
    title: 'DASHBOARDS & VISUALIZATION',
    children: [
      { id: 'dashboards-visualization', title: 'Pre-Built Dashboards' },
      { id: 'dashboards-visualization', title: 'Custom Dashboards' },
      { id: 'dashboards-visualization', title: 'Visualization Best Practices' }
    ]
  },
  {
    id: 'learning-resources',
    title: 'LEARNING RESOURCES',
    children: [
      { id: 'learning-resources', title: 'Documentation' },
      { id: 'learning-resources', title: 'Training' },
      { id: 'learning-resources', title: 'Videos & Webinars' },
      { id: 'learning-resources', title: 'Blogs & Articles' },
      { id: 'learning-resources', title: 'Community' }
    ]
  },
  {
    id: 'support-resources',
    title: 'SUPPORT & RESOURCES',
    children: [
      { id: 'support-resources', title: 'Getting Help' },
      { id: 'support-resources', title: 'Service Health' },
      { id: 'support-resources', title: 'Feedback' },
      { id: 'support-resources', title: 'Additional Resources' }
    ]
  },
  {
    id: 'reference',
    title: 'REFERENCE',
    children: [
      { id: 'reference', title: 'Service Limits & Quotas' },
      { id: 'reference', title: 'Supported Regions' },
      { id: 'reference', title: 'Supported Languages & Frameworks' },
      { id: 'reference', title: 'Glossary' },
      { id: 'reference', title: 'Release History' }
    ]
  },
  {
    id: 'whats-new',
    title: "WHAT'S NEW",
    children: [
      { id: 'whats-new', title: 'Latest Features' },
      { id: 'whats-new', title: 'Upcoming Features' }
    ]
  },
  {
    id: 'related-services',
    title: 'RELATED SERVICES',
    children: [
      { id: 'related-services', title: 'CloudWatch Family' },
      { id: 'related-services', title: 'Observability Services' },
      { id: 'related-services', title: 'Developer Tools' }
    ]
  }
];

export const APMSidebar: React.FC<APMSidebarProps> = ({
  currentSection,
  onSectionChange,
  className = '',
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<APMSection>>(
    new Set(['home', 'getting-started', 'implementation-guides'])
  );

  const toggleSection = (sectionId: APMSection) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = currentSection === item.id;
    const isExpanded = expandedSections.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={`${item.id}-${item.title}-${level}`} className={level === 0 ? "mb-4" : "mb-1"}>
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
            isActive
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          } ${
            level === 0 
              ? 'text-sm font-bold text-gray-900 uppercase tracking-wide' 
              : level === 1 
              ? 'ml-4 text-sm font-semibold' 
              : level === 2
              ? 'ml-8 text-sm'
              : 'ml-12 text-xs'
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleSection(item.id);
            } else {
              onSectionChange(item.id);
            }
          }}
        >
          <div className="flex items-center flex-1 min-w-0">
            {!isCollapsed && (
              <>
                <span className={`truncate ${level === 0 ? 'font-bold' : ''}`}>{item.title}</span>
                {item.badge && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                    item.badge === 'Start Here' 
                      ? 'bg-green-100 text-green-700'
                      : item.badge === 'Popular'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.isNew && (
                  <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full flex-shrink-0">
                    New
                  </span>
                )}
              </>
            )}
          </div>
          {hasChildren && !isCollapsed && (
            <div className="flex-shrink-0 ml-2">
              {isExpanded ? (
                <span className="text-xs">▼</span>
              ) : (
                <span className="text-xs">▶</span>
              )}
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child, index) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white border-r border-gray-200 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">CloudWatch APM</h2>
              <p className="text-sm text-gray-600">Documentation & Tools</p>
            </div>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span className="text-sm">{isCollapsed ? '→' : '←'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2" role="navigation" aria-label="APM Documentation">
          {navigationStructure.map(item => renderNavigationItem(item))}
        </nav>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-start">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">Quick Tip</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Start with Getting Started → Quick Start Guides for fastest setup
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APMSidebar;