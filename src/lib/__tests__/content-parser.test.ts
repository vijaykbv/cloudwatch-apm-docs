import { ContentParser, ContentIndexer, isContentParseError } from '../content-parser'

// Mock remark and related modules
jest.mock('remark', () => ({
  remark: () => ({
    use: jest.fn().mockReturnThis(),
    process: jest.fn().mockResolvedValue({
      toString: () => '<h1>Test Content</h1><p>This is a test page with some <strong>bold</strong> text and a <a href="https://example.com">link</a>.</p><h2>Code Example</h2><pre><code class="language-javascript">console.log(\'Hello, world!\')</code></pre>'
    })
  })
}))

jest.mock('remark-html', () => ({}))
jest.mock('remark-gfm', () => ({}))

describe('ContentParser', () => {
  let parser: ContentParser

  beforeEach(() => {
    parser = new ContentParser()
  })

  describe('parseMarkdown', () => {
    it('should parse valid markdown with frontmatter', async () => {
      const markdownContent = `---
title: Test Page
description: A test page for CloudWatch APM
audience:
  - type: developer
    experience: beginner
difficulty: beginner
category: getting-started
tags: [test, example]
relatedPages: [other-page]
estimatedReadTime: 5
---

# Test Content

This is a test page with some **bold** text and a [link](https://example.com).

## Code Example

\`\`\`javascript
console.log('Hello, world!')
\`\`\`
`

      const result = await parser.parseMarkdown(markdownContent)
      
      expect(isContentParseError(result)).toBe(false)
      
      if (!isContentParseError(result)) {
        expect(result.frontmatter.title).toBe('Test Page')
        expect(result.frontmatter.description).toBe('A test page for CloudWatch APM')
        expect(result.frontmatter.audience).toHaveLength(1)
        expect(result.frontmatter.audience[0].type).toBe('developer')
        expect(result.frontmatter.audience[0].experience).toBe('beginner')
        expect(result.frontmatter.difficulty).toBe('beginner')
        expect(result.frontmatter.category).toBe('getting-started')
        expect(result.frontmatter.tags).toEqual(['test', 'example'])
        expect(result.frontmatter.relatedPages).toEqual(['other-page'])
        expect(result.frontmatter.estimatedReadTime).toBe(5)
        
        expect(result.content).toContain('# Test Content')
        expect(result.content).toContain('This is a test page')
        expect(result.htmlContent).toContain('<h1>Test Content</h1>')
        expect(result.htmlContent).toContain('<strong>bold</strong>')
        expect(result.htmlContent).toContain('<a href="https://example.com">link</a>')
        expect(result.htmlContent).toContain('console.log(\'Hello, world!\')')
      }
    })

    it('should handle markdown without optional frontmatter fields', async () => {
      const markdownContent = `---
title: Minimal Page
description: A minimal test page
audience:
  - type: operations
    experience: intermediate
difficulty: intermediate
category: implementation
---

# Minimal Content

Just some basic content.
`

      const result = await parser.parseMarkdown(markdownContent)
      
      expect(isContentParseError(result)).toBe(false)
      
      if (!isContentParseError(result)) {
        expect(result.frontmatter.title).toBe('Minimal Page')
        expect(result.frontmatter.tags).toEqual([]) // Default empty array
        expect(result.frontmatter.relatedPages).toEqual([]) // Default empty array
        expect(result.frontmatter.estimatedReadTime).toBeUndefined()
      }
    })

    it('should return error for invalid frontmatter', async () => {
      const markdownContent = `---
title: ""
description: Valid description
audience: []
difficulty: invalid-difficulty
category: getting-started
---

# Content
`

      const result = await parser.parseMarkdown(markdownContent)
      
      expect(isContentParseError(result)).toBe(true)
      
      if (isContentParseError(result)) {
        expect(result.type).toBe('frontmatter')
        expect(result.message).toBe('Invalid frontmatter structure')
      }
    })

    it('should return error for missing required frontmatter fields', async () => {
      const markdownContent = `---
title: Test Page
# Missing description, audience, difficulty, category
---

# Content
`

      const result = await parser.parseMarkdown(markdownContent)
      
      expect(isContentParseError(result)).toBe(true)
      
      if (isContentParseError(result)) {
        expect(result.type).toBe('frontmatter')
      }
    })

    it('should handle malformed markdown gracefully', async () => {
      const markdownContent = `---
title: Test
description: Test
audience:
  - type: developer
    experience: beginner
difficulty: beginner
category: getting-started
---

# Unclosed [link
`

      const result = await parser.parseMarkdown(markdownContent)
      
      // Should still parse successfully even with malformed markdown
      expect(isContentParseError(result)).toBe(false)
    })
  })

  describe('createDocumentationPage', () => {
    it('should create valid documentation page from parsed content', async () => {
      const markdownContent = `---
title: API Reference
description: Complete API documentation
audience:
  - type: developer
    experience: advanced
difficulty: advanced
category: api-reference
tags: [api, reference]
---

# API Documentation

Complete API reference.
`

      const parseResult = await parser.parseMarkdown(markdownContent)
      expect(isContentParseError(parseResult)).toBe(false)
      
      if (!isContentParseError(parseResult)) {
        const page = parser.createDocumentationPage('api-ref', parseResult)
        
        expect(isContentParseError(page)).toBe(false)
        
        if (!isContentParseError(page)) {
          expect(page.id).toBe('api-ref')
          expect(page.title).toBe('API Reference')
          expect(page.description).toBe('Complete API documentation')
          expect(page.content).toHaveLength(1)
          expect(page.content[0].type).toBe('text')
          expect(page.content[0].content).toContain('Test Content')
          expect(page.estimatedReadTime).toBeGreaterThan(0)
          expect(page.lastUpdated).toBeInstanceOf(Date)
        }
      }
    })

    it('should calculate estimated read time when not provided', async () => {
      const longContent = `---
title: Long Article
description: A very long article
audience:
  - type: developer
    experience: beginner
difficulty: beginner
category: getting-started
---

# Long Article

${'This is a long paragraph with many words. '.repeat(100)}
`

      const parseResult = await parser.parseMarkdown(longContent)
      expect(isContentParseError(parseResult)).toBe(false)
      
      if (!isContentParseError(parseResult)) {
        const page = parser.createDocumentationPage('long-article', parseResult)
        
        expect(isContentParseError(page)).toBe(false)
        
        if (!isContentParseError(page)) {
          expect(page.estimatedReadTime).toBeGreaterThan(1)
        }
      }
    })

    it('should use provided estimated read time', async () => {
      const markdownContent = `---
title: Timed Article
description: Article with specific read time
audience:
  - type: developer
    experience: beginner
difficulty: beginner
category: getting-started
estimatedReadTime: 10
---

# Short content
`

      const parseResult = await parser.parseMarkdown(markdownContent)
      expect(isContentParseError(parseResult)).toBe(false)
      
      if (!isContentParseError(parseResult)) {
        const page = parser.createDocumentationPage('timed-article', parseResult)
        
        expect(isContentParseError(page)).toBe(false)
        
        if (!isContentParseError(page)) {
          expect(page.estimatedReadTime).toBe(10)
        }
      }
    })
  })
})

