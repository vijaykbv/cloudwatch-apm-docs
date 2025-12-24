import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ComplianceFrameworkMapper from '../ComplianceFrameworkMapper'
import { ComplianceFramework } from '../../../types/security'

// Mock the security data
jest.mock('../../../data/security-data', () => ({
  complianceFrameworks: [
    {
      framework: 'SOC2',
      status: 'compliant',
      controls: [
        {
          id: 'soc2-cc6.1',
          name: 'Test Control 1',
          description: 'Test control description',
          framework: 'SOC2',
          category: 'Security',
          implementation: 'Test implementation',
          validation: 'Test validation',
          evidence: ['config', 'logs']
        }
      ],
      requirements: [
        {
          id: 'soc2-req-001',
          title: 'Test Requirement',
          description: 'Test requirement description',
          framework: 'SOC2',
          section: 'CC6.1',
          mandatory: true,
          implementation: 'Test implementation',
          validation: 'Test validation'
        }
      ],
      evidence: [
        {
          id: 'evidence-001',
          type: 'configuration',
          description: 'Test evidence',
          location: 'Test location',
          automated: true,
          frequency: 'daily'
        }
      ]
    },
    {
      framework: 'GDPR',
      status: 'partial',
      controls: [],
      requirements: [],
      evidence: []
    }
  ]
}))

describe('ComplianceFrameworkMapper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders compliance framework mapper with frameworks', () => {
    render(<ComplianceFrameworkMapper />)
    
    expect(screen.getByText('Compliance Framework Mapping')).toBeInTheDocument()
    expect(screen.getAllByText('SOC2')).toHaveLength(2) // Appears in selector and overview
    expect(screen.getByText('GDPR')).toBeInTheDocument()
  })

  it('displays framework status correctly', () => {
    render(<ComplianceFrameworkMapper />)
    
    expect(screen.getAllByText('compliant')).toHaveLength(2) // Appears in selector and overview
    expect(screen.getByText('partial')).toBeInTheDocument()
  })

  it('switches between frameworks when clicked', async () => {
    render(<ComplianceFrameworkMapper />)
    
    // Find GDPR framework in the selector (not in overview)
    const frameworkCards = screen.getAllByText('GDPR')
    const gdprFrameworkCard = frameworkCards[0] // First one should be in the selector
    fireEvent.click(gdprFrameworkCard)
    
    await waitFor(() => {
      // Should show GDPR as active framework in the overview
      expect(screen.getAllByText('GDPR')).toHaveLength(2) // In selector and overview
      // The framework should be selected (indicated by the content change)
      expect(screen.getByText('PARTIAL')).toBeInTheDocument() // Status in overview
    })
  })

  it('navigates between tabs correctly', async () => {
    render(<ComplianceFrameworkMapper />)
    
    // Click on Controls tab
    const controlsTab = screen.getByText('Controls')
    fireEvent.click(controlsTab)
    
    await waitFor(() => {
      expect(screen.getByText('Security Controls')).toBeInTheDocument()
      expect(screen.getByText('Test Control 1')).toBeInTheDocument()
    })
  })

  it('displays control details in controls tab', async () => {
    render(<ComplianceFrameworkMapper />)
    
    // Navigate to controls tab
    fireEvent.click(screen.getByText('Controls'))
    
    await waitFor(() => {
      expect(screen.getByText('Test Control 1')).toBeInTheDocument()
      expect(screen.getByText('Test control description')).toBeInTheDocument()
      expect(screen.getByText('Test implementation')).toBeInTheDocument()
      expect(screen.getByText('Test validation')).toBeInTheDocument()
    })
  })

  it('displays requirements in requirements tab', async () => {
    render(<ComplianceFrameworkMapper />)
    
    // Navigate to requirements tab
    fireEvent.click(screen.getByText('Requirements'))
    
    await waitFor(() => {
      expect(screen.getByText('Compliance Requirements')).toBeInTheDocument()
      expect(screen.getByText('Test Requirement')).toBeInTheDocument()
      expect(screen.getByText('Mandatory')).toBeInTheDocument()
    })
  })

  it('displays evidence in evidence tab', async () => {
    render(<ComplianceFrameworkMapper />)
    
    // Navigate to evidence tab
    fireEvent.click(screen.getByText('Evidence'))
    
    await waitFor(() => {
      expect(screen.getByText('Compliance Evidence')).toBeInTheDocument()
      expect(screen.getByText('CONFIGURATION')).toBeInTheDocument()
      expect(screen.getByText('Test evidence')).toBeInTheDocument()
      expect(screen.getByText('Automated')).toBeInTheDocument()
    })
  })

  it('shows framework statistics in overview', () => {
    render(<ComplianceFrameworkMapper />)
    
    expect(screen.getByText('Framework Statistics')).toBeInTheDocument()
    expect(screen.getByText('Total Controls:')).toBeInTheDocument()
    expect(screen.getByText('Requirements:')).toBeInTheDocument()
    expect(screen.getByText('Evidence Items:')).toBeInTheDocument()
  })

  it('calls onFrameworkSelect when framework is selected', async () => {
    const mockOnFrameworkSelect = jest.fn()
    render(<ComplianceFrameworkMapper onFrameworkSelect={mockOnFrameworkSelect} />)
    
    const gdprFramework = screen.getByText('GDPR')
    fireEvent.click(gdprFramework)
    
    await waitFor(() => {
      expect(mockOnFrameworkSelect).toHaveBeenCalledWith('GDPR')
    })
  })

  it('calls onStatusUpdate when update status button is clicked', async () => {
    const mockOnStatusUpdate = jest.fn()
    render(<ComplianceFrameworkMapper onStatusUpdate={mockOnStatusUpdate} />)
    
    const updateButton = screen.getByText('Update Status')
    fireEvent.click(updateButton)
    
    await waitFor(() => {
      expect(mockOnStatusUpdate).toHaveBeenCalledWith('SOC2', 'compliant')
    })
  })

  it('filters controls by status', async () => {
    render(<ComplianceFrameworkMapper />)
    
    // Navigate to controls tab
    fireEvent.click(screen.getByText('Controls'))
    
    await waitFor(() => {
      const statusFilter = screen.getByDisplayValue('All Statuses')
      fireEvent.change(statusFilter, { target: { value: 'compliant' } })
      
      // Should still show the control since it's compliant
      expect(screen.getByText('Test Control 1')).toBeInTheDocument()
    })
  })

  it('shows framework information based on selected framework', () => {
    render(<ComplianceFrameworkMapper />)
    
    // Should show SOC2 information by default
    expect(screen.getByText(/SOC 2.*Service Organization Control/)).toBeInTheDocument()
  })

  it('displays control categories and evidence types', () => {
    render(<ComplianceFrameworkMapper />)
    
    expect(screen.getByText('Control Categories')).toBeInTheDocument()
    expect(screen.getByText('Evidence Types')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('configuration')).toBeInTheDocument()
  })
})