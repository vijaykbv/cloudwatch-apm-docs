import React, { useState } from 'react';
import APMSidebar from '../navigation/APMSidebar';

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

interface APMLayoutProps {
  children: React.ReactNode;
  currentSection: APMSection;
  onSectionChange: (section: APMSection) => void;
}

export const APMLayout: React.FC<APMLayoutProps> = ({
  children,
  currentSection,
  onSectionChange
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getSectionTitle = (section: APMSection): string => {
    const titles: Record<APMSection, string> = {
      'home': 'CloudWatch APM Home',
      'getting-started': 'Getting Started',
      'concepts-fundamentals': 'Concepts & Fundamentals',
      'implementation-guides': 'Implementation Guides',
      'features-capabilities': 'Features & Capabilities',
      'use-cases-patterns': 'Use Cases & Patterns',
      'tutorials-workshops': 'Tutorials & Workshops',
      'examples-code-samples': 'Examples & Code Samples',
      'api-reference': 'API Reference',
      'best-practices': 'Best Practices',
      'troubleshooting': 'Troubleshooting',
      'security-compliance': 'Security & Compliance',
      'integrations': 'Integrations',
      'dashboards-visualization': 'Dashboards & Visualization',
      'learning-resources': 'Learning Resources',
      'support-resources': 'Support & Resources',
      'reference': 'Reference',
      'whats-new': "What's New",
      'related-services': 'Related Services'
    };
    return titles[section] || 'CloudWatch APM';
  };

  const getBreadcrumbs = (section: APMSection): string[] => {
    const breadcrumbMap: Record<APMSection, string[]> = {
      'home': ['Home'],
      'getting-started': ['Getting Started'],
      'concepts-fundamentals': ['Concepts & Fundamentals'],
      'implementation-guides': ['Implementation Guides'],
      'features-capabilities': ['Features & Capabilities'],
      'use-cases-patterns': ['Use Cases & Patterns'],
      'tutorials-workshops': ['Tutorials & Workshops'],
      'examples-code-samples': ['Examples & Code Samples'],
      'api-reference': ['API Reference'],
      'best-practices': ['Best Practices'],
      'troubleshooting': ['Troubleshooting'],
      'security-compliance': ['Security & Compliance'],
      'integrations': ['Integrations'],
      'dashboards-visualization': ['Dashboards & Visualization'],
      'learning-resources': ['Learning Resources'],
      'support-resources': ['Support & Resources'],
      'reference': ['Reference'],
      'whats-new': ["What's New"],
      'related-services': ['Related Services']
    };
    return breadcrumbMap[section] || ['Home'];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${isSidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 flex-shrink-0 bg-white border-r border-gray-200`}>
          <APMSidebar
            currentSection={currentSection}
            onSectionChange={onSectionChange}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="h-full"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              {/* Breadcrumbs and Title */}
              <div className="flex-1 min-w-0">
                <nav className="flex mb-2" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2 text-sm text-gray-500">
                    <li>
                      <button
                        onClick={() => onSectionChange('home')}
                        className="hover:text-gray-700"
                      >
                        CloudWatch APM
                      </button>
                    </li>
                    {getBreadcrumbs(currentSection).map((crumb, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-xs">›</span>
                        <span className={index === getBreadcrumbs(currentSection).length - 1 ? 'text-gray-900 font-medium' : ''}>
                          {crumb}
                        </span>
                      </li>
                    ))}
                  </ol>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {getSectionTitle(currentSection)}
                </h1>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-4 ml-6">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-64 pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                  <span className="text-sm">Notifications</span>
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
                </button>

                {/* User Menu */}
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <span className="text-sm">User</span>
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="h-full">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>© 2024 AWS CloudWatch APM Documentation</span>
                <span>•</span>
                <button className="hover:text-gray-700">Privacy Policy</button>
                <span>•</span>
                <button className="hover:text-gray-700">Terms of Service</button>
              </div>
              <div className="flex items-center space-x-4">
                <span>Last updated: {new Date().toLocaleDateString()}</span>
                <span>•</span>
                <button 
                  onClick={() => onSectionChange('api-reference')}
                  className="hover:text-gray-700"
                >
                  API Reference
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default APMLayout;