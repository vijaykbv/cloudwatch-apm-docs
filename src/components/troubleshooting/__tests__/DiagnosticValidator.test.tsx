import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DiagnosticValidator from '../DiagnosticValidator'

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
  return function Button({ children, onClick, variant, size, className = '', disabled, ...props }: any) {
    return (
      <button 
        onClick={onClick} 
        className={`button ${variant} ${size} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
})

describe('DiagnosticValidator', () => {
  test('renders diagnostic validator with main elements', () => {
    render(<DiagnosticValidator />)
    
    expect(screen.getByText('Diagnostic Validator')).toBeInTheDocument()
    expect(screen.getByText('Validate configuration files, policies, and other CloudWatch APM settings.')).toBeInTheDocument()
    expect(screen.getByText('Validation Rules')).toBeInTheDocument()
  })

  test('displays validation rule categories', () => {
    render(<DiagnosticValidator />)
    
    expect(screen.getByText('Configuration')).toBeInTheDocument()
    expect(screen.getByText('Permissions')).toBeInTheDocument()
    expect(screen.getByText('Network')).toBeInTheDocument()
  })

  test('displays validation rules for each category', () => {
    render(<DiagnosticValidator />)
    
    expect(screen.getByText('CloudWatch Agent Configuration JSON Syntax')).toBeInTheDocument()
    expect(screen.getByText('IAM Policy for CloudWatch Agent')).toBeInTheDocument()
    expect(screen.getByText('CloudWatch Log Group Name')).toBeInTheDocument()
    expect(screen.getByText('CloudWatch Metric Namespace')).toBeInTheDocument()
    expect(screen.getByText('CloudWatch Endpoint URL')).toBeInTheDocument()
  })

  test('shows validation interface when rule is selected', () => {
    render(<DiagnosticValidator />)
    
    // Select a validation rule
    fireEvent.click(screen.getByText('CloudWatch Agent Configuration JSON Syntax'))
    
    expect(screen.getByText('Input to Validate')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter configuration data to validate...')).toBeInTheDocument()
    expect(screen.getByText('Validate')).toBeInTheDocument()
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  test('validates valid JSON configuration', async () => {
    render(<DiagnosticValidator />)
    
    // Select JSON validation rule
    fireEvent.click(screen.getByText('CloudWatch Agent Configuration JSON Syntax'))
    
    // Enter valid JSON
    const validConfig = JSON.stringify({
      agent: { region: 'us-east-1' },
      metrics: { namespace: 'MyApp' },
      logs: { log_group_name: '/aws/myapp' }
    }, null, 2)
    
    const textarea = screen.getByPlaceholderText('Enter configuration data to validate...')
    fireEvent.change(textarea, { target: { value: validConfig } })
    
    // Click validate
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText('Validation Result')).toBeInTheDocument()
      expect(screen.getByText('Configuration JSON is valid and well-structured')).toBeInTheDocument()
    })
  })

  test('validates invalid JSON configuration', async () => {
    render(<DiagnosticValidator />)
    
    // Select JSON validation rule
    fireEvent.click(screen.getByText('CloudWatch Agent Configuration JSON Syntax'))
    
    // Enter invalid JSON
    const invalidConfig = '{ "agent": { "region": "us-east-1" } // missing closing brace'
    
    const textarea = screen.getByPlaceholderText('Enter configuration data to validate...')
    fireEvent.change(textarea, { target: { value: invalidConfig } })
    
    // Click validate
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText('Validation Result')).toBeInTheDocument()
      expect(screen.getByText(/Invalid JSON syntax/)).toBeInTheDocument()
    })
  })

  test('validates missing required sections in configuration', async () => {
    render(<DiagnosticValidator />)
    
    // Select JSON validation rule
    fireEvent.click(screen.getByText('CloudWatch Agent Configuration JSON Syntax'))
    
    // Enter JSON missing required sections
    const incompleteConfig = JSON.stringify({
      agent: { region: 'us-east-1' }
      // Missing metrics and logs sections
    }, null, 2)
    
    const textarea = screen.getByPlaceholderText('Enter configuration data to validate...')
    fireEvent.change(textarea, { target: { value: incompleteConfig } })
    
    // Click validate
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText('Validation Result')).toBeInTheDocument()
      expect(screen.getByText(/Missing required sections/)).toBeInTheDocument()
      expect(screen.getByText('Suggestions:')).toBeInTheDocument()
    })
  })

  test('validates IAM policy with required permissions', async () => {
    render(<DiagnosticValidator />)
    
    // Select IAM policy validation rule
    fireEvent.click(screen.getByText('IAM Policy for CloudWatch Agent'))
    
    // Enter valid IAM policy
    const validPolicy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'cloudwatch:PutMetricData',
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents'
          ],
          Resource: '*'
        }
      ]
    }, null, 2)
    
    const textarea = screen.getByPlaceholderText('Enter permissions data to validate...')
    fireEvent.change(textarea, { target: { value: validPolicy } })
    
    // Click validate
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText('IAM policy contains required CloudWatch permissions')).toBeInTheDocument()
    })
  })

  test('validates IAM policy missing required permissions', async () => {
    render(<DiagnosticValidator />)
    
    // Select IAM policy validation rule
    fireEvent.click(screen.getByText('IAM Policy for CloudWatch Agent'))
    
    // Enter IAM policy missing permissions
    const incompletePolicy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['cloudwatch:PutMetricData'], // Missing logs permissions
          Resource: '*'
        }
      ]
    }, null, 2)
    
    const textarea = screen.getByPlaceholderText('Enter permissions data to validate...')
    fireEvent.change(textarea, { target: { value: incompletePolicy } })
    
    // Click validate
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText(/Missing required permissions/)).toBeInTheDocument()
    })
  })

  test('validates log group name format', async () => {
    render(<DiagnosticValidator />)
    
    // Select log group name validation rule
    fireEvent.click(screen.getByText('CloudWatch Log Group Name'))
    
    // Enter valid log group name
    const validLogGroup = '/aws/lambda/my-function'
    
    const textarea = screen.getByPlaceholderText('Enter configuration data to validate...')
    fireEvent.change(textarea, { target: { value: validLogGroup } })
    
    // Click validate
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText('Valid AWS service log group name')).toBeInTheDocument()
    })
  })

  test('validates invalid log group name', async () => {
    render(<DiagnosticValidator />)
    
    // Select log group name validation rule
    fireEvent.click(screen.getByText('CloudWatch Log Group Name'))
    
    // Enter invalid log group name with special characters
    const invalidLogGroup = 'my-log-group-with-@-symbol'
    
    const textarea = screen.getByPlaceholderText('Enter configuration data to validate...')
    fireEvent.change(textarea, { target: { value: invalidLogGroup } })
    
    // Click validate
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText('Log group name contains invalid characters')).toBeInTheDocument()
    })
  })

  test('validates metric namespace format', async () => {
    render(<DiagnosticValidator />)
    
    // Select metric namespace validation rule
    fireEvent.click(screen.getByText('CloudWatch Metric Namespace'))
    
    // Enter valid namespace
    const validNamespace = 'MyApplication/Component'
    
    const textarea = screen.getByPlaceholderText('Enter configuration data to validate...')
    fireEvent.change(textarea, { target: { value: validNamespace } })
    
    // Click validate
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText('Valid metric namespace format')).toBeInTheDocument()
    })
  })

  test('rejects AWS namespace prefix for custom metrics', async () => {
    render(<DiagnosticValidator />)
    
    // Select metric namespace validation rule
    fireEvent.click(screen.getByText('CloudWatch Metric Namespace'))
    
    // Enter namespace with AWS prefix
    const awsNamespace = 'AWS/MyApplication'
    
    const textarea = screen.getByPlaceholderText('Enter configuration data to validate...')
    fireEvent.change(textarea, { target: { value: awsNamespace } })
    
    // Click validate
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText('Cannot use AWS/ prefix for custom metrics')).toBeInTheDocument()
    })
  })

  test('validates CloudWatch endpoint URL', async () => {
    render(<DiagnosticValidator />)
    
    // Select endpoint URL validation rule
    fireEvent.click(screen.getByText('CloudWatch Endpoint URL'))
    
    // Enter valid endpoint URL
    const validEndpoint = 'https://monitoring.us-east-1.amazonaws.com'
    
    const textarea = screen.getByPlaceholderText('Enter network data to validate...')
    fireEvent.change(textarea, { target: { value: validEndpoint } })
    
    // Click validate
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText('Valid CloudWatch endpoint URL')).toBeInTheDocument()
    })
  })

  test('rejects non-HTTPS endpoint URLs', async () => {
    render(<DiagnosticValidator />)
    
    // Select endpoint URL validation rule
    fireEvent.click(screen.getByText('CloudWatch Endpoint URL'))
    
    // Enter HTTP endpoint URL
    const httpEndpoint = 'http://monitoring.us-east-1.amazonaws.com'
    
    const textarea = screen.getByPlaceholderText('Enter network data to validate...')
    fireEvent.change(textarea, { target: { value: httpEndpoint } })
    
    // Click validate
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText('CloudWatch endpoints must use HTTPS')).toBeInTheDocument()
    })
  })

  test('clears validation result and input', async () => {
    render(<DiagnosticValidator />)
    
    // Select a rule and enter input
    fireEvent.click(screen.getByText('CloudWatch Log Group Name'))
    
    const textarea = screen.getByPlaceholderText('Enter configuration data to validate...')
    fireEvent.change(textarea, { target: { value: '/aws/test' } })
    
    // Validate
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText('Validation Result')).toBeInTheDocument()
    })
    
    // Clear
    fireEvent.click(screen.getByText('Clear'))
    
    expect(textarea).toHaveValue('')
    expect(screen.queryByText('Validation Result')).not.toBeInTheDocument()
  })

  test('disables validate button when no input provided', () => {
    render(<DiagnosticValidator />)
    
    // Select a rule
    fireEvent.click(screen.getByText('CloudWatch Log Group Name'))
    
    // Validate button should be disabled when no input
    const validateButton = screen.getByText('Validate')
    expect(validateButton).toBeDisabled()
  })

  test('shows validation history after multiple validations', async () => {
    render(<DiagnosticValidator />)
    
    // Select a rule and validate something
    fireEvent.click(screen.getByText('CloudWatch Log Group Name'))
    
    const textarea = screen.getByPlaceholderText('Enter configuration data to validate...')
    fireEvent.change(textarea, { target: { value: '/aws/test' } })
    
    fireEvent.click(screen.getByText('Validate'))
    
    await waitFor(() => {
      expect(screen.getByText('Validation History')).toBeInTheDocument()
    })
  })
})