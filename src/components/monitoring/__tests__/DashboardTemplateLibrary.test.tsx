import { DashboardTemplateLibrary } from '../DashboardTemplateLibrary'

describe('DashboardTemplateLibrary', () => {
  it('exports DashboardTemplateLibrary component', () => {
    expect(DashboardTemplateLibrary).toBeDefined()
    expect(typeof DashboardTemplateLibrary).toBe('function')
  })

  it('has correct component name', () => {
    expect(DashboardTemplateLibrary.name).toBe('DashboardTemplateLibrary')
  })
})