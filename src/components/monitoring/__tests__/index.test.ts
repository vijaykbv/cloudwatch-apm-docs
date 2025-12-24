// Test to ensure all monitoring components are properly exported
import * as MonitoringComponents from '../index'

describe('Monitoring Components Exports', () => {
  it('exports all required monitoring components', () => {
    expect(MonitoringComponents.AlertingWizard).toBeDefined()
    expect(MonitoringComponents.ThresholdRecommendationEngine).toBeDefined()
    expect(MonitoringComponents.NotificationSetupGuide).toBeDefined()
    expect(MonitoringComponents.DashboardTemplateLibrary).toBeDefined()
    expect(MonitoringComponents.MonitoringBestPractices).toBeDefined()
    expect(MonitoringComponents.PerformanceMetricCatalog).toBeDefined()
  })

  it('exports components as functions', () => {
    expect(typeof MonitoringComponents.AlertingWizard).toBe('function')
    expect(typeof MonitoringComponents.ThresholdRecommendationEngine).toBe('function')
    expect(typeof MonitoringComponents.NotificationSetupGuide).toBe('function')
    expect(typeof MonitoringComponents.DashboardTemplateLibrary).toBe('function')
    expect(typeof MonitoringComponents.MonitoringBestPractices).toBe('function')
    expect(typeof MonitoringComponents.PerformanceMetricCatalog).toBe('function')
  })
})