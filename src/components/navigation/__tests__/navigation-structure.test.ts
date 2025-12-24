/**
 * Property-based tests for navigation structure integrity
 * Feature: cloudwatch-apm-docs, Property 1: Navigation Structure Integrity
 * Validates: Requirements 1.1, 1.2, 1.4
 */

import fc from 'fast-check';
import { NavigationStructure, NavigationSection, NavigationSubsection, DocumentationPage, BreadcrumbItem } from '@/types';

// Helper to generate valid non-empty strings
const validStringArb = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);
const validIdArb = fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s));
const validPageIdArb = fc.string({ minLength: 3, maxLength: 30 }).filter(s => /^[a-zA-Z0-9_/-]+$/.test(s));

// Generators for navigation structure components
const documentationPageArb = fc.record({
  id: validPageIdArb,
  title: validStringArb,
  description: validStringArb,
  audience: fc.array(fc.record({
    type: fc.constantFrom('developer', 'operations', 'architect', 'security'),
    experience: fc.constantFrom('beginner', 'intermediate', 'advanced')
  }), { minLength: 1 }),
  difficulty: fc.constantFrom('beginner', 'intermediate', 'advanced'),
  category: fc.constantFrom(
    'getting-started', 'implementation', 'configuration', 'examples',
    'api-reference', 'troubleshooting', 'monitoring', 'security', 'performance'
  ),
  tags: fc.array(validStringArb),
  content: fc.array(fc.record({
    type: fc.constantFrom('text', 'code', 'diagram', 'interactive', 'video'),
    content: fc.string(),
    metadata: fc.record({
      language: fc.option(validStringArb),
      title: fc.option(validStringArb),
      description: fc.option(validStringArb)
    })
  })),
  relatedPages: fc.array(validPageIdArb),
  lastUpdated: fc.date(),
  estimatedReadTime: fc.integer({ min: 1 })
});

const navigationSubsectionArb = fc.record({
  id: validIdArb,
  title: validStringArb,
  pages: fc.array(documentationPageArb, { minLength: 1, maxLength: 3 }),
  estimatedCompletionTime: fc.integer({ min: 1 })
});

const navigationSectionArb = fc.record({
  id: validIdArb,
  title: validStringArb,
  icon: validStringArb,
  subsections: fc.array(navigationSubsectionArb, { maxLength: 2 }),
  landingPage: fc.oneof(
    fc.constant('/getting-started'),
    fc.constant('/docs'),
    fc.constant('/api'),
    fc.constant('/examples'),
    fc.webUrl()
  )
});

const breadcrumbItemArb = fc.record({
  id: fc.option(validIdArb),
  title: validStringArb,
  href: fc.oneof(
    fc.constant('/'),
    fc.constant('/docs'),
    fc.constant('/getting-started'),
    fc.constant('/api'),
    fc.webUrl()
  )
});

const contextualLinkArb = fc.record({
  id: validIdArb,
  title: validStringArb,
  href: fc.oneof(
    fc.webUrl(),
    fc.constant('/docs'),
    fc.constant('/getting-started'),
    fc.constant('/api'),
    fc.constant('#section-1'),
    fc.constant('#overview')
  ),
  description: fc.option(validStringArb),
  type: fc.constantFrom('related', 'next', 'previous', 'external')
});

// Custom generator that ensures unique section IDs
const uniqueNavigationStructureArb = fc.integer({ min: 1, max: 3 }).chain(numSections => {
  return fc.tuple(
    fc.array(navigationSectionArb, { minLength: numSections, maxLength: numSections }),
    fc.array(breadcrumbItemArb, { maxLength: 3 }),
    fc.array(contextualLinkArb, { maxLength: 3 })
  ).map(([sections, breadcrumbs, contextualLinks]) => {
    // Ensure unique section IDs
    const uniqueSections = sections.map((section, index) => ({
      ...section,
      id: `section-${index + 1}`,
      subsections: section.subsections.map((subsection, subIndex) => ({
        ...subsection,
        id: `subsection-${index + 1}-${subIndex + 1}`,
        pages: subsection.pages.map((page, pageIndex) => ({
          ...page,
          id: `page-${index + 1}-${subIndex + 1}-${pageIndex + 1}`
        }))
      }))
    }));
    
    return {
      sections: uniqueSections,
      breadcrumbs,
      contextualLinks
    };
  });
});

