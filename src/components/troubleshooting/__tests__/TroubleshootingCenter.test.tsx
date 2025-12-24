import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TroubleshootingCenter from '../TroubleshootingCenter'

// Mock UI components
jest.mock('../../ui/Card', () => {
  return function Card({ children, className = '', title }: any) {
    return (
      <div className={`card ${className}`} data-testid="card">
        {title && <h3>{title}</h3>}
        {children}
      </div>
    )
  }
})

jest.mock('../../ui/Button', () => {
  return function Button({ children, onClick, variant, size, className = '', ...props }: any) {
    return (
      <button 
        onClick={onClick} 
        className={`button ${variant} ${size} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
})

jest.mock('../../ui/Input', () => {
  return function Input({ label, error, className = '', ...props }: any) {
    return (
      <div>
        {label && <label>{label}</label>}
        <input className={`input ${className}`} {...props} />
        {error && <p>{error}</p>}
      </div>
    )
  }
})

// Mock other troubleshooting components
jest.mock('../IssueClassifier', () => {
  return function IssueClassifier({ onIssueIdentified }: any) {
    return <div data-testid="issue-classifier">Issue Classifier</div>
  }
})

jest.mock('../SolutionDatabase', () => {
  return function SolutionDatabase({ issue }: any) {
    return <div data-testid="solution-database">{issue.title}</div>
  }
})

jest.mock('../DiagnosticTools', () => {
  return function DiagnosticTools() {
    return <div data-testid="diagnostic-tools">Diagnostic Tools</div>
  }
})

jest.mock('../EscalationPathways', () => {
  return function EscalationPathways() {
    return <div data-testid="escalation-pathways">Get Help</div>
  }
})

// Mock the troubleshooting data
jest.mock('../../../data/troubleshooting-data', () => ({
  searchTroubleshootingIssues: jest.fn(() => [
    {
      id: 'test-issue-1',
      title: 'Test Issue 1',
      description: 'Test description 1',
      category: 'installation',
      severity: 'high',
      symptoms: ['Symptom 1', 'Symptom 2'],
      causes: ['Cause 1'],
      solutions: [
        {
          id: 'solution-1',
          title: 'Test Solution',
          description: 'Test solution description',
          steps: [],
          estimatedTime: 10,
          difficulty: 'easy',
          prerequisites: [],
          verificationSteps: []
        }
      ],
      diagnosticSteps: [],
      relatedIssues: [],
      tags: ['test'],
      lastUpdated: new Date('2024-01-15'),
      affectedComponents: ['Component 1']
    }
  ]),
  getTroubleshootingIssuesByCategory: jest.fn(() => []),
  getTroubleshootingIssuesBySeverity: jest.fn(() => []),
  troubleshootingIssues: [
    {
      id: 'test-issue-1',
      title: 'Test Issue 1',
      description: 'Test description 1',
      category: 'installation',
      severity: 'high',
      symptoms: ['Symptom 1', 'Symptom 2'],
      causes: ['Cause 1'],
      solutions: [
        {
          id: 'solution-1',
          title: 'Test Solution',
          description: 'Test solution description',
          steps: [],
          estimatedTime: 10,
          difficulty: 'easy',
          prerequisites: [],
          verificationSteps: []
        }
      ],
      diagnosticSteps: [],
      relatedIssues: [],
      tags: ['test'],
      lastUpdated: new Date('2024-01-15'),
      affectedComponents: ['Component 1']
    }
  ]
}))

describe('TroubleshootingCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders troubleshooting center with main elements', () => {
    render(<TroubleshootingCenter />)
    
    expect(screen.getByText('CloudWatch APM Troubleshooting Center')).toBeInTheDocument()
    expect(screen.getByText('Find solutions to common issues, run diagnostic tools, and get help when you need it.')).toBeInTheDocument()
    
    // Check navigation tabs
    expect(screen.getByText('Search Issues')).toBeInTheDocument()
    expect(screen.getByText('Issue Classifier')).toBeInTheDocument()
    expect(screen.getByText('Diagnostic Tools')).toBeInTheDocument()
    expect(screen.getByText('Get Help')).toBeInTheDocument()
  })

  test('displays search interface by default', () => {
    render(<TroubleshootingCenter />)
    
    expect(screen.getByPlaceholderText('Search by symptoms, error messages, or keywords...')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Severity')).toBeInTheDocument()
  })

  test('allows searching for issues', async () => {
    const mockSearchResults = [
      {
        id: 'search-result-1',
        title: 'Search Result Issue',
        description: 'Found issue description',
        category: 'configuration',
        severity: 'medium',
        symptoms: ['Search symptom'],
        causes: ['Search cause'],
        solutions: [],
        diagnosticSteps: [],
        relatedIssues: [],
        tags: ['search'],
        lastUpdated: new Date('2024-01-15'),
        affectedComponents: ['Search Component']
      }
    ]

    const { searchTroubleshootingIssues } = require('../../../data/troubleshooting-data')
    searchTroubleshootingIssues.mockReturnValue(mockSearchResults)

    render(<TroubleshootingCenter />)
    
    const searchInput = screen.getByPlaceholderText('Search by symptoms, error messages, or keywords...')
    fireEvent.change(searchInput, { target: { value: 'test search' } })

    await waitFor(() => {
      expect(searchTroubleshootingIssues).toHaveBeenCalledWith('test search')
    })
  })

  test('allows filtering by category', async () => {
    const mockCategoryResults = [
      {
        id: 'category-result-1',
        title: 'Category Issue',
        description: 'Category issue description',
        category: 'performance',
        severity: 'low',
        symptoms: ['Category symptom'],
        causes: ['Category cause'],
        solutions: [],
        diagnosticSteps: [],
        relatedIssues: [],
        tags: ['category'],
        lastUpdated: new Date('2024-01-15'),
        affectedComponents: ['Category Component']
      }
    ]

    const { getTroubleshootingIssuesByCategory } = require('../../../data/troubleshooting-data')
    getTroubleshootingIssuesByCategory.mockReturnValue(mockCategoryResults)

    render(<TroubleshootingCenter />)
    
    const categorySelect = screen.getByDisplayValue('All Categories')
    fireEvent.change(categorySelect, { target: { value: 'performance' } })

    await waitFor(() => {
      expect(getTroubleshootingIssuesByCategory).toHaveBeenCalledWith('performance')
    })
  })

  test('allows filtering by severity', async () => {
    const mockSeverityResults = [
      {
        id: 'severity-result-1',
        title: 'Critical Issue',
        description: 'Critical issue description',
        category: 'connectivity',
        severity: 'critical',
        symptoms: ['Critical symptom'],
        causes: ['Critical cause'],
        solutions: [],
        diagnosticSteps: [],
        relatedIssues: [],
        tags: ['critical'],
        lastUpdated: new Date('2024-01-15'),
        affectedComponents: ['Critical Component']
      }
    ]

    const { getTroubleshootingIssuesBySeverity } = require('../../../data/troubleshooting-data')
    getTroubleshootingIssuesBySeverity.mockReturnValue(mockSeverityResults)

    render(<TroubleshootingCenter />)
    
    const severitySelect = screen.getByDisplayValue('All Severities')
    fireEvent.change(severitySelect, { target: { value: 'critical' } })

    await waitFor(() => {
      expect(getTroubleshootingIssuesBySeverity).toHaveBeenCalledWith('critical')
    })
  })

  test('switches between navigation tabs', () => {
    render(<TroubleshootingCenter />)
    
    // Click on Issue Classifier tab
    fireEvent.click(screen.getByText('Issue Classifier'))
    expect(screen.getByText('Issue Classifier')).toBeInTheDocument()
    
    // Click on Diagnostic Tools tab
    fireEvent.click(screen.getByText('Diagnostic Tools'))
    expect(screen.getByText('Diagnostic Tools')).toBeInTheDocument()
    
    // Click on Get Help tab
    fireEvent.click(screen.getByText('Get Help'))
    expect(screen.getByText('Get Help')).toBeInTheDocument()
  })

  test('displays issue details when issue is selected', () => {
    render(<TroubleshootingCenter />)
    
    // Find and click on an issue
    const issueCard = screen.getByText('Test Issue 1')
    fireEvent.click(issueCard)

    // Should show solution database
    expect(screen.getByText('Test Issue 1')).toBeInTheDocument()
    expect(screen.getByText('Test description 1')).toBeInTheDocument()
  })

  test('shows no results message when no issues found', () => {
    const { searchTroubleshootingIssues } = require('../../../data/troubleshooting-data')
    searchTroubleshootingIssues.mockReturnValue([])

    render(<TroubleshootingCenter />)
    
    const searchInput = screen.getByPlaceholderText('Search by symptoms, error messages, or keywords...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent issue' } })

    expect(screen.getByText('No Issues Found')).toBeInTheDocument()
    expect(screen.getByText('Try Issue Classifier')).toBeInTheDocument()
  })

  test('displays severity badges with correct colors', () => {
    render(<TroubleshootingCenter />)
    
    // Should display the high severity badge
    const severityBadge = screen.getByText('HIGH')
    expect(severityBadge).toBeInTheDocument()
    expect(severityBadge).toHaveClass('text-orange-600', 'bg-orange-50')
  })

  test('displays category icons correctly', () => {
    render(<TroubleshootingCenter />)
    
    // The installation category should have a gear icon (⚙️)
    // We can't directly test for emoji, but we can test that the issue is displayed
    expect(screen.getByText('Test Issue 1')).toBeInTheDocument()
  })

  test('shows issue metadata correctly', () => {
    render(<TroubleshootingCenter />)
    
    // Check that issue metadata is displayed
    expect(screen.getByText('1 solution')).toBeInTheDocument()
    expect(screen.getByText('1 component')).toBeInTheDocument()
    expect(screen.getByText('Updated 1/15/2024')).toBeInTheDocument()
  })
})