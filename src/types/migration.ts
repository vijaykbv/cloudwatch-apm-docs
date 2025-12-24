import { z } from 'zod'

// Migration-specific types for brownfield integration
export interface APMSolution {
  id: string
  name: string
  vendor: string
  description: string
  icon: string
  commonFeatures: string[]
  migrationComplexity: 'low' | 'medium' | 'high'
  estimatedMigrationTime: string
  supportedLanguages: string[]
  architecturePatterns: string[]
}

export interface MigrationStep {
  id: string
  title: string
  description: string
  category: 'preparation' | 'implementation' | 'validation' | 'cleanup'
  estimatedTime: string
  prerequisites: string[]
  instructions: string[]
  codeExamples?: CodeExample[]
  warnings?: string[]
  tips?: string[]
}

export interface CodeExample {
  language: string
  title: string
  before?: string
  after: string
  description: string
}

export interface MigrationPlan {
  id: string
  sourceAPM: string
  targetAPM: 'cloudwatch-apm'
  applicationContext: ApplicationContext
  steps: MigrationStep[]
  estimatedTotalTime: string
  riskLevel: 'low' | 'medium' | 'high'
  rollbackPlan: RollbackStep[]
  validationChecklist: ValidationItem[]
}

export interface ApplicationContext {
  language: string
  framework?: string
  infrastructure: string
  currentAPMFeatures: string[]
  businessCriticality: 'low' | 'medium' | 'high'
  deploymentFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
}

export interface RollbackStep {
  id: string
  title: string
  description: string
  commands: string[]
  verificationSteps: string[]
}

export interface ValidationItem {
  id: string
  category: 'functionality' | 'performance' | 'data-integrity' | 'monitoring'
  description: string
  validationMethod: string
  expectedResult: string
  troubleshooting: string[]
}

export interface CompatibilityCheck {
  service: string
  compatible: boolean
  version?: string
  notes?: string
  migrationRequired?: boolean
  alternativeApproach?: string
}

export interface IntegrationPattern {
  id: string
  name: string
  description: string
  architecture: 'monolith' | 'microservices' | 'serverless' | 'hybrid'
  complexity: 'simple' | 'moderate' | 'complex'
  components: PatternComponent[]
  implementation: ImplementationGuide
  benefits: string[]
  considerations: string[]
}

export interface PatternComponent {
  name: string
  type: 'application' | 'database' | 'cache' | 'queue' | 'gateway' | 'load-balancer'
  description: string
  apmIntegration: string
}

export interface ImplementationGuide {
  overview: string
  steps: MigrationStep[]
  configurationExamples: ConfigurationExample[]
  testingStrategy: string[]
}

export interface ConfigurationExample {
  title: string
  description: string
  configuration: string
  language: string
  notes?: string[]
}

// Zod validation schemas
export const APMSolutionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  vendor: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  commonFeatures: z.array(z.string()),
  migrationComplexity: z.enum(['low', 'medium', 'high']),
  estimatedMigrationTime: z.string().min(1),
  supportedLanguages: z.array(z.string()),
  architecturePatterns: z.array(z.string())
})

export const CodeExampleSchema = z.object({
  language: z.string().min(1),
  title: z.string().min(1),
  before: z.string().optional(),
  after: z.string().min(1),
  description: z.string().min(1)
})

export const MigrationStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['preparation', 'implementation', 'validation', 'cleanup']),
  estimatedTime: z.string().min(1),
  prerequisites: z.array(z.string()),
  instructions: z.array(z.string()),
  codeExamples: z.array(CodeExampleSchema).optional(),
  warnings: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional()
})

export const ApplicationContextSchema = z.object({
  language: z.string().min(1),
  framework: z.string().optional(),
  infrastructure: z.string().min(1),
  currentAPMFeatures: z.array(z.string()),
  businessCriticality: z.enum(['low', 'medium', 'high']),
  deploymentFrequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly'])
})

export const RollbackStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  commands: z.array(z.string()),
  verificationSteps: z.array(z.string())
})

export const ValidationItemSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['functionality', 'performance', 'data-integrity', 'monitoring']),
  description: z.string().min(1),
  validationMethod: z.string().min(1),
  expectedResult: z.string().min(1),
  troubleshooting: z.array(z.string())
})

export const MigrationPlanSchema = z.object({
  id: z.string().min(1),
  sourceAPM: z.string().min(1),
  targetAPM: z.literal('cloudwatch-apm'),
  applicationContext: ApplicationContextSchema,
  steps: z.array(MigrationStepSchema),
  estimatedTotalTime: z.string().min(1),
  riskLevel: z.enum(['low', 'medium', 'high']),
  rollbackPlan: z.array(RollbackStepSchema),
  validationChecklist: z.array(ValidationItemSchema)
})

export const CompatibilityCheckSchema = z.object({
  service: z.string().min(1),
  compatible: z.boolean(),
  version: z.string().optional(),
  notes: z.string().optional(),
  migrationRequired: z.boolean().optional(),
  alternativeApproach: z.string().optional()
})

export const PatternComponentSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['application', 'database', 'cache', 'queue', 'gateway', 'load-balancer']),
  description: z.string().min(1),
  apmIntegration: z.string().min(1)
})

export const ConfigurationExampleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  configuration: z.string().min(1),
  language: z.string().min(1),
  notes: z.array(z.string()).optional()
})

export const ImplementationGuideSchema = z.object({
  overview: z.string().min(1),
  steps: z.array(MigrationStepSchema),
  configurationExamples: z.array(ConfigurationExampleSchema),
  testingStrategy: z.array(z.string())
})

export const IntegrationPatternSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  architecture: z.enum(['monolith', 'microservices', 'serverless', 'hybrid']),
  complexity: z.enum(['simple', 'moderate', 'complex']),
  components: z.array(PatternComponentSchema),
  implementation: ImplementationGuideSchema,
  benefits: z.array(z.string()),
  considerations: z.array(z.string())
})