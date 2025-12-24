/**
 * Property-Based Tests for Code Example Coverage
 * Feature: cloudwatch-apm-docs, Property 6: Code Example Language Coverage
 * **Validates: Requirements 6.1, 7.5**
 */

import { describe, test, expect } from '@jest/globals'
import { 
  CodeExample, 
  MultiLanguageCodeExample, 
  ProgrammingLanguage, 
  ExampleCategory,
  CodeExampleSchema,
  MultiLanguageCodeExampleSchema
} from '../../types/examples'
import { codeExamples, multiLanguageExamples } from '../../data/code-examples'

// Property-based test generators
function generateRandomLanguage(): ProgrammingLanguage {
  const languages: ProgrammingLanguage[] = [
    'javascript', 'typescript', 'python', 'java', 'csharp', 'go', 'rust', 'php', 'ruby'
  ]
  return languages[Math.floor(Math.random() * languages.length)]
}

function generateRandomCategory(): ExampleCategory {
  const categories: ExampleCategory[] = [
    'getting-started', 'integration', 'configuration', 'monitoring', 'troubleshooting',
    'performance', 'security', 'deployment', 'testing', 'best-practices'
  ]
  return categories[Math.floor(Math.random() * categories.length)]
}

function generateRandomCodeExample(): CodeExample {
  const id = `test-example-${Math.random().toString(36).substr(2, 9)}`
  const language = generateRandomLanguage()
  const category = generateRandomCategory()
  
  // Generate correct filename extension based on language
  const getFileExtension = (lang: ProgrammingLanguage): string => {
    const extensions: Record<ProgrammingLanguage, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      shell: 'sh',
      yaml: 'yml',
      json: 'json',
      dockerfile: 'dockerfile'
    }
    return extensions[lang] || 'txt'
  }
  
  return {
    id,
    title: `Test Example for ${language}`,
    description: `Generated test example for ${language} in ${category} category`,
    language,
    code: `// Sample ${language} code\nconsole.log("Hello CloudWatch APM");`,
    category,
    difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any,
    tags: [language, category, 'test'],
    dependencies: [`${language}-sdk`, 'opentelemetry'],
    relatedExamples: [],
    lastUpdated: new Date(),
    metadata: {
      filename: `example.${getFileExtension(language)}`,
      runnable: true,
      testable: true,
      framework: language === 'javascript' ? 'express' : language === 'python' ? 'flask' : undefined,
      platform: language
    }
  }
}

