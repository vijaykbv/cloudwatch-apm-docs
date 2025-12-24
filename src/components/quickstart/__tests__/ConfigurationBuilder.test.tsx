import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConfigurationBuilder from '../ConfigurationBuilder'
import { UserPreferences } from '../../../types/quickstart'

// Mock the configuration templates
jest.mock('../../../data/configuration-templates', () => ({
  CONFIGURATION_TEMPLATES: [
    {
      id: 'basic-monitoring',
      name: 'Basic Application Monitoring',
      description: 'Essential monitoring setup for getting started',
      platforms: ['java', 'nodejs'],
      useCase: 'monitoring',
      configuration: {
        serviceName: '${SERVICE_NAME}',
        serviceVersion: '${SERVICE_VERSION}',
        environment: '${ENVIRONMENT}',
        samplingRate: 0.1,
        enableTracing: true,
        enableMetrics: true,
        enableLogs: false
      },
      examples: []
    },
    {
      id: 'high-performance',
      name: 'High Performance Configuration',
      description: 'Optimized for high-traffic applications',
      platforms: ['java'],
      useCase: 'performance',
      configuration: {
        serviceName: '${SERVICE_NAME}',
        samplingRate: 0.01,
        batchSize: 500
      },
      examples: []
    }
  ]
}))

