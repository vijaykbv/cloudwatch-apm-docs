// Types for security and compliance documentation system
import { z } from 'zod'

export interface SecurityConfiguration {
  id: string
  name: string
  description: string
  category: SecurityCategory
  severity: SecuritySeverity
  requirements: SecurityRequirement[]
  implementation: SecurityImplementation
  validation: SecurityValidation
  compliance: ComplianceMapping[]
  lastUpdated: Date
}

export interface SecurityRequirement {
  id: string
  title: string
  description: string
  mandatory: boolean
  category: SecurityCategory
  controls: SecurityControl[]
  references: SecurityReference[]
}

export interface SecurityControl {
  id: string
  name: string
  description: string
  type: SecurityControlType
  implementation: string
  validation: string
  automated: boolean
  frequency: ValidationFrequency
}

export interface SecurityImplementation {
  steps: ImplementationStep[]
  codeExamples: SecurityCodeExample[]
  configurations: SecurityConfigurationExample[]
  bestPractices: string[]
  commonMistakes: string[]
}

export interface ImplementationStep {
  id: string
  title: string
  description: string
  order: number
  required: boolean
  validation: string
  troubleshooting: string[]
}

export interface SecurityCodeExample {
  id: string
  title: string
  description: string
  language: string
  code: string
  explanation: string
  securityNotes: string[]
  platform?: string
}

export interface SecurityConfigurationExample {
  id: string
  title: string
  description: string
  configuration: Record<string, unknown>
  explanation: string
  securityLevel: SecurityLevel
  environment: string
}

export interface SecurityValidation {
  checklist: SecurityChecklistItem[]
  automatedTests: SecurityTest[]
  manualVerification: ManualVerificationStep[]
  tools: SecurityTool[]
}

export interface SecurityChecklistItem {
  id: string
  title: string
  description: string
  category: SecurityCategory
  required: boolean
  validation: string
  status?: ChecklistStatus
  notes?: string
}

export interface SecurityTest {
  id: string
  name: string
  description: string
  type: SecurityTestType
  automated: boolean
  frequency: ValidationFrequency
  command?: string
  expectedResult: string
  troubleshooting: string[]
}

export interface ManualVerificationStep {
  id: string
  title: string
  description: string
  instructions: string[]
  expectedOutcome: string
  documentation: string[]
}

export interface SecurityTool {
  id: string
  name: string
  description: string
  type: SecurityToolType
  installation: string
  usage: string
  configuration?: Record<string, unknown>
  platforms: string[]
}

export interface ComplianceMapping {
  framework: ComplianceFramework
  controls: ComplianceControl[]
  requirements: ComplianceRequirement[]
  evidence: ComplianceEvidence[]
  status: ComplianceStatus
}

export interface ComplianceControl {
  id: string
  name: string
  description: string
  framework: ComplianceFramework
  category: string
  implementation: string
  validation: string
  evidence: string[]
}

export interface ComplianceRequirement {
  id: string
  title: string
  description: string
  framework: ComplianceFramework
  section: string
  mandatory: boolean
  implementation: string
  validation: string
}

export interface ComplianceEvidence {
  id: string
  type: EvidenceType
  description: string
  location: string
  automated: boolean
  frequency: ValidationFrequency
}

export interface DataPrivacyPolicy {
  id: string
  name: string
  description: string
  scope: string[]
  dataTypes: DataType[]
  retention: RetentionPolicy
  processing: ProcessingActivity[]
  rights: DataSubjectRights[]
  compliance: ComplianceFramework[]
}

export interface DataType {
  id: string
  name: string
  description: string
  category: DataCategory
  sensitivity: DataSensitivity
  retention: number
  encryption: boolean
  anonymization: boolean
}

export interface RetentionPolicy {
  defaultPeriod: number
  categories: RetentionCategory[]
  deletion: DeletionProcess
  archival: ArchivalProcess
}

export interface RetentionCategory {
  dataType: string
  period: number
  reason: string
  exceptions: string[]
}

export interface DeletionProcess {
  automated: boolean
  frequency: ValidationFrequency
  verification: string
  documentation: string[]
}

export interface ArchivalProcess {
  enabled: boolean
  criteria: string[]
  location: string
  encryption: boolean
  access: string[]
}

