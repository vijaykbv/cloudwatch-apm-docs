import React, { useState } from 'react';
import APMSidebar from '../navigation/APMSidebar';
import { MagnifyingGlassIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

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
      'overview': 'APM Overview',
      'getting-started': 'Getting Started',
      'instrumentation': 'Instrumentation Basics',
      'dynamic-instrumentation': 'Dynamic Instrumentation',
      'agentic-instrumentation': 'Agentic Instrumentation',
      'examples': 'Implementation Examples',
      'monitoring': 'Monitoring & Observability',
      'troubleshooting': 'Troubleshooting',
      'cost-optimization': 'Cost Management',
      'performance': 'Performance Tuning',
      'security': 'Security & Compliance',
      'api-reference': 'API Reference',
      'migration': 'Migration Guide',
      'best-practices': 'Best Practices'
    };
    return titles[section] || 'CloudWatch APM';
  };

  const getBreadcrumbs = (section: APMSection): string[] => {
    const breadcrumbMap: Record<APMSection, string[]> = {
      'overview': ['Home'],
      'getting-started': ['Getting Started'],
      'instrumentation': ['Getting Started', 'Instrumentation Basics'],
      'dynamic-instrumentation': ['Getting Started', 'Dynamic Instrumentation'],
      'agentic-instrumentation': ['Getting Started', 'Agentic Instrumentation'],
      'examples': ['Implementation Examples'],
      'monitoring': ['Monitoring & Observability'],
      'troubleshooting': ['Troubleshooting'],
      'cost-optimization': ['Cost Management'],
      'performance': ['Performance Tuning'],
      'security': ['Security & Compliance'],
      'api-reference': ['API Reference'],
      'migration': ['Migration Guide'],
      'best-practices': ['Best Practices']
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
                        onClick={() => onSectionChange('overview')}
                        className="hover:text-gray-700"
                      >
                        CloudWatch APM
                      </button>
                    </li>
                    {getBreadcrumbs(currentSection).map((crumb, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
                </button>

                {/* User Menu */}
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <UserCircleIcon className="h-6 w-6" />
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