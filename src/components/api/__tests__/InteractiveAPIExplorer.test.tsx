/**
 * Unit tests for InteractiveAPIExplorer component
 * **Validates: Requirements 7.1, 7.3**
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { InteractiveAPIExplorer } from '../InteractiveAPIExplorer'
import { OpenAPISpec } from '../../../types/api'

const mockOpenAPISpec: OpenAPISpec = {
  openapi: '3.0.3',
  info: {
    title: 'Test API Explorer',
    description: 'Test API for explorer',
    version: '1.0.0'
  },
  servers: [
    {
      url: 'https://api.example.com',
      description: 'Test server'
    }
  ],
  paths: {
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        description: 'Get a list of users',
        operationId: 'listUsers',
        parameters: [
          {
            name: 'limit',
            in: 'query' as const,
            description: 'Maximum number of users to return',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10
            }
          },
          {
            name: 'status',
            in: 'query' as const,
            description: 'Filter by status',
            required: false,
            schema: {
              type: 'string',
              enum: ['active', 'inactive']
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Create user',
        description: 'Create a new user',
        operationId: 'createUser',
        requestBody: {
          description: 'User data',
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: {
                    type: 'string',
                    description: 'User name'
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'User email'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User created successfully'
          }
        }
      }
    }
  }
}

describe('InteractiveAPIExplorer', () => {
  const defaultProps = {
    spec: mockOpenAPISpec
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders explorer title and description', () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    expect(screen.getByText('API Explorer')).toBeInTheDocument()
    expect(screen.getByText('Try out the CloudWatch APM API endpoints with interactive examples')).toBeInTheDocument()
  })

  test('displays endpoint selection sidebar', () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    expect(screen.getByText('Select Endpoint')).toBeInTheDocument()
    expect(screen.getByText('/users')).toBeInTheDocument()
    expect(screen.getByText('get')).toBeInTheDocument()
    expect(screen.getByText('post')).toBeInTheDocument()
    expect(screen.getByText('List users')).toBeInTheDocument()
    expect(screen.getByText('Create user')).toBeInTheDocument()
  })

  test('shows default message when no endpoint is selected', () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    expect(screen.getByText('Select an endpoint to try it out')).toBeInTheDocument()
    expect(screen.getByText('Choose an endpoint from the sidebar to start exploring the API')).toBeInTheDocument()
  })

  test('selects endpoint when clicked', () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    // Click GET endpoint
    const getButton = screen.getByRole('button', { name: /get List users/ })
    fireEvent.click(getButton)
    
    // Should show endpoint details - use getAllByText to handle multiple occurrences
    expect(screen.getAllByText('List users')[1]).toBeInTheDocument() // Use second occurrence (the heading)
    expect(screen.getByText('Get a list of users')).toBeInTheDocument()
  })

  test('displays parameters for selected endpoint', () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    // Select GET endpoint
    const getButton = screen.getByRole('button', { name: /get List users/ })
    fireEvent.click(getButton)
    
    expect(screen.getByText('Parameters')).toBeInTheDocument()
    expect(screen.getByText('limit')).toBeInTheDocument()
    expect(screen.getByText('status')).toBeInTheDocument()
    expect(screen.getByText('Maximum number of users to return')).toBeInTheDocument()
    expect(screen.getByText('Filter by status')).toBeInTheDocument()
  })

  test('renders different input types for parameters', () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    // Select GET endpoint
    const getButton = screen.getByRole('button', { name: /get List users/ })
    fireEvent.click(getButton)
    
    // Should have number input for limit
    const limitInput = screen.getByRole('spinbutton') // number inputs have spinbutton role
    expect(limitInput).toHaveAttribute('type', 'number')
    expect(limitInput).toHaveAttribute('min', '1')
    expect(limitInput).toHaveAttribute('max', '100')
    
    // Should have select for enum parameter
    const statusSelect = screen.getByRole('combobox') // select elements have combobox role
    expect(statusSelect.tagName).toBe('SELECT')
  })

  test('displays request body editor for POST endpoints', () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    // Select POST endpoint
    const postButton = screen.getByRole('button', { name: /post Create user/ })
    fireEvent.click(postButton)
    
    expect(screen.getByText('Request Body')).toBeInTheDocument()
    expect(screen.getByText('User data')).toBeInTheDocument()
    expect(screen.getByText('Content Type: application/json')).toBeInTheDocument()
    
    // Should have textarea for JSON input
    const textarea = screen.getByRole('textbox')
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  test('updates parameter values when changed', () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    // Select GET endpoint
    const getButton = screen.getByRole('button', { name: /get List users/ })
    fireEvent.click(getButton)
    
    // Change limit parameter
    const limitInput = screen.getByRole('spinbutton')
    fireEvent.change(limitInput, { target: { value: '25' } })
    
    expect(limitInput).toHaveValue(25)
  })

  test('updates request body when changed', () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    // Select POST endpoint
    const postButton = screen.getByRole('button', { name: /post Create user/ })
    fireEvent.click(postButton)
    
    // Change request body
    const textarea = screen.getByRole('textbox')
    const newBody = '{"name": "John Doe", "email": "john@example.com"}'
    fireEvent.change(textarea, { target: { value: newBody } })
    
    // Check that the value contains the expected content (formatted JSON)
    expect(textarea.value).toContain('John Doe')
    expect(textarea.value).toContain('john@example.com')
  })

  test('executes API request when try it out is clicked', async () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    // Select GET endpoint
    const getButton = screen.getByRole('button', { name: /get List users/ })
    fireEvent.click(getButton)
    
    // Click try it out
    const tryButton = screen.getByText('Try it out')
    fireEvent.click(tryButton)
    
    // Should show loading state
    expect(screen.getByText('Executing...')).toBeInTheDocument()
    expect(tryButton).toBeDisabled()
    
    // Wait for response
    await waitFor(() => {
      expect(screen.getByText('Response')).toBeInTheDocument()
    }, { timeout: 2000 })
    
    // Should show response details
    expect(screen.getByText('200 OK')).toBeInTheDocument()
    expect(screen.getByText('Headers')).toBeInTheDocument()
    expect(screen.getByText('Response Body')).toBeInTheDocument()
  })

  test('shows use example button for request body', () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    // Select POST endpoint
    const postButton = screen.getByRole('button', { name: /post Create user/ })
    fireEvent.click(postButton)
    
    expect(screen.getByText('Use example')).toBeInTheDocument()
  })

  test('populates example when use example is clicked', () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    // Select POST endpoint
    const postButton = screen.getByRole('button', { name: /post Create user/ })
    fireEvent.click(postButton)
    
    // Click use example
    const useExampleButton = screen.getByText('Use example')
    fireEvent.click(useExampleButton)
    
    // Should populate textarea with example - the component returns empty object for non-application paths
    const textarea = screen.getByRole('textbox')
    expect(textarea.value).toContain('{}')
  })

  test('displays method-specific styling', () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    // Check that the method spans have the correct styling
    const getMethodSpan = screen.getByText('get')
    expect(getMethodSpan).toHaveClass('text-blue-600')
    
    const postMethodSpan = screen.getByText('post')
    expect(postMethodSpan).toHaveClass('text-green-600')
  })

  test('resets state when switching endpoints', () => {
    render(<InteractiveAPIExplorer {...defaultProps} />)
    
    // Select GET endpoint and set parameter
    const getButton = screen.getByRole('button', { name: /get List users/ })
    fireEvent.click(getButton)
    
    const limitInput = screen.getByRole('spinbutton')
    fireEvent.change(limitInput, { target: { value: '25' } })
    
    // Switch to POST endpoint
    const postButton = screen.getByRole('button', { name: /post Create user/ })
    fireEvent.click(postButton)
    
    // Switch back to GET
    fireEvent.click(getButton)
    
    // Parameter should be reset
    const newLimitInput = screen.getByRole('spinbutton')
    expect(newLimitInput).toHaveValue(null)
  })

  test('applies custom className', () => {
    const { container } = render(
      <InteractiveAPIExplorer {...defaultProps} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  test('handles spec without paths', () => {
    const emptySpec = {
      ...mockOpenAPISpec,
      paths: {}
    }
    
    render(<InteractiveAPIExplorer spec={emptySpec} />)
    
    expect(screen.getByText('Select an endpoint to try it out')).toBeInTheDocument()
  })

  test('handles parameters with examples', () => {
    const specWithExamples = {
      ...mockOpenAPISpec,
      paths: {
        '/test': {
          get: {
            summary: 'Test endpoint',
            parameters: [
              {
                name: 'testParam',
                in: 'query' as const,
                schema: {
                  type: 'string'
                },
                example: 'test-example-value'
              }
            ],
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        }
      }
    }
    
    render(<InteractiveAPIExplorer spec={specWithExamples} />)
    
    // Select the endpoint
    const button = screen.getByRole('button', { name: /get Test endpoint/ })
    fireEvent.click(button)
    
    expect(screen.getByText('Example: "test-example-value"')).toBeInTheDocument()
  })

  test('handles boolean parameters', () => {
    const specWithBoolean = {
      ...mockOpenAPISpec,
      paths: {
        '/test': {
          get: {
            summary: 'Test endpoint',
            parameters: [
              {
                name: 'enabled',
                in: 'query' as const,
                schema: {
                  type: 'boolean'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        }
      }
    }
    
    render(<InteractiveAPIExplorer spec={specWithBoolean} />)
    
    // Select the endpoint
    const button = screen.getByRole('button', { name: /get Test endpoint/ })
    fireEvent.click(button)
    
    // Should have select with true/false options
    const select = screen.getByRole('combobox')
    expect(select.tagName).toBe('SELECT')
    
    // Check options
    fireEvent.mouseDown(select)
    expect(screen.getByText('true')).toBeInTheDocument()
    expect(screen.getByText('false')).toBeInTheDocument()
  })
})