export interface ProcessingActivity {
  id: string
  name: string
  description: string
  purpose: string[]
  dataTypes: string[]
  legalBasis: string
  retention: number
  sharing: DataSharing[]
}

export interface DataSharing {
  recipient: string
  purpose: string
  dataTypes: string[]
  safeguards: string[]
  agreement: string
}

export interface DataSubjectRights {
  right: DataRight
  description: string
  process: string[]
  timeline: number
  automation: boolean
}

export interface AuditConfiguration {
  id: string
  name: string
  description: string
  scope: AuditScope[]
  events: AuditEvent[]
  retention: number
  storage: AuditStorage
  monitoring: AuditMonitoring
  reporting: AuditReporting
}

export interface AuditScope {
  component: string
  events: string[]
  level: AuditLevel
  required: boolean
}

export interface AuditEvent {
  id: string
  name: string
  description: string
  category: AuditCategory
  level: AuditLevel
  fields: AuditField[]
  retention: number
}

export interface AuditField {
  name: string
  type: string
  required: boolean
  sensitive: boolean
  description: string
}

export interface AuditStorage {
  location: string
  encryption: boolean
  backup: boolean
  retention: number
  access: AccessControl[]
}

export interface AccessControl {
  role: string
  permissions: string[]
  conditions: string[]
  approval: boolean
}

export interface AuditMonitoring {
  realTime: boolean
  alerts: AuditAlert[]
  dashboards: string[]
  reports: string[]
}

export interface AuditAlert {
  id: string
  name: string
  description: string
  condition: string
  severity: AlertSeverity
  notification: string[]
}

export interface AuditReporting {
  automated: boolean
  frequency: ValidationFrequency
  recipients: string[]
  format: string[]
  retention: number
}

// Enums and types
export type SecurityCategory = 
  | 'authentication'
  | 'authorization'
  | 'encryption'
  | 'network'
  | 'data-protection'
  | 'audit-logging'
  | 'access-control'
  | 'compliance'
  | 'incident-response'

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical'

export type SecurityLevel = 'basic' | 'standard' | 'enhanced' | 'maximum'

export type SecurityControlType = 
  | 'preventive'
  | 'detective'
  | 'corrective'
  | 'compensating'

export type ValidationFrequency = 
  | 'continuous'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annually'

export type ChecklistStatus = 'pending' | 'in-progress' | 'completed' | 'failed'

export type SecurityTestType = 
  | 'configuration'
  | 'vulnerability'
  | 'penetration'
  | 'compliance'
  | 'access-control'

export type SecurityToolType = 
  | 'scanner'
  | 'analyzer'
  | 'monitor'
  | 'validator'
  | 'generator'

export type ComplianceFramework = 
  | 'SOC2'
  | 'ISO27001'
  | 'GDPR'
  | 'HIPAA'
  | 'PCI-DSS'
  | 'FedRAMP'
  | 'NIST'
  | 'CIS'

export type ComplianceStatus = 
  | 'compliant'
  | 'non-compliant'
  | 'partial'
  | 'not-assessed'

export type EvidenceType = 
  | 'configuration'
  | 'log'
  | 'report'
  | 'certificate'
  | 'documentation'
  | 'test-result'

export type DataCategory = 
  | 'personal'
  | 'sensitive'
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted'

export type DataSensitivity = 'low' | 'medium' | 'high' | 'critical'

export type DataRight = 
  | 'access'
  | 'rectification'
  | 'erasure'
  | 'portability'
  | 'restriction'
  | 'objection'

export type AuditLevel = 'basic' | 'detailed' | 'verbose'

export type AuditCategory = 
  | 'authentication'
  | 'authorization'
  | 'data-access'
  | 'configuration'
  | 'system'
  | 'security'

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface SecurityReference {
  id: string
  title: string
  url: string
  type: 'standard' | 'guideline' | 'documentation' | 'tool'
  description: string
}

// Zod validation schemas
export const SecurityCategorySchema = z.enum([
  'authentication',
  'authorization', 
  'encryption',
  'network',
  'data-protection',
  'audit-logging',
  'access-control',
  'compliance',
  'incident-response'
])

