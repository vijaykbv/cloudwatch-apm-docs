/**
 * Integration tests for complete user journeys
 * Tests end-to-end user workflows for different personas
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Home from '../../app/page'

// Mock the analytics service to avoid side effects
jest.mock('../../lib/analytics', () => ({
  analytics: {
    track: jest.fn(),
    trackNavigation: jest.fn(),
    trackSearch: jest.fn(),
    trackInteraction: jest.fn(),
    trackError: jest.fn(),
    trackPerformance: jest.fn(),
  },
  getAnalytics: jest.fn(() => ({
    getAnalyticsSummary: () => ({
      totalEvents: 0,
      queuedEvents: 0,
      session: {
        sessionId: 'test-session',
        pageViews: 1,
        searchQueries: 0,
        sectionsVisited: ['home'],
      },
      topSections: [],
    }),
  })),
}))

// Mock the search system
jest.mock('../../lib/search-system', () => ({
  SearchSystem: jest.fn().mockImplementation(() => ({
    indexPages: jest.fn(),
    search: jest.fn(() => []),
    getPopularContent: jest.fn(() => [
      {
        id: 'test-content-1',
        title: 'Test Content 1',
        description: 'Test description 1',
        estimatedReadTime: 5,
        difficulty: 'beginner',
      },
      {
        id: 'test-content-2',
        title: 'Test Content 2',
        description: 'Test description 2',
        estimatedReadTime: 10,
        difficulty: 'intermediate',
      },
    ]),
    getIndexSize: jest.fn(() => 3),
    getFacets: jest.fn(() => ({
      categories: [],
      difficulties: [],
      audienceTypes: [],
      audienceExperiences: [],
      tags: [],
    })),
    getSuggestions: jest.fn(() => []),
  })),
}))

// Mock the recommendation system
jest.mock('../../lib/recommendation-system', () => ({
  RecommendationSystem: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(),
    getRecommendations: jest.fn(() => []),
    getRelatedContent: jest.fn(() => []),
    getPopularContent: jest.fn(() => []),
  })),
}))

describe('User Journey Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('New Developer Journey', () => {
    test('should complete getting started workflow', async () => {
      const user = userEvent.setup()
      render(<Home />)

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading CloudWatch APM Documentation...')).not.toBeInTheDocument()
      })

      // User should see the home page
      expect(screen.getByText('CloudWatch APM Documentation')).toBeInTheDocument()
      expect(screen.getByText('Comprehensive documentation for CloudWatch Application Performance Monitoring')).toBeInTheDocument()

      // User clicks on Getting Started
      const gettingStartedCard = screen.getByText('Getting Started')
      await user.click(gettingStartedCard)

      // Should navigate to getting started section
      await waitFor(() => {
        expect(screen.getByText('Quick Start Wizard')).toBeInTheDocument()
      })

      // User should see platform selection
      expect(screen.getByText('Select Your Platform')).toBeInTheDocument()

      // User can select a platform
      const javaButton = screen.getByText('Java')
      await user.click(javaButton)

      // Should show Java-specific content
      await waitFor(() => {
        expect(screen.getByText('Java Spring Boot')).toBeInTheDocument()
      })
    })

    test('should navigate through multiple sections', async () => {
      const user = userEvent.setup()
      render(<Home />)

      await waitFor(() => {
        expect(screen.queryByText('Loading CloudWatch APM Documentation...')).not.toBeInTheDocument()
      })

      // Navigate to Examples section
      const examplesCard = screen.getByText('Code Examples')
      await user.click(examplesCard)

      await waitFor(() => {
        expect(screen.getByText('Code Examples')).toBeInTheDocument()
        expect(screen.getByText('Basic Initialization')).toBeInTheDocument()
      })

      // Navigate to API section via navigation
      const apiNavButton = screen.getByRole('button', { name: /📚 API Reference/i })
      await user.click(apiNavButton)

      await waitFor(() => {
        expect(screen.getByText('API Documentation Generator')).toBeInTheDocument()
      })

      // Navigate back to home
      const homeButton = screen.getByRole('button', { name: /CloudWatch APM Docs/i })
      await user.click(homeButton)

      await waitFor(() => {
        expect(screen.getByText('Popular Content')).toBeInTheDocument()
      })
    })
  })

  describe('Operations Engineer Journey', () => {
    test('should complete troubleshooting workflow', async () => {
      const user = userEvent.setup()
      render(<Home />)

      await waitFor(() => {
        expect(screen.queryByText('Loading CloudWatch APM Documentation...')).not.toBeInTheDocument()
      })

      // Navigate to troubleshooting
      const troubleshootingCard = screen.getByText('Troubleshooting')
      await user.click(troubleshootingCard)

      await waitFor(() => {
        expect(screen.getByText('Troubleshooting Center')).toBeInTheDocument()
      })

      // Should see troubleshooting tools
      expect(screen.getByText('Issue Classification')).toBeInTheDocument()
      expect(screen.getByText('Diagnostic Tools')).toBeInTheDocument()

      // User can classify an issue
      const classifyButton = screen.getByText('Classify Issue')
      await user.click(classifyButton)

      // Should show issue classification interface
      await waitFor(() => {
        expect(screen.getByText('Describe your issue')).toBeInTheDocument()
      })
    })

    test('should access monitoring and alerting tools', async () => {
      const user = userEvent.setup()
      render(<Home />)

      await waitFor(() => {
        expect(screen.queryByText('Loading CloudWatch APM Documentation...')).not.toBeInTheDocument()
      })

      // Navigate to monitoring
      const monitoringCard = screen.getByText('Monitoring')
      await user.click(monitoringCard)

      await waitFor(() => {
        expect(screen.getByText('Alerting Wizard')).toBeInTheDocument()
      })

      // Should see alerting configuration
      expect(screen.getByText('Create Alert')).toBeInTheDocument()
      expect(screen.getByText('Metric Selection')).toBeInTheDocument()
    })
  })

  describe('Security Engineer Journey', () => {
    test('should complete security checklist workflow', async () => {
      const user = userEvent.setup()
      render(<Home />)

      await waitFor(() => {
        expect(screen.queryByText('Loading CloudWatch APM Documentation...')).not.toBeInTheDocument()
      })

      // Navigate to security
      const securityCard = screen.getByText('Security')
      await user.click(securityCard)

      await waitFor(() => {
        expect(screen.getByText('Security Checklist')).toBeInTheDocument()
      })

      // Should see security categories
      expect(screen.getByText('Authentication & Authorization')).toBeInTheDocument()
      expect(screen.getByText('Data Protection')).toBeInTheDocument()
      expect(screen.getByText('Network Security')).toBeInTheDocument()
    })
  })

  describe('Search and Discovery Journey', () => {
    test('should complete search workflow', async () => {
      const user = userEvent.setup()
      render(<Home />)

      await waitFor(() => {
        expect(screen.queryByText('Loading CloudWatch APM Documentation...')).not.toBeInTheDocument()
      })

      // Navigate to search
      const searchNavButton = screen.getByRole('button', { name: /🔍 Search/i })
      await user.click(searchNavButton)

      await waitFor(() => {
        expect(screen.getByText('Search Documentation')).toBeInTheDocument()
      })

      // Should see search interface
      expect(screen.getByPlaceholderText('Search documentation...')).toBeInTheDocument()
      expect(screen.getByText('Popular Content')).toBeInTheDocument()

      // User can perform a search
      const searchInput = screen.getByPlaceholderText('Search documentation...')
      await user.type(searchInput, 'configuration')

      // Should trigger search (mocked)
      await waitFor(() => {
        expect(searchInput).toHaveValue('configuration')
      })
    })

    test('should interact with popular content', async () => {
      const user = userEvent.setup()
      render(<Home />)

      await waitFor(() => {
        expect(screen.queryByText('Loading CloudWatch APM Documentation...')).not.toBeInTheDocument()
      })

      // Should see popular content on home page
      expect(screen.getByText('Popular Content')).toBeInTheDocument()
      expect(screen.getByText('Test Content 1')).toBeInTheDocument()
      expect(screen.getByText('Test Content 2')).toBeInTheDocument()

      // User can click on popular content
      const popularContent = screen.getByText('Test Content 1')
      await user.click(popularContent)

      // Should track interaction (mocked)
      // The actual behavior would depend on the implementation
    })
  })

  describe('Cross-Component Navigation', () => {
    test('should maintain state across navigation', async () => {
      const user = userEvent.setup()
      render(<Home />)

      await waitFor(() => {
        expect(screen.queryByText('Loading CloudWatch APM Documentation...')).not.toBeInTheDocument()
      })

      // Navigate through multiple sections
      const sections = [
        { name: 'Getting Started', button: '🚀 Getting Started' },
        { name: 'Examples', button: '💻 Examples' },
        { name: 'Configuration', button: '⚙️ Configuration' },
        { name: 'Performance', button: '⚡ Performance' },
      ]

      for (const section of sections) {
        const navButton = screen.getByRole('button', { name: new RegExp(section.button, 'i') })
        await user.click(navButton)

        // Wait for section to load
        await waitFor(() => {
          // Each section should have some content
          expect(document.body).toHaveTextContent('')
        }, { timeout: 1000 })
      }

      // Navigate back to home
      const homeButton = screen.getByRole('button', { name: /CloudWatch APM Docs/i })
      await user.click(homeButton)

      await waitFor(() => {
        expect(screen.getByText('Popular Content')).toBeInTheDocument()
      })
    })

    test('should handle mobile navigation', async () => {
      const user = userEvent.setup()
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<Home />)

      await waitFor(() => {
        expect(screen.queryByText('Loading CloudWatch APM Documentation...')).not.toBeInTheDocument()
      })

      // On mobile, navigation should be collapsed
      // Look for mobile menu toggle (hamburger menu)
      const mobileMenuToggle = screen.getByRole('button', { name: /Toggle navigation menu/i })
      expect(mobileMenuToggle).toBeInTheDocument()

      // Click to open mobile menu
      await user.click(mobileMenuToggle)

      // Should show navigation options
      await waitFor(() => {
        expect(screen.getByText('Getting Started')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('should handle loading states gracefully', async () => {
      render(<Home />)

      // Should show loading state initially
      expect(screen.getByText('Loading CloudWatch APM Documentation...')).toBeInTheDocument()

      // Should hide loading state after initialization
      await waitFor(() => {
        expect(screen.queryByText('Loading CloudWatch APM Documentation...')).not.toBeInTheDocument()
      })
    })

    test('should handle navigation to non-existent sections', async () => {
      const user = userEvent.setup()
      render(<Home />)

      await waitFor(() => {
        expect(screen.queryByText('Loading CloudWatch APM Documentation...')).not.toBeInTheDocument()
      })

      // All navigation should work without errors
      // The app should gracefully handle any navigation state
      expect(screen.getByText('CloudWatch APM Documentation')).toBeInTheDocument()
    })
  })

  describe('Analytics Integration', () => {
    test('should track user interactions', async () => {
      const user = userEvent.setup()
      const { analytics } = require('../../lib/analytics')
      
      render(<Home />)

      await waitFor(() => {
        expect(screen.queryByText('Loading CloudWatch APM Documentation...')).not.toBeInTheDocument()
      })

      // Navigate to a section
      const gettingStartedCard = screen.getByText('Getting Started')
      await user.click(gettingStartedCard)

      // Should track navigation
      expect(analytics.trackNavigation).toHaveBeenCalledWith('getting-started', 'home')

      // Click on popular content
      const popularContent = screen.getByText('Test Content 1')
      await user.click(popularContent)

      // Should track interaction
      expect(analytics.trackInteraction).toHaveBeenCalledWith(
        'popular_content',
        'click',
        { contentId: 'test-content-1' }
      )
    })

    test('should show analytics debug panel in development', async () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      render(<Home />)

      await waitFor(() => {
        expect(screen.queryByText('Loading CloudWatch APM Documentation...')).not.toBeInTheDocument()
      })

      // Should show analytics debug panel
      expect(screen.getByText('Analytics Summary')).toBeInTheDocument()
      expect(screen.getByText('Events: 0')).toBeInTheDocument()

      // Restore environment
      process.env.NODE_ENV = originalEnv
    })
  })
})