import { PerformanceMetricCatalog } from '../PerformanceMetricCatalog'

describe('PerformanceMetricCatalog', () => {
  it('exports PerformanceMetricCatalog component', () => {
    expect(PerformanceMetricCatalog).toBeDefined()
    expect(typeof PerformanceMetricCatalog).toBe('function')
  })

  it('has correct component name', () => {
    expect(PerformanceMetricCatalog.name).toBe('PerformanceMetricCatalog')
  })
})