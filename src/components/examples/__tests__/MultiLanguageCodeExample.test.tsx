/**
 * Unit tests for MultiLanguageCodeExample component
 * **Validates: Requirements 6.1, 6.2**
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MultiLanguageCodeExample } from '../MultiLanguageCodeExample'
import { CodeExample } from '../../../types/examples'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve())
  }
})

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

const mockExamples: CodeExample[] = [
  {
    id: 'test-js-example',
    title: 'JavaScript Example',
    description: 'Test JavaScript code example',
    language: 'javascript',
    code: 'console.log("Hello World");',
    category: 'getting-started',
    difficulty: 'beginner',
    tags: ['javascript', 'basic'],
    dependencies: ['express'],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'test.js',
      runnable: true,
      testable: true,
      framework: 'express'
    }
  },
  {
    id: 'test-python-example',
    title: 'Python Example',
    description: 'Test Python code example',
    language: 'python',
    code: 'print("Hello World")',
    category: 'getting-started',
    difficulty: 'beginner',
    tags: ['python', 'basic'],
    dependencies: ['flask'],
    relatedExamples: [],
    lastUpdated: new Date('2024-01-15'),
    metadata: {
      filename: 'test.py',
      runnable: true,
      testable: true,
      framework: 'flask'
    }
  }
]

describe('MultiLanguageCodeExample', () => {
  const defaultProps = {
    title: 'Test Multi-Language Example',
    description: 'Test description for multi-language example',
    examples: mockExamples
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders component with title and description', () => {
    render(<MultiLanguageCodeExample {...defaultProps} />)
    
    expect(screen.getByText('Test Multi-Language Example')).toBeInTheDocument()
    expect(screen.getByText('Test description for multi-language example')).toBeInTheDocument()
  })

  test('displays language tabs for all examples', () => {
    render(<MultiLanguageCodeExample {...defaultProps} />)
    
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  test('shows first example by default', () => {
    render(<MultiLanguageCodeExample {...defaultProps} />)
    
    expect(screen.getByText('JavaScript Example')).toBeInTheDocument()
    expect(screen.getByText('console.log("Hello World");')).toBeInTheDocument()
  })

  test('switches between language tabs', () => {
    render(<MultiLanguageCodeExample {...defaultProps} />)
    
    // Initially shows JavaScript
    expect(screen.getByText('console.log("Hello World");')).toBeInTheDocument()
    
    // Click Python tab
    fireEvent.click(screen.getByText('Python'))
    
    // Should now show Python code
    expect(screen.getByText('print("Hello World")')).toBeInTheDocument()
  })

  test('displays example metadata correctly', () => {
    render(<MultiLanguageCodeExample {...defaultProps} />)
    
    expect(screen.getByText('Difficulty: beginner')).toBeInTheDocument()
    expect(screen.getByText('Framework: express')).toBeInTheDocument()
    expect(screen.getByText('✓ Runnable')).toBeInTheDocument()
    expect(screen.getByText('✓ Testable')).toBeInTheDocument()
  })

  test('shows dependencies when available', () => {
    render(<MultiLanguageCodeExample {...defaultProps} />)
    
    expect(screen.getByText('Dependencies:')).toBeInTheDocument()
    expect(screen.getByText('express')).toBeInTheDocument()
  })

  test('shows tags when available', () => {
    render(<MultiLanguageCodeExample {...defaultProps} />)
    
    expect(screen.getByText('Tags:')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
    expect(screen.getByText('basic')).toBeInTheDocument()
  })

  test('copy functionality works', async () => {
    render(<MultiLanguageCodeExample {...defaultProps} />)
    
    const copyButton = screen.getByText('Copy')
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('console.log("Hello World");')
    })
    
    // Should show "Copied!" temporarily
    expect(screen.getByText('Copied!')).toBeInTheDocument()
  })

  test('download functionality works', () => {
    // Mock document methods
    const mockClick = jest.fn()
    const mockAppendChild = jest.fn()
    const mockRemoveChild = jest.fn()
    
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick
    }
    
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
    jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild)
    jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild)
    
    render(<MultiLanguageCodeExample {...defaultProps} />)
    
    const downloadButton = screen.getByText('Download')
    fireEvent.click(downloadButton)
    
    expect(document.createElement).toHaveBeenCalledWith('a')
    expect(mockClick).toHaveBeenCalled()
    expect(mockAppendChild).toHaveBeenCalledWith(mockAnchor)
    expect(mockRemoveChild).toHaveBeenCalledWith(mockAnchor)
  })

  test('handles empty examples array gracefully', () => {
    const emptyProps = {
      ...defaultProps,
      examples: []
    }
    
    render(<MultiLanguageCodeExample {...emptyProps} />)
    
    // Should still render title and description
    expect(screen.getByText('Test Multi-Language Example')).toBeInTheDocument()
    expect(screen.getByText('Test description for multi-language example')).toBeInTheDocument()
  })

  test('applies custom className', () => {
    const { container } = render(
      <MultiLanguageCodeExample {...defaultProps} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  test('displays last updated date', () => {
    render(<MultiLanguageCodeExample {...defaultProps} />)
    
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument()
  })

  test('handles missing optional metadata gracefully', () => {
    const exampleWithoutFramework: CodeExample = {
      ...mockExamples[0],
      metadata: {
        filename: 'test.js',
        runnable: false,
        testable: false
      }
    }
    
    const propsWithoutFramework = {
      ...defaultProps,
      examples: [exampleWithoutFramework]
    }
    
    render(<MultiLanguageCodeExample {...propsWithoutFramework} />)
    
    // Should not show framework info
    expect(screen.queryByText('Framework:')).not.toBeInTheDocument()
    
    // Should not show runnable/testable indicators
    expect(screen.queryByText('✓ Runnable')).not.toBeInTheDocument()
    expect(screen.queryByText('✓ Testable')).not.toBeInTheDocument()
  })
})