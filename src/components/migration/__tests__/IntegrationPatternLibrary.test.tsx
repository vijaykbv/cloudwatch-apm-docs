import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { IntegrationPatternLibrary } from '../IntegrationPatternLibrary'
import { INTEGRATION_PATTERNS } from '../../../data/apm-solutions'

describe('IntegrationPatternLibrary', () => {
  const mockOnPatternSelect = jest.fn()

  beforeEach(() => {
    mockOnPatternSelect.mockClear()
  })

  it('renders the integration pattern library', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    expect(screen.getByText('Integration Pattern Library')).toBeInTheDocument()
    expect(screen.getByText((content, element) => {
      return content.includes('Browse proven integration patterns for migrating different architectures to CloudWatch APM')
    })).toBeInTheDocument()
  })

  it('displays all integration patterns', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    INTEGRATION_PATTERNS.forEach(pattern => {
      expect(screen.getByText(pattern.name)).toBeInTheDocument()
      expect(screen.getByText(pattern.description)).toBeInTheDocument()
    })
  })

  it('shows filter options', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    expect(screen.getByText('Architecture')).toBeInTheDocument()
    expect(screen.getByText('Complexity')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    
    expect(screen.getByDisplayValue('All Architectures')).toBeInTheDocument()
    expect(screen.getByDisplayValue('All Complexities')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search patterns...')).toBeInTheDocument()
  })

  it('filters patterns by architecture', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    const architectureFilter = screen.getByDisplayValue('All Architectures')
    fireEvent.change(architectureFilter, { target: { value: 'monolith' } })
    
    // Should only show monolith patterns
    const monolithPatterns = INTEGRATION_PATTERNS.filter(p => p.architecture === 'monolith')
    const nonMonolithPatterns = INTEGRATION_PATTERNS.filter(p => p.architecture !== 'monolith')
    
    monolithPatterns.forEach(pattern => {
      expect(screen.getByText(pattern.name)).toBeInTheDocument()
    })
    
    nonMonolithPatterns.forEach(pattern => {
      expect(screen.queryByText(pattern.name)).not.toBeInTheDocument()
    })
  })

  it('filters patterns by complexity', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    const complexityFilter = screen.getByDisplayValue('All Complexities')
    fireEvent.change(complexityFilter, { target: { value: 'simple' } })
    
    // Should only show simple patterns
    const simplePatterns = INTEGRATION_PATTERNS.filter(p => p.complexity === 'simple')
    const nonSimplePatterns = INTEGRATION_PATTERNS.filter(p => p.complexity !== 'simple')
    
    simplePatterns.forEach(pattern => {
      expect(screen.getByText(pattern.name)).toBeInTheDocument()
    })
    
    nonSimplePatterns.forEach(pattern => {
      expect(screen.queryByText(pattern.name)).not.toBeInTheDocument()
    })
  })

  it('filters patterns by search term', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    const searchInput = screen.getByPlaceholderText('Search patterns...')
    fireEvent.change(searchInput, { target: { value: 'serverless' } })
    
    // Should only show patterns containing 'serverless'
    const serverlessPatterns = INTEGRATION_PATTERNS.filter(p => 
      p.name.toLowerCase().includes('serverless') || 
      p.description.toLowerCase().includes('serverless')
    )
    
    serverlessPatterns.forEach(pattern => {
      expect(screen.getByText(pattern.name)).toBeInTheDocument()
    })
  })

  it('shows no results message when filters match nothing', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    const searchInput = screen.getByPlaceholderText('Search patterns...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent-pattern' } })
    
    expect(screen.getByText('No patterns match your current filters.')).toBeInTheDocument()
    expect(screen.getByText('Clear filters')).toBeInTheDocument()
  })

  it('clears filters when clear filters button is clicked', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    // Apply filters
    const searchInput = screen.getByPlaceholderText('Search patterns...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent-pattern' } })
    
    expect(screen.getByText('No patterns match your current filters.')).toBeInTheDocument()
    
    // Clear filters
    fireEvent.click(screen.getByText('Clear filters'))
    
    // Should show all patterns again
    INTEGRATION_PATTERNS.forEach(pattern => {
      expect(screen.getByText(pattern.name)).toBeInTheDocument()
    })
  })

  it('displays pattern complexity badges correctly', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    INTEGRATION_PATTERNS.forEach(pattern => {
      // Look for the complexity badge by its text content
      expect(screen.getByText(pattern.complexity)).toBeInTheDocument()
    })
  })

  it('shows pattern components and benefits', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    INTEGRATION_PATTERNS.forEach(pattern => {
      // Check components are shown (at least first 3) - use getAllByText for duplicates
      pattern.components.slice(0, 3).forEach(component => {
        const elements = screen.getAllByText(component.name)
        expect(elements.length).toBeGreaterThan(0)
      })
      
      // Check benefits are shown (at least first 2) - look for partial text matches
      pattern.benefits.slice(0, 2).forEach(benefit => {
        // Split the benefit text and look for key parts
        const benefitWords = benefit.split(' ')
        const keyWords = benefitWords.slice(0, 3).join(' ') // First 3 words
        expect(screen.getByText((content, element) => {
          return content.includes(keyWords)
        })).toBeInTheDocument()
      })
    })
  })

  it('selects pattern when clicked', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    const firstPattern = INTEGRATION_PATTERNS[0]
    const patternCard = screen.getByText(firstPattern.name).closest('div')
    
    fireEvent.click(patternCard!)
    
    expect(mockOnPatternSelect).toHaveBeenCalledWith(firstPattern)
  })

  it('shows detailed pattern view when pattern is selected', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    const firstPattern = INTEGRATION_PATTERNS[0]
    const patternCard = screen.getByText(firstPattern.name).closest('div')
    
    fireEvent.click(patternCard!)
    
    // Should show detailed view
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Architecture Components')).toBeInTheDocument()
    expect(screen.getByText('Implementation Steps')).toBeInTheDocument()
    expect(screen.getByText('Benefits')).toBeInTheDocument()
    expect(screen.getByText('Considerations')).toBeInTheDocument()
  })

  it('shows close button in detailed view', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    const firstPattern = INTEGRATION_PATTERNS[0]
    const patternCard = screen.getByText(firstPattern.name).closest('div')
    
    fireEvent.click(patternCard!)
    
    expect(screen.getByText('✕')).toBeInTheDocument()
  })

  it('returns to pattern list when close button is clicked', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    const firstPattern = INTEGRATION_PATTERNS[0]
    const patternCard = screen.getByText(firstPattern.name).closest('div')
    
    fireEvent.click(patternCard!)
    
    // Should be in detailed view
    expect(screen.getByText('Overview')).toBeInTheDocument()
    
    // Click close button
    fireEvent.click(screen.getByText('✕'))
    
    // Should return to pattern list
    expect(screen.getByText('Integration Pattern Library')).toBeInTheDocument()
    expect(screen.queryByText('Overview')).not.toBeInTheDocument()
  })

  it('displays implementation steps in detailed view', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    const firstPattern = INTEGRATION_PATTERNS[0]
    const patternCard = screen.getByText(firstPattern.name).closest('div')
    
    fireEvent.click(patternCard!)
    
    // Check implementation steps are shown
    firstPattern.implementation.steps.forEach((step, index) => {
      expect(screen.getByText(step.title)).toBeInTheDocument()
      expect(screen.getByText(step.description)).toBeInTheDocument()
      expect(screen.getByText((index + 1).toString())).toBeInTheDocument()
    })
  })

  it('displays configuration examples in detailed view', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    const firstPattern = INTEGRATION_PATTERNS[0]
    const patternCard = screen.getByText(firstPattern.name).closest('div')
    
    fireEvent.click(patternCard!)
    
    // Check configuration examples are shown
    if (firstPattern.implementation.configurationExamples.length > 0) {
      expect(screen.getByText('Configuration Examples')).toBeInTheDocument()
      
      firstPattern.implementation.configurationExamples.forEach(example => {
        expect(screen.getByText(example.title)).toBeInTheDocument()
        expect(screen.getByText(example.description)).toBeInTheDocument()
      })
    }
  })

  it('displays testing strategy in detailed view', () => {
    render(<IntegrationPatternLibrary onPatternSelect={mockOnPatternSelect} />)
    
    const firstPattern = INTEGRATION_PATTERNS[0]
    const patternCard = screen.getByText(firstPattern.name).closest('div')
    
    fireEvent.click(patternCard!)
    
    expect(screen.getByText('Testing Strategy')).toBeInTheDocument()
    
    firstPattern.implementation.testingStrategy.forEach(strategy => {
      expect(screen.getByText(strategy)).toBeInTheDocument()
    })
  })
})