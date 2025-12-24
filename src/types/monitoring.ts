// Types for monitoring and alerting documentation system
import { z } from 'zod'

export interface MetricDefinition {
  id: string
  name: string
  displayName: string
  description: string
  unit: string
  namespace: string
  dimensions: MetricDimension[]
  category: MetricCategory
  severity: 'low' | 'medium' | 'high' | 'critical'
  defaultThresholds: ThresholdRecommendation[]
  relatedMetrics: string[]
  documentation: string
  examples: MetricExample[]
}

export interface MetricDimension {
  name: string
  description: string
  possibleValues?: string[]
  required: boolean
}

export interface MetricCategory {
  id: string
  name: string
  description: string
  icon?: string
  color?: string
  order: number
}

export interface ThresholdRecommendation {
  condition: 'greater_than' | 'less_than' | 'equal_to' | 'not_equal_to'
  value: number
  duration: string
  severity: 'warning' | 'critical'
  description: string
  rationale: string
}

export interface MetricExample {
  id: string
  title: string
  description: string
  scenario: string
  expectedValue: number
  interpretation: string
}

export interface AlertConfiguration {
  id: string
  name: string
  description: string
  metric: string
  threshold: AlertThreshold
  notifications: NotificationConfiguration[]
  actions: AlertAction[]
  tags: Record<string, string>
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AlertThreshold {
  condition: 'greater_than' | 'less_than' | 'equal_to' | 'not_equal_to'
  value: number
  duration: string
  evaluationPeriods: number
  datapointsToAlarm: number
  treatMissingData: 'breaching' | 'notBreaching' | 'ignore' | 'missing'
}

export interface NotificationConfiguration {
  type: 'email' | 'sms' | 'slack' | 'webhook' | 'sns'
  target: string
  enabled: boolean
  conditions: NotificationCondition[]
}

export interface NotificationCondition {
  state: 'alarm' | 'ok' | 'insufficient_data'
  enabled: boolean
}

export interface AlertAction {
  type: 'auto_scaling' | 'lambda' | 'ec2' | 'custom'
  target: string
  parameters: Record<string, unknown>
  enabled: boolean
}

export interface AlertingWizardStep {
  id: string
  title: string
  description: string
  component: string
  validation: ValidationRule[]
  nextStep?: string
  previousStep?: string
}

export interface ValidationRule {
  field: string
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: unknown
  message: string
  validator?: (value: unknown) => boolean
}

export interface DashboardTemplate {
  id: string
  name: string
  description: string
  category: DashboardCategory
  widgets: DashboardWidget[]
  layout: DashboardLayout
  variables: DashboardVariable[]
  tags: string[]
  useCase: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedSetupTime: string
}

export interface DashboardCategory {
  id: string
  name: string
  description: string
  icon?: string
  order: number
}

export interface DashboardWidget {
  id: string
  type: 'metric' | 'log' | 'text' | 'alarm' | 'custom'
  title: string
  description?: string
  configuration: WidgetConfiguration
  position: WidgetPosition
  size: WidgetSize
}

export interface WidgetConfiguration {
  metrics?: string[]
  queries?: string[]
  timeRange?: string
  refreshInterval?: string
  visualization?: 'line' | 'bar' | 'pie' | 'number' | 'gauge'
  thresholds?: WidgetThreshold[]
  customOptions?: Record<string, unknown>
}

export interface WidgetPosition {
  x: number
  y: number
}

export interface WidgetSize {
  width: number
  height: number
}

export interface WidgetThreshold {
  value: number
  color: string
  label?: string
}

export interface DashboardLayout {
  columns: number
  rows: number
  responsive: boolean
}

export interface DashboardVariable {
  name: string
  type: 'query' | 'constant' | 'custom'
  label: string
  description?: string
  defaultValue?: string
  options?: string[]
  query?: string
}

export interface MonitoringBestPractice {
  id: string
  title: string
  description: string
  category: BestPracticeCategory
  importance: 'low' | 'medium' | 'high' | 'critical'
  implementation: ImplementationGuide
  examples: BestPracticeExample[]
  relatedPractices: string[]
  tags: string[]
}

export interface BestPracticeCategory {
  id: string
  name: string
  description: string
  icon?: string
}

export interface ImplementationGuide {
  overview: string
  steps: ImplementationStep[]
  prerequisites: string[]
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface ImplementationStep {
  id: string
  title: string
  description: string
  code?: string
  commands?: string[]
  validation: string
  troubleshooting?: string[]
}

export interface BestPracticeExample {
  id: string
  title: string
  description: string
  scenario: string
  implementation: string
  benefits: string[]
  metrics: string[]
}

export interface PerformanceMetricCatalog {
  categories: MetricCategory[]
  metrics: MetricDefinition[]
  relationships: MetricRelationship[]
  useCases: MetricUseCase[]
}

export interface MetricRelationship {
  primary: string
  related: string[]
  type: 'correlation' | 'causation' | 'dependency'
  description: string
}

export interface MetricUseCase {
  id: string
  name: string
  description: string
  scenario: string
  metrics: string[]
  dashboards: string[]
  alerts: string[]
  interpretation: string
}

// Zod validation schemas
export const MetricDimensionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  possibleValues: z.array(z.string()).optional(),
  required: z.boolean()
})

