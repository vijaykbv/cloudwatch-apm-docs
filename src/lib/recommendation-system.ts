import type { DocumentationPage, UserAudience, ContentCategory } from '../types'

export interface RecommendationScore {
  pageId: string
  score: number
  reasons: RecommendationReason[]
}

export interface RecommendationReason {
  type: 'category' | 'audience' | 'difficulty' | 'tags' | 'content' | 'explicit'
  weight: number
  description: string
}

export interface RecommendationOptions {
  maxRecommendations?: number
  includeReasons?: boolean
  excludeCurrentPage?: boolean
  audienceBoost?: number
  categoryBoost?: number
  tagBoost?: number
}

export class RecommendationSystem {
  private pages: Map<string, DocumentationPage> = new Map()
  private pageViews: Map<string, number> = new Map()
  private coViewMatrix: Map<string, Map<string, number>> = new Map()

  /**
   * Index pages for recommendations
   */
  indexPages(pages: DocumentationPage[]): void {
    this.pages.clear()
    pages.forEach(page => {
      this.pages.set(page.id, page)
    })
  }

  /**
   * Track page view for popularity and co-viewing patterns
   */
  trackPageView(pageId: string, sessionId?: string): void {
    // Update view count
    const currentViews = this.pageViews.get(pageId) || 0
    this.pageViews.set(pageId, currentViews + 1)

    // Update co-viewing matrix (simplified - in real system would use session data)
    if (!this.coViewMatrix.has(pageId)) {
      this.coViewMatrix.set(pageId, new Map())
    }
  }

