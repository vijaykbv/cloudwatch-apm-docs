/**
 * Property-based tests for content organization by journey stage
 * Feature: cloudwatch-apm-docs, Property 2: Content Organization by Journey Stage
 * Validates: Requirements 1.3
 */

import fc from 'fast-check';
import { ContentOrganizer, JOURNEY_STAGES } from '../content-organization';
import { DocumentationPage, UserAudience, ContentCategory } from '@/types';

// Generators for content organization testing
const userAudienceArb = fc.record({
  type: fc.constantFrom('developer', 'operations', 'architect', 'security'),
  experience: fc.constantFrom('beginner', 'intermediate', 'advanced')
});

const documentationPageArb = fc.record({
  id: fc.string({ minLength: 1 }),
  title: fc.string({ minLength: 1 }),
  description: fc.string({ minLength: 1 }),
  audience: fc.array(userAudienceArb, { minLength: 1 }),
  difficulty: fc.constantFrom('beginner', 'intermediate', 'advanced'),
  category: fc.constantFrom(
    'getting-started', 'implementation', 'configuration', 'examples',
    'api-reference', 'troubleshooting', 'monitoring', 'security', 'performance'
  ),
  tags: fc.array(fc.string()),
  content: fc.array(fc.record({
    type: fc.constantFrom('text', 'code', 'diagram', 'interactive', 'video'),
    content: fc.string(),
    metadata: fc.record({
      language: fc.option(fc.string()),
      title: fc.option(fc.string()),
      description: fc.option(fc.string())
    })
  })),
  relatedPages: fc.array(fc.string()),
  lastUpdated: fc.date(),
  estimatedReadTime: fc.integer({ min: 1, max: 120 })
});

const documentationPagesArb = fc.array(documentationPageArb, { minLength: 1, maxLength: 50 });

