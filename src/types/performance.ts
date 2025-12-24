import { z } from 'zod'

// Performance Benchmarking Types
export interface PerformanceBenchmark {
  id: string
  name: string
  description: string
  category: BenchmarkCategory
  metrics: PerformanceMetric[]
  baseline: BenchmarkBaseline
  thresholds: PerformanceThreshold[]
  testConfiguration: TestConfiguration
  lastUpdated: Date
}

export interface PerformanceMetric {
  id: string
  name: string
  description: string
  unit: MetricUnit
  value: number
  timestamp: Date
  tags: Record<string, string>
  context: MetricContext
}

export interface BenchmarkBaseline {
  value: number
  confidence: number
  sampleSize: number
  environment: string
  version: string
  date: Date
}

export interface PerformanceThreshold {
  metric: string
  warning: number
  critical: number
  direction: 'above' | 'below'
  description: string
}

export interface TestConfiguration {
  environment: string
  instanceType: string
  region: string
  duration: number
  concurrency: number
  dataSize: string
  parameters: Record<string, unknown>
}

// Scaling Recommendation Types
export interface ScalingRecommendation {
  id: string
  title: string
  description: string
  category: ScalingCategory
  currentMetrics: PerformanceMetric[]
  recommendations: RecommendationItem[]
  estimatedImpact: ImpactEstimate
  implementation: ImplementationGuide
  priority: Priority
}

export interface RecommendationItem {
  id: string
  title: string
  description: string
  type: RecommendationType
  configuration: Record<string, unknown>
  estimatedCost: CostEstimate
  complexity: Complexity
}

export interface ImpactEstimate {
  performance: number
  cost: number
  reliability: number
  maintainability: number
  confidence: number
}

export interface ImplementationGuide {
  steps: ImplementationStep[]
  prerequisites: string[]
  estimatedTime: number
  rollbackPlan: string[]
  validationSteps: string[]
}

export interface ImplementationStep {
  id: string
  title: string
  description: string
  commands: string[]
  validation: string
  rollback: string
}

// Capacity Planning Types
export interface CapacityPlan {
  id: string
  name: string
  description: string
  timeframe: TimeFrame
  currentCapacity: CapacityMetrics
  projectedCapacity: CapacityMetrics
  recommendations: CapacityRecommendation[]
  assumptions: string[]
  risks: RiskAssessment[]
}

export interface CapacityMetrics {
  cpu: ResourceMetric
  memory: ResourceMetric
  storage: ResourceMetric
  network: ResourceMetric
  requests: ResourceMetric
  custom: Record<string, ResourceMetric>
}

export interface ResourceMetric {
  current: number
  peak: number
  average: number
  unit: string
  utilization: number
  trend: TrendDirection
}

export interface CapacityRecommendation {
  id: string
  resource: string
  action: CapacityAction
  magnitude: number
  timeline: string
  justification: string
  cost: CostEstimate
}

export interface RiskAssessment {
  id: string
  description: string
  probability: number
  impact: number
  mitigation: string
  category: RiskCategory
}

// Cost Optimization Types
export interface CostOptimization {
  id: string
  title: string
  description: string
  category: CostCategory
  currentCost: CostBreakdown
  optimizedCost: CostBreakdown
  savings: CostSavings
  recommendations: CostRecommendation[]
  implementation: ImplementationGuide
}

export interface CostBreakdown {
  total: number
  compute: number
  storage: number
  network: number
  monitoring: number
  other: number
  currency: string
  period: string
}

export interface CostSavings {
  amount: number
  percentage: number
  timeframe: string
  confidence: number
  recurring: boolean
}

export interface CostRecommendation {
  id: string
  title: string
  description: string
  type: CostOptimizationType
  savings: number
  effort: Complexity
  risk: RiskLevel
  timeline: string
}

export interface CostEstimate {
  setup: number
  monthly: number
  annual: number
  currency: string
  confidence: number
}

// Architecture Pattern Types
export interface ArchitecturePattern {
  id: string
  name: string
  description: string
  category: ArchitectureCategory
  scale: ScaleLevel
  components: ArchitectureComponent[]
  benefits: string[]
  tradeoffs: string[]
  useCases: string[]
  implementation: PatternImplementation
}

export interface ArchitectureComponent {
  id: string
  name: string
  type: ComponentType
  description: string
  configuration: Record<string, unknown>
  dependencies: string[]
  scalingProperties: ScalingProperties
}

export interface ScalingProperties {
  horizontal: boolean
  vertical: boolean
  autoScaling: boolean
  maxInstances: number
  minInstances: number
  scalingMetrics: string[]
}

export interface PatternImplementation {
  steps: ImplementationStep[]
  codeExamples: CodeExample[]
  configurations: ConfigurationExample[]
  monitoring: MonitoringSetup
}

export interface CodeExample {
  language: string
  title: string
  description: string
  code: string
  dependencies: string[]
}

export interface ConfigurationExample {
  name: string
  description: string
  format: string
  content: string
  variables: Record<string, string>
}

export interface MonitoringSetup {
  metrics: string[]
  alerts: AlertConfiguration[]
  dashboards: DashboardConfiguration[]
}

export interface AlertConfiguration {
  name: string
  condition: string
  threshold: number
  severity: string
}

export interface DashboardConfiguration {
  name: string
  widgets: WidgetConfiguration[]
}

