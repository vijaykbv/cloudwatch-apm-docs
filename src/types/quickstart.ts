// Types for Quick Start wizard functionality
import { z } from 'zod'

export interface Platform {
  id: string
  name: string
  description: string
  icon: string
  category: 'language' | 'framework' | 'infrastructure'
  prerequisites: string[]
  installationSteps: InstallationStep[]
  verificationSteps: VerificationStep[]
}

export interface InstallationStep {
  id: string
  title: string
  description: string
  code?: string
  language?: string
  notes?: string[]
  isOptional?: boolean
}

export interface VerificationStep {
  id: string
  title: string
  description: string
  command?: string
  expectedOutput?: string
  troubleshooting?: string[]
}

export interface WizardStep {
  id: string
  title: string
  description: string
  component: string
  isCompleted: boolean
  isOptional?: boolean
}

export interface QuickStartProgress {
  currentStep: number
  completedSteps: string[]
  selectedPlatforms: string[]
  userPreferences: UserPreferences
}

export interface UserPreferences {
  experience: 'beginner' | 'intermediate' | 'advanced'
  useCase: 'monitoring' | 'debugging' | 'performance' | 'alerting'
  environment: 'development' | 'staging' | 'production'
}

export interface ConfigurationTemplate {
  id: string
  name: string
  description: string
  platforms: string[]
  useCase: string
  configuration: Record<string, unknown>
  examples: ConfigurationExample[]
}

export interface ConfigurationExample {
  id: string
  title: string
  description: string
  code: string
  language: string
  notes?: string[]
}

// Zod validation schemas
export const PlatformSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  category: z.enum(['language', 'framework', 'infrastructure']),
  prerequisites: z.array(z.string()),
  installationSteps: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    code: z.string().optional(),
    language: z.string().optional(),
    notes: z.array(z.string()).optional(),
    isOptional: z.boolean().optional()
  })),
  verificationSteps: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    command: z.string().optional(),
    expectedOutput: z.string().optional(),
    troubleshooting: z.array(z.string()).optional()
  }))
})

export const UserPreferencesSchema = z.object({
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  useCase: z.enum(['monitoring', 'debugging', 'performance', 'alerting']),
  environment: z.enum(['development', 'staging', 'production'])
})

export const QuickStartProgressSchema = z.object({
  currentStep: z.number().min(0),
  completedSteps: z.array(z.string()),
  selectedPlatforms: z.array(z.string()),
  userPreferences: UserPreferencesSchema
})

export const ConfigurationTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  platforms: z.array(z.string()),
  useCase: z.string().min(1),
  configuration: z.record(z.unknown()),
  examples: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    code: z.string().min(1),
    language: z.string().min(1),
    notes: z.array(z.string()).optional()
  }))
})