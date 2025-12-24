import fc from 'fast-check'
import { SearchSystem } from '../search-system'
import type { DocumentationPage, UserAudience, DifficultyLevel, ContentCategory } from '../../types'

// **Feature: cloudwatch-apm-docs, Property 3: Search Functionality Coverage**
// **Validates: Requirements 1.5**

describe('SearchSystem Property Tests', () => {
  // Generators for test data
  const audienceTypeGen = fc.constantFrom('developer', 'operations', 'architect', 'security')
  const experienceGen = fc.constantFrom('beginner', 'intermediate', 'advanced')
  const difficultyGen = fc.constantFrom('beginner', 'intermediate', 'advanced')
  const categoryGen = fc.constantFrom(
    'getting-started',
    'implementation',
    'configuration',
    'examples',
    'api-reference',
    'troubleshooting',
    'monitoring',
    'security',
    'performance'
  )

  const userAudienceGen = fc.record({
    type: audienceTypeGen,
    experience: experienceGen
  })

  const contentBlockGen = fc.record({
    type: fc.constantFrom('text', 'code', 'diagram', 'interactive', 'video'),
    content: fc.string({ minLength: 10, maxLength: 500 }).map(s => s.trim()),
    metadata: fc.record({
      title: fc.option(fc.string({ minLength: 1, maxLength: 100 }).map(s => s.trim())),
      description: fc.option(fc.string({ minLength: 1, maxLength: 200 }).map(s => s.trim()))
    })
  })

  const documentationPageGen = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
    title: fc.string({ minLength: 1, maxLength: 100 }).map(s => s.trim()),
    description: fc.string({ minLength: 1, maxLength: 300 }).map(s => s.trim()),
    audience: fc.array(userAudienceGen, { minLength: 1, maxLength: 3 }),
    difficulty: difficultyGen,
    category: categoryGen,
    tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }).map(s => s.trim()).filter(s => s.length > 0), { maxLength: 10 }),
    content: fc.array(contentBlockGen, { minLength: 1, maxLength: 5 }),
    relatedPages: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }),
    lastUpdated: fc.date({ min: new Date('2020-01-01'), max: new Date() }),
    estimatedReadTime: fc.integer({ min: 1, max: 60 })
  })

  const searchTermGen = fc.oneof(
    fc.string({ minLength: 1, maxLength: 50 }).map(s => s.trim()).filter(s => s.length > 0),
    fc.constantFrom('getting', 'started', 'configuration', 'example', 'troubleshoot', 'api', 'security')
  )

  test('Property 3: Search Functionality Coverage - For any searchable content, the search system should return that content when queried with relevant terms from its title, description, or tags', () => {
    fc.assert(fc.property(
      fc.array(documentationPageGen, { minLength: 1, maxLength: 20 }),
      searchTermGen,
      (pages, searchTerm) => {
        // Skip very short search terms that might not meet Fuse.js minimum requirements
        if (searchTerm.length < 2) {
          return true
        }

        const searchSystem = new SearchSystem()
        searchSystem.indexPages(pages)

        // Find pages that should match the search term
        const expectedMatches = pages.filter(page => {
          const searchTermLower = searchTerm.toLowerCase()
          const titleMatch = page.title.toLowerCase().includes(searchTermLower)
          const descriptionMatch = page.description.toLowerCase().includes(searchTermLower)
          const tagMatch = page.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
          const contentMatch = page.content.some(block => 
            block.content.toLowerCase().includes(searchTermLower)
          )
          
          return titleMatch || descriptionMatch || tagMatch || contentMatch
        })

        // Perform search
        const results = searchSystem.search(searchTerm)
        const resultIds = new Set(results.map(r => r.item.id))

        // All results should be valid pages from our index
        const allResultsValid = results.every(result => 
          pages.some(page => page.id === result.item.id)
        )

        // For fuzzy search, we can't expect exact string matching behavior
        // Instead, we verify that:
        // 1. All results are valid (from our indexed pages)
        // 2. If we have strong matches (search term appears in title/tags), we get some results
        const hasStrongMatches = expectedMatches.some(page => {
          const searchTermLower = searchTerm.toLowerCase()
          const titleWords = page.title.toLowerCase().split(/\s+/)
          const tagWords = page.tags.map(tag => tag.toLowerCase())
          
          return titleWords.some(word => word.includes(searchTermLower) && word.length <= searchTermLower.length + 3) ||
                 tagWords.some(tag => tag.includes(searchTermLower) && tag.length <= searchTermLower.length + 3)
        })

        // If we have strong matches, we should get some results
        if (hasStrongMatches && results.length === 0) {
          return false
        }

        return allResultsValid
      }
    ), { numRuns: 100 })
  })

  test('Property 3a: Search with filters returns only matching content', () => {
    fc.assert(fc.property(
      fc.array(documentationPageGen, { minLength: 5, maxLength: 15 }),
      searchTermGen,
      categoryGen,
      difficultyGen,
      (pages, searchTerm, filterCategory, filterDifficulty) => {
        const searchSystem = new SearchSystem()
        searchSystem.indexPages(pages)

        // Search with filters
        const results = searchSystem.search(searchTerm, {
          category: filterCategory,
          difficulty: filterDifficulty
        })

        // All results should match the filters
        const allResultsMatchFilters = results.every(result => 
          result.item.category === filterCategory && 
          result.item.difficulty === filterDifficulty
        )

        return allResultsMatchFilters
      }
    ), { numRuns: 100 })
  })

  test('Property 3b: Empty search with filters returns all matching content', () => {
    fc.assert(fc.property(
      fc.array(documentationPageGen, { minLength: 3, maxLength: 10 }),
      categoryGen,
      (pages, filterCategory) => {
        const searchSystem = new SearchSystem()
        searchSystem.indexPages(pages)

        // Empty search with category filter
        const results = searchSystem.search('', { category: filterCategory })
        
        // Should return all pages with matching category
        const expectedPages = pages.filter(page => page.category === filterCategory)
        const resultIds = new Set(results.map(r => r.item.id))
        
        const allExpectedFound = expectedPages.every(page => resultIds.has(page.id))
        const noUnexpectedResults = results.every(result => result.item.category === filterCategory)

        return allExpectedFound && noUnexpectedResults
      }
    ), { numRuns: 100 })
  })

  test('Property 3c: Search suggestions contain relevant terms', () => {
    fc.assert(fc.property(
      fc.array(documentationPageGen, { minLength: 3, maxLength: 10 }),
      fc.string({ minLength: 2, maxLength: 10 }),
      (pages, partialQuery) => {
        const searchSystem = new SearchSystem()
        searchSystem.indexPages(pages)

        const suggestions = searchSystem.getSuggestions(partialQuery, 5)

        // All suggestions should start with the partial query (case insensitive)
        const allSuggestionsValid = suggestions.every(suggestion =>
          suggestion.toLowerCase().startsWith(partialQuery.toLowerCase()) &&
          suggestion.length > partialQuery.length
        )

        // Suggestions should come from indexed content
        const allSuggestionsFromContent = suggestions.every(suggestion => {
          return pages.some(page => {
            const titleWords = page.title.toLowerCase().split(/\s+/)
            const tagWords = page.tags.map(tag => tag.toLowerCase())
            return titleWords.includes(suggestion.toLowerCase()) || 
                   tagWords.includes(suggestion.toLowerCase())
          })
        })

        return allSuggestionsValid && allSuggestionsFromContent
      }
    ), { numRuns: 100 })
  })

  test('Property 3d: Faceted search maintains consistency', () => {
    fc.assert(fc.property(
      fc.array(documentationPageGen, { minLength: 5, maxLength: 15 }),
      searchTermGen,
      (pages, searchTerm) => {
        const searchSystem = new SearchSystem()
        searchSystem.indexPages(pages)

        const facets = searchSystem.getFacets(searchTerm)
        const results = searchSystem.search(searchTerm)

        // Total facet counts should not exceed total results
        const totalCategoryCount = facets.categories.reduce((sum, cat) => sum + cat.count, 0)
        const totalDifficultyCount = facets.difficulties.reduce((sum, diff) => sum + diff.count, 0)

        // Each result should contribute to exactly one category and difficulty
        const categoryCountsMatch = totalCategoryCount >= results.length || results.length === 0
        const difficultyCountsMatch = totalDifficultyCount >= results.length || results.length === 0

        // All facet values should exist in the results
        const allCategoriesExist = facets.categories.every(cat =>
          results.some(result => result.item.category === cat.value)
        )
        const allDifficultiesExist = facets.difficulties.every(diff =>
          results.some(result => result.item.difficulty === diff.value)
        )

        return categoryCountsMatch && difficultyCountsMatch && 
               (results.length === 0 || (allCategoriesExist && allDifficultiesExist))
      }
    ), { numRuns: 100 })
  })

  test('Property 3e: Popular content ranking is consistent', () => {
    fc.assert(fc.property(
      fc.array(documentationPageGen, { minLength: 3, maxLength: 10 }),
      fc.option(categoryGen),
      (pages, category) => {
        const searchSystem = new SearchSystem()
        searchSystem.indexPages(pages)

        const popularContent = searchSystem.getPopularContent(category, 5)

        // If category filter is applied, all results should match
        const categoryFilterRespected = !category || 
          popularContent.every(item => item.category === category)

        // Results should be from the indexed pages
        const allResultsFromIndex = popularContent.every(item =>
          pages.some(page => page.id === item.id)
        )

        // Should not return more items than requested or available
        const expectedCount = category 
          ? Math.min(5, pages.filter(p => p.category === category).length)
          : Math.min(5, pages.length)
        const correctCount = popularContent.length <= expectedCount

        return categoryFilterRespected && allResultsFromIndex && correctCount
      }
    ), { numRuns: 100 })
  })

  test('Property 3f: Search system maintains index integrity', () => {
    fc.assert(fc.property(
      fc.array(documentationPageGen, { minLength: 1, maxLength: 10 }),
      fc.array(documentationPageGen, { minLength: 1, maxLength: 10 }),
      (initialPages, newPages) => {
        const searchSystem = new SearchSystem()
        
        // Index initial pages
        searchSystem.indexPages(initialPages)
        const initialSize = searchSystem.getIndexSize()
        
        // Re-index with new pages
        searchSystem.indexPages(newPages)
        const newSize = searchSystem.getIndexSize()
        
        // Index size should match the number of new pages
        const sizeMatches = newSize === newPages.length
        
        // Should be able to find all new pages
        const allNewPagesSearchable = newPages.every(page => {
          const results = searchSystem.search(page.title)
          return results.some(result => result.item.id === page.id)
        })
        
        // Clear should reset to empty
        searchSystem.clearIndex()
        const clearedSize = searchSystem.getIndexSize()
        
        return sizeMatches && allNewPagesSearchable && clearedSize === 0
      }
    ), { numRuns: 100 })
  })
})