describe('Content Organization Properties', () => {
  let organizer: ContentOrganizer;

  beforeEach(() => {
    organizer = new ContentOrganizer();
  });

  describe('Property 2: Content Organization by Journey Stage', () => {
    test('all content should be categorized into exactly one primary journey stage', () => {
      fc.assert(fc.property(documentationPagesArb, (pages) => {
        const organizedContent = organizer.organizeByJourneyStages(pages);
        
        // Count total pages across all stages
        const totalPagesInStages = organizedContent.reduce(
          (total, stage) => total + stage.content.length, 
          0
        );

        // Each page should appear in exactly one stage based on its category
        const expectedTotal = pages.filter(page => 
          JOURNEY_STAGES.some(stage => stage.categories.includes(page.category))
        ).length;

        return totalPagesInStages === expectedTotal;
      }), { numRuns: 100 });
    });

    test('journey stages should maintain proper ordering', () => {
      fc.assert(fc.property(documentationPagesArb, (pages) => {
        const organizedContent = organizer.organizeByJourneyStages(pages);
        
        // Verify stages are in correct order
        for (let i = 1; i < organizedContent.length; i++) {
          if (organizedContent[i].stage.order <= organizedContent[i - 1].stage.order) {
            return false;
          }
        }
        
        return true;
      }), { numRuns: 100 });
    });

    test('content within stages should have appropriate metadata', () => {
      fc.assert(fc.property(documentationPagesArb, (pages) => {
        const organizedContent = organizer.organizeByJourneyStages(pages);
        
        return organizedContent.every(stageContent => {
          // Each stage should have valid metadata
          if (!stageContent.stage.id || !stageContent.stage.name) {
            return false;
          }

          // Estimated duration should be sum of page read times
          const expectedDuration = stageContent.content.reduce(
            (total, page) => total + page.estimatedReadTime, 
            0
          );
          
          if (stageContent.estimatedDuration !== expectedDuration) {
            return false;
          }

          // Completion criteria should exist
          if (!Array.isArray(stageContent.completionCriteria)) {
            return false;
          }

          // All content should belong to stage categories
          return stageContent.content.every(page =>
            stageContent.stage.categories.includes(page.category)
          );
        });
      }), { numRuns: 100 });
    });

    test('audience filtering should return only relevant content', () => {
      fc.assert(fc.property(documentationPagesArb, userAudienceArb, (pages, targetAudience) => {
        const filteredContent = organizer.filterByAudience(pages, targetAudience);
        
        return filteredContent.every(page =>
          page.audience.some(audience => audience.type === targetAudience.type)
        );
      }), { numRuns: 100 });
    });

    test('progressive disclosure should separate content by difficulty levels', () => {
      fc.assert(fc.property(documentationPagesArb, (pages) => {
        const progressiveContent = organizer.createProgressiveDisclosure(pages);
        
        // Should have exactly 3 levels
        if (progressiveContent.length !== 3) {
          return false;
        }

        const levels = progressiveContent.map(pc => pc.level);
        const expectedLevels = ['basic', 'intermediate', 'advanced'];
        
        if (!expectedLevels.every(level => levels.includes(level))) {
          return false;
        }

        // Content should be properly categorized by difficulty
        return progressiveContent.every(levelContent => {
          const expectedDifficulty = levelContent.level === 'basic' ? 'beginner' :
                                   levelContent.level === 'intermediate' ? 'intermediate' : 'advanced';
          
          return levelContent.content.every(page => page.difficulty === expectedDifficulty);
        });
      }), { numRuns: 100 });
    });

    test('content filters should properly combine multiple criteria', () => {
      fc.assert(fc.property(
        documentationPagesArb,
        userAudienceArb,
        fc.constantFrom('beginner', 'intermediate', 'advanced'),
        fc.constantFrom(
          'getting-started', 'implementation', 'configuration', 'examples',
          'api-reference', 'troubleshooting', 'monitoring', 'security', 'performance'
        ),
        (pages, audience, difficulty, category) => {
          const filters = { audience, difficulty, category };
          const filteredContent = organizer.applyFilters(pages, filters);
          
          return filteredContent.every(page =>
            page.audience.some(aud => aud.type === audience.type) &&
            page.difficulty === difficulty &&
            page.category === category
          );
        }
      ), { numRuns: 100 });
    });

    test('audience-specific organization should group content appropriately', () => {
      fc.assert(fc.property(documentationPagesArb, (pages) => {
        const audienceContent = organizer.organizeByAudience(pages);
        
        const expectedAudiences = ['developer', 'operations', 'architect', 'security'];
        
        // Should have content for all audience types
        if (!expectedAudiences.every(audience => audience in audienceContent)) {
          return false;
        }

        // Each audience group should only contain relevant content
        return expectedAudiences.every(audienceType =>
          audienceContent[audienceType].every(page =>
            page.audience.some(audience => audience.type === audienceType)
          )
        );
      }), { numRuns: 100 });
    });

    test('recommended content should exclude current page and return valid recommendations', () => {
      fc.assert(fc.property(documentationPagesArb, (pages) => {
        if (pages.length < 2) return true; // Skip if not enough pages
        
        const currentPage = pages[0];
        const recommendations = organizer.getRecommendedContent(currentPage, pages, 3);
        
        // Should not include current page
        if (recommendations.some(page => page.id === currentPage.id)) {
          return false;
        }

        // Should not exceed requested limit
        if (recommendations.length > 3) {
          return false;
        }

        // All recommendations should be from the original pages
        return recommendations.every(rec =>
          pages.some(page => page.id === rec.id)
        );
      }), { numRuns: 100 });
    });

    test('journey stage content should have valid completion criteria', () => {
      fc.assert(fc.property(documentationPagesArb, (pages) => {
        const organizedContent = organizer.organizeByJourneyStages(pages);
        
        return organizedContent.every(stageContent => {
          // Completion criteria should be an array of strings
          if (!Array.isArray(stageContent.completionCriteria)) {
            return false;
          }

          // Should have at least one criterion for stages with content
          if (stageContent.content.length > 0 && stageContent.completionCriteria.length === 0) {
            return false;
          }

          // All criteria should be non-empty strings
          return stageContent.completionCriteria.every(criterion =>
            typeof criterion === 'string' && criterion.length > 0
          );
        });
      }), { numRuns: 100 });
    });
  });
});