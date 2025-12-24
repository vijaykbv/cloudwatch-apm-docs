import { z } from 'zod'

export interface TroubleshootingIssue {
  id: string
  title: string
  description: string
  category: IssueCategory
  severity: IssueSeverity
  symptoms: string[]
  causes: string[]
  solutions: Solution[]
  diagnosticSteps: DiagnosticStep[]
  relatedIssues: string[]
  tags: string[]
  lastUpdated: Date
  affectedComponents: string[]
}

export interface Solution {
  id: string
  title: string
  description: string
  steps: SolutionStep[]
  estimatedTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  prerequisites: string[]
  verificationSteps: string[]
}

export interface SolutionStep {
  id: string
  title: string
  description: string
  type: 'action' | 'command' | 'configuration' | 'verification'
  content: string
  expectedResult?: string
  troubleshootingTips?: string[]
}

export interface DiagnosticStep {
  id: string
  title: string
  description: string
  command?: string
  expectedOutput?: string
  interpretation: string
  nextSteps: string[]
}

export interface DiagnosticTool {
  id: string
  name: string
  description: string
  category: DiagnosticCategory
  command: string
  parameters: DiagnosticParameter[]
  outputFormat: 'json' | 'text' | 'table'
  interpretation: DiagnosticInterpretation[]
}

export interface DiagnosticParameter {
  name: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'select'
  required: boolean
  defaultValue?: string | number | boolean
  options?: string[]
}

export interface DiagnosticInterpretation {
  condition: string
  meaning: string
  severity: IssueSeverity
  recommendedActions: string[]
}

export interface EscalationPath {
  id: string
  name: string
  description: string
  triggerConditions: string[]
  steps: EscalationStep[]
  estimatedResponseTime: string
  requiredInformation: string[]
}

export interface EscalationStep {
  id: string
  title: string
  description: string
  contact: ContactInfo
  requiredDocumentation: string[]
  escalationCriteria: string[]
}

export interface ContactInfo {
  type: 'email' | 'slack' | 'ticket' | 'phone'
  value: string
  availability: string
  responseTime: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: FAQCategory
  tags: string[]
  relatedIssues: string[]
  popularity: number
  lastUpdated: Date
}

export interface ErrorMessage {
  id: string
  code: string
  message: string
  description: string
  category: ErrorCategory
  severity: IssueSeverity
  commonCauses: string[]
  solutions: string[]
  relatedErrors: string[]
  documentationLinks: string[]
}

export type IssueCategory = 
  | 'installation'
  | 'configuration'
  | 'performance'
  | 'connectivity'
  | 'authentication'
  | 'data-collection'
  | 'alerting'
  | 'dashboard'
  | 'integration'
  | 'billing'

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical'

export type DiagnosticCategory = 
  | 'connectivity'
  | 'configuration'
  | 'performance'
  | 'logs'
  | 'metrics'
  | 'system'

export type FAQCategory = 
  | 'general'
  | 'setup'
  | 'configuration'
  | 'troubleshooting'
  | 'billing'
  | 'integration'

export type ErrorCategory = 
  | 'client'
  | 'server'
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'configuration'
  | 'data'

// Zod validation schemas
export const IssueSeveritySchema = z.enum(['low', 'medium', 'high', 'critical'])

export const IssueCategorySchema = z.enum([
  'installation',
  'configuration', 
  'performance',
  'connectivity',
  'authentication',
  'data-collection',
  'alerting',
  'dashboard',
  'integration',
  'billing'
])

export const DiagnosticCategorySchema = z.enum([
  'connectivity',
  'configuration',
  'performance', 
  'logs',
  'metrics',
  'system'
])

export const FAQCategorySchema = z.enum([
  'general',
  'setup',
  'configuration',
  'troubleshooting',
  'billing',
  'integration'
])

export const ErrorCategorySchema = z.enum([
  'client',
  'server',
  'network',
  'authentication',
  'authorization',
  'configuration',
  'data'
])

export const SolutionStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['action', 'command', 'configuration', 'verification']),
  content: z.string().min(1),
  expectedResult: z.string().optional(),
  troubleshootingTips: z.array(z.string()).optional()
})

export const SolutionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  steps: z.array(SolutionStepSchema),
  estimatedTime: z.number().positive(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  prerequisites: z.array(z.string()),
  verificationSteps: z.array(z.string())
})

export const DiagnosticStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  command: z.string().optional(),
  expectedOutput: z.string().optional(),
  interpretation: z.string().min(1),
  nextSteps: z.array(z.string())
})

export const TroubleshootingIssueSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: IssueCategorySchema,
  severity: IssueSeveritySchema,
  symptoms: z.array(z.string()).min(1),
  causes: z.array(z.string()).min(1),
  solutions: z.array(SolutionSchema).min(1),
  diagnosticSteps: z.array(DiagnosticStepSchema),
  relatedIssues: z.array(z.string()),
  tags: z.array(z.string()),
  lastUpdated: z.date(),
  affectedComponents: z.array(z.string())
})

export const DiagnosticParameterSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['string', 'number', 'boolean', 'select']),
  required: z.boolean(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  options: z.array(z.string()).optional()
})

export const DiagnosticInterpretationSchema = z.object({
  condition: z.string().min(1),
  meaning: z.string().min(1),
  severity: IssueSeveritySchema,
  recommendedActions: z.array(z.string())
})

export const DiagnosticToolSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: DiagnosticCategorySchema,
  command: z.string().min(1),
  parameters: z.array(DiagnosticParameterSchema),
  outputFormat: z.enum(['json', 'text', 'table']),
  interpretation: z.array(DiagnosticInterpretationSchema)
})

export const ContactInfoSchema = z.object({
  type: z.enum(['email', 'slack', 'ticket', 'phone']),
  value: z.string().min(1),
  availability: z.string().min(1),
  responseTime: z.string().min(1)
})

export const EscalationStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  contact: ContactInfoSchema,
  requiredDocumentation: z.array(z.string()),
  escalationCriteria: z.array(z.string())
})

export const EscalationPathSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  triggerConditions: z.array(z.string()),
  steps: z.array(EscalationStepSchema),
  estimatedResponseTime: z.string().min(1),
  requiredInformation: z.array(z.string())
})

export const FAQSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  category: FAQCategorySchema,
  tags: z.array(z.string()),
  relatedIssues: z.array(z.string()),
  popularity: z.number().nonnegative(),
  lastUpdated: z.date()
})

export const ErrorMessageSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  message: z.string().min(1),
  description: z.string().min(1),
  category: ErrorCategorySchema,
  severity: IssueSeveritySchema,
  commonCauses: z.array(z.string()),
  solutions: z.array(z.string()),
  relatedErrors: z.array(z.string()),
  documentationLinks: z.array(z.string())
})