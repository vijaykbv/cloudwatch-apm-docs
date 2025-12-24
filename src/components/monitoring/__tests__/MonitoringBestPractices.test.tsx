import { MonitoringBestPractices } from '../MonitoringBestPractices'

describe('MonitoringBestPractices', () => {
  it('exports MonitoringBestPractices component', () => {
    expect(MonitoringBestPractices).toBeDefined()
    expect(typeof MonitoringBestPractices).toBe('function')
  })

  it('has correct component name', () => {
    expect(MonitoringBestPractices.name).toBe('MonitoringBestPractices')
  })
})