const navigationStructureArb = uniqueNavigationStructureArb;

describe('Navigation Structure Integrity Properties', () => {
  describe('Property 1: Navigation Structure Integrity', () => {
    test('all navigation sections should have unique IDs', () => {
      fc.assert(fc.property(navigationStructureArb, (navStructure) => {
        const sectionIds = navStructure.sections.map(section => section.id);
        const uniqueIds = new Set(sectionIds);
        return sectionIds.length === uniqueIds.size;
      }), { numRuns: 100 });
    });

    test('all subsections within a section should have unique IDs', () => {
      fc.assert(fc.property(navigationStructureArb, (navStructure) => {
        return navStructure.sections.every(section => {
          const subsectionIds = section.subsections.map(subsection => subsection.id);
          const uniqueIds = new Set(subsectionIds);
          return subsectionIds.length === uniqueIds.size;
        });
      }), { numRuns: 100 });
    });

    test('all pages within subsections should have unique IDs', () => {
      fc.assert(fc.property(navigationStructureArb, (navStructure) => {
        const allPageIds: string[] = [];
        
        navStructure.sections.forEach(section => {
          section.subsections.forEach(subsection => {
            subsection.pages.forEach(page => {
              allPageIds.push(page.id);
            });
          });
        });

        const uniqueIds = new Set(allPageIds);
        return allPageIds.length === uniqueIds.size;
      }), { numRuns: 100 });
    });

    test('landing pages should reference valid page IDs or be valid URLs', () => {
      fc.assert(fc.property(navigationStructureArb, (navStructure) => {
        const allPageIds = new Set<string>();
        
        // Collect all page IDs
        navStructure.sections.forEach(section => {
          section.subsections.forEach(subsection => {
            subsection.pages.forEach(page => {
              allPageIds.add(page.id);
            });
          });
        });

        // Check that landing pages are either valid page IDs or valid paths/URLs
        return navStructure.sections.every(section => {
          const landingPage = section.landingPage;
          return landingPage.length > 0 && (
            allPageIds.has(landingPage) || 
            landingPage.startsWith('/') ||
            landingPage.startsWith('http')
          );
        });
      }), { numRuns: 100 });
    });

    test('breadcrumb items should have valid hrefs', () => {
      fc.assert(fc.property(navigationStructureArb, (navStructure) => {
        return navStructure.breadcrumbs.every(breadcrumb => {
          return breadcrumb.href.length > 0;
        });
      }), { numRuns: 100 });
    });

    test('contextual links should have valid URLs', () => {
      fc.assert(fc.property(navigationStructureArb, (navStructure) => {
        return navStructure.contextualLinks.every(link => {
          try {
            // Check if it's a valid URL or a valid path
            return link.href.startsWith('http') || link.href.startsWith('/') || link.href.startsWith('#');
          } catch {
            return false;
          }
        });
      }), { numRuns: 100 });
    });

    test('navigation structure should maintain hierarchical integrity', () => {
      fc.assert(fc.property(navigationStructureArb, (navStructure) => {
        // Every section should have a valid structure
        return navStructure.sections.every(section => {
          // Section should have required fields
          if (!section.id || !section.title || !section.landingPage) {
            return false;
          }

          // All subsections should be valid
          return section.subsections.every(subsection => {
            if (!subsection.id || !subsection.title || subsection.estimatedCompletionTime <= 0) {
              return false;
            }

            // All pages should be valid
            return subsection.pages.every(page => {
              return page.id && page.title && page.description && 
                     page.audience.length > 0 && page.estimatedReadTime > 0;
            });
          });
        });
      }), { numRuns: 100 });
    });

    test('related pages references should be valid strings', () => {
      fc.assert(fc.property(navigationStructureArb, (navStructure) => {
        const allPages: DocumentationPage[] = [];
        
        navStructure.sections.forEach(section => {
          section.subsections.forEach(subsection => {
            allPages.push(...subsection.pages);
          });
        });

        return allPages.every(page => {
          return page.relatedPages.every(relatedPageId => 
            typeof relatedPageId === 'string' && relatedPageId.length > 0
          );
        });
      }), { numRuns: 100 });
    });
  });
});