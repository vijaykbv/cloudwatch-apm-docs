import React, { useState } from 'react';

type AppSection = 
  | 'home' 
  | 'getting-started' 
  | 'examples' 
  | 'api' 
  | 'troubleshooting' 
  | 'monitoring' 
  | 'security' 
  | 'performance' 
  | 'migration' 
  | 'configuration'
  | 'search'

interface PrimaryNavigationProps {
  currentSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  className?: string;
}

export const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({
  currentSection,
  onSectionChange,
  className = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationSections = [
    { id: 'home' as AppSection, title: 'Home', icon: '🏠' },
    { id: 'getting-started' as AppSection, title: 'Getting Started', icon: '🚀' },
    { id: 'examples' as AppSection, title: 'Examples', icon: '💻' },
    { id: 'api' as AppSection, title: 'API Reference', icon: '📚' },
    { id: 'configuration' as AppSection, title: 'Configuration', icon: '⚙️' },
    { id: 'migration' as AppSection, title: 'Migration', icon: '🔄' },
    { id: 'troubleshooting' as AppSection, title: 'Troubleshooting', icon: '🔧' },
    { id: 'monitoring' as AppSection, title: 'Monitoring', icon: '📊' },
    { id: 'security' as AppSection, title: 'Security', icon: '🔒' },
    { id: 'performance' as AppSection, title: 'Performance', icon: '⚡' },
    { id: 'search' as AppSection, title: 'Search', icon: '🔍' },
  ];

  return (
    <nav className={`bg-white shadow-sm border-b ${className}`} role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button
              onClick={() => onSectionChange('home')}
              className="text-xl font-bold text-blue-600 hover:text-blue-700"
            >
              CloudWatch APM Docs
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationSections.slice(1).map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1" aria-hidden="true">{section.icon}</span>
                {section.title}
              </button>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            <span className="sr-only">Toggle navigation menu</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-navigation-menu" className="md:hidden py-4 border-t">
            <div className="space-y-1">
              {navigationSections.slice(1).map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    onSectionChange(section.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentSection === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2" aria-hidden="true">{section.icon}</span>
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PrimaryNavigation;