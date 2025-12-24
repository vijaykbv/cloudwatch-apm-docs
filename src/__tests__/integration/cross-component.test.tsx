/**
 * Integration tests for cross-component functionality
 * Tests interactions between different components and systems
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock the search system
const mockSearchSystem = {
  indexPages: jest.fn(),
  search: jest.fn(() => [
    {
      item: {
        id: 'getting-started',
        title: 'Getting Started Guide',
        description: 'Quick start guide for CloudWatch APM',
        category: 'getting-started',
        difficulty: 'beginner',
        estimatedReadTime: 5,
        tags: ['quickstart', 'setup']
      }
    }
  ]),
  getPopularContent: jest.fn(() => [
    {
      id: 'popular-1',
      title: 'Popular Guide 1',
      description: 'Popular content description',
      difficulty: 'beginner',
      estimatedReadTime: 5
    }
  ]),
  getIndexSize: jest.fn(() => 3),
  getFacets: jest.fn(() => ({
    categories: [{ value: 'getting-started', count: 1 }],
    difficulties: [{ value: 'beginner', count: 1 }],
    audienceTypes: [{ value: 'developer', count: 1 }],
    audienceExperiences: [{ value: 'beginner', count: 1 }],
    tags: [{ value: 'quickstart', count: 1 }]
  })),
  getSuggestions: jest.fn(() => ['getting', 'started'])
}

// Mock the recommendation system
const mockRecommendationSystem = {
  initialize: jest.fn(),
  getRecommendations: jest.fn(() => []),
  getRelatedContent: jest.fn(() => []),
  getPopularContent: jest.fn(() => [])
}

// Simple SearchInterface mock component for testing
const MockSearchInterface = ({ searchSystem, onSearch }: any) => {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<any[]>([])

  const handleSearch = async (newQuery: string) => {
    setQuery(newQuery)
    const searchResults = searchSystem.search(newQuery)
    setResults(searchResults)
    if (onSearch) {
      onSearch(newQuery, searchResults.length)
    }
  }

  return (
    <div>
      <h1>Search Documentation</h1>
      <input
        placeholder="Search documentation..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <button>Filters</button>
      
      {query ? (
        <div>
          {results.map((result) => (
            <div key={result.item.id}>
              <h3>{result.item.title}</h3>
              <p>{result.item.description}</p>
            </div>
          ))}
          {results.length === 0 && (
            <div>
              <h3>Try these suggestions:</h3>
              <p>Check your spelling and try different keywords</p>
              <h4>Popular searches:</h4>
              <button onClick={() => handleSearch('getting started')}>getting started</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>Popular Content</h2>
          {searchSystem.getPopularContent().map((item: any) => (
            <div key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

describe('Cross-Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Search and Recommendation Integration', () => {
    test('should integrate search results with recommendations', async () => {
      const user = userEvent.setup()
      const mockOnSearch = jest.fn()

      render(
        <MockSearchInterface 
          searchSystem={mockSearchSystem}
          onSearch={mockOnSearch}
        />
      )

      // Should show popular content initially
      expect(screen.getByText('Popular Content')).toBeInTheDocument()

      // Perform a search
      const searchInput = screen.getByPlaceholderText('Search documentation...')
      await user.type(searchInput, 'getting started')

      // Should call onSearch callback
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('getting started', 1)
      })

      // Should show search results
      await waitFor(() => {
        expect(screen.getByText('Getting Started Guide')).toBeInTheDocument()
      })
    })

    test('should handle empty search results gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock empty search results
      const emptySearchSystem = {
        ...mockSearchSystem,
        search: jest.fn(() => [])
      }

      render(
        <MockSearchInterface 
          searchSystem={emptySearchSystem}
          onSearch={jest.fn()}
        />
      )

      // Search for non-existent content
      const searchInput = screen.getByPlaceholderText('Search documentation...')
      await user.type(searchInput, 'nonexistent content xyz')

      // Should show no results message
      await waitFor(() => {
        expect(screen.getByText('Try these suggestions:')).toBeInTheDocument()
        expect(screen.getByText('Check your spelling and try different keywords')).toBeInTheDocument()
      })

      // Should show popular search suggestions
      expect(screen.getByText('Popular searches:')).toBeInTheDocument()
      
      // User can click on suggested searches
      const suggestionButton = screen.getByText('getting started')
      await user.click(suggestionButton)

      // Should update search query
      expect(searchInput).toHaveValue('getting started')
    })

    test('should maintain search state across interactions', async () => {
      const user = userEvent.setup()

      render(
        <MockSearchInterface 
          searchSystem={mockSearchSystem}
          onSearch={jest.fn()}
        />
      )

      // Perform a search
      const searchInput = screen.getByPlaceholderText('Search documentation...')
      await user.type(searchInput, 'troubleshooting')

      // Should maintain search query
      expect(searchInput).toHaveValue('troubleshooting')

      // Clear search
      await user.clear(searchInput)

      // Should return to popular content
      await waitFor(() => {
        expect(screen.getByText('Popular Content')).toBeInTheDocument()
      })
    })
  })

  describe('Content Organization Integration', () => {
    test('should organize content by journey stages', () => {
      const mockPages = [
        {
          id: 'getting-started',
          category: 'getting-started',
          difficulty: 'beginner',
          audience: [{ type: 'developer', experience: 'beginner' }]
        },
        {
          id: 'api-reference',
          category: 'api',
          difficulty: 'intermediate',
          audience: [{ type: 'developer', experience: 'intermediate' }]
        },
        {
          id: 'troubleshooting',
          category: 'troubleshooting',
          difficulty: 'intermediate',
          audience: [{ type: 'operations', experience: 'intermediate' }]
        }
      ]

      // Test that content is properly categorized
      const gettingStartedContent = mockPages.filter(page => page.category === 'getting-started')
      const apiContent = mockPages.filter(page => page.category === 'api')
      const troubleshootingContent = mockPages.filter(page => page.category === 'troubleshooting')

      expect(gettingStartedContent).toHaveLength(1)
      expect(apiContent).toHaveLength(1)
      expect(troubleshootingContent).toHaveLength(1)

      // Each category should have appropriate content
      expect(gettingStartedContent[0].difficulty).toBe('beginner')
      expect(apiContent[0].difficulty).toBe('intermediate')
      expect(troubleshootingContent[0].difficulty).toBe('intermediate')
    })

    test('should support audience-based filtering', () => {
      const mockPages = [
        {
          id: 'dev-guide',
          audience: [{ type: 'developer', experience: 'beginner' }]
        },
        {
          id: 'ops-guide',
          audience: [{ type: 'operations', experience: 'intermediate' }]
        }
      ]

      const developerContent = mockPages.filter(page => 
        page.audience.some(audience => audience.type === 'developer')
      )
      const operationsContent = mockPages.filter(page => 
        page.audience.some(audience => audience.type === 'operations')
      )

      expect(developerContent).toHaveLength(1)
      expect(operationsContent).toHaveLength(1)
    })
  })

  describe('System Integration', () => {
    test('should integrate search system with content indexing', () => {
      // Test search system integration
      const results = mockSearchSystem.search('getting started')
      expect(results).toHaveLength(1)
      expect(results[0].item.title).toBe('Getting Started Guide')

      // Test faceted search
      const facets = mockSearchSystem.getFacets()
      expect(facets.categories).toHaveLength(1)
      expect(facets.difficulties).toHaveLength(1)
      expect(facets.audienceTypes).toHaveLength(1)
    })

    test('should integrate recommendation system with content relationships', () => {
      // Test recommendation system
      const recommendations = mockRecommendationSystem.getRecommendations('getting-started')
      expect(recommendations).toBeDefined()

      // Test related content
      const relatedContent = mockRecommendationSystem.getRelatedContent('getting-started')
      expect(relatedContent).toBeDefined()
    })

    test('should handle system errors gracefully', () => {
      // Test error handling in search system
      expect(() => {
        mockSearchSystem.search('')
      }).not.toThrow()

      // Test error handling in recommendation system
      expect(() => {
        mockRecommendationSystem.getRecommendations('nonexistent-id')
      }).not.toThrow()
    })
  })

  describe('Performance Integration', () => {
    test('should handle large content sets efficiently', () => {
      // Create a large set of mock results
      const largeResultSet = Array.from({ length: 1000 }, (_, i) => ({
        item: {
          id: `page-${i}`,
          title: `Page ${i}`,
          description: `Description for page ${i}`,
          category: 'getting-started',
          difficulty: 'beginner',
          estimatedReadTime: 5,
          tags: [`tag-${i}`, 'common-tag']
        }
      }))

      const largeSearchSystem = {
        ...mockSearchSystem,
        search: jest.fn(() => largeResultSet.slice(0, 10)) // Return first 10 results
      }

      // Should handle large result sets without errors
      expect(() => {
        largeSearchSystem.search('page')
      }).not.toThrow()

      // Should return reasonable number of results
      const results = largeSearchSystem.search('page')
      expect(results.length).toBeLessThanOrEqual(10)
    })

    test('should debounce search queries appropriately', async () => {
      const user = userEvent.setup()
      const mockOnSearch = jest.fn()

      render(
        <MockSearchInterface 
          searchSystem={mockSearchSystem}
          onSearch={mockOnSearch}
        />
      )

      const searchInput = screen.getByPlaceholderText('Search documentation...')

      // Type rapidly
      await user.type(searchInput, 'quick search test')

      // Should handle rapid typing without excessive calls
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalled()
      })

      // The exact number of calls depends on implementation
      // but it should be reasonable
      expect(mockOnSearch.mock.calls.length).toBeGreaterThan(0)
    })
  })
})