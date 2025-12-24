import { ConfigurationUseCase, PerformanceCharacteristics } from '../types/configuration'
import { CONFIGURATION_USE_CASES } from '../data/configuration-use-cases'

export interface PerformanceTuningRecommendation {
  parameter: string
  currentValue: unknown
  recommendedValue: unknown
  reason: string
  impact: 'high' | 'medium' | 'low'
  category: 'performance' | 'cost' | 'security' | 'reliability'
}

export interface TuningContext {
  environment: 'development' | 'staging' | 'production'
  trafficVolume: 'low' | 'medium' | 'high' | 'very-high'
  primaryGoal: 'performance' | 'cost' | 'security' | 'observability'
  constraints: string[]
}

export class PerformanceTuningEngine {
  generateRecommendations(
    currentConfig: Record<string, unknown>,
    context: TuningContext
  ): PerformanceTuningRecommendation[] {
    const recommendations: PerformanceTuningRecommendation[] = []

    // Sampling rate recommendations
    const samplingRateRec = this.analyzeSamplingRate(currentConfig, context)
    if (samplingRateRec) recommendations.push(samplingRateRec)

    // Batch size recommendations
    const batchSizeRec = this.analyzeBatchSize(currentConfig, context)
    if (batchSizeRec) recommendations.push(batchSizeRec)

    // Export configuration recommendations
    const exportRecs = this.analyzeExportConfiguration(currentConfig, context)
    recommendations.push(...exportRecs)

    // Security recommendations
    const securityRecs = this.analyzeSecurityConfiguration(currentConfig, context)
    recommendations.push(...securityRecs)

    // Cost optimization recommendations
    const costRecs = this.analyzeCostOptimization(currentConfig, context)
    recommendations.push(...costRecs)

    // Performance optimization recommendations
    const perfRecs = this.analyzePerformanceOptimization(currentConfig, context)
    recommendations.push(...perfRecs)

    return recommendations.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      return impactOrder[b.impact] - impactOrder[a.impact]
    })
  }

  private analyzeSamplingRate(
    config: Record<string, unknown>,
    context: TuningContext
  ): PerformanceTuningRecommendation | null {
    const currentRate = config.samplingRate as number
    if (typeof currentRate !== 'number') return null

    let recommendedRate: number
    let reason: string
    let impact: 'high' | 'medium' | 'low' = 'medium'

    switch (context.trafficVolume) {
      case 'very-high':
        recommendedRate = context.primaryGoal === 'performance' ? 0.001 : 0.01
        reason = 'Very high traffic requires minimal sampling to maintain performance'
        impact = 'high'
        break
      case 'high':
        recommendedRate = context.primaryGoal === 'performance' ? 0.01 : 0.05
        reason = 'High traffic benefits from reduced sampling rate'
        impact = 'high'
        break
      case 'medium':
        recommendedRate = context.primaryGoal === 'cost' ? 0.05 : 0.1
        reason = 'Medium traffic allows for moderate sampling'
        impact = 'medium'
        break
      case 'low':
        recommendedRate = context.environment === 'development' ? 1.0 : 0.2
        reason = 'Low traffic can support higher sampling rates'
        impact = 'low'
        break
      default:
        return null
    }

    if (Math.abs(currentRate - recommendedRate) < 0.005) return null

    return {
      parameter: 'samplingRate',
      currentValue: currentRate,
      recommendedValue: recommendedRate,
      reason,
      impact,
      category: context.primaryGoal === 'cost' ? 'cost' : 'performance'
    }
  }

  private analyzeBatchSize(
    config: Record<string, unknown>,
    context: TuningContext
  ): PerformanceTuningRecommendation | null {
    const currentSize = config.batchSize as number
    if (typeof currentSize !== 'number') return null

    let recommendedSize: number
    let reason: string
    let impact: 'high' | 'medium' | 'low' = 'medium'

    if (context.primaryGoal === 'performance' && context.trafficVolume === 'very-high') {
      recommendedSize = 500
      reason = 'Large batches reduce export overhead for high-traffic applications'
      impact = 'high'
    } else if (context.primaryGoal === 'cost') {
      recommendedSize = 300
      reason = 'Larger batches reduce API call costs'
      impact = 'medium'
    } else if (context.environment === 'development') {
      recommendedSize = 10
      reason = 'Small batches provide faster feedback during development'
      impact = 'low'
    } else {
      recommendedSize = 100
      reason = 'Standard batch size for balanced performance'
      impact = 'low'
    }

    if (Math.abs(currentSize - recommendedSize) < 20) return null

    return {
      parameter: 'batchSize',
      currentValue: currentSize,
      recommendedValue: recommendedSize,
      reason,
      impact,
      category: context.primaryGoal === 'cost' ? 'cost' : 'performance'
    }
  }

  private analyzeExportConfiguration(
    config: Record<string, unknown>,
    context: TuningContext
  ): PerformanceTuningRecommendation[] {
    const recommendations: PerformanceTuningRecommendation[] = []

    // Async export recommendation
    if (config.asyncExport !== true && context.environment === 'production') {
      recommendations.push({
        parameter: 'asyncExport',
        currentValue: config.asyncExport,
        recommendedValue: true,
        reason: 'Async export prevents blocking application threads in production',
        impact: 'high',
        category: 'performance'
      })
    }

    // Compression recommendation
    if (config.compressionEnabled !== true) {
      recommendations.push({
        parameter: 'compressionEnabled',
        currentValue: config.compressionEnabled,
        recommendedValue: true,
        reason: 'Compression reduces bandwidth usage and costs',
        impact: 'medium',
        category: 'cost'
      })
    }

    // Export timeout optimization
    const currentTimeout = config.exportTimeout as number
    if (typeof currentTimeout === 'number') {
      let recommendedTimeout: number
      
      if (context.primaryGoal === 'performance' && context.trafficVolume === 'very-high') {
        recommendedTimeout = 10000
      } else if (context.environment === 'development') {
        recommendedTimeout = 5000
      } else {
        recommendedTimeout = 30000
      }

      if (Math.abs(currentTimeout - recommendedTimeout) > 5000) {
        recommendations.push({
          parameter: 'exportTimeout',
          currentValue: currentTimeout,
          recommendedValue: recommendedTimeout,
          reason: `Optimized timeout for ${context.environment} environment`,
          impact: 'low',
          category: 'reliability'
        })
      }
    }

    return recommendations
  }

  private analyzeSecurityConfiguration(
    config: Record<string, unknown>,
    context: TuningContext
  ): PerformanceTuningRecommendation[] {
    const recommendations: PerformanceTuningRecommendation[] = []

    if (context.primaryGoal === 'security' || context.environment === 'production') {
      // HTTP headers capture
      if (config.captureHttpHeaders === true) {
        recommendations.push({
          parameter: 'captureHttpHeaders',
          currentValue: true,
          recommendedValue: false,
          reason: 'HTTP headers may contain sensitive authentication data',
          impact: 'high',
          category: 'security'
        })
      }

      // HTTP body capture
      if (config.captureHttpBody === true) {
        recommendations.push({
          parameter: 'captureHttpBody',
          currentValue: true,
          recommendedValue: false,
          reason: 'HTTP bodies often contain sensitive user data',
          impact: 'high',
          category: 'security'
        })
      }

      // Exception capture
      if (config.captureExceptions === true && context.constraints.includes('pii-sensitive')) {
        recommendations.push({
          parameter: 'captureExceptions',
          currentValue: true,
          recommendedValue: false,
          reason: 'Exception messages may contain sensitive information',
          impact: 'medium',
          category: 'security'
        })
      }

      // Encryption recommendations
      if (config.encryptionInTransit !== true) {
        recommendations.push({
          parameter: 'encryptionInTransit',
          currentValue: config.encryptionInTransit,
          recommendedValue: true,
          reason: 'Encryption in transit protects data during transmission',
          impact: 'high',
          category: 'security'
        })
      }
    }

    return recommendations
  }

  private analyzeCostOptimization(
    config: Record<string, unknown>,
    context: TuningContext
  ): PerformanceTuningRecommendation[] {
    const recommendations: PerformanceTuningRecommendation[] = []

    if (context.primaryGoal === 'cost') {
      // Disable metrics if not essential
      if (config.enableMetrics === true) {
        recommendations.push({
          parameter: 'enableMetrics',
          currentValue: true,
          recommendedValue: false,
          reason: 'Disabling metrics can significantly reduce costs for high-volume applications',
          impact: 'high',
          category: 'cost'
        })
      }

      // Disable logs if not essential
      if (config.enableLogs === true) {
        recommendations.push({
          parameter: 'enableLogs',
          currentValue: true,
          recommendedValue: false,
          reason: 'Log correlation adds significant data volume and cost',
          impact: 'high',
          category: 'cost'
        })
      }

      // Optimize queue size
      const currentQueueSize = config.maxQueueSize as number
      if (typeof currentQueueSize === 'number' && currentQueueSize > 2000) {
        recommendations.push({
          parameter: 'maxQueueSize',
          currentValue: currentQueueSize,
          recommendedValue: 1000,
          reason: 'Smaller queues reduce memory usage and potential data loss costs',
          impact: 'medium',
          category: 'cost'
        })
      }
    }

    return recommendations
  }

  private analyzePerformanceOptimization(
    config: Record<string, unknown>,
    context: TuningContext
  ): PerformanceTuningRecommendation[] {
    const recommendations: PerformanceTuningRecommendation[] = []

    if (context.primaryGoal === 'performance') {
      // Span attributes optimization
      const currentAttributes = config.maxSpanAttributes as number
      if (typeof currentAttributes === 'number' && currentAttributes > 64) {
        recommendations.push({
          parameter: 'maxSpanAttributes',
          currentValue: currentAttributes,
          recommendedValue: 32,
          reason: 'Fewer span attributes reduce memory usage and processing overhead',
          impact: 'medium',
          category: 'performance'
        })
      }

      // Span events optimization
      const currentEvents = config.maxSpanEvents as number
      if (typeof currentEvents === 'number' && currentEvents > 128) {
        recommendations.push({
          parameter: 'maxSpanEvents',
          currentValue: currentEvents,
          recommendedValue: 64,
          reason: 'Limiting span events reduces memory usage',
          impact: 'medium',
          category: 'performance'
        })
      }

      // Buffer size optimization
      const currentBufferSize = config.bufferSize as number
      if (typeof currentBufferSize === 'number' && currentBufferSize < 4096) {
        recommendations.push({
          parameter: 'bufferSize',
          currentValue: currentBufferSize,
          recommendedValue: 8192,
          reason: 'Larger buffers improve export efficiency',
          impact: 'low',
          category: 'performance'
        })
      }
    }

    return recommendations
  }

  findSimilarUseCase(
    config: Record<string, unknown>,
    context: TuningContext
  ): ConfigurationUseCase | null {
    let bestMatch: ConfigurationUseCase | null = null
    let bestScore = 0

    for (const useCase of CONFIGURATION_USE_CASES) {
      let score = 0

      // Environment match
      if (useCase.environment === context.environment) score += 3

      // Performance characteristics match
      const perfMatch = this.calculatePerformanceMatch(useCase.performance, context)
      score += perfMatch

      // Configuration similarity
      const configSimilarity = this.calculateConfigSimilarity(config, useCase.configuration)
      score += configSimilarity

      if (score > bestScore) {
        bestScore = score
        bestMatch = useCase
      }
    }

    return bestScore > 5 ? bestMatch : null
  }

  private calculatePerformanceMatch(
    performance: PerformanceCharacteristics,
    context: TuningContext
  ): number {
    let score = 0

    // Match overhead preference
    if (context.primaryGoal === 'performance' && performance.overhead === 'low') score += 2
    if (context.primaryGoal === 'observability' && performance.overhead === 'medium') score += 2
    if (context.environment === 'development' && performance.overhead === 'high') score += 1

    return score
  }

  private calculateConfigSimilarity(
    config1: Record<string, unknown>,
    config2: Record<string, unknown>
  ): number {
    let matches = 0
    let total = 0

    const keys = new Set([...Object.keys(config1), ...Object.keys(config2)])
    
    for (const key of keys) {
      total++
      if (config1[key] === config2[key]) {
        matches++
      } else if (typeof config1[key] === 'number' && typeof config2[key] === 'number') {
        // For numeric values, consider close values as partial matches
        const diff = Math.abs((config1[key] as number) - (config2[key] as number))
        const avg = ((config1[key] as number) + (config2[key] as number)) / 2
        if (diff / avg < 0.2) matches += 0.5
      }
    }

    return total > 0 ? (matches / total) * 3 : 0
  }

  estimatePerformanceImpact(
    config: Record<string, unknown>,
    context: TuningContext
  ): PerformanceCharacteristics {
    let overhead: 'low' | 'medium' | 'high' = 'low'
    let throughputPenalty = 0
    let latencyIncrease = 0
    let memoryIncrease = 0

    // Sampling rate impact
    const samplingRate = config.samplingRate as number
    if (typeof samplingRate === 'number') {
      if (samplingRate > 0.5) {
        overhead = 'high'
        throughputPenalty += 15
        latencyIncrease += 10
        memoryIncrease += 100
      } else if (samplingRate > 0.1) {
        overhead = 'medium'
        throughputPenalty += 5
        latencyIncrease += 3
        memoryIncrease += 30
      } else {
        throughputPenalty += 1
        latencyIncrease += 1
        memoryIncrease += 10
      }
    }

    // Feature impact
    if (config.enableLogs === true) {
      throughputPenalty += 3
      latencyIncrease += 2
      memoryIncrease += 20
    }

    if (config.captureHttpBody === true) {
      throughputPenalty += 5
      latencyIncrease += 3
      memoryIncrease += 50
    }

    if (config.captureHttpHeaders === true) {
      throughputPenalty += 2
      latencyIncrease += 1
      memoryIncrease += 15
    }

    // Async export benefit
    if (config.asyncExport !== true) {
      throughputPenalty += 10
      latencyIncrease += 5
    }

    return {
      overhead,
      throughput: `${Math.max(70, 100 - throughputPenalty)}% of baseline`,
      latency: `${Math.max(1, latencyIncrease)}ms additional latency`,
      memoryUsage: `${Math.max(10, memoryIncrease)}MB additional memory`,
      recommendations: this.generatePerformanceRecommendations(config, overhead)
    }
  }

  private generatePerformanceRecommendations(
    config: Record<string, unknown>,
    overhead: 'low' | 'medium' | 'high'
  ): string[] {
    const recommendations: string[] = []

    if (overhead === 'high') {
      recommendations.push('Consider reducing sampling rate for production use')
      recommendations.push('Disable non-essential features like body capture')
      recommendations.push('Monitor application performance metrics closely')
    }

    if (config.asyncExport !== true) {
      recommendations.push('Enable async export to prevent blocking application threads')
    }

    if (config.compressionEnabled !== true) {
      recommendations.push('Enable compression to reduce bandwidth usage')
    }

    if (typeof config.batchSize === 'number' && config.batchSize < 50) {
      recommendations.push('Increase batch size to improve export efficiency')
    }

    return recommendations
  }
}