describe('ContentIndexer', () => {
  let indexer: ContentIndexer

  beforeEach(() => {
    indexer = new ContentIndexer()
  })

  describe('addToIndex and search', () => {
    it('should add pages to index and search them', () => {
      const page1 = {
        id: 'page1',
        title: 'Getting Started with CloudWatch APM',
        description: 'Learn how to set up CloudWatch APM',
        audience: [{ type: 'developer' as const, experience: 'beginner' as const }],
        difficulty: 'beginner' as const,
        category: 'getting-started' as const,
        tags: ['setup', 'beginner'],
        content: [{ 
          type: 'text' as const, 
          content: '<p>This guide covers the basics of CloudWatch APM setup</p>',
          metadata: {}
        }],
        relatedPages: [],
        lastUpdated: new Date(),
        estimatedReadTime: 5
      }

      const page2 = {
        id: 'page2',
        title: 'Advanced Configuration',
        description: 'Advanced CloudWatch APM configuration options',
        audience: [{ type: 'operations' as const, experience: 'advanced' as const }],
        difficulty: 'advanced' as const,
        category: 'configuration' as const,
        tags: ['advanced', 'config'],
        content: [{ 
          type: 'text' as const, 
          content: '<p>Advanced configuration for production environments</p>',
          metadata: {}
        }],
        relatedPages: ['page1'],
        lastUpdated: new Date(),
        estimatedReadTime: 15
      }

      indexer.addToIndex(page1)
      indexer.addToIndex(page2)

      // Search by title
      const titleResults = indexer.search('Getting Started')
      expect(titleResults).toHaveLength(1)
      expect(titleResults[0].id).toBe('page1')

      // Search by description
      const descResults = indexer.search('configuration options')
      expect(descResults).toHaveLength(1)
      expect(descResults[0].id).toBe('page2')

      // Search by tag
      const tagResults = indexer.search('advanced')
      expect(tagResults).toHaveLength(1)
      expect(tagResults[0].id).toBe('page2')

      // Search by content
      const contentResults = indexer.search('production environments')
      expect(contentResults).toHaveLength(1)
      expect(contentResults[0].id).toBe('page2')
    })

    it('should filter search results by category', () => {
      const page1 = {
        id: 'page1',
        title: 'CloudWatch Setup',
        description: 'Setup guide',
        audience: [{ type: 'developer' as const, experience: 'beginner' as const }],
        difficulty: 'beginner' as const,
        category: 'getting-started' as const,
        tags: [],
        content: [{ type: 'text' as const, content: 'Setup content', metadata: {} }],
        relatedPages: [],
        lastUpdated: new Date(),
        estimatedReadTime: 5
      }

      const page2 = {
        id: 'page2',
        title: 'CloudWatch Config',
        description: 'Configuration guide',
        audience: [{ type: 'developer' as const, experience: 'beginner' as const }],
        difficulty: 'beginner' as const,
        category: 'configuration' as const,
        tags: [],
        content: [{ type: 'text' as const, content: 'Config content', metadata: {} }],
        relatedPages: [],
        lastUpdated: new Date(),
        estimatedReadTime: 5
      }

      indexer.addToIndex(page1)
      indexer.addToIndex(page2)

      // Search without filter
      const allResults = indexer.search('CloudWatch')
      expect(allResults).toHaveLength(2)

      // Search with category filter
      const filteredResults = indexer.search('CloudWatch', { category: 'getting-started' })
      expect(filteredResults).toHaveLength(1)
      expect(filteredResults[0].id).toBe('page1')
    })

    it('should return empty results for non-matching queries', () => {
      const page = {
        id: 'page1',
        title: 'CloudWatch Guide',
        description: 'A guide to CloudWatch',
        audience: [{ type: 'developer' as const, experience: 'beginner' as const }],
        difficulty: 'beginner' as const,
        category: 'getting-started' as const,
        tags: ['guide'],
        content: [{ type: 'text' as const, content: 'Guide content', metadata: {} }],
        relatedPages: [],
        lastUpdated: new Date(),
        estimatedReadTime: 5
      }

      indexer.addToIndex(page)

      const results = indexer.search('nonexistent term')
      expect(results).toHaveLength(0)
    })

    it('should update existing entries when re-adding same ID', () => {
      const originalPage = {
        id: 'page1',
        title: 'Original Title',
        description: 'Original description',
        audience: [{ type: 'developer' as const, experience: 'beginner' as const }],
        difficulty: 'beginner' as const,
        category: 'getting-started' as const,
        tags: ['original'],
        content: [{ type: 'text' as const, content: 'Original content', metadata: {} }],
        relatedPages: [],
        lastUpdated: new Date(),
        estimatedReadTime: 5
      }

      const updatedPage = {
        ...originalPage,
        title: 'Updated Title',
        description: 'Updated description',
        content: [{ type: 'text' as const, content: 'Updated content', metadata: {} }],
        tags: ['updated']
      }

      indexer.addToIndex(originalPage)
      indexer.addToIndex(updatedPage)

      const results = indexer.search('Updated')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Updated Title')

      const originalResults = indexer.search('Original')
      expect(originalResults).toHaveLength(0)
    })
  })

  describe('clearIndex', () => {
    it('should clear all entries from index', () => {
      const page = {
        id: 'page1',
        title: 'Test Page',
        description: 'Test description',
        audience: [{ type: 'developer' as const, experience: 'beginner' as const }],
        difficulty: 'beginner' as const,
        category: 'getting-started' as const,
        tags: [],
        content: [{ type: 'text' as const, content: 'Test content', metadata: {} }],
        relatedPages: [],
        lastUpdated: new Date(),
        estimatedReadTime: 5
      }

      indexer.addToIndex(page)
      expect(indexer.getAllEntries()).toHaveLength(1)

      indexer.clearIndex()
      expect(indexer.getAllEntries()).toHaveLength(0)
    })
  })
})