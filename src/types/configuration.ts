// Types for configuration documentation system
import { z } from 'zod'

export interface ConfigurationParameter {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description: string
  required: boolean
  defaultValue?: unknown
  validValues?: unknown[]
  validationRules?: ValidationRule[]
  examples: ConfigurationExample[]
  category: ConfigurationCategory
  platform?: string[]
  environment?: string[]
  deprecated?: boolean
  deprecationMessage?: string
  relatedParameters?: string[]
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'enum' | 'custom'
  value: unknown
  message: string
}

export interface ConfigurationExample {
  id: string
  title: string
  description: string
  value: unknown
  context?: string
  platform?: string
  useCase?: string
}

export interface ConfigurationSchema {
  id: string
  name: string
  description: string
  version: string
  parameters: ConfigurationParameter[]
  categories: ConfigurationCategory[]
  platforms: string[]
  lastUpdated: Date
}

export interface ConfigurationCategory {
  id: string
  name: string
  description: string
  icon?: string
  order: number
}

export interface ConfigurationReference {
  schema: ConfigurationSchema
  documentation: ConfigurationDocumentation
  examples: ConfigurationUseCase[]
  validation: ConfigurationValidation
}

export interface ConfigurationDocumentation {
  overview: string
  gettingStarted: string
  bestPractices: string[]
  commonIssues: ConfigurationIssue[]
  migration?: MigrationGuide[]
}

export interface ConfigurationIssue {
  id: string
  title: string
  description: string
  symptoms: string[]
  solutions: string[]
  relatedParameters: string[]
}

export interface MigrationGuide {
  fromVersion: string
  toVersion: string
  changes: ConfigurationChange[]
  migrationSteps: string[]
}

export interface ConfigurationChange {
  type: 'added' | 'removed' | 'modified' | 'deprecated'
  parameter: string
  description: string
  impact: 'breaking' | 'non-breaking'
  action?: string
}

export interface ConfigurationUseCase {
  id: string
  name: string
  description: string
  scenario: string
  configuration: Record<string, unknown>
  explanation: string
  platforms: string[]
  environment: string
  performance: PerformanceCharacteristics
  monitoring: MonitoringRecommendations
}

export interface PerformanceCharacteristics {
  overhead: 'low' | 'medium' | 'high'
  throughput: string
  latency: string
  memoryUsage: string
  recommendations: string[]
}

export interface MonitoringRecommendations {
  keyMetrics: string[]
  alertThresholds: Record<string, unknown>
  dashboards: string[]
  troubleshooting: string[]
}

export interface ConfigurationValidation {
  rules: ValidationRule[]
  validator: (config: Record<string, unknown>) => ValidationResult
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
}

export interface ValidationError {
  parameter: string
  message: string
  severity: 'error' | 'warning'
  fix?: string
}

export interface ValidationWarning {
  parameter: string
  message: string
  recommendation: string
}

export interface ValidationSuggestion {
  parameter: string
  currentValue: unknown
  suggestedValue: unknown
  reason: string
}

// Zod validation schemas
export const ValidationRuleSchema = z.object({
  type: z.enum(['min', 'max', 'pattern', 'enum', 'custom']),
  value: z.unknown(),
  message: z.string().min(1)
})

export const ConfigurationExampleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  value: z.unknown(),
  context: z.string().optional(),
  platform: z.string().optional(),
  useCase: z.string().optional()
})

export const ConfigurationParameterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  description: z.string().min(1),
  required: z.boolean(),
  defaultValue: z.unknown().optional(),
  validValues: z.array(z.unknown()).optional(),
  validationRules: z.array(ValidationRuleSchema).optional(),
  examples: z.array(ConfigurationExampleSchema),
  category: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    icon: z.string().optional(),
    order: z.number()
  }),
  platform: z.array(z.string()).optional(),
  environment: z.array(z.string()).optional(),
  deprecated: z.boolean().optional(),
  deprecationMessage: z.string().optional(),
  relatedParameters: z.array(z.string()).optional()
})

export const ConfigurationSchemaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  version: z.string().min(1),
  parameters: z.array(ConfigurationParameterSchema),
  categories: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    icon: z.string().optional(),
    order: z.number()
  })),
  platforms: z.array(z.string()),
  lastUpdated: z.date()
})

export const PerformanceCharacteristicsSchema = z.object({
  overhead: z.enum(['low', 'medium', 'high']),
  throughput: z.string().min(1),
  latency: z.string().min(1),
  memoryUsage: z.string().min(1),
  recommendations: z.array(z.string())
})

export const MonitoringRecommendationsSchema = z.object({
  keyMetrics: z.array(z.string()),
  alertThresholds: z.record(z.string(), z.unknown()),
  dashboards: z.array(z.string()),
  troubleshooting: z.array(z.string())
})

export const ConfigurationUseCaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  scenario: z.string().min(1),
  configuration: z.record(z.string(), z.unknown()),
  explanation: z.string().min(1),
  platforms: z.array(z.string()),
  environment: z.string().min(1),
  performance: PerformanceCharacteristicsSchema,
  monitoring: MonitoringRecommendationsSchema
})

export const ValidationErrorSchema = z.object({
  parameter: z.string().min(1),
  message: z.string().min(1),
  severity: z.enum(['error', 'warning']),
  fix: z.string().optional()
})

export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(ValidationErrorSchema),
  warnings: z.array(z.object({
    parameter: z.string().min(1),
    message: z.string().min(1),
    recommendation: z.string().min(1)
  })),
  suggestions: z.array(z.object({
    parameter: z.string().min(1),
    currentValue: z.unknown(),
    suggestedValue: z.unknown(),
    reason: z.string().min(1)
  }))
})