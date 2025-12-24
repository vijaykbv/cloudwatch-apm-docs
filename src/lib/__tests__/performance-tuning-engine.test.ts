/**
 * Unit tests for performance tuning engine
 * Tests configuration validation logic and example generation
 * Validates: Requirements 4.2, 4.4
 */

import { PerformanceTuningEngine, TuningContext } from '../performance-tuning-engine'
import { CONFIGURATION_USE_CASES } from '../../data/configuration-use-cases'

describe('PerformanceTuningEngine', () => {
  let engine: PerformanceTuningEngine

  beforeEach(() => {
    engine = new PerformanceTuningEngine()
  })

  describe('generateRecommendations', () => {
    test('should recommend lower sampling rate for high traffic', () => {
      const config = { samplingRate: 0.5, batchSize: 100 }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'very-high',
        primaryGoal: 'performance',
        constraints: []
      }

      const recommendations = engine.generateRecommendations(config, context)
      
      const samplingRec = recommendations.find(r => r.parameter === 'samplingRate')
      expect(samplingRec).toBeDefined()
      expect(samplingRec!.recommendedValue).toBeLessThan(0.5)
      expect(samplingRec!.impact).toBe('high')
      expect(samplingRec!.category).toBe('performance')
    })

    test('should recommend larger batch sizes for performance optimization', () => {
      const config = { samplingRate: 0.1, batchSize: 50 }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'very-high',
        primaryGoal: 'performance',
        constraints: []
      }

      const recommendations = engine.generateRecommendations(config, context)
      
      const batchRec = recommendations.find(r => r.parameter === 'batchSize')
      expect(batchRec).toBeDefined()
      expect(batchRec!.recommendedValue).toBeGreaterThan(50)
      expect(batchRec!.category).toBe('performance')
    })

    test('should recommend security settings for security-focused context', () => {
      const config = { 
        samplingRate: 0.1, 
        captureHttpHeaders: true, 
        captureHttpBody: true 
      }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'medium',
        primaryGoal: 'security',
        constraints: ['pii-sensitive']
      }

      const recommendations = engine.generateRecommendations(config, context)
      
      const headerRec = recommendations.find(r => r.parameter === 'captureHttpHeaders')
      const bodyRec = recommendations.find(r => r.parameter === 'captureHttpBody')
      
      expect(headerRec).toBeDefined()
      expect(headerRec!.recommendedValue).toBe(false)
      expect(headerRec!.category).toBe('security')
      
      expect(bodyRec).toBeDefined()
      expect(bodyRec!.recommendedValue).toBe(false)
      expect(bodyRec!.category).toBe('security')
    })

    test('should recommend cost optimization settings', () => {
      const config = { 
        samplingRate: 0.1, 
        enableMetrics: true, 
        enableLogs: true,
        maxQueueSize: 5000
      }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'medium',
        primaryGoal: 'cost',
        constraints: []
      }

      const recommendations = engine.generateRecommendations(config, context)
      
      const metricsRec = recommendations.find(r => r.parameter === 'enableMetrics')
      const logsRec = recommendations.find(r => r.parameter === 'enableLogs')
      
      expect(metricsRec).toBeDefined()
      expect(metricsRec!.recommendedValue).toBe(false)
      expect(metricsRec!.category).toBe('cost')
      
      expect(logsRec).toBeDefined()
      expect(logsRec!.recommendedValue).toBe(false)
      expect(logsRec!.category).toBe('cost')
    })

    test('should prioritize high impact recommendations', () => {
      const config = { 
        samplingRate: 0.8, 
        batchSize: 10,
        asyncExport: false
      }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'very-high',
        primaryGoal: 'performance',
        constraints: []
      }

      const recommendations = engine.generateRecommendations(config, context)
      
      // Should be sorted by impact (high first)
      expect(recommendations[0].impact).toBe('high')
      
      // High impact recommendations should include sampling rate and async export
      const highImpactParams = recommendations
        .filter(r => r.impact === 'high')
        .map(r => r.parameter)
      
      expect(highImpactParams).toContain('samplingRate')
      expect(highImpactParams).toContain('asyncExport')
    })

    test('should not recommend changes for already optimal configurations', () => {
      const config = { 
        samplingRate: 0.01, 
        batchSize: 500,
        asyncExport: true,
        compressionEnabled: true
      }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'very-high',
        primaryGoal: 'performance',
        constraints: []
      }

      const recommendations = engine.generateRecommendations(config, context)
      
      // Should have minimal recommendations for already optimized config
      expect(recommendations.length).toBeLessThan(3)
    })
  })

  describe('findSimilarUseCase', () => {
    test('should find matching use case for production monitoring config', () => {
      const config = {
        samplingRate: 0.1,
        enableTracing: true,
        enableMetrics: true,
        enableLogs: false,
        batchSize: 100
      }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'medium',
        primaryGoal: 'performance',
        constraints: []
      }

      const similarUseCase = engine.findSimilarUseCase(config, context)
      
      expect(similarUseCase).toBeDefined()
      expect(similarUseCase!.environment).toBe('production')
      expect(similarUseCase!.performance.overhead).toBe('low')
    })

    test('should find debugging use case for development environment', () => {
      const config = {
        samplingRate: 1.0,
        enableTracing: true,
        enableMetrics: true,
        enableLogs: true,
        captureHttpHeaders: true,
        captureHttpBody: true,
        batchSize: 10,
        asyncExport: false
      }
      const context: TuningContext = {
        environment: 'development',
        trafficVolume: 'low',
        primaryGoal: 'observability',
        constraints: []
      }

      const similarUseCase = engine.findSimilarUseCase(config, context)
      
      expect(similarUseCase).toBeDefined()
      expect(similarUseCase!.environment).toBe('development')
      expect(similarUseCase!.name).toContain('Debug')
    })

    test('should return null for no good matches', () => {
      const config = {
        samplingRate: 0.7,
        unknownParameter: 'value'
      }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'medium',
        primaryGoal: 'performance',
        constraints: []
      }

      const similarUseCase = engine.findSimilarUseCase(config, context)
      
      expect(similarUseCase).toBeNull()
    })
  })

  describe('estimatePerformanceImpact', () => {
    test('should estimate high overhead for high sampling rate', () => {
      const config = {
        samplingRate: 0.8,
        enableLogs: true,
        captureHttpBody: true
      }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'high',
        primaryGoal: 'observability',
        constraints: []
      }

      const impact = engine.estimatePerformanceImpact(config, context)
      
      expect(impact.overhead).toBe('high')
      expect(impact.throughput).toMatch(/\d+% of baseline/)
      expect(impact.latency).toMatch(/\d+ms additional latency/)
      expect(impact.memoryUsage).toMatch(/\d+MB additional memory/)
      expect(impact.recommendations.length).toBeGreaterThan(0)
    })

    test('should estimate low overhead for optimized configuration', () => {
      const config = {
        samplingRate: 0.01,
        enableLogs: false,
        captureHttpBody: false,
        asyncExport: true,
        compressionEnabled: true
      }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'high',
        primaryGoal: 'performance',
        constraints: []
      }

      const impact = engine.estimatePerformanceImpact(config, context)
      
      expect(impact.overhead).toBe('low')
      expect(impact.recommendations.length).toBeLessThan(3)
    })

    test('should provide specific recommendations based on configuration issues', () => {
      const config = {
        samplingRate: 0.1,
        asyncExport: false,
        compressionEnabled: false,
        batchSize: 10
      }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'medium',
        primaryGoal: 'performance',
        constraints: []
      }

      const impact = engine.estimatePerformanceImpact(config, context)
      
      expect(impact.recommendations).toContain('Enable async export to prevent blocking application threads')
      expect(impact.recommendations).toContain('Enable compression to reduce bandwidth usage')
      expect(impact.recommendations).toContain('Increase batch size to improve export efficiency')
    })
  })

  describe('edge cases and error handling', () => {
    test('should handle missing configuration parameters gracefully', () => {
      const config = {}
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'medium',
        primaryGoal: 'performance',
        constraints: []
      }

      const recommendations = engine.generateRecommendations(config, context)
      
      // Should not crash and should provide some basic recommendations
      expect(recommendations).toBeInstanceOf(Array)
    })

    test('should handle invalid parameter types', () => {
      const config = {
        samplingRate: 'invalid',
        batchSize: 'also-invalid'
      }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'medium',
        primaryGoal: 'performance',
        constraints: []
      }

      const recommendations = engine.generateRecommendations(config, context)
      
      // Should handle gracefully without crashing
      expect(recommendations).toBeInstanceOf(Array)
    })

    test('should handle extreme configuration values', () => {
      const config = {
        samplingRate: 10.0, // Invalid - over 1.0
        batchSize: -100,    // Invalid - negative
        maxQueueSize: 1000000 // Very large
      }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'medium',
        primaryGoal: 'performance',
        constraints: []
      }

      const impact = engine.estimatePerformanceImpact(config, context)
      
      // Should handle extreme values without crashing
      expect(impact).toBeDefined()
      expect(impact.overhead).toMatch(/^(low|medium|high)$/)
    })
  })

  describe('context-specific recommendations', () => {
    test('should provide development-specific recommendations', () => {
      const config = { samplingRate: 0.1, batchSize: 100 }
      const context: TuningContext = {
        environment: 'development',
        trafficVolume: 'low',
        primaryGoal: 'observability',
        constraints: []
      }

      const recommendations = engine.generateRecommendations(config, context)
      
      // Development should favor observability over performance
      const batchRec = recommendations.find(r => r.parameter === 'batchSize')
      if (batchRec) {
        expect(batchRec.recommendedValue).toBeLessThan(100)
        expect(batchRec.reason).toContain('development')
      }
    })

    test('should handle constraint-based recommendations', () => {
      const config = { 
        captureExceptions: true,
        captureHttpHeaders: true 
      }
      const context: TuningContext = {
        environment: 'production',
        trafficVolume: 'medium',
        primaryGoal: 'security',
        constraints: ['pii-sensitive', 'gdpr-compliant']
      }

      const recommendations = engine.generateRecommendations(config, context)
      
      // Should recommend disabling data capture for PII-sensitive environments
      const exceptionRec = recommendations.find(r => r.parameter === 'captureExceptions')
      expect(exceptionRec).toBeDefined()
      expect(exceptionRec!.recommendedValue).toBe(false)
      expect(exceptionRec!.reason).toContain('sensitive')
    })
  })
})