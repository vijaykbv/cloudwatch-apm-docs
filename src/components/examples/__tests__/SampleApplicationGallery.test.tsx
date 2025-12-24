/**
 * Unit tests for SampleApplicationGallery component
 * **Validates: Requirements 6.1, 6.2**
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SampleApplicationGallery } from '../SampleApplicationGallery'
import { SampleApplication } from '../../../types/examples'

// Mock window.open
global.open = jest.fn()

const mockApplications: SampleApplication[] = [
  {
    id: 'test-app-1',
    name: 'E-commerce Demo',
    description: 'Complete e-commerce application with APM integration',
    language: 'typescript',
    framework: 'express',
    category: 'integration',
    useCase: 'Microservices monitoring',
    features: [
      'User authentication',
      'Product catalog',
      'Order processing',
      'Payment integration'
    ],
    downloadUrl: 'https://example.com/download/ecommerce-demo.zip',
    repositoryUrl: 'https://github.com/example/ecommerce-demo',
    documentation: 'Complete setup guide with instructions',
    prerequisites: ['Node.js 18+', 'Docker', 'AWS CLI'],
    installationSteps: ['Clone repository', 'Install dependencies', 'Configure AWS'],
    runningInstructions: ['Start services', 'Access application'],
    tags: ['typescript', 'microservices', 'ecommerce'],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      size: '25MB',
      complexity: 'complex',
      estimatedSetupTime: 30,
      supportedPlatforms: ['linux', 'macos']
    }
  },
  {
    id: 'test-app-2',
    name: 'Simple API',
    description: 'Basic REST API with monitoring',
    language: 'python',
    framework: 'flask',
    category: 'getting-started',
    useCase: 'Basic API monitoring',
    features: [
      'REST endpoints',
      'Database integration',
      'Error handling'
    ],
    downloadUrl: 'https://example.com/download/simple-api.zip',
    documentation: 'Quick start guide',
    prerequisites: ['Python 3.9+'],
    installationSteps: ['Install requirements'],
    runningInstructions: ['Run flask app'],
    tags: ['python', 'api', 'simple'],
    lastUpdated: new Date('2024-01-10'),
    metadata: {
      size: '5MB',
      complexity: 'simple',
      estimatedSetupTime: 10,
      supportedPlatforms: ['linux', 'macos', 'windows']
    }
  }
]

describe('SampleApplicationGallery', () => {
  const defaultProps = {
    applications: mockApplications
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders component with header and description', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    expect(screen.getByText('Sample Applications')).toBeInTheDocument()
    expect(screen.getByText(/Download complete sample applications/)).toBeInTheDocument()
  })

  test('displays all applications by default', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    expect(screen.getByText('E-commerce Demo')).toBeInTheDocument()
    expect(screen.getByText('Simple API')).toBeInTheDocument()
    expect(screen.getByText('Showing 2 applications')).toBeInTheDocument()
  })

  test('filters applications by search term', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/Search applications/)
    fireEvent.change(searchInput, { target: { value: 'ecommerce' } })
    
    expect(screen.getByText('E-commerce Demo')).toBeInTheDocument()
    expect(screen.queryByText('Simple API')).not.toBeInTheDocument()
    expect(screen.getByText('Showing 1 application')).toBeInTheDocument()
  })

  test('filters applications by language', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    const languageSelect = screen.getByDisplayValue('All Languages')
    fireEvent.change(languageSelect, { target: { value: 'python' } })
    
    expect(screen.queryByText('E-commerce Demo')).not.toBeInTheDocument()
    expect(screen.getByText('Simple API')).toBeInTheDocument()
  })

  test('filters applications by category', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    const categorySelect = screen.getByDisplayValue('All Categories')
    fireEvent.change(categorySelect, { target: { value: 'getting-started' } })
    
    expect(screen.queryByText('E-commerce Demo')).not.toBeInTheDocument()
    expect(screen.getByText('Simple API')).toBeInTheDocument()
  })

  test('filters applications by complexity', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    const complexitySelect = screen.getByDisplayValue('All Levels')
    fireEvent.change(complexitySelect, { target: { value: 'simple' } })
    
    expect(screen.queryByText('E-commerce Demo')).not.toBeInTheDocument()
    expect(screen.getByText('Simple API')).toBeInTheDocument()
  })

  test('clears all filters', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    // Apply filters
    const searchInput = screen.getByPlaceholderText(/Search applications/)
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    const languageSelect = screen.getByDisplayValue('All Languages')
    fireEvent.change(languageSelect, { target: { value: 'python' } })
    
    // Clear filters
    const clearButton = screen.getByText('Clear Filters')
    fireEvent.click(clearButton)
    
    // Should show all applications again
    expect(screen.getByText('E-commerce Demo')).toBeInTheDocument()
    expect(screen.getByText('Simple API')).toBeInTheDocument()
    expect(searchInput).toHaveValue('')
    expect(languageSelect).toHaveValue('all')
  })

  test('displays application details correctly', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    // Check first application details
    expect(screen.getByText('E-commerce Demo')).toBeInTheDocument()
    expect(screen.getByText('Complete e-commerce application with APM integration')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('express')).toBeInTheDocument()
    expect(screen.getByText('Microservices monitoring')).toBeInTheDocument()
    expect(screen.getByText('complex')).toBeInTheDocument()
    expect(screen.getByText('25MB')).toBeInTheDocument()
    expect(screen.getByText('~30 minutes')).toBeInTheDocument()
  })

  test('shows key features with truncation', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    // Should show first 4 features
    expect(screen.getByText('User authentication')).toBeInTheDocument()
    expect(screen.getByText('Product catalog')).toBeInTheDocument()
    expect(screen.getByText('Order processing')).toBeInTheDocument()
    expect(screen.getByText('Payment integration')).toBeInTheDocument()
  })

  test('shows prerequisites with truncation', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    expect(screen.getByText('Node.js 18+')).toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
    expect(screen.getByText('AWS CLI')).toBeInTheDocument()
  })

  test('displays tags correctly', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    expect(screen.getByText('typescript')).toBeInTheDocument()
    expect(screen.getByText('microservices')).toBeInTheDocument()
    expect(screen.getByText('ecommerce')).toBeInTheDocument()
  })

  test('download button opens download URL', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    const downloadButtons = screen.getAllByText('Download')
    fireEvent.click(downloadButtons[0])
    
    expect(global.open).toHaveBeenCalledWith(
      'https://example.com/download/ecommerce-demo.zip',
      '_blank'
    )
  })

  test('view code button opens repository URL', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    const viewCodeButton = screen.getByText('View Code')
    fireEvent.click(viewCodeButton)
    
    expect(global.open).toHaveBeenCalledWith(
      'https://github.com/example/ecommerce-demo',
      '_blank'
    )
  })

  test('hides view code button when no repository URL', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    // Simple API doesn't have repositoryUrl, so should only have Download button
    const simpleApiCard = screen.getByText('Simple API').closest('.p-6')
    const buttons = simpleApiCard?.querySelectorAll('button')
    
    expect(buttons).toHaveLength(1) // Only Download button
  })

  test('shows no results message when no applications match filters', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/Search applications/)
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    
    expect(screen.getByText('No applications found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search terms or filters to find relevant applications.')).toBeInTheDocument()
  })

  test('displays last updated date', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    expect(screen.getByText('Last updated: 1/15/2024')).toBeInTheDocument()
    expect(screen.getByText('Last updated: 1/10/2024')).toBeInTheDocument()
  })

  test('applies custom className', () => {
    const { container } = render(
      <SampleApplicationGallery {...defaultProps} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  test('handles empty applications array', () => {
    render(<SampleApplicationGallery applications={[]} />)
    
    expect(screen.getByText('Sample Applications')).toBeInTheDocument()
    expect(screen.getByText('Showing 0 applications')).toBeInTheDocument()
    expect(screen.getByText('No applications found')).toBeInTheDocument()
  })

  test('shows active filters display', () => {
    render(<SampleApplicationGallery {...defaultProps} />)
    
    // Apply multiple filters
    const searchInput = screen.getByPlaceholderText(/Search applications/)
    fireEvent.change(searchInput, { target: { value: 'demo' } })
    
    const languageSelect = screen.getByDisplayValue('All Languages')
    fireEvent.change(languageSelect, { target: { value: 'typescript' } })
    
    // Should show active filters
    expect(screen.getByText('Active filters:')).toBeInTheDocument()
    expect(screen.getByText('Search: "demo"')).toBeInTheDocument()
    expect(screen.getByText('Language: TypeScript')).toBeInTheDocument()
  })
})