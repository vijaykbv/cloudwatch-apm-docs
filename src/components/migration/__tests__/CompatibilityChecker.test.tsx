import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CompatibilityChecker } from '../CompatibilityChecker'

describe('CompatibilityChecker', () => {
  const mockOnCheckComplete = jest.fn()

  beforeEach(() => {
    mockOnCheckComplete.mockClear()
  })

  it('renders the compatibility checker interface', () => {
    render(<CompatibilityChecker onCheckComplete={mockOnCheckComplete} />)
    
    expect(screen.getByText('AWS Service Compatibility Checker')).toBeInTheDocument()
    expect(screen.getByText(/Check the compatibility of your current services and infrastructure with CloudWatch APM/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Service name (e.g., Lambda, Spring Boot, PostgreSQL)')).toBeInTheDocument()
  })

  it('allows adding services to check', () => {
    render(<CompatibilityChecker onCheckComplete={mockOnCheckComplete} />)
    
    const serviceInput = screen.getByPlaceholderText('Service name (e.g., Lambda, Spring Boot, PostgreSQL)')
    const typeSelect = screen.getByDisplayValue('AWS Service')
    const versionInput = screen.getByPlaceholderText('Version (optional)')
    const addButton = screen.getByText('Add')
    
    // Add a service
    fireEvent.change(serviceInput, { target: { value: 'Lambda' } })
    fireEvent.change(typeSelect, { target: { value: 'aws-service' } })
    fireEvent.change(versionInput, { target: { value: '1.0' } })
    fireEvent.click(addButton)
    
    // Check that service was added
    expect(screen.getByText(/Services to Check \(1\)/)).toBeInTheDocument()
    expect(screen.getByText('Lambda')).toBeInTheDocument()
    expect(screen.getByText('v1.0')).toBeInTheDocument()
  })

  it('prevents adding empty service names', () => {
    render(<CompatibilityChecker onCheckComplete={mockOnCheckComplete} />)
    
    const addButton = screen.getByText('Add')
    expect(addButton).toBeDisabled()
    
    const serviceInput = screen.getByPlaceholderText('Service name (e.g., Lambda, Spring Boot, PostgreSQL)')
    fireEvent.change(serviceInput, { target: { value: 'Lambda' } })
    
    expect(addButton).toBeEnabled()
  })

  it('allows removing added services', () => {
    render(<CompatibilityChecker onCheckComplete={mockOnCheckComplete} />)
    
    // Add a service
    const serviceInput = screen.getByPlaceholderText('Service name (e.g., Lambda, Spring Boot, PostgreSQL)')
    fireEvent.change(serviceInput, { target: { value: 'Lambda' } })
    fireEvent.click(screen.getByText('Add'))
    
    expect(screen.getByText(/Services to Check \(1\)/)).toBeInTheDocument()
    
    // Remove the service
    fireEvent.click(screen.getByText('Remove'))
    
    expect(screen.queryByText(/Services to Check \(1\)/)).not.toBeInTheDocument()
  })

  it('clears input after adding a service', () => {
    render(<CompatibilityChecker onCheckComplete={mockOnCheckComplete} />)
    
    const serviceInput = screen.getByPlaceholderText('Service name (e.g., Lambda, Spring Boot, PostgreSQL)')
    const versionInput = screen.getByPlaceholderText('Version (optional)')
    
    fireEvent.change(serviceInput, { target: { value: 'Lambda' } })
    fireEvent.change(versionInput, { target: { value: '1.0' } })
    fireEvent.click(screen.getByText('Add'))
    
    expect(serviceInput).toHaveValue('')
    expect(versionInput).toHaveValue('')
  })

  it('shows check compatibility button only when services are added', () => {
    render(<CompatibilityChecker onCheckComplete={mockOnCheckComplete} />)
    
    expect(screen.queryByText('Check Compatibility')).not.toBeInTheDocument()
    
    // Add a service
    const serviceInput = screen.getByPlaceholderText('Service name (e.g., Lambda, Spring Boot, PostgreSQL)')
    fireEvent.change(serviceInput, { target: { value: 'Lambda' } })
    fireEvent.click(screen.getByText('Add'))
    
    expect(screen.getByText('Check Compatibility')).toBeInTheDocument()
  })

  it('performs compatibility check and shows results', async () => {
    render(<CompatibilityChecker onCheckComplete={mockOnCheckComplete} />)
    
    // Add services
    const serviceInput = screen.getByPlaceholderText('Service name (e.g., Lambda, Spring Boot, PostgreSQL)')
    
    fireEvent.change(serviceInput, { target: { value: 'Lambda' } })
    fireEvent.click(screen.getByText('Add'))
    
    fireEvent.change(serviceInput, { target: { value: 'Spring Boot' } })
    fireEvent.change(screen.getByDisplayValue('AWS Service'), { target: { value: 'framework' } })
    fireEvent.click(screen.getByText('Add'))
    
    // Run compatibility check
    fireEvent.click(screen.getByText('Check Compatibility'))
    
    // Check loading state
    expect(screen.getByText('Checking Compatibility...')).toBeInTheDocument()
    expect(screen.getByText('Analyzing service compatibility...')).toBeInTheDocument()
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Compatibility Results')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Check that results are displayed - use more specific selectors
    expect(screen.getByText('Compatibility Results')).toBeInTheDocument()
    expect(mockOnCheckComplete).toHaveBeenCalled()
  })

  it('handles AWS service compatibility correctly', async () => {
    render(<CompatibilityChecker onCheckComplete={mockOnCheckComplete} />)
    
    // Add AWS Lambda service
    const serviceInput = screen.getByPlaceholderText('Service name (e.g., Lambda, Spring Boot, PostgreSQL)')
    fireEvent.change(serviceInput, { target: { value: 'Lambda' } })
    fireEvent.click(screen.getByText('Add'))
    
    fireEvent.click(screen.getByText('Check Compatibility'))
    
    await waitFor(() => {
      expect(screen.getByText('Compatibility Results')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // AWS Lambda should be compatible
    expect(screen.getByText('AWS Lambda')).toBeInTheDocument()
    expect(screen.getByText('✅')).toBeInTheDocument()
  })

  it('handles third-party service compatibility correctly', async () => {
    render(<CompatibilityChecker onCheckComplete={mockOnCheckComplete} />)
    
    // Add Spring Boot framework
    const serviceInput = screen.getByPlaceholderText('Service name (e.g., Lambda, Spring Boot, PostgreSQL)')
    fireEvent.change(serviceInput, { target: { value: 'Spring Boot' } })
    fireEvent.change(screen.getByDisplayValue('AWS Service'), { target: { value: 'framework' } })
    fireEvent.click(screen.getByText('Add'))
    
    fireEvent.click(screen.getByText('Check Compatibility'))
    
    await waitFor(() => {
      expect(screen.getByText('Compatibility Results')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Spring Boot should be compatible
    expect(screen.getAllByText('Spring Boot')[0]).toBeInTheDocument()
  })

  it('shows next steps after compatibility check', async () => {
    render(<CompatibilityChecker onCheckComplete={mockOnCheckComplete} />)
    
    // Add a service and run check
    const serviceInput = screen.getByPlaceholderText('Service name (e.g., Lambda, Spring Boot, PostgreSQL)')
    fireEvent.change(serviceInput, { target: { value: 'Lambda' } })
    fireEvent.click(screen.getByText('Add'))
    fireEvent.click(screen.getByText('Check Compatibility'))
    
    await waitFor(() => {
      expect(screen.getByText('Next Steps')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    expect(screen.getByText(/Review any incompatible services and plan necessary changes/)).toBeInTheDocument()
    expect(screen.getByText(/Consider alternative approaches for services requiring migration/)).toBeInTheDocument()
  })

  it('supports different service types', () => {
    render(<CompatibilityChecker onCheckComplete={mockOnCheckComplete} />)
    
    const typeSelect = screen.getByDisplayValue('AWS Service')
    
    // Check all service type options are available
    fireEvent.click(typeSelect)
    expect(screen.getByText('Third Party')).toBeInTheDocument()
    expect(screen.getByText('Database')).toBeInTheDocument()
    expect(screen.getByText('Framework')).toBeInTheDocument()
    expect(screen.getByText('Library')).toBeInTheDocument()
  })

  it('allows adding service via Enter key', () => {
    render(<CompatibilityChecker onCheckComplete={mockOnCheckComplete} />)
    
    const serviceInput = screen.getByPlaceholderText('Service name (e.g., Lambda, Spring Boot, PostgreSQL)')
    fireEvent.change(serviceInput, { target: { value: 'Lambda' } })
    fireEvent.keyDown(serviceInput, { key: 'Enter', code: 'Enter' })
    
    expect(screen.getByText(/Services to Check \(1\)/)).toBeInTheDocument()
    expect(screen.getByText('Lambda')).toBeInTheDocument()
  })

  it('displays service type correctly in the list', () => {
    render(<CompatibilityChecker onCheckComplete={mockOnCheckComplete} />)
    
    const serviceInput = screen.getByPlaceholderText('Service name (e.g., Lambda, Spring Boot, PostgreSQL)')
    const typeSelect = screen.getByDisplayValue('AWS Service')
    
    fireEvent.change(serviceInput, { target: { value: 'PostgreSQL' } })
    fireEvent.change(typeSelect, { target: { value: 'database' } })
    fireEvent.click(screen.getByText('Add'))
    
    expect(screen.getByText('database')).toBeInTheDocument()
  })
})