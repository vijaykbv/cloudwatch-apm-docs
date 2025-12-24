/**
 * Unit tests for configuration validation tools
 * Tests configuration validation logic and template generation
 * Validates: Requirements 4.2, 4.4
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ConfigurationValidationTools from '../ConfigurationValidationTools'
import { CONFIGURATION_USE_CASES } from '../../../data/configuration-use-cases'

// Mock the performance tuning engine
jest.mock('../../../lib/performance-tuning-engine', () => ({
  PerformanceTuningEngine: jest.fn().mockImplementation(() => ({
    generateRecommendations: jest.fn().mockReturnValue([]),
    estimatePerformanceImpact: jest.fn().mockReturnValue({
      overhead: 'low',
      throughput: '95% of baseline',
      latency: '2ms additional latency',
      memoryUsage: '30MB additional memory',
      recommendations: ['Test recommendation']
    })
  }))
}))

describe('ConfigurationValidationTools', () => {
  const mockOnUseCaseSelect = jest.fn()
  const mockOnConfigurationGenerated = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Use Cases Tab', () => {
    test('should render use cases grid', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      expect(screen.getByText('Use Cases')).toBeInTheDocument()
      
      // Should show some use cases
      expect(screen.getByText('Basic Application Monitoring')).toBeInTheDocument()
      expect(screen.getByText('High-Traffic Performance Optimization')).toBeInTheDocument()
    })

    test('should filter use cases by environment', async () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const environmentSelect = screen.getByLabelText('Environment')
      fireEvent.change(environmentSelect, { target: { value: 'development' } })

      await waitFor(() => {
        // Should show development use cases
        expect(screen.getByText('Comprehensive Debugging Setup')).toBeInTheDocument()
        
        // Should not show production-only use cases
        expect(screen.queryByText('High-Traffic Performance Optimization')).not.toBeInTheDocument()
      })
    })

    test('should filter use cases by platform', async () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const platformSelect = screen.getByLabelText('Platform')
      fireEvent.change(platformSelect, { target: { value: 'kubernetes' } })

      await waitFor(() => {
        // Should show kubernetes-compatible use cases
        expect(screen.getByText('Containerized Kubernetes Deployment')).toBeInTheDocument()
        expect(screen.getByText('Microservices Distributed Tracing')).toBeInTheDocument()
      })
    })

    test('should select use case and call callbacks', async () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const selectButton = screen.getAllByText('Select')[0]
      fireEvent.click(selectButton)

      await waitFor(() => {
        expect(mockOnUseCaseSelect).toHaveBeenCalledWith(
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            configuration: expect.any(Object)
          })
        )
        expect(mockOnConfigurationGenerated).toHaveBeenCalledWith(
          expect.any(Object)
        )
      })
    })

    test('should display use case performance characteristics', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      // Should show overhead indicators
      expect(screen.getAllByText('low').length).toBeGreaterThan(0)
      expect(screen.getAllByText('medium').length).toBeGreaterThan(0)
      
      // Should show platform tags
      expect(screen.getAllByText('java').length).toBeGreaterThan(0)
      expect(screen.getAllByText('nodejs').length).toBeGreaterThan(0)
    })
  })

  describe('Validation Tab', () => {
    test('should switch to validation tab', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const validationTab = screen.getByText('Validation')
      fireEvent.click(validationTab)

      expect(screen.getByText('Configuration Validation')).toBeInTheDocument()
      expect(screen.getByText('Validate Configuration')).toBeInTheDocument()
    })

    test('should disable validate button when no configuration', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const validationTab = screen.getByText('Validation')
      fireEvent.click(validationTab)

      const validateButton = screen.getByText('Validate Configuration')
      expect(validateButton).toBeDisabled()
    })

    test('should clear validation results', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const validationTab = screen.getByText('Validation')
      fireEvent.click(validationTab)

      const clearButton = screen.getByText('Clear Results')
      fireEvent.click(clearButton)

      // Should not show any validation results
      expect(screen.queryByText('Configuration Valid')).not.toBeInTheDocument()
      expect(screen.queryByText('Configuration Invalid')).not.toBeInTheDocument()
    })
  })

  describe('Performance Tab', () => {
    test('should switch to performance tab', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const performanceTab = screen.getByText('Performance')
      fireEvent.click(performanceTab)

      expect(screen.getByText('Configuration Optimization')).toBeInTheDocument()
    })

    test('should show optimization buttons', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const performanceTab = screen.getByText('Performance')
      fireEvent.click(performanceTab)

      expect(screen.getByText('Optimize for Performance')).toBeInTheDocument()
      expect(screen.getByText('Optimize for Cost')).toBeInTheDocument()
      expect(screen.getByText('Optimize for Security')).toBeInTheDocument()
    })

    test('should generate optimized configuration for performance', async () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const performanceTab = screen.getByText('Performance')
      fireEvent.click(performanceTab)

      const optimizeButton = screen.getByText('Optimize for Performance')
      fireEvent.click(optimizeButton)

      await waitFor(() => {
        expect(mockOnConfigurationGenerated).toHaveBeenCalledWith(
          expect.objectContaining({
            samplingRate: 0.01,
            batchSize: 500,
            asyncExport: true,
            compressionEnabled: true,
            maxSpanAttributes: 32
          })
        )
      })
    })

    test('should generate optimized configuration for cost', async () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const performanceTab = screen.getByText('Performance')
      fireEvent.click(performanceTab)

      const optimizeButton = screen.getByText('Optimize for Cost')
      fireEvent.click(optimizeButton)

      await waitFor(() => {
        expect(mockOnConfigurationGenerated).toHaveBeenCalledWith(
          expect.objectContaining({
            samplingRate: 0.02,
            enableMetrics: false,
            enableLogs: false,
            batchSize: 300,
            compressionEnabled: true
          })
        )
      })
    })

    test('should generate optimized configuration for security', async () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const performanceTab = screen.getByText('Performance')
      fireEvent.click(performanceTab)

      const optimizeButton = screen.getByText('Optimize for Security')
      fireEvent.click(optimizeButton)

      await waitFor(() => {
        expect(mockOnConfigurationGenerated).toHaveBeenCalledWith(
          expect.objectContaining({
            captureHttpHeaders: false,
            captureHttpBody: false,
            captureExceptions: false,
            dataRedaction: true,
            encryptionInTransit: true
          })
        )
      })
    })
  })

  describe('Recommendations Tab', () => {
    test('should switch to recommendations tab', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const recommendationsTab = screen.getByText('Recommendations')
      fireEvent.click(recommendationsTab)

      // Should show performance tuning recommendations
      expect(screen.getByText('High-Traffic Performance Tuning')).toBeInTheDocument()
      expect(screen.getByText('Debugging Configuration Tuning')).toBeInTheDocument()
      expect(screen.getByText('Cost Optimization Strategies')).toBeInTheDocument()
      expect(screen.getByText('Security-Focused Configuration')).toBeInTheDocument()
    })

    test('should display parameter recommendations with reasons', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const recommendationsTab = screen.getByText('Recommendations')
      fireEvent.click(recommendationsTab)

      // Should show specific parameter recommendations (multiple instances expected)
      expect(screen.getAllByText('samplingRate').length).toBeGreaterThan(0)
      expect(screen.getAllByText('batchSize').length).toBeGreaterThan(0)
      expect(screen.getByText('asyncExport')).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    test('should highlight active tab', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      const useCasesTab = screen.getByText('Use Cases')
      const validationTab = screen.getByText('Validation')

      // Use Cases tab should be active by default
      expect(useCasesTab).toHaveClass('text-blue-600')
      expect(validationTab).toHaveClass('text-gray-500')

      // Click validation tab
      fireEvent.click(validationTab)

      // Validation tab should now be active
      expect(validationTab).toHaveClass('text-blue-600')
      expect(useCasesTab).toHaveClass('text-gray-500')
    })

    test('should switch content when changing tabs', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      // Should show use cases content by default
      expect(screen.getByText('Basic Application Monitoring')).toBeInTheDocument()
      expect(screen.queryByText('Configuration Validation')).not.toBeInTheDocument()

      // Switch to validation tab
      const validationTab = screen.getByText('Validation')
      fireEvent.click(validationTab)

      // Should show validation content
      expect(screen.getByText('Configuration Validation')).toBeInTheDocument()
      expect(screen.queryByText('Basic Application Monitoring')).not.toBeInTheDocument()
    })
  })

  describe('Integration with Use Cases Data', () => {
    test('should display all available use cases', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      // Should display use cases from the data
      CONFIGURATION_USE_CASES.forEach(useCase => {
        expect(screen.getByText(useCase.name)).toBeInTheDocument()
      })
    })

    test('should show correct platform tags for each use case', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      // Check that platform tags are displayed
      const kubernetesUseCase = CONFIGURATION_USE_CASES.find(uc => 
        uc.platforms.includes('kubernetes')
      )
      
      if (kubernetesUseCase) {
        expect(screen.getByText(kubernetesUseCase.name)).toBeInTheDocument()
        expect(screen.getAllByText('kubernetes').length).toBeGreaterThan(0)
      }
    })

    test('should show correct environment for each use case', () => {
      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      // Check that environments are displayed correctly
      const productionUseCases = CONFIGURATION_USE_CASES.filter(uc => 
        uc.environment === 'production'
      )
      
      expect(productionUseCases.length).toBeGreaterThan(0)
      productionUseCases.forEach(useCase => {
        expect(screen.getByText(useCase.name)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    test('should handle missing callback props gracefully', () => {
      render(<ConfigurationValidationTools />)

      // Should render without crashing
      expect(screen.getByText('Use Cases')).toBeInTheDocument()

      // Should handle button clicks without callbacks
      const selectButton = screen.getAllByText('Select')[0]
      expect(() => fireEvent.click(selectButton)).not.toThrow()
    })

    test('should handle empty use cases data', () => {
      // Mock empty use cases
      jest.doMock('../../../data/configuration-use-cases', () => ({
        CONFIGURATION_USE_CASES: []
      }))

      render(
        <ConfigurationValidationTools
          onUseCaseSelect={mockOnUseCaseSelect}
          onConfigurationGenerated={mockOnConfigurationGenerated}
        />
      )

      // Should still render the component structure
      expect(screen.getByText('Use Cases')).toBeInTheDocument()
      expect(screen.getByLabelText('Environment')).toBeInTheDocument()
      expect(screen.getByLabelText('Platform')).toBeInTheDocument()
    })
  })
})