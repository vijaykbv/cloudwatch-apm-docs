import { AlertingWizard } from '../AlertingWizard'

describe('AlertingWizard', () => {
  it('exports AlertingWizard component', () => {
    expect(AlertingWizard).toBeDefined()
    expect(typeof AlertingWizard).toBe('function')
  })

  it('has correct component name', () => {
    expect(AlertingWizard.name).toBe('AlertingWizard')
  })
})