// Core type definitions for the documentation system
import { z } from 'zod'

export interface DocumentationPage {
  id: string
  title: string
  description: string
  audience: UserAudience[]
  difficulty: DifficultyLevel
  category: ContentCategory
  tags: string[]
  content: ContentBlock[]
  relatedPages: string[]
  lastUpdated: Date
  estimatedReadTime: number
}

export interface ContentBlock {
  type: 'text' | 'code' | 'diagram' | 'interactive' | 'video'
  content: string
  metadata: BlockMetadata
}

export interface BlockMetadata {
  language?: string
  title?: string
  description?: string
  [key: string]: unknown
}

export interface UserAudience {
  type: 'developer' | 'operations' | 'architect' | 'security'
  experience: 'beginner' | 'intermediate' | 'advanced'
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export type ContentCategory = 
  | 'getting-started'
  | 'implementation'
  | 'configuration'
  | 'examples'
  | 'api-reference'
  | 'troubleshooting'
  | 'monitoring'
  | 'security'
  | 'performance'

export interface NavigationStructure {
  sections: NavigationSection[]
  breadcrumbs: BreadcrumbItem[]
  contextualLinks: ContextualLink[]
}

export interface NavigationSection {
  id: string
  title: string
  icon: string
  subsections: NavigationSubsection[]
  landingPage: string
}

export interface NavigationSubsection {
  id: string
  title: string
  pages: DocumentationPage[]
  estimatedCompletionTime: number
}

export interface BreadcrumbItem {
  id?: string
  title: string
  href: string
}

export interface ContextualLink {
  id: string
  title: string
  href: string
  description?: string
  type: 'related' | 'next' | 'previous' | 'external'
}

export interface UserJourney {
  id: string
  name: string
  description: string
  audience: UserAudience
  steps: JourneyStep[]
  estimatedDuration: number
}

export interface JourneyStep {
  id: string
  title: string
  description: string
  requiredPages: string[]
  optionalPages: string[]
  completionCriteria: string[]
  nextSteps: string[]
}

// Zod validation schemas
export const UserAudienceSchema = z.object({
  type: z.enum(['developer', 'operations', 'architect', 'security']),
  experience: z.enum(['beginner', 'intermediate', 'advanced'])
})

export const DifficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced'])

export const ContentCategorySchema = z.enum([
  'getting-started',
  'implementation', 
  'configuration',
  'examples',
  'api-reference',
  'troubleshooting',
  'monitoring',
  'security',
  'performance'
])

export const BlockMetadataSchema = z.object({
  language: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional()
}).catchall(z.unknown())

export const ContentBlockSchema = z.object({
  type: z.enum(['text', 'code', 'diagram', 'interactive', 'video']),
  content: z.string(),
  metadata: BlockMetadataSchema
})

export const DocumentationPageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  audience: z.array(UserAudienceSchema).min(1),
  difficulty: DifficultyLevelSchema,
  category: ContentCategorySchema,
  tags: z.array(z.string()),
  content: z.array(ContentBlockSchema),
  relatedPages: z.array(z.string()),
  lastUpdated: z.date(),
  estimatedReadTime: z.number().positive()
})

export const BreadcrumbItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  href: z.string().min(1)
})

export const ContextualLinkSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  href: z.string().url(),
  description: z.string().optional(),
  type: z.enum(['related', 'next', 'previous', 'external'])
})

export const NavigationSubsectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  pages: z.array(DocumentationPageSchema),
  estimatedCompletionTime: z.number().positive()
})

export const NavigationSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  icon: z.string().min(1),
  subsections: z.array(NavigationSubsectionSchema),
  landingPage: z.string().min(1)
})

export const NavigationStructureSchema = z.object({
  sections: z.array(NavigationSectionSchema),
  breadcrumbs: z.array(BreadcrumbItemSchema),
  contextualLinks: z.array(ContextualLinkSchema)
})

export const JourneyStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  requiredPages: z.array(z.string()),
  optionalPages: z.array(z.string()),
  completionCriteria: z.array(z.string()),
  nextSteps: z.array(z.string())
})

export const UserJourneySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  audience: UserAudienceSchema,
  steps: z.array(JourneyStepSchema),
  estimatedDuration: z.number().positive()
})