// Types for code examples and SDK documentation
import { z } from 'zod'

export interface CodeExample {
  id: string
  title: string
  description: string
  language: ProgrammingLanguage
  code: string
  category: ExampleCategory
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  dependencies?: string[]
  relatedExamples: string[]
  lastUpdated: Date
  metadata: CodeExampleMetadata
}

export interface CodeExampleMetadata {
  filename?: string
  runnable: boolean
  testable: boolean
  framework?: string
  version?: string
  platform?: string
  [key: string]: unknown
}

export interface MultiLanguageCodeExample {
  id: string
  title: string
  description: string
  examples: CodeExample[]
  category: ExampleCategory
  useCase: string
  tags: string[]
  lastUpdated: Date
}

export interface SampleApplication {
  id: string
  name: string
  description: string
  language: ProgrammingLanguage
  framework?: string
  category: ExampleCategory
  useCase: string
  features: string[]
  downloadUrl: string
  repositoryUrl?: string
  documentation: string
  prerequisites: string[]
  installationSteps: string[]
  runningInstructions: string[]
  tags: string[]
  lastUpdated: Date
  metadata: SampleApplicationMetadata
}

export interface SampleApplicationMetadata {
  size: string
  complexity: 'simple' | 'moderate' | 'complex'
  estimatedSetupTime: number
  supportedPlatforms: string[]
  [key: string]: unknown
}

export interface PerformanceExample {
  id: string
  title: string
  description: string
  category: 'optimization' | 'monitoring' | 'tuning' | 'measurement'
  language: ProgrammingLanguage
  beforeCode: string
  afterCode: string
  explanation: string
  metrics: PerformanceMetric[]
  tools: string[]
  tags: string[]
  lastUpdated: Date
}

export interface PerformanceMetric {
  name: string
  beforeValue: number
  afterValue: number
  unit: string
  improvement: number
  description: string
}

export type ProgrammingLanguage = 
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'shell'
  | 'yaml'
  | 'json'
  | 'dockerfile'

export type ExampleCategory =
  | 'getting-started'
  | 'integration'
  | 'configuration'
  | 'monitoring'
  | 'troubleshooting'
  | 'performance'
  | 'security'
  | 'deployment'
  | 'testing'
  | 'best-practices'

// Zod validation schemas
export const ProgrammingLanguageSchema = z.enum([
  'javascript',
  'typescript', 
  'python',
  'java',
  'csharp',
  'go',
  'rust',
  'php',
  'ruby',
  'shell',
  'yaml',
  'json',
  'dockerfile'
])

export const ExampleCategorySchema = z.enum([
  'getting-started',
  'integration',
  'configuration', 
  'monitoring',
  'troubleshooting',
  'performance',
  'security',
  'deployment',
  'testing',
  'best-practices'
])

export const CodeExampleMetadataSchema = z.object({
  filename: z.string().optional(),
  runnable: z.boolean(),
  testable: z.boolean(),
  framework: z.string().optional(),
  version: z.string().optional(),
  platform: z.string().optional()
}).catchall(z.unknown())

export const CodeExampleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  language: ProgrammingLanguageSchema,
  code: z.string().min(1),
  category: ExampleCategorySchema,
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  tags: z.array(z.string()),
  dependencies: z.array(z.string()).optional(),
  relatedExamples: z.array(z.string()),
  lastUpdated: z.date(),
  metadata: CodeExampleMetadataSchema
})

export const MultiLanguageCodeExampleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  examples: z.array(CodeExampleSchema).min(1),
  category: ExampleCategorySchema,
  useCase: z.string().min(1),
  tags: z.array(z.string()),
  lastUpdated: z.date()
})

export const SampleApplicationMetadataSchema = z.object({
  size: z.string(),
  complexity: z.enum(['simple', 'moderate', 'complex']),
  estimatedSetupTime: z.number().positive(),
  supportedPlatforms: z.array(z.string())
}).catchall(z.unknown())

export const SampleApplicationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  language: ProgrammingLanguageSchema,
  framework: z.string().optional(),
  category: ExampleCategorySchema,
  useCase: z.string().min(1),
  features: z.array(z.string()),
  downloadUrl: z.string().url(),
  repositoryUrl: z.string().url().optional(),
  documentation: z.string().min(1),
  prerequisites: z.array(z.string()),
  installationSteps: z.array(z.string()),
  runningInstructions: z.array(z.string()),
  tags: z.array(z.string()),
  lastUpdated: z.date(),
  metadata: SampleApplicationMetadataSchema
})

export const PerformanceMetricSchema = z.object({
  name: z.string().min(1),
  beforeValue: z.number(),
  afterValue: z.number(),
  unit: z.string().min(1),
  improvement: z.number(),
  description: z.string().min(1)
})

export const PerformanceExampleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['optimization', 'monitoring', 'tuning', 'measurement']),
  language: ProgrammingLanguageSchema,
  beforeCode: z.string().min(1),
  afterCode: z.string().min(1),
  explanation: z.string().min(1),
  metrics: z.array(PerformanceMetricSchema),
  tools: z.array(z.string()),
  tags: z.array(z.string()),
  lastUpdated: z.date()
})