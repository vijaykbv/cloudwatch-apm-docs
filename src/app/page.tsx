'use client'

import { useState, useEffect } from 'react'
import { PrimaryNavigation } from '@/components/navigation'
import { SearchInterface } from '@/components/search'
import QuickStartWizard from '@/components/quickstart/QuickStartWizard'
import { MultiLanguageCodeExample } from '@/components/examples'
import APIDocumentationGenerator from '@/components/api/APIDocumentationGenerator'
import TroubleshootingCenter from '@/components/troubleshooting/TroubleshootingCenter'
import { AlertingWizard } from '@/components/monitoring'
import SecurityChecklist from '@/components/security/SecurityChecklist'
import PerformanceMetricsDisplay from '@/components/performance/PerformanceMetricsDisplay'
import { MigrationWizard } from '@/components/migration'
import ConfigurationReferenceGenerator from '@/components/configuration/ConfigurationReferenceGenerator'
import { SearchSystem } from '@/lib/search-system'
import { RecommendationSystem } from '@/lib/recommendation-system'
import { analytics, getAnalytics } from '@/lib/analytics'
import { ErrorBoundary, SearchErrorBoundary, NavigationErrorBoundary, ContentErrorBoundary } from '@/components/error/ErrorBoundary'
import StatusIndicator from '@/components/status/StatusIndicator'
import type { DocumentationPage, DifficultyLevel, ContentCategory } from '@/types'

// Main application sections
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

