import Fuse from 'fuse.js'
import type { DocumentationPage, UserAudience, DifficultyLevel, ContentCategory } from '../types'

export interface SearchableContent {
  id: string
  title: string
  description: string
  content: string
  tags: string[]
  category: ContentCategory
  audience: UserAudience[]
  difficulty: DifficultyLevel
  estimatedReadTime: number
  lastUpdated: Date
}

export interface SearchFilters {
  category?: ContentCategory
  difficulty?: DifficultyLevel
  audienceType?: UserAudience['type']
  audienceExperience?: UserAudience['experience']
  tags?: string[]
  maxReadTime?: number
}

export interface SearchResult {
  item: SearchableContent
  score?: number
  matches?: any[]
}

export interface SearchOptions {
  limit?: number
  includeMatches?: boolean
  threshold?: number
}

export class SearchSystem {
  private fuse: Fuse<SearchableContent>
  private searchableContent: SearchableContent[] = []

  constructor() {
    // Configure Fuse.js options for optimal search
    const fuseOptions: any = {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
        { name: 'content', weight: 0.1 }
      ],
      threshold: 0.3, // Lower = more strict matching
      distance: 100,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true,
      findAllMatches: true
    }

    this.fuse = new Fuse([], fuseOptions)
  }

  /**
   * Index documentation pages for search
   */
  indexPages(pages: DocumentationPage[]): void {
    this.searchableContent = pages.map(page => ({
      id: page.id,
      title: page.title,
      description: page.description,
      content: this.extractTextContent(page.content),
      tags: page.tags,
      category: page.category,
      audience: page.audience,
      difficulty: page.difficulty,
      estimatedReadTime: page.estimatedReadTime,
      lastUpdated: page.lastUpdated
    }))

    // Update Fuse index
    this.fuse.setCollection(this.searchableContent)
  }

  /**
   * Perform full-text search with optional filters
   */
  search(
    query: string, 
    filters?: SearchFilters, 
    options: SearchOptions = {}
  ): SearchResult[] {
    const { limit = 50, includeMatches = true, threshold } = options

    // If no query, return filtered results
    if (!query.trim()) {
      return this.getFilteredResults(filters, limit)
    }

    // Update threshold if provided
    if (threshold !== undefined) {
      this.fuse.setCollection(this.searchableContent)
      // this.fuse.options.threshold = threshold // TODO: Fix Fuse options access
    }

    // Perform search
    const fuseResults = this.fuse.search(query, { limit })

    // Convert to SearchResult format and apply filters
    let results: SearchResult[] = fuseResults.map(result => ({
      item: result.item,
      score: result.score,
      matches: includeMatches ? (result.matches as any) : undefined
    }))

    // Apply additional filters
    if (filters) {
      results = this.applyFilters(results, filters)
    }

    return results.slice(0, limit)
  }

  /**
   * Get faceted search results for building filter UI
   */
  getFacets(query?: string, currentFilters?: SearchFilters): {
    categories: Array<{ value: ContentCategory; count: number }>
    difficulties: Array<{ value: DifficultyLevel; count: number }>
    audienceTypes: Array<{ value: UserAudience['type']; count: number }>
    audienceExperiences: Array<{ value: UserAudience['experience']; count: number }>
    tags: Array<{ value: string; count: number }>
  } {
    // Get base results (either search results or all content)
    const baseResults = query 
      ? this.search(query, currentFilters, { includeMatches: false })
      : this.searchableContent.map(item => ({ item }))

    const items = baseResults.map(result => result.item)

    // Count categories
    const categoryCount = new Map<ContentCategory, number>()
    items.forEach(item => {
      categoryCount.set(item.category, (categoryCount.get(item.category) || 0) + 1)
    })

    // Count difficulties
    const difficultyCount = new Map<DifficultyLevel, number>()
    items.forEach(item => {
      difficultyCount.set(item.difficulty, (difficultyCount.get(item.difficulty) || 0) + 1)
    })

    // Count audience types
    const audienceTypeCount = new Map<UserAudience['type'], number>()
    items.forEach(item => {
      item.audience.forEach(audience => {
        audienceTypeCount.set(audience.type, (audienceTypeCount.get(audience.type) || 0) + 1)
      })
    })

    // Count audience experiences
    const audienceExperienceCount = new Map<UserAudience['experience'], number>()
    items.forEach(item => {
      item.audience.forEach(audience => {
        audienceExperienceCount.set(audience.experience, (audienceExperienceCount.get(audience.experience) || 0) + 1)
      })
    })

    // Count tags
    const tagCount = new Map<string, number>()
    items.forEach(item => {
      item.tags.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
      })
    })

    return {
      categories: Array.from(categoryCount.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      difficulties: Array.from(difficultyCount.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      audienceTypes: Array.from(audienceTypeCount.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      audienceExperiences: Array.from(audienceExperienceCount.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      tags: Array.from(tagCount.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20) // Limit to top 20 tags
    }
  }

  /**
   * Get search suggestions based on partial query
   */
  getSuggestions(partialQuery: string, limit: number = 5): string[] {
    if (partialQuery.length < 2) return []

    const suggestions = new Set<string>()
    
    // Get suggestions from titles
    this.searchableContent.forEach(item => {
      const words = item.title.toLowerCase().split(/\s+/)
      words.forEach(word => {
        if (word.startsWith(partialQuery.toLowerCase()) && word.length > partialQuery.length) {
          suggestions.add(word)
        }
      })
    })

    // Get suggestions from tags
    this.searchableContent.forEach(item => {
      item.tags.forEach(tag => {
        if (tag.toLowerCase().startsWith(partialQuery.toLowerCase()) && tag.length > partialQuery.length) {
          suggestions.add(tag)
        }
      })
    })

    return Array.from(suggestions).slice(0, limit)
  }

  /**
   * Get popular content based on category or overall
   */
  getPopularContent(category?: ContentCategory, limit: number = 10): SearchableContent[] {
    let content = this.searchableContent

    if (category) {
      content = content.filter(item => item.category === category)
    }

    // Sort by recency and estimated read time (shorter = more popular for quick access)
    return content
      .sort((a, b) => {
        const aScore = this.calculatePopularityScore(a)
        const bScore = this.calculatePopularityScore(b)
        return bScore - aScore
      })
      .slice(0, limit)
  }

  /**
   * Clear the search index
   */
  clearIndex(): void {
    this.searchableContent = []
    this.fuse.setCollection([])
  }

  /**
   * Get total number of indexed items
   */
  getIndexSize(): number {
    return this.searchableContent.length
  }

  /**
   * Extract plain text content from content blocks
   */
  private extractTextContent(contentBlocks: any[]): string {
    return contentBlocks
      .map(block => {
        // Remove HTML tags and normalize whitespace
        return block.content.replace(/<[^>]*>/g, ' ')
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Apply filters to search results
   */
  private applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    return results.filter(result => {
      const item = result.item

      // Category filter
      if (filters.category && item.category !== filters.category) {
        return false
      }

      // Difficulty filter
      if (filters.difficulty && item.difficulty !== filters.difficulty) {
        return false
      }

      // Audience type filter
      if (filters.audienceType && !item.audience.some(a => a.type === filters.audienceType)) {
        return false
      }

      // Audience experience filter
      if (filters.audienceExperience && !item.audience.some(a => a.experience === filters.audienceExperience)) {
        return false
      }

      // Tags filter (item must have at least one of the specified tags)
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          item.tags.some(itemTag => itemTag.toLowerCase().includes(tag.toLowerCase()))
        )
        if (!hasMatchingTag) {
          return false
        }
      }

      // Max read time filter
      if (filters.maxReadTime && item.estimatedReadTime > filters.maxReadTime) {
        return false
      }

      return true
    })
  }

  /**
   * Get filtered results without search query
   */
  private getFilteredResults(filters?: SearchFilters, limit: number = 50): SearchResult[] {
    let content = this.searchableContent

    if (filters) {
      content = content.filter(item => {
        // Apply same filter logic as applyFilters
        if (filters.category && item.category !== filters.category) return false
        if (filters.difficulty && item.difficulty !== filters.difficulty) return false
        if (filters.audienceType && !item.audience.some(a => a.type === filters.audienceType)) return false
        if (filters.audienceExperience && !item.audience.some(a => a.experience === filters.audienceExperience)) return false
        if (filters.tags && filters.tags.length > 0) {
          const hasMatchingTag = filters.tags.some(tag => 
            item.tags.some(itemTag => itemTag.toLowerCase().includes(tag.toLowerCase()))
          )
          if (!hasMatchingTag) return false
        }
        if (filters.maxReadTime && item.estimatedReadTime > filters.maxReadTime) return false
        return true
      })
    }

    // Sort by popularity/relevance
    content.sort((a, b) => this.calculatePopularityScore(b) - this.calculatePopularityScore(a))

    return content.slice(0, limit).map(item => ({ item }))
  }

  /**
   * Calculate popularity score for content ranking
   */
  private calculatePopularityScore(item: SearchableContent): number {
    const now = new Date()
    const daysSinceUpdate = (now.getTime() - item.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    
    // Newer content gets higher score, shorter read time gets slight boost
    const recencyScore = Math.max(0, 100 - daysSinceUpdate * 0.5)
    const readTimeScore = Math.max(0, 20 - item.estimatedReadTime)
    const tagScore = item.tags.length * 2 // More tags = more discoverable
    
    return recencyScore + readTimeScore + tagScore
  }
}

// Utility functions for search system
export function highlightSearchMatches(
  text: string, 
  matches?: any[]
): string {
  if (!matches || matches.length === 0) return text

  let highlightedText = text
  const highlights: Array<{ start: number; end: number }> = []

  // Collect all match indices
  matches.forEach(match => {
    if (match.indices) {
      match.indices.forEach(([start, end]: [number, number]) => {
        highlights.push({ start, end })
      })
    }
  })

  // Sort highlights by start position (descending to avoid index shifting)
  highlights.sort((a, b) => b.start - a.start)

  // Apply highlights
  highlights.forEach(({ start, end }) => {
    const before = highlightedText.slice(0, start)
    const highlighted = highlightedText.slice(start, end + 1)
    const after = highlightedText.slice(end + 1)
    highlightedText = `${before}<mark>${highlighted}</mark>${after}`
  })

  return highlightedText
}

export function createSearchQuery(
  terms: string[], 
  operator: 'AND' | 'OR' = 'OR'
): string {
  if (terms.length === 0) return ''
  if (terms.length === 1) return terms[0]
  
  return operator === 'AND' 
    ? terms.join(' ')  // Fuse.js treats space-separated terms as AND by default
    : terms.join(' | ') // Use pipe for OR operations
}