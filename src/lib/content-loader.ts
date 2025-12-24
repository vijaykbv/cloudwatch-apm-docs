import * as fs from 'fs/promises'
import * as path from 'path'
import { ContentParser, ContentIndexer, isContentParseError, type ContentParseError } from './content-parser'
import type { DocumentationPage } from '../types'

export interface ContentLoadResult {
  pages: DocumentationPage[]
  errors: Array<{ filePath: string; error: ContentParseError }>
}

export class ContentLoader {
  private parser = new ContentParser()
  private indexer = new ContentIndexer()
  private contentDirectory: string

  constructor(contentDirectory: string = 'content') {
    this.contentDirectory = contentDirectory
  }

  /**
   * Load all markdown files from the content directory
   */
  async loadAllContent(): Promise<ContentLoadResult> {
    const pages: DocumentationPage[] = []
    const errors: Array<{ filePath: string; error: ContentParseError }> = []

    try {
      const markdownFiles = await this.findMarkdownFiles(this.contentDirectory)
      
      for (const filePath of markdownFiles) {
        try {
          const page = await this.loadSingleFile(filePath)
          if (isContentParseError(page)) {
            errors.push({ filePath, error: page })
          } else {
            pages.push(page)
            this.indexer.addToIndex(page)
          }
        } catch (error) {
          errors.push({
            filePath,
            error: {
              type: 'markdown',
              message: 'Failed to load file',
              details: error
            }
          })
        }
      }
    } catch (error) {
      errors.push({
        filePath: this.contentDirectory,
        error: {
          type: 'markdown',
          message: 'Failed to scan content directory',
          details: error
        }
      })
    }

    return { pages, errors }
  }

  /**
   * Load a single markdown file
   */
  async loadSingleFile(filePath: string): Promise<DocumentationPage | ContentParseError> {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const stats = await fs.stat(filePath)
      
      // Parse the markdown content
      const parseResult = await this.parser.parseMarkdown(content)
      if (isContentParseError(parseResult)) {
        return parseResult
      }

      // Generate ID from file path
      const id = this.generateIdFromPath(filePath)
      
      // Create documentation page
      const page = this.parser.createDocumentationPage(
        id,
        parseResult,
        stats.mtime
      )

      return page
    } catch (error) {
      return {
        type: 'markdown',
        message: 'Failed to read file',
        details: error
      }
    }
  }

  /**
   * Get the search indexer
   */
  getIndexer(): ContentIndexer {
    return this.indexer
  }

  /**
   * Reload content and update index
   */
  async reloadContent(): Promise<ContentLoadResult> {
    this.indexer.clearIndex()
    return this.loadAllContent()
  }

  /**
   * Find all markdown files in a directory recursively
   */
  private async findMarkdownFiles(directory: string): Promise<string[]> {
    const files: string[] = []
    
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name)
        
        if (entry.isDirectory()) {
          // Recursively search subdirectories
          const subFiles = await this.findMarkdownFiles(fullPath)
          files.push(...subFiles)
        } else if (entry.isFile() && this.isMarkdownFile(entry.name)) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
      console.warn(`Could not read directory ${directory}:`, error)
    }
    
    return files
  }

  /**
   * Check if a file is a markdown file
   */
  private isMarkdownFile(filename: string): boolean {
    return filename.toLowerCase().endsWith('.md') || filename.toLowerCase().endsWith('.markdown')
  }

  /**
   * Generate a unique ID from file path
   */
  private generateIdFromPath(filePath: string): string {
    // Remove content directory prefix and file extension
    const relativePath = path.relative(this.contentDirectory, filePath)
    const withoutExtension = relativePath.replace(/\.(md|markdown)$/i, '')
    
    // Convert to kebab-case and ensure it's a valid ID
    return withoutExtension
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-') || 'untitled'
  }
}

// Utility functions for content management
export async function validateContentStructure(contentDirectory: string): Promise<{
  isValid: boolean
  errors: string[]
  warnings: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Check if content directory exists
    await fs.access(contentDirectory)
  } catch {
    errors.push(`Content directory '${contentDirectory}' does not exist`)
    return { isValid: false, errors, warnings }
  }

  try {
    const loader = new ContentLoader(contentDirectory)
    const result = await loader.loadAllContent()
    
    // Check for loading errors
    if (result.errors.length > 0) {
      result.errors.forEach(({ filePath, error }) => {
        errors.push(`${filePath}: ${error.message}`)
      })
    }

    // Check for content coverage
    const categories = new Set(result.pages.map(page => page.category))
    const expectedCategories = [
      'getting-started',
      'implementation',
      'configuration',
      'examples',
      'api-reference',
      'troubleshooting'
    ]

    expectedCategories.forEach(category => {
      if (!categories.has(category as any)) {
        warnings.push(`No content found for category: ${category}`)
      }
    })

    // Check for orphaned pages (no related pages)
    const pagesWithoutRelated = result.pages.filter(page => page.relatedPages.length === 0)
    if (pagesWithoutRelated.length > result.pages.length * 0.5) {
      warnings.push(`Many pages (${pagesWithoutRelated.length}) have no related pages - consider adding cross-references`)
    }

  } catch (error) {
    errors.push(`Failed to validate content structure: ${error}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}