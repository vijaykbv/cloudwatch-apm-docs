import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MigrationWizard } from '../MigrationWizard'
import { APM_SOLUTIONS } from '../../../data/apm-solutions'

describe('MigrationWizard', () => {
  const mockOnPlanGenerated = jest.fn()

  beforeEach(() => {
    mockOnPlanGenerated.mockClear()
  })

  it('renders the initial step with APM solution selection', () => {
    render(<MigrationWizard onPlanGenerated={mockOnPlanGenerated} />)
    
    expect(screen.getByText('Select Your Current APM Solution')).toBeInTheDocument()
    expect(screen.getByText('Choose the APM solution you\'re currently using. This will help us create a tailored migration plan.')).toBeInTheDocument()
    
    // Check that APM solutions are displayed
    APM_SOLUTIONS.forEach(apm => {
      expect(screen.getByText(apm.name)).toBeInTheDocument()
    })
  })

  it('allows selecting an APM solution', () => {
    render(<MigrationWizard onPlanGenerated={mockOnPlanGenerated} />)
    
    // Find the actual clickable card div (not just the text element)
    const newRelicCard = screen.getByText('New Relic').closest('div[class*="border rounded-lg p-4 cursor-pointer"]')
    expect(newRelicCard).toBeInTheDocument()
    
    fireEvent.click(newRelicCard!)
    
    // Check that the card is selected (has blue styling)
    expect(newRelicCard).toHaveClass('border-blue-500', 'bg-blue-50')
  })

  it('enables next button only when APM solution is selected', () => {
    render(<MigrationWizard onPlanGenerated={mockOnPlanGenerated} />)
    
    const nextButton = screen.getByText('Next')
    expect(nextButton).toBeDisabled()
    
    // Select an APM solution
    const newRelicCard = screen.getByText('New Relic').closest('div[class*="border rounded-lg p-4 cursor-pointer"]')
    fireEvent.click(newRelicCard!)
    
    expect(nextButton).toBeEnabled()
  })

  it('progresses to application details step', () => {
    render(<MigrationWizard onPlanGenerated={mockOnPlanGenerated} />)
    
    // Select APM solution and proceed
    const newRelicCard = screen.getByText('New Relic').closest('div[class*="border rounded-lg p-4 cursor-pointer"]')
    fireEvent.click(newRelicCard!)
    
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    // Look for the step title in the progress section (h2)
    expect(screen.getByRole('heading', { level: 2, name: 'Application Details' })).toBeInTheDocument()
    expect(screen.getByText('Tell us about your application to create a customized migration plan.')).toBeInTheDocument()
  })

  it('collects application context information', () => {
    render(<MigrationWizard onPlanGenerated={mockOnPlanGenerated} />)
    
    // Navigate to application details step
    const newRelicCard = screen.getByText('New Relic').closest('div')
    fireEvent.click(newRelicCard!)
    fireEvent.click(screen.getByText('Next'))
    
    // Fill out application details
    const languageSelect = screen.getByDisplayValue('Select language')
    fireEvent.change(languageSelect, { target: { value: 'java' } })
    
    const frameworkInput = screen.getByPlaceholderText('e.g., Spring Boot, Express, Django')
    fireEvent.change(frameworkInput, { target: { value: 'Spring Boot' } })
    
    const infrastructureSelect = screen.getByDisplayValue('Select infrastructure')
    fireEvent.change(infrastructureSelect, { target: { value: 'aws-eks' } })
    
    const criticalitySelect = screen.getByDisplayValue('Select criticality')
    fireEvent.change(criticalitySelect, { target: { value: 'medium' } })
    
    expect(languageSelect).toHaveValue('java')
    expect(frameworkInput).toHaveValue('Spring Boot')
    expect(infrastructureSelect).toHaveValue('aws-eks')
    expect(criticalitySelect).toHaveValue('medium')
  })

  it('allows selecting APM features', () => {
    render(<MigrationWizard onPlanGenerated={mockOnPlanGenerated} />)
    
    // Navigate to application details step
    const newRelicCard = screen.getByText('New Relic').closest('div')
    fireEvent.click(newRelicCard!)
    fireEvent.click(screen.getByText('Next'))
    
    // Select some APM features
    const apmCheckbox = screen.getByLabelText('Application Performance Monitoring')
    const tracingCheckbox = screen.getByLabelText('Distributed Tracing')
    
    fireEvent.click(apmCheckbox)
    fireEvent.click(tracingCheckbox)
    
    expect(apmCheckbox).toBeChecked()
    expect(tracingCheckbox).toBeChecked()
  })

  it('progresses through all steps to plan generation', async () => {
    render(<MigrationWizard onPlanGenerated={mockOnPlanGenerated} />)
    
    // Step 1: Select APM
    const newRelicCard = screen.getByText('New Relic').closest('div[class*="border rounded-lg p-4 cursor-pointer"]')
    fireEvent.click(newRelicCard!)
    fireEvent.click(screen.getByText('Next'))
    
    // Step 2: Application details
    fireEvent.change(screen.getByDisplayValue('Select language'), { target: { value: 'java' } })
    fireEvent.change(screen.getByDisplayValue('Select infrastructure'), { target: { value: 'aws-eks' } })
    fireEvent.change(screen.getByDisplayValue('Select criticality'), { target: { value: 'medium' } })
    fireEvent.click(screen.getByText('Next'))
    
    // Step 3: Migration preferences
    expect(screen.getByRole('heading', { level: 2, name: 'Migration Preferences' })).toBeInTheDocument()
    fireEvent.click(screen.getByText('Next'))
    
    // Step 4: Plan generation
    expect(screen.getByText('Migration Plan Summary')).toBeInTheDocument()
    
    const generateButton = screen.getByText('Generate Migration Plan')
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Migration Plan Generated')).toBeInTheDocument()
    })
    
    expect(mockOnPlanGenerated).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceAPM: 'new-relic',
        targetAPM: 'cloudwatch-apm'
      })
    )
  })

  it('allows going back to previous steps', () => {
    render(<MigrationWizard onPlanGenerated={mockOnPlanGenerated} />)
    
    // Navigate forward
    const newRelicCard = screen.getByText('New Relic').closest('div[class*="border rounded-lg p-4 cursor-pointer"]')
    fireEvent.click(newRelicCard!)
    fireEvent.click(screen.getByText('Next'))
    
    expect(screen.getByRole('heading', { level: 2, name: 'Application Details' })).toBeInTheDocument()
    
    // Go back
    fireEvent.click(screen.getByText('Previous'))
    
    expect(screen.getByText('Select Your Current APM Solution')).toBeInTheDocument()
  })

  it('validates required fields before allowing progression', () => {
    render(<MigrationWizard onPlanGenerated={mockOnPlanGenerated} />)
    
    // Navigate to application details without selecting APM
    const nextButton = screen.getByText('Next')
    expect(nextButton).toBeDisabled()
    
    // Select APM and proceed
    const newRelicCard = screen.getByText('New Relic').closest('div[class*="border rounded-lg p-4 cursor-pointer"]')
    fireEvent.click(newRelicCard!)
    fireEvent.click(nextButton)
    
    // Try to proceed without filling required fields
    expect(screen.getByText('Next')).toBeDisabled()
    
    // Fill required fields
    fireEvent.change(screen.getByDisplayValue('Select language'), { target: { value: 'java' } })
    fireEvent.change(screen.getByDisplayValue('Select infrastructure'), { target: { value: 'aws-eks' } })
    fireEvent.change(screen.getByDisplayValue('Select criticality'), { target: { value: 'medium' } })
    
    expect(screen.getByText('Next')).toBeEnabled()
  })

  it('displays migration preferences correctly', () => {
    render(<MigrationWizard onPlanGenerated={mockOnPlanGenerated} />)
    
    // Navigate to migration preferences step
    const newRelicCard = screen.getByText('New Relic').closest('div')
    fireEvent.click(newRelicCard!)
    fireEvent.click(screen.getByText('Next'))
    
    // Fill application details
    fireEvent.change(screen.getByDisplayValue('Select language'), { target: { value: 'java' } })
    fireEvent.change(screen.getByDisplayValue('Select infrastructure'), { target: { value: 'aws-eks' } })
    fireEvent.change(screen.getByDisplayValue('Select criticality'), { target: { value: 'medium' } })
    fireEvent.click(screen.getByText('Next'))
    
    // Check migration preferences options
    expect(screen.getByText('Gradual Migration')).toBeInTheDocument()
    expect(screen.getByText('Big Bang Migration')).toBeInTheDocument()
    expect(screen.getByText('Aggressive')).toBeInTheDocument()
    expect(screen.getByText('Moderate')).toBeInTheDocument()
    expect(screen.getByText('Flexible')).toBeInTheDocument()
  })

  it('shows progress indicators correctly', () => {
    render(<MigrationWizard onPlanGenerated={mockOnPlanGenerated} />)
    
    // Check initial progress
    const steps = screen.getAllByText(/\d/)
    expect(steps[0]).toHaveTextContent('1')
    expect(steps[0]).toHaveClass('border-blue-500', 'bg-blue-500', 'text-white')
    
    // Navigate forward and check progress
    const newRelicCard = screen.getByText('New Relic').closest('div')
    fireEvent.click(newRelicCard!)
    fireEvent.click(screen.getByText('Next'))
    
    const updatedSteps = screen.getAllByText(/[1-4✓]/)
    expect(updatedSteps[0]).toHaveTextContent('✓')
    expect(updatedSteps[0]).toHaveClass('border-green-500', 'bg-green-500', 'text-white')
  })
})