export default function Home() {
  const [currentSection, setCurrentSection] = useState<AppSection>('home')
  const [searchSystem] = useState(() => new SearchSystem())
  const [recommendationSystem] = useState(() => new RecommendationSystem())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsService] = useState(() => getAnalytics({
    enabled: true,
    enableDebugLogging: process.env.NODE_ENV === 'development'
  }))

  // Initialize systems on mount
  useEffect(() => {
    initializeSystems()
  }, [])

  const initializeSystems = async () => {
    try {
      setError(null)
      
      // Initialize search system with sample documentation pages
      const samplePages: DocumentationPage[] = [
        {
          id: 'quick-start',
          title: 'Quick Start Guide',
          description: 'Get started with CloudWatch APM in minutes',
          audience: [{ type: 'developer', experience: 'beginner' }],
          difficulty: 'beginner' as DifficultyLevel,
          category: 'getting-started' as ContentCategory,
          tags: ['quickstart', 'setup', 'installation'],
          content: [{ type: 'text', content: 'Quick start guide content', metadata: {} }],
          relatedPages: ['installation', 'configuration'],
          lastUpdated: new Date(),
          estimatedReadTime: 5
        },
        {
          id: 'api-reference',
          title: 'API Reference',
          description: 'Complete API documentation for CloudWatch APM',
          audience: [{ type: 'developer', experience: 'intermediate' }],
          difficulty: 'intermediate' as DifficultyLevel,
          category: 'api' as ContentCategory,
          tags: ['api', 'reference', 'endpoints'],
          content: [{ type: 'text', content: 'API reference content', metadata: {} }],
          relatedPages: ['authentication', 'sdk'],
          lastUpdated: new Date(),
          estimatedReadTime: 15
        },
        {
          id: 'troubleshooting',
          title: 'Troubleshooting Guide',
          description: 'Common issues and solutions',
          audience: [{ type: 'operations', experience: 'intermediate' }],
          difficulty: 'intermediate' as DifficultyLevel,
          category: 'troubleshooting' as ContentCategory,
          tags: ['troubleshooting', 'errors', 'debugging'],
          content: [{ type: 'text', content: 'Troubleshooting guide content', metadata: {} }],
          relatedPages: ['diagnostics', 'support'],
          lastUpdated: new Date(),
          estimatedReadTime: 10
        }
      ]

      searchSystem.indexPages(samplePages)
      
      // Initialize recommendation system (no initialize method needed)
      // recommendationSystem.initialize(samplePages)

      setIsLoading(false)
      analytics.track('system', 'initialize', 'application_loaded')
    } catch (error) {
      console.error('Failed to initialize systems:', error)
      setError(error instanceof Error ? error.message : 'Failed to initialize application')
      analytics.trackError(error as Error, 'system_initialization')
      setIsLoading(false)
    }
  }

  const handleSectionChange = (section: AppSection) => {
    const previousSection = currentSection
    setCurrentSection(section)
    analytics.trackNavigation(section, previousSection)
  }

  const handleRetryInitialization = () => {
    setIsLoading(true)
    setError(null)
    initializeSystems()
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'getting-started':
        return (
          <ContentErrorBoundary>
            <QuickStartWizard 
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
              onComplete={() => analytics.track('quickstart', 'completed')} 
            />
          </ContentErrorBoundary>
        )
      
      case 'examples':
        return (
          <ContentErrorBoundary>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Code Examples</h2>
              <MultiLanguageCodeExample
                examples={[
                  {
                    id: 'js-init',
                    title: 'JavaScript Initialization',
                    description: 'Basic CloudWatch APM initialization in JavaScript',
                    language: 'javascript',
                    code: 'console.log("CloudWatch APM initialized");',
                    category: 'getting-started',
                    difficulty: 'beginner',
                    tags: ['initialization', 'javascript'],
                    relatedExamples: [],
                    lastUpdated: new Date(),
                    metadata: {
                      filename: 'app.js',
                      runnable: true,
                      testable: true
                    }
                  },
                  {
                    id: 'py-init',
                    title: 'Python Initialization',
                    description: 'Basic CloudWatch APM initialization in Python',
                    language: 'python', 
                    code: 'print("CloudWatch APM initialized")',
                    category: 'getting-started',
                    difficulty: 'beginner',
                    tags: ['initialization', 'python'],
                    relatedExamples: [],
                    lastUpdated: new Date(),
                    metadata: {
                      filename: 'app.py',
                      runnable: true,
                      testable: true
                    }
                  },
                  {
                    id: 'java-init',
                    title: 'Java Initialization',
                    description: 'Basic CloudWatch APM initialization in Java',
                    language: 'java',
                    code: 'System.out.println("CloudWatch APM initialized");',
                    category: 'getting-started',
                    difficulty: 'beginner',
                    tags: ['initialization', 'java'],
                    relatedExamples: [],
                    lastUpdated: new Date(),
                    metadata: {
                      filename: 'App.java',
                      runnable: true,
                      testable: true
                    }
                  }
                ]}
                title="Basic Initialization"
                description="Initialize CloudWatch APM in your application"
              />
            </div>
          </ContentErrorBoundary>
        )
      
      case 'api':
        return (
          <ContentErrorBoundary>
            <APIDocumentationGenerator />
          </ContentErrorBoundary>
        )
      
      case 'troubleshooting':
        return (
          <ContentErrorBoundary>
            <TroubleshootingCenter />
          </ContentErrorBoundary>
        )
      
      case 'monitoring':
        return (
          <ContentErrorBoundary>
            <AlertingWizard />
          </ContentErrorBoundary>
        )
      
      case 'security':
        return (
          <ContentErrorBoundary>
            <SecurityChecklist />
          </ContentErrorBoundary>
        )
      
      case 'performance':
        return (
          <ContentErrorBoundary>
            <PerformanceMetricsDisplay />
          </ContentErrorBoundary>
        )
      
      case 'migration':
        return (
          <ContentErrorBoundary>
            <MigrationWizard />
          </ContentErrorBoundary>
        )
      
      case 'configuration':
        return (
          <ContentErrorBoundary>
            <ConfigurationReferenceGenerator />
          </ContentErrorBoundary>
        )
      
      case 'search':
        return (
          <SearchErrorBoundary>
            <SearchInterface 
              searchSystem={searchSystem}
              onSearch={(query, resultsCount) => analytics.trackSearch(query, resultsCount)}
            />
          </SearchErrorBoundary>
        )
      
      default:
        return (
          <ContentErrorBoundary>
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">
                  CloudWatch APM Documentation
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Comprehensive documentation for CloudWatch Application Performance Monitoring
                </p>
              </div>

              {/* Quick access cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div 
                  className="p-6 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSectionChange('getting-started')}
                >
                  <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
                  <p className="text-gray-600">Quick setup and installation guides</p>
                </div>
                
                <div 
                  className="p-6 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSectionChange('examples')}
                >
                  <h3 className="text-lg font-semibold mb-2">Code Examples</h3>
                  <p className="text-gray-600">Sample code and implementation patterns</p>
                </div>
                
                <div 
                  className="p-6 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSectionChange('api')}
                >
                  <h3 className="text-lg font-semibold mb-2">API Reference</h3>
                  <p className="text-gray-600">Complete API documentation</p>
                </div>
                
                <div 
                  className="p-6 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSectionChange('troubleshooting')}
                >
                  <h3 className="text-lg font-semibold mb-2">Troubleshooting</h3>
                  <p className="text-gray-600">Common issues and solutions</p>
                </div>
                
                <div 
                  className="p-6 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSectionChange('monitoring')}
                >
                  <h3 className="text-lg font-semibold mb-2">Monitoring</h3>
                  <p className="text-gray-600">Alerting and dashboard setup</p>
                </div>
                
                <div 
                  className="p-6 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSectionChange('security')}
                >
                  <h3 className="text-lg font-semibold mb-2">Security</h3>
                  <p className="text-gray-600">Security configuration and compliance</p>
                </div>
              </div>

              {/* Popular content section */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Popular Content</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchSystem.getPopularContent(undefined, 4).map((content) => (
                    <div 
                      key={content.id} 
                      className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => analytics.trackInteraction('popular_content', 'click', { contentId: content.id })}
                    >
                      <h3 className="font-semibold">{content.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{content.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span>{content.estimatedReadTime} min read</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{content.difficulty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ContentErrorBoundary>
        )
    }
  }

  // Show initialization error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Initialization Failed
              </h3>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Failed to initialize the documentation system:
            </p>
            <p className="text-sm text-red-600 font-mono bg-red-50 p-2 rounded">
              {error}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleRetryInitialization}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading CloudWatch APM Documentation...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing systems and caching critical content</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation with error boundary */}
        <NavigationErrorBoundary>
          <PrimaryNavigation 
            currentSection={currentSection}
            onSectionChange={handleSectionChange}
          />
        </NavigationErrorBoundary>

        {/* Status indicator */}
        <div className="fixed top-4 right-4 z-50">
          <StatusIndicator showDetails={true} />
        </div>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {renderCurrentSection()}
        </main>

        {/* Analytics debug panel (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-white border rounded-lg p-4 shadow-lg max-w-sm">
            <h4 className="font-semibold mb-2">Analytics Summary</h4>
            <div className="text-xs space-y-1">
              {(() => {
                const summary = analyticsService.getAnalyticsSummary()
                return (
                  <>
                    <div>Events: {summary.totalEvents}</div>
                    <div>Session: {summary.session?.sessionId.slice(-8)}</div>
                    <div>Page Views: {summary.session?.pageViews}</div>
                    <div>Searches: {summary.session?.searchQueries}</div>
                    <div>Sections: {summary.session?.sectionsVisited.length}</div>
                  </>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}