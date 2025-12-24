import * as fc from 'fast-check'
import {
  DocumentationPageSchema,
  UserAudienceSchema,
  ContentBlockSchema,
  NavigationStructureSchema,
  UserJourneySchema,
  type DocumentationPage,
  type UserAudience,
  type ContentBlock,
  type NavigationStructure,
  type UserJourney
} from '../index'

// Property-based test generators
const userAudienceArb = fc.record({
  type: fc.constantFrom('developer', 'operations', 'architect', 'security'),
  experience: fc.constantFrom('beginner', 'intermediate', 'advanced')
})

const contentBlockArb = fc.record({
  type: fc.constantFrom('text', 'code', 'diagram', 'interactive', 'video'),
  content: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  metadata: fc.record({
    language: fc.option(fc.string(), { nil: undefined }),
    title: fc.option(fc.string(), { nil: undefined }),
    description: fc.option(fc.string(), { nil: undefined })
  })
})

const documentationPageArb = fc.record({
  id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
  audience: fc.array(userAudienceArb, { minLength: 1 }),
  difficulty: fc.constantFrom('beginner', 'intermediate', 'advanced'),
  category: fc.constantFrom(
    'getting-started',
    'implementation',
    'configuration',
    'examples',
    'api-reference',
    'troubleshooting',
    'monitoring',
    'security',
    'performance'
  ),
  tags: fc.array(fc.string()),
  content: fc.array(contentBlockArb),
  relatedPages: fc.array(fc.string()),
  lastUpdated: fc.date(),
  estimatedReadTime: fc.integer({ min: 1 })
})

describe('Content Structure Validation Property Tests', () => {
  /**
   * Property 10: Content Metadata Consistency
   * **Validates: Requirements 1.3, 2.2**
   */
  it('Property 10: Content Metadata Consistency - For any documentation page, all required metadata fields should be present and follow the defined schema', () => {
    fc.assert(
      fc.property(documentationPageArb, (page: DocumentationPage) => {
        // Test that the generated page validates against our schema
        const result = DocumentationPageSchema.safeParse(page)
        
        // The property should hold: all valid pages should pass schema validation
        expect(result.success).toBe(true)
        
        if (result.success) {
          // Additional consistency checks
          expect(page.id).toBeTruthy()
          expect(page.title).toBeTruthy()
          expect(page.description).toBeTruthy()
          expect(page.audience.length).toBeGreaterThan(0)
          expect(page.estimatedReadTime).toBeGreaterThan(0)
          
          // Ensure all content blocks have valid types
          page.content.forEach(block => {
            expect(['text', 'code', 'diagram', 'interactive', 'video']).toContain(block.type)
            expect(block.content).toBeTruthy()
          })
          
          // Ensure all audience entries are valid
          page.audience.forEach(audience => {
            expect(['developer', 'operations', 'architect', 'security']).toContain(audience.type)
            expect(['beginner', 'intermediate', 'advanced']).toContain(audience.experience)
          })
        }
      }),
      { numRuns: 100 }
    )
  })

  it('Property 10a: UserAudience Schema Consistency - For any user audience, it should follow the defined schema', () => {
    fc.assert(
      fc.property(userAudienceArb, (audience: UserAudience) => {
        const result = UserAudienceSchema.safeParse(audience)
        expect(result.success).toBe(true)
        
        if (result.success) {
          expect(['developer', 'operations', 'architect', 'security']).toContain(audience.type)
          expect(['beginner', 'intermediate', 'advanced']).toContain(audience.experience)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('Property 10b: ContentBlock Schema Consistency - For any content block, it should follow the defined schema', () => {
    fc.assert(
      fc.property(contentBlockArb, (block: ContentBlock) => {
        const result = ContentBlockSchema.safeParse(block)
        
        expect(result.success).toBe(true)
        
        if (result.success) {
          expect(['text', 'code', 'diagram', 'interactive', 'video']).toContain(block.type)
          expect(block.content).toBeTruthy()
          expect(typeof block.metadata).toBe('object')
        }
      }),
      { numRuns: 100 }
    )
  })

  // Test invalid data to ensure schema validation works
  it('Property 10c: Schema Validation Rejects Invalid Data - For any invalid documentation page, schema validation should fail', () => {
    const invalidPages = [
      { id: '', title: 'Test', description: 'Test' }, // Empty id
      { id: 'test', title: '', description: 'Test' }, // Empty title
      { id: 'test', title: 'Test', description: '', audience: [] }, // Empty description and audience
      { id: 'test', title: 'Test', description: 'Test', audience: [], estimatedReadTime: -1 } // Negative read time
    ]

    invalidPages.forEach(invalidPage => {
      const result = DocumentationPageSchema.safeParse(invalidPage)
      expect(result.success).toBe(false)
    })
  })
})