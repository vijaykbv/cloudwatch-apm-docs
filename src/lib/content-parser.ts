import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import { z } from 'zod'
import {
  DocumentationPageSchema,
  type DocumentationPage,
  type ContentBlock,
  type UserAudience,
  type DifficultyLevel,
  type ContentCategory
} from '../types'

// Frontmatter schema for markdown files
const FrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  audience: z.array(z.object({
    type: z.enum(['developer', 'operations', 'architect', 'security']),
    experience: z.enum(['beginner', 'intermediate', 'advanced'])
  })).min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.enum([
    'getting-started',
    'implementation',
    'configuration',
    'examples',
    'api-reference',
    'troubleshooting',
    'monitoring',
    'security',
    'performance'
  ]),
  tags: z.array(z.string()).default([]),
  relatedPages: z.array(z.string()).default([]),
  estimatedReadTime: z.number().positive().optional()
})

export interface ParsedContent {
  frontmatter: z.infer<typeof FrontmatterSchema>
  content: string
  htmlContent: string
}

export interface ContentParseError {
  type: 'frontmatter' | 'markdown' | 'validation'
  message: string
  details?: unknown
}

export class ContentParser {
  private processor = remark().use(remarkGfm).use(remarkHtml)

  /**
   * Parse markdown content with frontmatter
   */
  async parseMarkdown(markdownContent: string): Promise<ParsedContent | ContentParseError> {
    try {
      // Parse frontmatter and content
      const { data, content } = matter(markdownContent)
      
      // Validate frontmatter
      const frontmatterResult = FrontmatterSchema.safeParse(data)
      if (!frontmatterResult.success) {
        return {
          type: 'frontmatter',
          message: 'Invalid frontmatter structure',
          details: frontmatterResult.error.issues
        }
      }

      // Process markdown to HTML
      const processedContent = await this.processor.process(content)
      const htmlContent = processedContent.toString()

      return {
        frontmatter: frontmatterResult.data,
        content: content.trim(),
        htmlContent
      }
    } catch (error) {
      return {
        type: 'markdown',
        message: 'Failed to parse markdown content',
        details: error
      }
    }
  }

  /**
   * Convert parsed content to DocumentationPage
   */
  createDocumentationPage(
    id: string,
    parsedContent: ParsedContent,
    lastUpdated?: Date
  ): DocumentationPage | ContentParseError {
    try {
      // Create content blocks from the parsed content
      const contentBlocks: ContentBlock[] = [
        {
          type: 'text',
          content: parsedContent.htmlContent,
          metadata: {
            title: parsedContent.frontmatter.title,
            description: parsedContent.frontmatter.description
          }
        }
      ]

      // Calculate estimated read time if not provided
      const estimatedReadTime = parsedContent.frontmatter.estimatedReadTime || 
        this.calculateReadTime(parsedContent.content)

      const page: DocumentationPage = {
        id,
        title: parsedContent.frontmatter.title,
        description: parsedContent.frontmatter.description,
        audience: parsedContent.frontmatter.audience,
        difficulty: parsedContent.frontmatter.difficulty,
        category: parsedContent.frontmatter.category,
        tags: parsedContent.frontmatter.tags,
        content: contentBlocks,
        relatedPages: parsedContent.frontmatter.relatedPages,
        lastUpdated: lastUpdated || new Date(),
        estimatedReadTime
      }

      // Validate the complete page
      const validationResult = DocumentationPageSchema.safeParse(page)
      if (!validationResult.success) {
        return {
          type: 'validation',
          message: 'Generated page failed validation',
          details: validationResult.error.issues
        }
      }

      return page
    } catch (error) {
      return {
        type: 'validation',
        message: 'Failed to create documentation page',
        details: error
      }
    }
  }

  /**
   * Calculate estimated reading time based on content length
   * Assumes average reading speed of 200 words per minute
   */
  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  }
}

// Search indexing functionality
export interface SearchIndex {
  id: string
  title: string
  description: string
  content: string
  tags: string[]
  category: ContentCategory
  audience: UserAudience[]
  difficulty: DifficultyLevel
}

export class ContentIndexer {
  private index: SearchIndex[] = []

  /**
   * Add a page to the search index
   */
  addToIndex(page: DocumentationPage): void {
    const searchEntry: SearchIndex = {
      id: page.id,
      title: page.title,
      description: page.description,
      content: this.extractTextContent(page.content),
      tags: page.tags,
      category: page.category,
      audience: page.audience,
      difficulty: page.difficulty
    }

    // Remove existing entry if it exists
    this.index = this.index.filter(entry => entry.id !== page.id)
    
    // Add new entry
    this.index.push(searchEntry)
  }

  /**
   * Search the index
   */
  search(query: string, filters?: {
    category?: ContentCategory
    difficulty?: DifficultyLevel
    audienceType?: string
  }): SearchIndex[] {
    const normalizedQuery = query.toLowerCase().trim()
    
    if (!normalizedQuery) {
      return this.index
    }

    let results = this.index.filter(entry => {
      // Text search
      const titleMatch = entry.title.toLowerCase().includes(normalizedQuery)
      const descriptionMatch = entry.description.toLowerCase().includes(normalizedQuery)
      const contentMatch = entry.content.toLowerCase().includes(normalizedQuery)
      const tagMatch = entry.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
      
      return titleMatch || descriptionMatch || contentMatch || tagMatch
    })

    // Apply filters
    if (filters) {
      if (filters.category) {
        results = results.filter(entry => entry.category === filters.category)
      }
      
      if (filters.difficulty) {
        results = results.filter(entry => entry.difficulty === filters.difficulty)
      }
      
      if (filters.audienceType) {
        results = results.filter(entry => 
          entry.audience.some(audience => audience.type === filters.audienceType)
        )
      }
    }

    return results
  }

  /**
   * Get all entries in the index
   */
  getAllEntries(): SearchIndex[] {
    return [...this.index]
  }

  /**
   * Clear the index
   */
  clearIndex(): void {
    this.index = []
  }

  /**
   * Extract plain text content from content blocks
   */
  private extractTextContent(contentBlocks: ContentBlock[]): string {
    return contentBlocks
      .map(block => {
        // Remove HTML tags for search indexing
        return block.content.replace(/<[^>]*>/g, ' ')
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  }
}

// Error handling utilities
export function isContentParseError(result: unknown): result is ContentParseError {
  return typeof result === 'object' && 
         result !== null && 
         'type' in result && 
         'message' in result
}

export function formatContentError(error: ContentParseError): string {
  switch (error.type) {
    case 'frontmatter':
      return `Frontmatter validation failed: ${error.message}`
    case 'markdown':
      return `Markdown parsing failed: ${error.message}`
    case 'validation':
      return `Content validation failed: ${error.message}`
    default:
      return `Unknown error: ${error.message}`
  }
}