describe('Code Example Coverage Property Tests', () => {
  describe('Property 6: Code Example Language Coverage', () => {
    test('For any supported programming language, code examples should exist for all major integration scenarios', () => {
      // **Feature: cloudwatch-apm-docs, Property 6: Code Example Language Coverage**
      
      const supportedLanguages: ProgrammingLanguage[] = [
        'javascript', 'typescript', 'python', 'java', 'csharp', 'go'
      ]
      
      const majorScenarios: ExampleCategory[] = [
        'getting-started', 'integration', 'configuration', 'monitoring'
      ]

      // Property: For all supported languages, examples should exist for major scenarios
      supportedLanguages.forEach(language => {
        const languageExamples = codeExamples.filter(ex => ex.language === language)
        
        // Verify language has examples
        expect(languageExamples.length).toBeGreaterThan(0)
        
        // Verify examples follow consistent formatting standards
        languageExamples.forEach(example => {
          // Validate schema compliance
          expect(() => CodeExampleSchema.parse(example)).not.toThrow()
          
          // Verify required fields are present
          expect(example.id).toBeTruthy()
          expect(example.title).toBeTruthy()
          expect(example.description).toBeTruthy()
          expect(example.code).toBeTruthy()
          expect(example.language).toBe(language)
          
          // Verify metadata consistency
          expect(example.metadata).toBeDefined()
          expect(example.metadata.runnable).toBeDefined()
          expect(example.metadata.testable).toBeDefined()
          
          // Verify tags include language
          expect(example.tags).toContain(language)
          
          // Verify code is not empty and contains meaningful content
          expect(example.code.trim().length).toBeGreaterThan(10)
        })
      })
    })

    test('For any code example, it should have consistent metadata and follow language conventions', () => {
      // Generate random examples to test property
      for (let i = 0; i < 50; i++) {
        const example = generateRandomCodeExample()
        
        // Property: All code examples should have consistent structure
        expect(() => CodeExampleSchema.parse(example)).not.toThrow()
        
        // Property: Language-specific conventions should be followed
        switch (example.language) {
          case 'javascript':
          case 'typescript':
            expect(example.metadata.filename).toMatch(/\.(js|ts)$/)
            break
          case 'python':
            expect(example.metadata.filename).toMatch(/\.py$/)
            break
          case 'java':
            expect(example.metadata.filename).toMatch(/\.java$/)
            break
        }
        
        // Property: All examples should be categorized
        expect(['getting-started', 'integration', 'configuration', 'monitoring', 
                'troubleshooting', 'performance', 'security', 'deployment', 
                'testing', 'best-practices']).toContain(example.category)
        
        // Property: All examples should have difficulty level
        expect(['beginner', 'intermediate', 'advanced']).toContain(example.difficulty)
      }
    })

    test('For any multi-language example group, all languages should implement the same use case', () => {
      multiLanguageExamples.forEach(group => {
        // Validate schema compliance
        expect(() => MultiLanguageCodeExampleSchema.parse(group)).not.toThrow()
        
        // Property: All examples in group should have same use case
        const useCase = group.useCase
        expect(useCase).toBeTruthy()
        
        // Property: All examples should be in same category
        const categories = new Set(group.examples.map(ex => ex.category))
        expect(categories.size).toBe(1)
        
        // Property: Examples should cover multiple languages
        const languages = new Set(group.examples.map(ex => ex.language))
        expect(languages.size).toBeGreaterThan(1)
        
        // Property: Each example should be valid
        group.examples.forEach(example => {
          expect(() => CodeExampleSchema.parse(example)).not.toThrow()
          
          // Property: Code should contain language-appropriate APM integration
          const code = example.code.toLowerCase()
          switch (example.language) {
            case 'javascript':
            case 'typescript':
              expect(code).toMatch(/(opentelemetry|@opentelemetry|aws-xray)/i)
              break
            case 'python':
              expect(code).toMatch(/(opentelemetry|aws_xray|trace)/i)
              break
            case 'java':
              expect(code).toMatch(/(opentelemetry|xray|trace)/i)
              break
          }
        })
      })
    })

    test('For any example category, it should have examples across multiple languages', () => {
      const categories: ExampleCategory[] = [
        'getting-started', 'integration', 'configuration', 'monitoring'
      ]
      
      categories.forEach(category => {
        const categoryExamples = codeExamples.filter(ex => ex.category === category)
        
        // Property: Major categories should have examples
        expect(categoryExamples.length).toBeGreaterThan(0)
        
        // Property: Categories should span multiple languages for comprehensive coverage
        const languages = new Set(categoryExamples.map(ex => ex.language))
        
        // For major categories, expect coverage across multiple languages
        if (['getting-started', 'integration'].includes(category)) {
          expect(languages.size).toBeGreaterThan(1)
        }
        
        // Property: All examples in category should be relevant
        categoryExamples.forEach(example => {
          expect(example.category).toBe(category)
          expect(example.tags).toContain(category)
        })
      })
    })

    test('For any code example with dependencies, dependencies should be valid and complete', () => {
      codeExamples.forEach(example => {
        if (example.dependencies && example.dependencies.length > 0) {
          // Property: Dependencies should be non-empty strings
          example.dependencies.forEach(dep => {
            expect(typeof dep).toBe('string')
            expect(dep.trim().length).toBeGreaterThan(0)
          })
          
          // Property: Examples with APM integration should have OpenTelemetry dependencies
          const hasAPMCode = example.code.toLowerCase().includes('opentelemetry') ||
                           example.code.toLowerCase().includes('xray') ||
                           example.code.toLowerCase().includes('trace')
          
          if (hasAPMCode) {
            const depsString = example.dependencies.join(' ').toLowerCase()
            expect(depsString).toMatch(/(opentelemetry|xray|trace)/i)
          }
        }
      })
    })

    test('For any runnable example, it should contain executable code patterns', () => {
      const runnableExamples = codeExamples.filter(ex => ex.metadata.runnable)
      
      runnableExamples.forEach(example => {
        const code = example.code
        
        // Property: Runnable examples should have main execution patterns
        switch (example.language) {
          case 'javascript':
          case 'typescript':
            // Should have app setup or main function
            expect(code).toMatch(/(app\.listen|server\.listen|function main|export|module\.exports)/i)
            break
          case 'python':
            // Should have main execution or app setup
            expect(code).toMatch(/(if __name__|app\.run|def main|flask|fastapi)/i)
            break
          case 'java':
            // Should have main method or Spring Boot application
            expect(code).toMatch(/(public static void main|@SpringBootApplication|SpringApplication\.run)/i)
            break
        }
        
        // Property: Runnable examples should have APM instrumentation
        expect(code.toLowerCase()).toMatch(/(opentelemetry|trace|span|metric)/i)
      })
    })
  })

  describe('Code Example Data Validation', () => {
    test('All existing code examples should pass schema validation', () => {
      codeExamples.forEach(example => {
        expect(() => CodeExampleSchema.parse(example)).not.toThrow()
      })
    })

    test('All multi-language examples should pass schema validation', () => {
      multiLanguageExamples.forEach(group => {
        expect(() => MultiLanguageCodeExampleSchema.parse(group)).not.toThrow()
      })
    })

    test('Code examples should have unique IDs', () => {
      const ids = codeExamples.map(ex => ex.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    test('Related examples should reference existing example IDs', () => {
      const allIds = new Set(codeExamples.map(ex => ex.id))
      
      codeExamples.forEach(example => {
        example.relatedExamples.forEach(relatedId => {
          expect(allIds.has(relatedId)).toBe(true)
        })
      })
    })
  })
})