import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import IssueClassifier from '../IssueClassifier'

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

const mockOnIssueIdentified = jest.fn()

// Mock the troubleshooting data
jest.mock('../../../data/troubleshooting-data', () => ({
  troubleshootingIssues: [
    {
      id: 'agent-not-starting',
      title: 'CloudWatch Agent Not Starting',
      description: 'The CloudWatch agent fails to start or stops unexpectedly',
      category: 'installation',
      severity: 'high',
      symptoms: ['Agent service fails to start'],
      causes: ['Incorrect configuration file'],
      solutions: [],
      diagnosticSteps: [],
      relatedIssues: [],
      tags: ['agent', 'startup'],
      lastUpdated: new Date('2024-01-15'),
      affectedComponents: ['CloudWatch Agent']
    },
    {
      id: 'metrics-not-appearing',
      title: 'Metrics Not Appearing in CloudWatch',
      description: 'Custom metrics or logs are not showing up in the CloudWatch console',
      category: 'data-collection',
      severity: 'medium',
      symptoms: ['No custom metrics in CloudWatch console'],
      causes: ['IAM permission issues'],
      solutions: [],
      diagnosticSteps: [],
      relatedIssues: [],
      tags: ['metrics', 'data-collection'],
      lastUpdated: new Date('2024-01-15'),
      affectedComponents: ['CloudWatch Metrics']
    }
  ]
}))

