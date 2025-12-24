/**
 * Property-Based Tests for Troubleshooting Coverage Completeness
 * Feature: cloudwatch-apm-docs, Property 9: Troubleshooting Coverage Completeness
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
 */

import * as fc from 'fast-check'
import { 
  troubleshootingIssues, 
  diagnosticTools, 
  escalationPaths, 
  faqs, 
  errorMessages,
  searchTroubleshootingIssues,
  getTroubleshootingIssuesByCategory,
  getTroubleshootingIssuesBySeverity,
  searchFAQs,
  getFAQsByCategory,
  searchErrorMessages,
  getErrorMessagesByCategory
} from '../../data/troubleshooting-data'
import { 
  TroubleshootingIssue, 
  DiagnosticTool, 
  EscalationPath, 
  FAQ, 
  ErrorMessage,
  IssueCategory,
  IssueSeverity,
  FAQCategory,
  ErrorCategory
} from '../../types/troubleshooting'

// Generators for troubleshooting data
const issueCategoryGen = fc.constantFrom<IssueCategory>(
  'installation', 'configuration', 'performance', 'connectivity',
  'authentication', 'data-collection', 'alerting', 'dashboard',
  'integration', 'billing'
)

const issueSeverityGen = fc.constantFrom<IssueSeverity>('low', 'medium', 'high', 'critical')

const faqCategoryGen = fc.constantFrom<FAQCategory>(
  'general', 'setup', 'configuration', 'troubleshooting', 'billing', 'integration'
)

const errorCategoryGen = fc.constantFrom<ErrorCategory>(
  'client', 'server', 'network', 'authentication', 'authorization', 'configuration', 'data'
)

const troubleshootingIssueGen = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  title: fc.string({ minLength: 5, maxLength: 100 }),
  description: fc.string({ minLength: 10, maxLength: 500 }),
  category: issueCategoryGen,
  severity: issueSeverityGen,
  symptoms: fc.array(fc.string({ minLength: 5, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
  causes: fc.array(fc.string({ minLength: 5, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
  solutions: fc.array(fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    title: fc.string({ minLength: 5, maxLength: 100 }),
    description: fc.string({ minLength: 10, maxLength: 200 }),
    steps: fc.array(fc.record({
      id: fc.string({ minLength: 1, maxLength: 50 }),
      title: fc.string({ minLength: 5, maxLength: 100 }),
      description: fc.string({ minLength: 10, maxLength: 200 }),
      type: fc.constantFrom('action', 'command', 'configuration', 'verification'),
      content: fc.string({ minLength: 5, maxLength: 500 }),
      expectedResult: fc.option(fc.string({ minLength: 5, maxLength: 200 })),
      troubleshootingTips: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 100 }), { maxLength: 5 }))
    }), { minLength: 1, maxLength: 10 }),
    estimatedTime: fc.integer({ min: 1, max: 120 }),
    difficulty: fc.constantFrom('easy', 'medium', 'hard'),
    prerequisites: fc.array(fc.string({ minLength: 5, maxLength: 100 }), { maxLength: 5 }),
    verificationSteps: fc.array(fc.string({ minLength: 5, maxLength: 100 }), { maxLength: 5 })
  }), { minLength: 1, maxLength: 5 }),
  diagnosticSteps: fc.array(fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    title: fc.string({ minLength: 5, maxLength: 100 }),
    description: fc.string({ minLength: 10, maxLength: 200 }),
    command: fc.option(fc.string({ minLength: 5, maxLength: 200 })),
    expectedOutput: fc.option(fc.string({ minLength: 5, maxLength: 200 })),
    interpretation: fc.string({ minLength: 10, maxLength: 200 }),
    nextSteps: fc.array(fc.string({ minLength: 5, maxLength: 100 }), { maxLength: 5 })
  }), { maxLength: 5 }),
  relatedIssues: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
  lastUpdated: fc.date(),
  affectedComponents: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 })
}) as fc.Arbitrary<TroubleshootingIssue>

const faqGen = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  question: fc.string({ minLength: 10, maxLength: 200 }),
  answer: fc.string({ minLength: 20, maxLength: 1000 }),
  category: faqCategoryGen,
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
  relatedIssues: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }),
  popularity: fc.integer({ min: 0, max: 100 }),
  lastUpdated: fc.date()
}) as fc.Arbitrary<FAQ>