export interface WidgetConfiguration {
  type: string
  title: string
  metrics: string[]
  configuration: Record<string, unknown>
}

// Enums and Union Types
export type BenchmarkCategory = 
  | 'throughput'
  | 'latency'
  | 'resource-usage'
  | 'scalability'
  | 'reliability'

export type MetricUnit = 
  | 'requests/second'
  | 'milliseconds'
  | 'seconds'
  | 'percentage'
  | 'bytes'
  | 'count'

export type MetricContext = 
  | 'load-test'
  | 'production'
  | 'staging'
  | 'synthetic'

export type ScalingCategory = 
  | 'horizontal'
  | 'vertical'
  | 'auto-scaling'
  | 'load-balancing'
  | 'caching'

export type RecommendationType = 
  | 'infrastructure'
  | 'configuration'
  | 'architecture'
  | 'monitoring'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export type Complexity = 'low' | 'medium' | 'high'

export type TimeFrame = 
  | '1-month'
  | '3-months'
  | '6-months'
  | '1-year'
  | '2-years'

export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile'

export type CapacityAction = 
  | 'scale-up'
  | 'scale-down'
  | 'scale-out'
  | 'scale-in'
  | 'optimize'

export type RiskCategory = 
  | 'performance'
  | 'cost'
  | 'availability'
  | 'security'
  | 'compliance'

export type CostCategory = 
  | 'compute'
  | 'storage'
  | 'network'
  | 'monitoring'
  | 'licensing'

export type CostOptimizationType = 
  | 'rightsizing'
  | 'reserved-instances'
  | 'spot-instances'
  | 'storage-optimization'
  | 'network-optimization'

export type RiskLevel = 'low' | 'medium' | 'high'

export type ArchitectureCategory = 
  | 'microservices'
  | 'serverless'
  | 'container'
  | 'hybrid'
  | 'edge'

export type ScaleLevel = 
  | 'small'
  | 'medium'
  | 'large'
  | 'enterprise'

export type ComponentType = 
  | 'compute'
  | 'storage'
  | 'network'
  | 'database'
  | 'cache'
  | 'queue'
  | 'load-balancer'

// Zod Validation Schemas
export const BenchmarkCategorySchema = z.enum([
  'throughput',
  'latency', 
  'resource-usage',
  'scalability',
  'reliability'
])

export const MetricUnitSchema = z.enum([
  'requests/second',
  'milliseconds',
  'seconds',
  'percentage',
  'bytes',
  'count'
])

export const MetricContextSchema = z.enum([
  'load-test',
  'production',
  'staging',
  'synthetic'
])

export const PerformanceMetricSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  unit: MetricUnitSchema,
  value: z.number(),
  timestamp: z.date(),
  tags: z.record(z.string()),
  context: MetricContextSchema
})

export const BenchmarkBaselineSchema = z.object({
  value: z.number(),
  confidence: z.number().min(0).max(1),
  sampleSize: z.number().positive(),
  environment: z.string().min(1),
  version: z.string().min(1),
  date: z.date()
})

export const PerformanceThresholdSchema = z.object({
  metric: z.string().min(1),
  warning: z.number(),
  critical: z.number(),
  direction: z.enum(['above', 'below']),
  description: z.string().min(1)
})

export const TestConfigurationSchema = z.object({
  environment: z.string().min(1),
  instanceType: z.string().min(1),
  region: z.string().min(1),
  duration: z.number().positive(),
  concurrency: z.number().positive(),
  dataSize: z.string().min(1),
  parameters: z.record(z.unknown())
})

export const PerformanceBenchmarkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: BenchmarkCategorySchema,
  metrics: z.array(PerformanceMetricSchema),
  baseline: BenchmarkBaselineSchema,
  thresholds: z.array(PerformanceThresholdSchema),
  testConfiguration: TestConfigurationSchema,
  lastUpdated: z.date()
})

export const CostEstimateSchema = z.object({
  setup: z.number().nonnegative(),
  monthly: z.number().nonnegative(),
  annual: z.number().nonnegative(),
  currency: z.string().min(1),
  confidence: z.number().min(0).max(1)
})

export const ComplexitySchema = z.enum(['low', 'medium', 'high'])

export const RecommendationItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['infrastructure', 'configuration', 'architecture', 'monitoring']),
  configuration: z.record(z.unknown()),
  estimatedCost: CostEstimateSchema,
  complexity: ComplexitySchema
})

export const ImpactEstimateSchema = z.object({
  performance: z.number().min(0).max(100),
  cost: z.number().min(0).max(100),
  reliability: z.number().min(0).max(100),
  maintainability: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1)
})

export const ImplementationStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  commands: z.array(z.string()),
  validation: z.string().min(1),
  rollback: z.string().min(1)
})

export const ImplementationGuideSchema = z.object({
  steps: z.array(ImplementationStepSchema),
  prerequisites: z.array(z.string()),
  estimatedTime: z.number().positive(),
  rollbackPlan: z.array(z.string()),
  validationSteps: z.array(z.string())
})

export const ScalingRecommendationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['horizontal', 'vertical', 'auto-scaling', 'load-balancing', 'caching']),
  currentMetrics: z.array(PerformanceMetricSchema),
  recommendations: z.array(RecommendationItemSchema),
  estimatedImpact: ImpactEstimateSchema,
  implementation: ImplementationGuideSchema,
  priority: z.enum(['low', 'medium', 'high', 'critical'])
})