describe('IssueClassifier', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders issue classifier with initial question', () => {
    render(<IssueClassifier onIssueIdentified={mockOnIssueIdentified} />)
    
    expect(screen.getByText('Issue Classifier')).toBeInTheDocument()
    expect(screen.getByText('Answer a few questions to help identify your issue and find the right solutions.')).toBeInTheDocument()
    expect(screen.getByText('What type of problem are you experiencing?')).toBeInTheDocument()
  })

  test('displays answer options for initial question', () => {
    render(<IssueClassifier onIssueIdentified={mockOnIssueIdentified} />)
    
    expect(screen.getByText('CloudWatch agent won\'t start or keeps stopping')).toBeInTheDocument()
    expect(screen.getByText('Not seeing metrics or logs in CloudWatch console')).toBeInTheDocument()
    expect(screen.getByText('Performance issues or high resource usage')).toBeInTheDocument()
    expect(screen.getByText('Configuration or setup problems')).toBeInTheDocument()
    expect(screen.getByText('Something else or not sure')).toBeInTheDocument()
  })

  test('progresses to next question when answer is selected', async () => {
    render(<IssueClassifier onIssueIdentified={mockOnIssueIdentified} />)
    
    // Click on the first answer option
    fireEvent.click(screen.getByText('CloudWatch agent won\'t start or keeps stopping'))
    
    await waitFor(() => {
      expect(screen.getByText('Which of these symptoms do you see?')).toBeInTheDocument()
    })
  })

  test('shows agent-specific symptoms after selecting agent problem', async () => {
    render(<IssueClassifier onIssueIdentified={mockOnIssueIdentified} />)
    
    // Select agent problem
    fireEvent.click(screen.getByText('CloudWatch agent won\'t start or keeps stopping'))
    
    await waitFor(() => {
      expect(screen.getByText('Service fails to start or shows as inactive')).toBeInTheDocument()
      expect(screen.getByText('No CloudWatch agent process running')).toBeInTheDocument()
      expect(screen.getByText('Error messages in agent logs during startup')).toBeInTheDocument()
      expect(screen.getByText('Agent starts but stops after a while')).toBeInTheDocument()
    })
  })

  test('shows data-specific symptoms after selecting data problem', async () => {
    render(<IssueClassifier onIssueIdentified={mockOnIssueIdentified} />)
    
    // Select data problem
    fireEvent.click(screen.getByText('Not seeing metrics or logs in CloudWatch console'))
    
    await waitFor(() => {
      expect(screen.getByText('What specifically is missing?')).toBeInTheDocument()
      expect(screen.getByText('Custom metrics not appearing')).toBeInTheDocument()
      expect(screen.getByText('Log groups or log streams not created')).toBeInTheDocument()
      expect(screen.getByText('Data appears but with significant delay')).toBeInTheDocument()
      expect(screen.getByText('Some metrics work, others don\'t')).toBeInTheDocument()
    })
  })

  test('completes classification and shows results', async () => {
    render(<IssueClassifier onIssueIdentified={mockOnIssueIdentified} />)
    
    // Select agent problem
    fireEvent.click(screen.getByText('CloudWatch agent won\'t start or keeps stopping'))
    
    await waitFor(() => {
      expect(screen.getByText('Which of these symptoms do you see?')).toBeInTheDocument()
    })
    
    // Select a symptom (this should complete the classification)
    fireEvent.click(screen.getByText('Service fails to start or shows as inactive'))
    
    await waitFor(() => {
      expect(screen.getByText('Classification Complete')).toBeInTheDocument()
      expect(screen.getByText('Based on your answers, here are the most likely issues:')).toBeInTheDocument()
    })
  })

  test('shows suggested issues after classification', async () => {
    render(<IssueClassifier onIssueIdentified={mockOnIssueIdentified} />)
    
    // Complete classification flow
    fireEvent.click(screen.getByText('CloudWatch agent won\'t start or keeps stopping'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Service fails to start or shows as inactive'))
    })
    
    await waitFor(() => {
      expect(screen.getByText('CloudWatch Agent Not Starting')).toBeInTheDocument()
      expect(screen.getByText('#1 Match')).toBeInTheDocument()
      expect(screen.getByText('View Solutions')).toBeInTheDocument()
    })
  })

  test('calls onIssueIdentified when View Solutions is clicked', async () => {
    render(<IssueClassifier onIssueIdentified={mockOnIssueIdentified} />)
    
    // Complete classification flow
    fireEvent.click(screen.getByText('CloudWatch agent won\'t start or keeps stopping'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Service fails to start or shows as inactive'))
    })
    
    await waitFor(() => {
      const viewSolutionsButton = screen.getByText('View Solutions')
      fireEvent.click(viewSolutionsButton)
    })
    
    expect(mockOnIssueIdentified).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'agent-not-starting',
        title: 'CloudWatch Agent Not Starting'
      })
    )
  })

  test('allows starting over during classification', async () => {
    render(<IssueClassifier onIssueIdentified={mockOnIssueIdentified} />)
    
    // Start classification
    fireEvent.click(screen.getByText('CloudWatch agent won\'t start or keeps stopping'))
    
    await waitFor(() => {
      expect(screen.getByText('Which of these symptoms do you see?')).toBeInTheDocument()
    })
    
    // Click Start Over
    fireEvent.click(screen.getByText('Start Over'))
    
    await waitFor(() => {
      expect(screen.getByText('What type of problem are you experiencing?')).toBeInTheDocument()
    })
  })

  test('allows starting over after classification complete', async () => {
    render(<IssueClassifier onIssueIdentified={mockOnIssueIdentified} />)
    
    // Complete classification
    fireEvent.click(screen.getByText('CloudWatch agent won\'t start or keeps stopping'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Service fails to start or shows as inactive'))
    })
    
    await waitFor(() => {
      expect(screen.getByText('Classification Complete')).toBeInTheDocument()
    })
    
    // Click Start Over
    fireEvent.click(screen.getByText('Start Over'))
    
    await waitFor(() => {
      expect(screen.getByText('What type of problem are you experiencing?')).toBeInTheDocument()
    })
  })

  test('shows progress indicator', async () => {
    render(<IssueClassifier onIssueIdentified={mockOnIssueIdentified} />)
    
    expect(screen.getByText('Step 1')).toBeInTheDocument()
    
    // Progress to next step
    fireEvent.click(screen.getByText('CloudWatch agent won\'t start or keeps stopping'))
    
    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeInTheDocument()
    })
  })

  test('shows question count after answering', async () => {
    render(<IssueClassifier onIssueIdentified={mockOnIssueIdentified} />)
    
    // Answer first question
    fireEvent.click(screen.getByText('CloudWatch agent won\'t start or keeps stopping'))
    
    await waitFor(() => {
      expect(screen.getByText('1 question answered')).toBeInTheDocument()
    })
  })

  test('handles no specific match found scenario', async () => {
    render(<IssueClassifier onIssueIdentified={mockOnIssueIdentified} />)
    
    // Select a path that won't match any issues strongly
    fireEvent.click(screen.getByText('Something else or not sure'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Need help troubleshooting an issue'))
    })
    
    await waitFor(() => {
      expect(screen.getByText('No Specific Match Found')).toBeInTheDocument()
      expect(screen.getByText('We couldn\'t identify a specific issue based on your answers.')).toBeInTheDocument()
    })
  })
})