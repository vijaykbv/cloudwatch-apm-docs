import React, { useState } from 'react';

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
    id: 'overview',
    title: 'APM Overview',
    badge: 'Start Here'
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    children: [
      { id: 'instrumentation', title: 'Instrumentation Basics' },
      { id: 'dynamic-instrumentation', title: 'Dynamic Instrumentation', isNew: true },
      { id: 'agentic-instrumentation', title: 'Agentic Instrumentation', isNew: true }
    ]
  },
  {
    id: 'examples',
    title: 'Implementation Examples',
    children: [
      { id: 'examples', title: 'Code Examples' },
      { id: 'best-practices', title: 'Best Practices' }
    ]
  },
  {
    id: 'monitoring',
    title: 'Monitoring & Observability',
    children: [
      { id: 'monitoring', title: 'Dashboards & Metrics' },
      { id: 'troubleshooting', title: 'Troubleshooting' }
    ]
  },
  {
    id: 'cost-optimization',
    title: 'Cost Management',
    badge: 'Popular'
  },
  {
    id: 'performance',
    title: 'Performance Tuning'
  },
  {
    id: 'security',
    title: 'Security & Compliance'
  },
  {
    id: 'api-reference',
    title: 'API Reference'
  },
  {
    id: 'migration',
    title: 'Migration Guide'
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
    new Set(['getting-started', 'examples', 'monitoring'])
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
      <div key={item.id} className="mb-1">
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
            isActive
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          } ${level > 0 ? 'ml-4 text-sm' : 'text-base font-medium'}`}
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
                <span className="truncate">{item.title}</span>
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
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
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
                  Start with Dynamic Instrumentation for zero-code observability
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