export const SecuritySeveritySchema = z.enum(['low', 'medium', 'high', 'critical'])

export const SecurityLevelSchema = z.enum(['basic', 'standard', 'enhanced', 'maximum'])

export const ValidationFrequencySchema = z.enum([
  'continuous',
  'daily',
  'weekly', 
  'monthly',
  'quarterly',
  'annually'
])

export const ComplianceFrameworkSchema = z.enum([
  'SOC2',
  'ISO27001',
  'GDPR',
  'HIPAA',
  'PCI-DSS',
  'FedRAMP',
  'NIST',
  'CIS'
])

export const SecurityReferenceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  type: z.enum(['standard', 'guideline', 'documentation', 'tool']),
  description: z.string().min(1)
})

export const SecurityControlSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['preventive', 'detective', 'corrective', 'compensating']),
  implementation: z.string().min(1),
  validation: z.string().min(1),
  automated: z.boolean(),
  frequency: ValidationFrequencySchema
})

export const SecurityRequirementSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  mandatory: z.boolean(),
  category: SecurityCategorySchema,
  controls: z.array(SecurityControlSchema),
  references: z.array(SecurityReferenceSchema)
})

export const SecurityChecklistItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: SecurityCategorySchema,
  required: z.boolean(),
  validation: z.string().min(1),
  status: z.enum(['pending', 'in-progress', 'completed', 'failed']).optional(),
  notes: z.string().optional()
})

export const SecurityConfigurationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: SecurityCategorySchema,
  severity: SecuritySeveritySchema,
  requirements: z.array(SecurityRequirementSchema),
  implementation: z.object({
    steps: z.array(z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      order: z.number().positive(),
      required: z.boolean(),
      validation: z.string().min(1),
      troubleshooting: z.array(z.string())
    })),
    codeExamples: z.array(z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      language: z.string().min(1),
      code: z.string().min(1),
      explanation: z.string().min(1),
      securityNotes: z.array(z.string()),
      platform: z.string().optional()
    })),
    configurations: z.array(z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      configuration: z.record(z.string(), z.unknown()),
      explanation: z.string().min(1),
      securityLevel: SecurityLevelSchema,
      environment: z.string().min(1)
    })),
    bestPractices: z.array(z.string()),
    commonMistakes: z.array(z.string())
  }),
  validation: z.object({
    checklist: z.array(SecurityChecklistItemSchema),
    automatedTests: z.array(z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().min(1),
      type: z.enum(['configuration', 'vulnerability', 'penetration', 'compliance', 'access-control']),
      automated: z.boolean(),
      frequency: ValidationFrequencySchema,
      command: z.string().optional(),
      expectedResult: z.string().min(1),
      troubleshooting: z.array(z.string())
    })),
    manualVerification: z.array(z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      instructions: z.array(z.string()),
      expectedOutcome: z.string().min(1),
      documentation: z.array(z.string())
    })),
    tools: z.array(z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().min(1),
      type: z.enum(['scanner', 'analyzer', 'monitor', 'validator', 'generator']),
      installation: z.string().min(1),
      usage: z.string().min(1),
      configuration: z.record(z.string(), z.unknown()).optional(),
      platforms: z.array(z.string())
    }))
  }),
  compliance: z.array(z.object({
    framework: ComplianceFrameworkSchema,
    controls: z.array(z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().min(1),
      framework: ComplianceFrameworkSchema,
      category: z.string().min(1),
      implementation: z.string().min(1),
      validation: z.string().min(1),
      evidence: z.array(z.string())
    })),
    requirements: z.array(z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      framework: ComplianceFrameworkSchema,
      section: z.string().min(1),
      mandatory: z.boolean(),
      implementation: z.string().min(1),
      validation: z.string().min(1)
    })),
    evidence: z.array(z.object({
      id: z.string().min(1),
      type: z.enum(['configuration', 'log', 'report', 'certificate', 'documentation', 'test-result']),
      description: z.string().min(1),
      location: z.string().min(1),
      automated: z.boolean(),
      frequency: ValidationFrequencySchema
    })),
    status: z.enum(['compliant', 'non-compliant', 'partial', 'not-assessed'])
  })),
  lastUpdated: z.date()
})