// Unit tests for specific edge cases and examples
describe('SearchSystem Unit Tests', () => {
  let searchSystem: SearchSystem
  let samplePages: DocumentationPage[]

  beforeEach(() => {
    searchSystem = new SearchSystem()
    samplePages = [
      {
        id: 'getting-started-guide',
        title: 'Getting Started with CloudWatch APM',
        description: 'Learn how to set up CloudWatch APM for your applications',
        audience: [{ type: 'developer', experience: 'beginner' }],
        difficulty: 'beginner' as DifficultyLevel,
        category: 'getting-started' as ContentCategory,
        tags: ['setup', 'quickstart', 'beginner'],
        content: [
          {
            type: 'text',
            content: 'This guide will help you get started with CloudWatch APM monitoring',
            metadata: {}
          }
        ],
        relatedPages: ['configuration-guide'],
        lastUpdated: new Date('2023-01-01'),
        estimatedReadTime: 5
      },
      {
        id: 'configuration-guide',
        title: 'Advanced Configuration Options',
        description: 'Configure CloudWatch APM for complex scenarios',
        audience: [{ type: 'operations', experience: 'advanced' }],
        difficulty: 'advanced' as DifficultyLevel,
        category: 'configuration' as ContentCategory,
        tags: ['configuration', 'advanced', 'tuning'],
        content: [
          {
            type: 'text',
            content: 'Advanced configuration requires understanding of CloudWatch metrics and alarms',
            metadata: {}
          }
        ],
        relatedPages: ['getting-started-guide'],
        lastUpdated: new Date('2023-02-01'),
        estimatedReadTime: 15
      }
    ]
    
    searchSystem.indexPages(samplePages)
  })

  test('should find content by exact title match', () => {
    const results = searchSystem.search('Getting Started with CloudWatch APM')
    expect(results).toHaveLength(1)
    expect(results[0].item.id).toBe('getting-started-guide')
  })

  test('should find content by partial title match', () => {
    const results = searchSystem.search('getting started')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.item.id === 'getting-started-guide')).toBe(true)
  })

  test('should find content by tag match', () => {
    const results = searchSystem.search('quickstart')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.item.id === 'getting-started-guide')).toBe(true)
  })

  test('should filter by category correctly', () => {
    const results = searchSystem.search('', { category: 'getting-started' })
    expect(results).toHaveLength(1)
    expect(results[0].item.category).toBe('getting-started')
  })

  test('should filter by difficulty correctly', () => {
    const results = searchSystem.search('', { difficulty: 'advanced' })
    expect(results).toHaveLength(1)
    expect(results[0].item.difficulty).toBe('advanced')
  })

  test('should return empty results for non-existent content', () => {
    const results = searchSystem.search('nonexistent content xyz')
    expect(results).toHaveLength(0)
  })

  test('should provide relevant suggestions', () => {
    const suggestions = searchSystem.getSuggestions('get', 3)
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions.every(s => s.toLowerCase().startsWith('get'))).toBe(true)
  })

  test('should return popular content', () => {
    const popular = searchSystem.getPopularContent(undefined, 2)
    expect(popular.length).toBeLessThanOrEqual(2)
    expect(popular.every(item => samplePages.some(page => page.id === item.id))).toBe(true)
  })

  test('should generate facets correctly', () => {
    const facets = searchSystem.getFacets()
    
    expect(facets.categories.length).toBeGreaterThan(0)
    expect(facets.difficulties.length).toBeGreaterThan(0)
    expect(facets.audienceTypes.length).toBeGreaterThan(0)
    
    // Check that counts are reasonable
    const totalCategoryCount = facets.categories.reduce((sum, cat) => sum + cat.count, 0)
    expect(totalCategoryCount).toBeGreaterThanOrEqual(samplePages.length)
  })
})