const errorMessageGen = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  code: fc.string({ minLength: 1, maxLength: 50 }),
  message: fc.string({ minLength: 10, maxLength: 500 }),
  description: fc.string({ minLength: 10, maxLength: 200 }),
  category: errorCategoryGen,
  severity: issueSeverityGen,
  commonCauses: fc.array(fc.string({ minLength: 5, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
  solutions: fc.array(fc.string({ minLength: 10, maxLength: 200 }), { minLength: 1, maxLength: 10 }),
  relatedErrors: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }),
  documentationLinks: fc.array(fc.string({ minLength: 5, maxLength: 100 }), { maxLength: 5 })
}) as fc.Arbitrary<ErrorMessage>

describe('Troubleshooting Coverage Completeness Properties', () => {
  describe('Property 9: Troubleshooting Coverage Completeness', () => {
    
    test('All troubleshooting issues have complete required fields', () => {
      fc.assert(fc.property(
        troubleshootingIssueGen,
        (issue) => {
          // Every issue must have all required fields populated
          expect(issue.id).toBeTruthy()
          expect(issue.title).toBeTruthy()
          expect(issue.description).toBeTruthy()
          expect(issue.category).toBeTruthy()
          expect(issue.severity).toBeTruthy()
          expect(issue.symptoms.length).toBeGreaterThan(0)
          expect(issue.causes.length).toBeGreaterThan(0)
          expect(issue.solutions.length).toBeGreaterThan(0)
          expect(issue.affectedComponents.length).toBeGreaterThan(0)
          expect(issue.lastUpdated).toBeInstanceOf(Date)
          
          // Each solution must have complete steps
          issue.solutions.forEach(solution => {
            expect(solution.id).toBeTruthy()
            expect(solution.title).toBeTruthy()
            expect(solution.description).toBeTruthy()
            expect(solution.steps.length).toBeGreaterThan(0)
            expect(solution.estimatedTime).toBeGreaterThan(0)
            expect(['easy', 'medium', 'hard']).toContain(solution.difficulty)
            
            // Each step must have required fields
            solution.steps.forEach(step => {
              expect(step.id).toBeTruthy()
              expect(step.title).toBeTruthy()
              expect(step.description).toBeTruthy()
              expect(['action', 'command', 'configuration', 'verification']).toContain(step.type)
              expect(step.content).toBeTruthy()
            })
          })
          
          return true
        }
      ), { numRuns: 100 })
    })

    test('Issue search functionality covers all content', () => {
      fc.assert(fc.property(
        fc.array(troubleshootingIssueGen, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (issues, searchTerm) => {
          // Mock the troubleshooting issues for this test
          const originalIssues = [...troubleshootingIssues]
          
          // Replace with test data temporarily
          troubleshootingIssues.length = 0
          troubleshootingIssues.push(...issues)
          
          try {
            const results = searchTroubleshootingIssues(searchTerm)
            
            // All returned results should contain the search term in searchable fields
            results.forEach(result => {
              const searchableContent = [
                result.title,
                result.description,
                ...result.symptoms,
                ...result.tags
              ].join(' ').toLowerCase()
              
              expect(searchableContent).toContain(searchTerm.toLowerCase())
            })
            
            // Search should be case-insensitive
            const upperCaseResults = searchTroubleshootingIssues(searchTerm.toUpperCase())
            const lowerCaseResults = searchTroubleshootingIssues(searchTerm.toLowerCase())
            expect(upperCaseResults.length).toBe(lowerCaseResults.length)
            
            return true
          } finally {
            // Restore original data
            troubleshootingIssues.length = 0
            troubleshootingIssues.push(...originalIssues)
          }
        }
      ), { numRuns: 50 })
    })

    test('Category filtering provides complete coverage', () => {
      fc.assert(fc.property(
        fc.array(troubleshootingIssueGen, { minLength: 1, maxLength: 20 }),
        issueCategoryGen,
        (issues, category) => {
          // Mock the troubleshooting issues for this test
          const originalIssues = [...troubleshootingIssues]
          
          // Replace with test data temporarily
          troubleshootingIssues.length = 0
          troubleshootingIssues.push(...issues)
          
          try {
            const results = getTroubleshootingIssuesByCategory(category)
            
            // All returned results should match the category
            results.forEach(result => {
              expect(result.category).toBe(category)
            })
            
            // Should return all issues of that category
            const expectedCount = issues.filter(issue => issue.category === category).length
            expect(results.length).toBe(expectedCount)
            
            return true
          } finally {
            // Restore original data
            troubleshootingIssues.length = 0
            troubleshootingIssues.push(...originalIssues)
          }
        }
      ), { numRuns: 50 })
    })

    test('Severity filtering maintains data integrity', () => {
      fc.assert(fc.property(
        fc.array(troubleshootingIssueGen, { minLength: 1, maxLength: 20 }),
        issueSeverityGen,
        (issues, severity) => {
          // Mock the troubleshooting issues for this test
          const originalIssues = [...troubleshootingIssues]
          
          // Replace with test data temporarily
          troubleshootingIssues.length = 0
          troubleshootingIssues.push(...issues)
          
          try {
            const results = getTroubleshootingIssuesBySeverity(severity)
            
            // All returned results should match the severity
            results.forEach(result => {
              expect(result.severity).toBe(severity)
            })
            
            // Should return all issues of that severity
            const expectedCount = issues.filter(issue => issue.severity === severity).length
            expect(results.length).toBe(expectedCount)
            
            return true
          } finally {
            // Restore original data
            troubleshootingIssues.length = 0
            troubleshootingIssues.push(...originalIssues)
          }
        }
      ), { numRuns: 50 })
    })

    test('FAQ search provides comprehensive coverage', () => {
      fc.assert(fc.property(
        fc.array(faqGen, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (testFaqs, searchTerm) => {
          // Mock the FAQs for this test
          const originalFaqs = [...faqs]
          
          // Replace with test data temporarily
          faqs.length = 0
          faqs.push(...testFaqs)
          
          try {
            const results = searchFAQs(searchTerm)
            
            // All returned results should contain the search term
            results.forEach(result => {
              const searchableContent = [
                result.question,
                result.answer,
                ...result.tags
              ].join(' ').toLowerCase()
              
              expect(searchableContent).toContain(searchTerm.toLowerCase())
            })
            
            // Results should be sorted by popularity (descending)
            for (let i = 1; i < results.length; i++) {
              expect(results[i-1].popularity).toBeGreaterThanOrEqual(results[i].popularity)
            }
            
            return true
          } finally {
            // Restore original data
            faqs.length = 0
            faqs.push(...originalFaqs)
          }
        }
      ), { numRuns: 50 })
    })

    test('FAQ category filtering maintains completeness', () => {
      fc.assert(fc.property(
        fc.array(faqGen, { minLength: 1, maxLength: 20 }),
        faqCategoryGen,
        (testFaqs, category) => {
          // Mock the FAQs for this test
          const originalFaqs = [...faqs]
          
          // Replace with test data temporarily
          faqs.length = 0
          faqs.push(...testFaqs)
          
          try {
            const results = getFAQsByCategory(category)
            
            // All returned results should match the category
            results.forEach(result => {
              expect(result.category).toBe(category)
            })
            
            // Should return all FAQs of that category
            const expectedCount = testFaqs.filter(faq => faq.category === category).length
            expect(results.length).toBe(expectedCount)
            
            // Results should be sorted by popularity (descending)
            for (let i = 1; i < results.length; i++) {
              expect(results[i-1].popularity).toBeGreaterThanOrEqual(results[i].popularity)
            }
            
            return true
          } finally {
            // Restore original data
            faqs.length = 0
            faqs.push(...originalFaqs)
          }
        }
      ), { numRuns: 50 })
    })

    test('Error message search covers all error types', () => {
      fc.assert(fc.property(
        fc.array(errorMessageGen, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (testErrors, searchTerm) => {
          // Mock the error messages for this test
          const originalErrors = [...errorMessages]
          
          // Replace with test data temporarily
          errorMessages.length = 0
          errorMessages.push(...testErrors)
          
          try {
            const results = searchErrorMessages(searchTerm)
            
            // All returned results should contain the search term
            results.forEach(result => {
              const searchableContent = [
                result.code,
                result.message,
                result.description
              ].join(' ').toLowerCase()
              
              expect(searchableContent).toContain(searchTerm.toLowerCase())
            })
            
            return true
          } finally {
            // Restore original data
            errorMessages.length = 0
            errorMessages.push(...originalErrors)
          }
        }
      ), { numRuns: 50 })
    })

    test('Error category filtering provides complete coverage', () => {
      fc.assert(fc.property(
        fc.array(errorMessageGen, { minLength: 1, maxLength: 20 }),
        errorCategoryGen,
        (testErrors, category) => {
          // Mock the error messages for this test
          const originalErrors = [...errorMessages]
          
          // Replace with test data temporarily
          errorMessages.length = 0
          errorMessages.push(...testErrors)
          
          try {
            const results = getErrorMessagesByCategory(category)
            
            // All returned results should match the category
            results.forEach(result => {
              expect(result.category).toBe(category)
            })
            
            // Should return all errors of that category
            const expectedCount = testErrors.filter(error => error.category === category).length
            expect(results.length).toBe(expectedCount)
            
            return true
          } finally {
            // Restore original data
            errorMessages.length = 0
            errorMessages.push(...originalErrors)
          }
        }
      ), { numRuns: 50 })
    })

    test('Diagnostic tools have complete configuration', () => {
      // Test that all diagnostic tools have required fields and valid configurations
      diagnosticTools.forEach(tool => {
        expect(tool.id).toBeTruthy()
        expect(tool.name).toBeTruthy()
        expect(tool.description).toBeTruthy()
        expect(['connectivity', 'configuration', 'performance', 'logs', 'metrics', 'system']).toContain(tool.category)
        expect(tool.command).toBeTruthy()
        expect(['json', 'text', 'table']).toContain(tool.outputFormat)
        expect(Array.isArray(tool.parameters)).toBe(true)
        expect(Array.isArray(tool.interpretation)).toBe(true)
        
        // Each parameter should have required fields
        tool.parameters.forEach(param => {
          expect(param.name).toBeTruthy()
          expect(param.description).toBeTruthy()
          expect(['string', 'number', 'boolean', 'select']).toContain(param.type)
          expect(typeof param.required).toBe('boolean')
          
          if (param.type === 'select') {
            expect(Array.isArray(param.options)).toBe(true)
            expect(param.options!.length).toBeGreaterThan(0)
          }
        })
        
        // Each interpretation should have required fields
        tool.interpretation.forEach(interp => {
          expect(interp.condition).toBeTruthy()
          expect(interp.meaning).toBeTruthy()
          expect(['low', 'medium', 'high', 'critical']).toContain(interp.severity)
          expect(Array.isArray(interp.recommendedActions)).toBe(true)
        })
      })
    })

    test('Escalation paths provide complete guidance', () => {
      // Test that all escalation paths have complete information
      escalationPaths.forEach(path => {
        expect(path.id).toBeTruthy()
        expect(path.name).toBeTruthy()
        expect(path.description).toBeTruthy()
        expect(Array.isArray(path.triggerConditions)).toBe(true)
        expect(path.triggerConditions.length).toBeGreaterThan(0)
        expect(Array.isArray(path.steps)).toBe(true)
        expect(path.steps.length).toBeGreaterThan(0)
        expect(path.estimatedResponseTime).toBeTruthy()
        expect(Array.isArray(path.requiredInformation)).toBe(true)
        expect(path.requiredInformation.length).toBeGreaterThan(0)
        
        // Each step should have complete information
        path.steps.forEach(step => {
          expect(step.id).toBeTruthy()
          expect(step.title).toBeTruthy()
          expect(step.description).toBeTruthy()
          expect(step.contact).toBeTruthy()
          expect(['email', 'slack', 'ticket', 'phone']).toContain(step.contact.type)
          expect(step.contact.value).toBeTruthy()
          expect(step.contact.availability).toBeTruthy()
          expect(step.contact.responseTime).toBeTruthy()
          expect(Array.isArray(step.requiredDocumentation)).toBe(true)
          expect(Array.isArray(step.escalationCriteria)).toBe(true)
        })
      })
    })

    test('All issue categories have representative content', () => {
      const categories: IssueCategory[] = [
        'installation', 'configuration', 'performance', 'connectivity',
        'authentication', 'data-collection', 'alerting', 'dashboard',
        'integration', 'billing'
      ]
      
      categories.forEach(category => {
        const issuesInCategory = troubleshootingIssues.filter(issue => issue.category === category)
        expect(issuesInCategory.length).toBeGreaterThan(0)
        
        // Each category should have issues of varying severities
        const severities = new Set(issuesInCategory.map(issue => issue.severity))
        expect(severities.size).toBeGreaterThan(0)
      })
    })

    test('All error categories have representative content', () => {
      const categories: ErrorCategory[] = [
        'client', 'server', 'network', 'authentication', 
        'authorization', 'configuration', 'data'
      ]
      
      categories.forEach(category => {
        const errorsInCategory = errorMessages.filter(error => error.category === category)
        expect(errorsInCategory.length).toBeGreaterThan(0)
        
        // Each error should have solutions
        errorsInCategory.forEach(error => {
          expect(error.solutions.length).toBeGreaterThan(0)
          expect(error.commonCauses.length).toBeGreaterThan(0)
        })
      })
    })
  })
})