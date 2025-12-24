import { NotificationSetupGuide } from '../NotificationSetupGuide'

describe('NotificationSetupGuide', () => {
  it('exports NotificationSetupGuide component', () => {
    expect(NotificationSetupGuide).toBeDefined()
    expect(typeof NotificationSetupGuide).toBe('function')
  })

  it('has correct component name', () => {
    expect(NotificationSetupGuide.name).toBe('NotificationSetupGuide')
  })
})