  /**
   * Get related content recommendations for a given page
   */
  getRelatedContent(
    currentPageId: string, 
    options: RecommendationOptions = {}
  ): RecommendationScore[] {
    const {
      maxRecommendations = 5,
      includeReasons = false,
      excludeCurrentPage = true,
      audienceBoost = 1.5,
      categoryBoost = 1.2,
      tagBoost = 1.0
    } = options

    const currentPage = this.pages.get(currentPageId)
    if (!currentPage) {
      return []
    }

    const recommendations: RecommendationScore[] = []

    // Score all other pages
    for (const [pageId, page] of this.pages) {
      if (excludeCurrentPage && pageId === currentPageId) {
        continue
      }

      const score = this.calculateRecommendationScore(
        currentPage, 
        page, 
        { audienceBoost, categoryBoost, tagBoost }
      )

      if (score.score > 0) {
        recommendations.push({
          pageId,
          score: score.score,
          reasons: includeReasons ? score.reasons : []
        })
      }
    }

    // Sort by score and limit results
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations)
  }

  /**
   * Get contextual recommendations based on user journey
   */
  getContextualRecommendations(
    currentPageId: string,
    userAudience?: UserAudience,
    journeyStage?: 'getting-started' | 'implementing' | 'optimizing' | 'troubleshooting'
  ): RecommendationScore[] {
    const currentPage = this.pages.get(currentPageId)
    if (!currentPage) {
      return []
    }

    // Define journey progression paths
    const journeyPaths: Record<string, ContentCategory[]> = {
      'getting-started': ['getting-started', 'implementation', 'examples'],
      'implementing': ['implementation', 'configuration', 'examples', 'api-reference'],
      'optimizing': ['performance', 'monitoring', 'configuration'],
      'troubleshooting': ['troubleshooting', 'monitoring', 'configuration']
    }

    const targetCategories = journeyStage ? journeyPaths[journeyStage] : []
    
    const recommendations: RecommendationScore[] = []

    for (const [pageId, page] of this.pages) {
      if (pageId === currentPageId) continue

      let score = 0
      const reasons: RecommendationReason[] = []

      // Journey stage relevance
      if (targetCategories.includes(page.category)) {
        const categoryScore = 30
        score += categoryScore
        reasons.push({
          type: 'category',
          weight: categoryScore,
          description: `Relevant for ${journeyStage} journey stage`
        })
      }

      // Audience match
      if (userAudience && page.audience.some(a => 
        a.type === userAudience.type && a.experience === userAudience.experience
      )) {
        const audienceScore = 25
        score += audienceScore
        reasons.push({
          type: 'audience',
          weight: audienceScore,
          description: `Matches your audience profile`
        })
      }

      // Difficulty progression
      if (this.isDifficultyProgression(currentPage.difficulty, page.difficulty)) {
        const difficultyScore = 20
        score += difficultyScore
        reasons.push({
          type: 'difficulty',
          weight: difficultyScore,
          description: `Natural difficulty progression`
        })
      }

      // Tag overlap
      const commonTags = currentPage.tags.filter(tag => page.tags.includes(tag))
      if (commonTags.length > 0) {
        const tagScore = commonTags.length * 5
        score += tagScore
        reasons.push({
          type: 'tags',
          weight: tagScore,
          description: `Shares ${commonTags.length} common topic${commonTags.length > 1 ? 's' : ''}`
        })
      }

      if (score > 0) {
        recommendations.push({
          pageId,
          score,
          reasons
        })
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }

  /**
   * Get popular content recommendations
   */
  getPopularContent(
    category?: ContentCategory,
    audience?: UserAudience,
    limit: number = 10
  ): RecommendationScore[] {
    const recommendations: RecommendationScore[] = []

    for (const [pageId, page] of this.pages) {
      // Apply filters
      if (category && page.category !== category) continue
      if (audience && !page.audience.some(a => 
        a.type === audience.type && a.experience === audience.experience
      )) continue

      const views = this.pageViews.get(pageId) || 0
      const recencyScore = this.calculateRecencyScore(page.lastUpdated)
      const readabilityScore = this.calculateReadabilityScore(page.estimatedReadTime)
      
      const score = views * 0.4 + recencyScore * 0.3 + readabilityScore * 0.3

      recommendations.push({
        pageId,
        score,
        reasons: [
          {
            type: 'content',
            weight: score,
            description: 'Popular content based on views and recency'
          }
        ]
      })
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Generate cross-reference links for a page
   */
  generateCrossReferences(pageId: string): Array<{
    targetPageId: string
    linkText: string
    context: string
    type: 'see-also' | 'prerequisite' | 'next-step' | 'related'
  }> {
    const page = this.pages.get(pageId)
    if (!page) return []

    const crossRefs: Array<{
      targetPageId: string
      linkText: string
      context: string
      type: 'see-also' | 'prerequisite' | 'next-step' | 'related'
    }> = []

    // Explicit related pages
    page.relatedPages.forEach(relatedId => {
      const relatedPage = this.pages.get(relatedId)
      if (relatedPage) {
        crossRefs.push({
          targetPageId: relatedId,
          linkText: relatedPage.title,
          context: 'Explicitly related content',
          type: 'see-also'
        })
      }
    })

    // Prerequisites (easier difficulty in same category)
    if (page.difficulty !== 'beginner') {
      for (const [otherId, otherPage] of this.pages) {
        if (otherId === pageId) continue
        
        if (otherPage.category === page.category && 
            this.isDifficultyProgression(otherPage.difficulty, page.difficulty)) {
          crossRefs.push({
            targetPageId: otherId,
            linkText: `Prerequisites: ${otherPage.title}`,
            context: 'Recommended prerequisite reading',
            type: 'prerequisite'
          })
        }
      }
    }

    // Next steps (harder difficulty in same category or related categories)
    const nextStepCategories = this.getNextStepCategories(page.category)
    for (const [otherId, otherPage] of this.pages) {
      if (otherId === pageId) continue
      
      if ((otherPage.category === page.category && 
           this.isDifficultyProgression(page.difficulty, otherPage.difficulty)) ||
          nextStepCategories.includes(otherPage.category)) {
        crossRefs.push({
          targetPageId: otherId,
          linkText: `Next: ${otherPage.title}`,
          context: 'Suggested next step',
          type: 'next-step'
        })
      }
    }

    // Related by tags
    for (const [otherId, otherPage] of this.pages) {
      if (otherId === pageId) continue
      
      const commonTags = page.tags.filter(tag => otherPage.tags.includes(tag))
      if (commonTags.length >= 2) {
        crossRefs.push({
          targetPageId: otherId,
          linkText: otherPage.title,
          context: `Related topics: ${commonTags.join(', ')}`,
          type: 'related'
        })
      }
    }

    // Remove duplicates and limit
    const seen = new Set<string>()
    return crossRefs
      .filter(ref => {
        if (seen.has(ref.targetPageId)) return false
        seen.add(ref.targetPageId)
        return true
      })
      .slice(0, 10)
  }

  /**
   * Get recommendation statistics
   */
  getRecommendationStats(): {
    totalPages: number
    totalViews: number
    mostPopular: Array<{ pageId: string; views: number }>
    categoryDistribution: Record<ContentCategory, number>
  } {
    const totalPages = this.pages.size
    const totalViews = Array.from(this.pageViews.values()).reduce((sum, views) => sum + views, 0)
    
    const mostPopular = Array.from(this.pageViews.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([pageId, views]) => ({ pageId, views }))

    const categoryDistribution: Record<string, number> = {}
    for (const page of this.pages.values()) {
      categoryDistribution[page.category] = (categoryDistribution[page.category] || 0) + 1
    }

    return {
      totalPages,
      totalViews,
      mostPopular,
      categoryDistribution: categoryDistribution as Record<ContentCategory, number>
    }
  }

  /**
   * Calculate recommendation score between two pages
   */
  private calculateRecommendationScore(
    currentPage: DocumentationPage,
    candidatePage: DocumentationPage,
    boosts: { audienceBoost: number; categoryBoost: number; tagBoost: number }
  ): { score: number; reasons: RecommendationReason[] } {
    let score = 0
    const reasons: RecommendationReason[] = []

    // Explicit related pages get highest score
    if (currentPage.relatedPages.includes(candidatePage.id)) {
      const explicitScore = 50
      score += explicitScore
      reasons.push({
        type: 'explicit',
        weight: explicitScore,
        description: 'Explicitly marked as related content'
      })
    }

    // Same category
    if (currentPage.category === candidatePage.category) {
      const categoryScore = 20 * boosts.categoryBoost
      score += categoryScore
      reasons.push({
        type: 'category',
        weight: categoryScore,
        description: 'Same content category'
      })
    }

    // Audience overlap
    const audienceOverlap = currentPage.audience.filter(a1 =>
      candidatePage.audience.some(a2 => a1.type === a2.type)
    ).length
    if (audienceOverlap > 0) {
      const audienceScore = audienceOverlap * 15 * boosts.audienceBoost
      score += audienceScore
      reasons.push({
        type: 'audience',
        weight: audienceScore,
        description: `Targets similar audience (${audienceOverlap} overlap${audienceOverlap > 1 ? 's' : ''})`
      })
    }

    // Tag overlap
    const tagOverlap = currentPage.tags.filter(tag => candidatePage.tags.includes(tag))
    if (tagOverlap.length > 0) {
      const tagScore = tagOverlap.length * 10 * boosts.tagBoost
      score += tagScore
      reasons.push({
        type: 'tags',
        weight: tagScore,
        description: `Shares ${tagOverlap.length} common tag${tagOverlap.length > 1 ? 's' : ''}: ${tagOverlap.join(', ')}`
      })
    }

    // Difficulty progression
    if (this.isDifficultyProgression(currentPage.difficulty, candidatePage.difficulty)) {
      const difficultyScore = 15
      score += difficultyScore
      reasons.push({
        type: 'difficulty',
        weight: difficultyScore,
        description: 'Natural difficulty progression'
      })
    }

    // Popularity boost
    const views = this.pageViews.get(candidatePage.id) || 0
    if (views > 0) {
      const popularityScore = Math.min(views * 0.1, 10)
      score += popularityScore
      reasons.push({
        type: 'content',
        weight: popularityScore,
        description: 'Popular content'
      })
    }

    return { score, reasons }
  }

  /**
   * Check if there's a natural difficulty progression
   */
  private isDifficultyProgression(from: string, to: string): boolean {
    const difficultyOrder = ['beginner', 'intermediate', 'advanced']
    const fromIndex = difficultyOrder.indexOf(from)
    const toIndex = difficultyOrder.indexOf(to)
    return toIndex === fromIndex + 1
  }

  /**
   * Get next step categories for a given category
   */
  private getNextStepCategories(category: ContentCategory): ContentCategory[] {
    const progressionMap: Record<ContentCategory, ContentCategory[]> = {
      'getting-started': ['implementation', 'configuration', 'examples'],
      'implementation': ['configuration', 'examples', 'api-reference'],
      'configuration': ['monitoring', 'performance', 'troubleshooting'],
      'examples': ['api-reference', 'performance'],
      'api-reference': ['examples', 'troubleshooting'],
      'troubleshooting': ['monitoring', 'performance'],
      'monitoring': ['performance', 'security'],
      'security': ['performance', 'monitoring'],
      'performance': ['monitoring', 'troubleshooting']
    }

    return progressionMap[category] || []
  }

  /**
   * Calculate recency score based on last updated date
   */
  private calculateRecencyScore(lastUpdated: Date): number {
    const now = new Date()
    const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    
    // Score decreases over time, but levels off
    return Math.max(0, 100 - daysSinceUpdate * 0.5)
  }

  /**
   * Calculate readability score based on estimated read time
   */
  private calculateReadabilityScore(estimatedReadTime: number): number {
    // Prefer moderate read times (5-15 minutes)
    if (estimatedReadTime >= 5 && estimatedReadTime <= 15) {
      return 100
    } else if (estimatedReadTime < 5) {
      return 50 + estimatedReadTime * 10 // Shorter gets some points
    } else {
      return Math.max(0, 100 - (estimatedReadTime - 15) * 2) // Longer loses points
    }
  }
}

// Utility functions for recommendation system
export function formatRecommendationReason(reason: RecommendationReason): string {
  return `${reason.description} (weight: ${reason.weight.toFixed(1)})`
}

export function groupRecommendationsByType(
  recommendations: RecommendationScore[]
): Record<string, RecommendationScore[]> {
  const groups: Record<string, RecommendationScore[]> = {
    high: [],
    medium: [],
    low: []
  }

  recommendations.forEach(rec => {
    if (rec.score >= 40) {
      groups.high.push(rec)
    } else if (rec.score >= 20) {
      groups.medium.push(rec)
    } else {
      groups.low.push(rec)
    }
  })

  return groups
}