export const ThresholdRecommendationSchema = z.object({
  condition: z.enum(['greater_than', 'less_than', 'equal_to', 'not_equal_to']),
  value: z.number(),
  duration: z.string().min(1),
  severity: z.enum(['warning', 'critical']),
  description: z.string().min(1),
  rationale: z.string().min(1)
})

export const MetricDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().min(1),
  unit: z.string().min(1),
  namespace: z.string().min(1),
  dimensions: z.array(MetricDimensionSchema),
  category: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    icon: z.string().optional(),
    color: z.string().optional(),
    order: z.number()
  }),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  defaultThresholds: z.array(ThresholdRecommendationSchema),
  relatedMetrics: z.array(z.string()),
  documentation: z.string().min(1),
  examples: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    scenario: z.string().min(1),
    expectedValue: z.number(),
    interpretation: z.string().min(1)
  }))
})

export const AlertThresholdSchema = z.object({
  condition: z.enum(['greater_than', 'less_than', 'equal_to', 'not_equal_to']),
  value: z.number(),
  duration: z.string().min(1),
  evaluationPeriods: z.number().min(1),
  datapointsToAlarm: z.number().min(1),
  treatMissingData: z.enum(['breaching', 'notBreaching', 'ignore', 'missing'])
})

export const AlertConfigurationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  metric: z.string().min(1),
  threshold: AlertThresholdSchema,
  notifications: z.array(z.object({
    type: z.enum(['email', 'sms', 'slack', 'webhook', 'sns']),
    target: z.string().min(1),
    enabled: z.boolean(),
    conditions: z.array(z.object({
      state: z.enum(['alarm', 'ok', 'insufficient_data']),
      enabled: z.boolean()
    }))
  })),
  actions: z.array(z.object({
    type: z.enum(['auto_scaling', 'lambda', 'ec2', 'custom']),
    target: z.string().min(1),
    parameters: z.record(z.unknown()),
    enabled: z.boolean()
  })),
  tags: z.record(z.string()),
  enabled: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const DashboardTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    icon: z.string().optional(),
    order: z.number()
  }),
  widgets: z.array(z.object({
    id: z.string().min(1),
    type: z.enum(['metric', 'log', 'text', 'alarm', 'custom']),
    title: z.string().min(1),
    description: z.string().optional(),
    configuration: z.object({
      metrics: z.array(z.string()).optional(),
      queries: z.array(z.string()).optional(),
      timeRange: z.string().optional(),
      refreshInterval: z.string().optional(),
      visualization: z.enum(['line', 'bar', 'pie', 'number', 'gauge']).optional(),
      thresholds: z.array(z.object({
        value: z.number(),
        color: z.string(),
        label: z.string().optional()
      })).optional(),
      customOptions: z.record(z.unknown()).optional()
    }),
    position: z.object({
      x: z.number(),
      y: z.number()
    }),
    size: z.object({
      width: z.number(),
      height: z.number()
    })
  })),
  layout: z.object({
    columns: z.number().min(1),
    rows: z.number().min(1),
    responsive: z.boolean()
  }),
  variables: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['query', 'constant', 'custom']),
    label: z.string().min(1),
    description: z.string().optional(),
    defaultValue: z.string().optional(),
    options: z.array(z.string()).optional(),
    query: z.string().optional()
  })),
  tags: z.array(z.string()),
  useCase: z.string().min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedSetupTime: z.string().min(1)
})

export const MonitoringBestPracticeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    icon: z.string().optional()
  }),
  importance: z.enum(['low', 'medium', 'high', 'critical']),
  implementation: z.object({
    overview: z.string().min(1),
    steps: z.array(z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      code: z.string().optional(),
      commands: z.array(z.string()).optional(),
      validation: z.string().min(1),
      troubleshooting: z.array(z.string()).optional()
    })),
    prerequisites: z.array(z.string()),
    estimatedTime: z.string().min(1),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced'])
  }),
  examples: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    scenario: z.string().min(1),
    implementation: z.string().min(1),
    benefits: z.array(z.string()),
    metrics: z.array(z.string())
  })),
  relatedPractices: z.array(z.string()),
  tags: z.array(z.string())
})