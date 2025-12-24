/**
 * Unit tests for APIDocumentationGenerator component
 * **Validates: Requirements 7.1, 7.3**
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { APIDocumentationGenerator } from '../APIDocumentationGenerator'
import { OpenAPISpec } from '../../../types/api'

const mockOpenAPISpec: OpenAPISpec = {
  openapi: '3.0.3',
  info: {
    title: 'Test API',
    description: 'Test API description',
    version: '1.0.0',
    contact: {
      name: 'Test Team',
      url: 'https://example.com',
      email: 'test@example.com'
    }
  },
  servers: [
    {
      url: 'https://api.example.com',
      description: 'Production server'
    }
  ],
  paths: {
    '/test': {
      get: {
        tags: ['Test'],
        summary: 'Test endpoint',
        description: 'Test endpoint description',
        operationId: 'getTest',
        parameters: [
          {
            name: 'testParam',
            in: 'query' as const,
            description: 'Test parameter',
            required: false,
            schema: {
              type: 'string',
              example: 'test-value'
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
                    message: {
                      type: 'string',
                      description: 'Response message'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request'
          }
        },
        security: [
          {
            'ApiKeyAuth': []
          }
        ]
      },
      post: {
        tags: ['Test'],
        summary: 'Create test',
        description: 'Create test endpoint',
        operationId: 'createTest',
        requestBody: {
          description: 'Test request body',
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Test name'
                  }
                },
                required: ['name']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Created successfully'
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      'ApiKeyAuth': {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key'
      }
    }
  },
  tags: [
    {
      name: 'Test',
      description: 'Test operations'
    }
  ]
}

describe('APIDocumentationGenerator', () => {
  const defaultProps = {
    spec: mockOpenAPISpec
  }

  test('renders API title and description', () => {
    render(<APIDocumentationGenerator {...defaultProps} />)
    
    expect(screen.getByText('Test API')).toBeInTheDocument()
    expect(screen.getByText('Test API description')).toBeInTheDocument()
    expect(screen.getByText('Version: 1.0.0')).toBeInTheDocument()
  })

  test('displays contact information when available', () => {
    render(<APIDocumentationGenerator {...defaultProps} />)
    
    expect(screen.getByText('Documentation')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', 'https://example.com')
  })

  test('renders endpoint sidebar with paths and methods', () => {
    render(<APIDocumentationGenerator {...defaultProps} />)
    
    expect(screen.getByText('Endpoints')).toBeInTheDocument()
    expect(screen.getAllByText('/test')[0]).toBeInTheDocument() // Use getAllByText to get first occurrence
    expect(screen.getAllByText('get')[0]).toBeInTheDocument() // Use getAllByText to get first occurrence
    expect(screen.getByText('post')).toBeInTheDocument()
    expect(screen.getAllByText('Test endpoint')[0]).toBeInTheDocument() // Use getAllByText to get first occurrence
    expect(screen.getByText('Create test')).toBeInTheDocument()
  })

  test('selects first endpoint by default', () => {
    render(<APIDocumentationGenerator {...defaultProps} />)
    
    // Should show the GET operation details
    expect(screen.getAllByText('Test endpoint')[1]).toBeInTheDocument() // Use second occurrence (the heading)
    expect(screen.getByText('Test endpoint description')).toBeInTheDocument()
  })

  test('switches between endpoints when clicked', () => {
    render(<APIDocumentationGenerator {...defaultProps} />)
    
    // Initially shows GET operation
    expect(screen.getByText('Test endpoint description')).toBeInTheDocument()
    
    // Click POST operation
    const postButton = screen.getByRole('button', { name: /post Create test/ })
    fireEvent.click(postButton)
    
    // Should now show POST operation
    expect(screen.getByText('Create test endpoint')).toBeInTheDocument()
  })

  test('displays operation parameters correctly', () => {
    render(<APIDocumentationGenerator {...defaultProps} />)
    
    expect(screen.getByText('Parameters')).toBeInTheDocument()
    expect(screen.getByText('testParam')).toBeInTheDocument()
    expect(screen.getByText('query')).toBeInTheDocument()
    expect(screen.getByText('Test parameter')).toBeInTheDocument()
    // Check for the example text in a more flexible way
    expect(screen.getByText('"test-value"')).toBeInTheDocument()
  })

  test('displays request body for POST operations', () => {
    render(<APIDocumentationGenerator {...defaultProps} />)
    
    // Switch to POST operation
    const postButton = screen.getByRole('button', { name: /post Create test/ })
    fireEvent.click(postButton)
    
    expect(screen.getByText('Request Body')).toBeInTheDocument()
    expect(screen.getByText('Test request body')).toBeInTheDocument()
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByText('application/json')).toBeInTheDocument()
  })

  test('displays response information', () => {
    render(<APIDocumentationGenerator {...defaultProps} />)
    
    expect(screen.getByText('Responses')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByText('Successful response')).toBeInTheDocument()
    expect(screen.getByText('400')).toBeInTheDocument()
    expect(screen.getByText('Bad request')).toBeInTheDocument()
  })

  test('displays security requirements', () => {
    render(<APIDocumentationGenerator {...defaultProps} />)
    
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('ApiKeyAuth')).toBeInTheDocument()
  })

  test('displays server information', () => {
    render(<APIDocumentationGenerator {...defaultProps} />)
    
    expect(screen.getByText('API Servers')).toBeInTheDocument()
    expect(screen.getByText('https://api.example.com')).toBeInTheDocument()
    expect(screen.getByText('Production server')).toBeInTheDocument()
  })

  test('renders schema properties correctly', () => {
    render(<APIDocumentationGenerator {...defaultProps} />)
    
    // Check response schema rendering
    expect(screen.getByText('Properties:')).toBeInTheDocument()
    expect(screen.getByText('message')).toBeInTheDocument()
    expect(screen.getByText('Response message')).toBeInTheDocument()
  })

  test('handles operations with tags', () => {
    render(<APIDocumentationGenerator {...defaultProps} />)
    
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  test('applies custom className', () => {
    const { container } = render(
      <APIDocumentationGenerator {...defaultProps} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  test('handles spec without contact information', () => {
    const specWithoutContact = {
      ...mockOpenAPISpec,
      info: {
        ...mockOpenAPISpec.info,
        contact: undefined
      }
    }
    
    render(<APIDocumentationGenerator spec={specWithoutContact} />)
    
    expect(screen.queryByText('Documentation')).not.toBeInTheDocument()
  })

  test('handles operations without parameters', () => {
    const specWithoutParams = {
      ...mockOpenAPISpec,
      paths: {
        '/simple': {
          get: {
            summary: 'Simple endpoint',
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        }
      }
    }
    
    render(<APIDocumentationGenerator spec={specWithoutParams} />)
    
    expect(screen.queryByText('Parameters')).not.toBeInTheDocument()
  })

  test('handles deprecated operations', () => {
    const specWithDeprecated = {
      ...mockOpenAPISpec,
      paths: {
        '/deprecated': {
          get: {
            summary: 'Deprecated endpoint',
            deprecated: true,
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        }
      }
    }
    
    render(<APIDocumentationGenerator spec={specWithDeprecated} />)
    
    // Should still render the operation - use getAllByText to handle multiple occurrences
    expect(screen.getAllByText('Deprecated endpoint')[1]).toBeInTheDocument() // Use second occurrence (the heading)
  })

  test('handles empty paths gracefully', () => {
    const specWithoutPaths = {
      ...mockOpenAPISpec,
      paths: {}
    }
    
    render(<APIDocumentationGenerator spec={specWithoutPaths} />)
    
    expect(screen.getByText('Select an endpoint to view documentation')).toBeInTheDocument()
  })

  test('renders required parameter indicators', () => {
    const specWithRequiredParam = {
      ...mockOpenAPISpec,
      paths: {
        '/test': {
          get: {
            summary: 'Test endpoint',
            parameters: [
              {
                name: 'requiredParam',
                in: 'path' as const,
                required: true,
                schema: {
                  type: 'string'
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
    
    render(<APIDocumentationGenerator spec={specWithRequiredParam} />)
    
    expect(screen.getByText('required')).toBeInTheDocument()
  })

  test('handles complex nested schemas', () => {
    const specWithNestedSchema = {
      ...mockOpenAPISpec,
      paths: {
        '/nested': {
          get: {
            summary: 'Nested schema endpoint',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'string'
                              },
                              name: {
                                type: 'string'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    render(<APIDocumentationGenerator spec={specWithNestedSchema} />)
    
    expect(screen.getByText('Array items:')).toBeInTheDocument()
    expect(screen.getByText('data')).toBeInTheDocument()
  })
})