describe('ConfigurationBuilder', () => {
  const mockUserPreferences: UserPreferences = {
    experience: 'intermediate',
    useCase: 'monitoring',
    environment: 'production'
  }

  const mockOnConfigurationGenerated = jest.fn()

  beforeEach(() => {
    mockOnConfigurationGenerated.mockClear()
  })

  it('shows message when no platforms selected', () => {
    render(
      <ConfigurationBuilder
        selectedPlatforms={[]}
        userPreferences={mockUserPreferences}
      />
    )

    expect(screen.getByText('Select Platforms First')).toBeInTheDocument()
    expect(screen.getByText('Choose your platforms to see relevant configuration templates')).toBeInTheDocument()
  })

  it('shows relevant templates based on selected platforms', () => {
    render(
      <ConfigurationBuilder
        selectedPlatforms={['java']}
        userPreferences={mockUserPreferences}
      />
    )

    expect(screen.getByText('Basic Application Monitoring')).toBeInTheDocument()
    expect(screen.getByText('High Performance Configuration')).toBeInTheDocument()
  })

  it('filters templates by use case', () => {
    const performancePreferences: UserPreferences = {
      ...mockUserPreferences,
      useCase: 'performance'
    }

    render(
      <ConfigurationBuilder
        selectedPlatforms={['java']}
        userPreferences={performancePreferences}
      />
    )

    expect(screen.getByText('High Performance Configuration')).toBeInTheDocument()
  })

  it('allows selecting a template', () => {
    render(
      <ConfigurationBuilder
        selectedPlatforms={['java']}
        userPreferences={mockUserPreferences}
      />
    )

    const templateButton = screen.getByText('Basic Application Monitoring').closest('button')
    fireEvent.click(templateButton!)

    expect(templateButton).toHaveClass('border-blue-500', 'bg-blue-50')
  })

  it('shows configuration form when template is selected', () => {
    render(
      <ConfigurationBuilder
        selectedPlatforms={['java']}
        userPreferences={mockUserPreferences}
      />
    )

    const templateButton = screen.getByText('Basic Application Monitoring').closest('button')
    fireEvent.click(templateButton!)

    expect(screen.getByText('Customize Configuration')).toBeInTheDocument()
    expect(screen.getByLabelText('Service Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Service Version *')).toBeInTheDocument()
  })

  it('validates form inputs', async () => {
    render(
      <ConfigurationBuilder
        selectedPlatforms={['java']}
        userPreferences={mockUserPreferences}
      />
    )

    // Select template
    fireEvent.click(screen.getByText('Basic Application Monitoring').closest('button')!)

    // Clear service name to trigger validation
    const serviceNameInput = screen.getByLabelText('Service Name *')
    fireEvent.change(serviceNameInput, { target: { value: '' } })

    // Try to generate configuration
    fireEvent.click(screen.getByText('Generate Configuration'))

    await waitFor(() => {
      expect(screen.getByText('Service name is required')).toBeInTheDocument()
    })
  })

  it('validates service name format', async () => {
    render(
      <ConfigurationBuilder
        selectedPlatforms={['java']}
        userPreferences={mockUserPreferences}
      />
    )

    // Select template
    fireEvent.click(screen.getByText('Basic Application Monitoring').closest('button')!)

    // Enter invalid service name
    const serviceNameInput = screen.getByLabelText('Service Name *')
    fireEvent.change(serviceNameInput, { target: { value: 'Invalid Name!' } })

    // Try to generate configuration
    fireEvent.click(screen.getByText('Generate Configuration'))

    await waitFor(() => {
      expect(screen.getByText('Service name must be lowercase with hyphens only')).toBeInTheDocument()
    })
  })

  it('validates sampling rate range', async () => {
    render(
      <ConfigurationBuilder
        selectedPlatforms={['java']}
        userPreferences={mockUserPreferences}
      />
    )

    // Select template
    fireEvent.click(screen.getByText('Basic Application Monitoring').closest('button')!)

    // Enter invalid sampling rate
    const samplingRateInput = screen.getByLabelText('Sampling Rate')
    fireEvent.change(samplingRateInput, { target: { value: '1.5' } })

    // Try to generate configuration
    fireEvent.click(screen.getByText('Generate Configuration'))

    await waitFor(() => {
      expect(screen.getByText('Sampling rate must be between 0 and 1')).toBeInTheDocument()
    })
  })

  it('generates configuration with valid inputs', async () => {
    render(
      <ConfigurationBuilder
        selectedPlatforms={['java']}
        userPreferences={mockUserPreferences}
        onConfigurationGenerated={mockOnConfigurationGenerated}
      />
    )

    // Select template
    fireEvent.click(screen.getByText('Basic Application Monitoring').closest('button')!)

    // Fill in valid form data
    fireEvent.change(screen.getByLabelText('Service Name *'), { target: { value: 'test-app' } })
    fireEvent.change(screen.getByLabelText('Service Version *'), { target: { value: '2.0.0' } })

    // Generate configuration
    fireEvent.click(screen.getByText('Generate Configuration'))

    await waitFor(() => {
      expect(screen.getByText('Configuration Generated Successfully!')).toBeInTheDocument()
    })

    expect(mockOnConfigurationGenerated).toHaveBeenCalledWith(
      expect.objectContaining({
        customizedConfig: expect.objectContaining({
          serviceName: 'test-app',
          serviceVersion: '2.0.0'
        })
      })
    )
  })

  it('shows export formats after generation', async () => {
    render(
      <ConfigurationBuilder
        selectedPlatforms={['java']}
        userPreferences={mockUserPreferences}
      />
    )

    // Select template and generate config
    fireEvent.click(screen.getByText('Basic Application Monitoring').closest('button')!)
    fireEvent.click(screen.getByText('Generate Configuration'))

    await waitFor(() => {
      expect(screen.getByText('Environment Variables')).toBeInTheDocument()
      expect(screen.getByText('Java Properties')).toBeInTheDocument()
    })
  })

  it('allows copying configuration to clipboard', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn()
      }
    })

    render(
      <ConfigurationBuilder
        selectedPlatforms={['java']}
        userPreferences={mockUserPreferences}
      />
    )

    // Generate configuration
    fireEvent.click(screen.getByText('Basic Application Monitoring').closest('button')!)
    fireEvent.click(screen.getByText('Generate Configuration'))

    await waitFor(() => {
      const copyButton = screen.getAllByText('Copy')[0]
      fireEvent.click(copyButton)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })

  it('updates form fields correctly', () => {
    render(
      <ConfigurationBuilder
        selectedPlatforms={['java']}
        userPreferences={mockUserPreferences}
      />
    )

    // Select template
    fireEvent.click(screen.getByText('Basic Application Monitoring').closest('button')!)

    // Update environment
    const environmentSelect = screen.getByLabelText('Environment')
    fireEvent.change(environmentSelect, { target: { value: 'development' } })

    expect(environmentSelect).toHaveValue('development')
  })

  it('toggles feature checkboxes', () => {
    render(
      <ConfigurationBuilder
        selectedPlatforms={['java']}
        userPreferences={mockUserPreferences}
      />
    )

    // Select template
    fireEvent.click(screen.getByText('Basic Application Monitoring').closest('button')!)

    // Toggle tracing checkbox
    const tracingCheckbox = screen.getByLabelText('Enable Tracing') as HTMLInputElement
    expect(tracingCheckbox.checked).toBe(true)

    fireEvent.click(tracingCheckbox)
    expect(tracingCheckbox.checked).toBe(false)
  })
})